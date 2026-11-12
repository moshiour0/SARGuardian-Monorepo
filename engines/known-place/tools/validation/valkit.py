#!/usr/bin/env python3
"""valkit.py - minimal validation kit for Known Place GOFF analysis.

Put at engines/known-place/tools/validation/valkit.py (new file, edits nothing).

  noise    component-wise noise floor + status for one saved pair
  null     negative control: many size-matched placements on a quiet scene
  inject   post-correlation injection-recovery on a real (quiet) host pair
  bench    compare GOFF displacement with an external velocity raster

Inputs: .npz with east/north displacement in metres over the pair interval,
plus an optional boolean valid mask. `bench` reads GeoTIFFs (needs rasterio).
Injection tests the statistics/gating stage, not the offset correlator itself.
"""
from __future__ import annotations
import argparse, json, math, warnings
from pathlib import Path
import numpy as np

K = 1.4826  # MAD -> Gaussian sigma


# ---------- core -------------------------------------------------------------
def mad_sigma(a):
    a = a[np.isfinite(a)]
    return float(K * np.median(np.abs(a - np.median(a)))) if a.size else float("nan")


def classify(e, n, valid, tgt, ref, snr_detect=3.0, min_ref=30, min_tgt=30):
    """Component-wise noise floor from the reference; vector-median target."""
    r, t = valid & ref, valid & tgt
    if r.sum() < min_ref or t.sum() < min_tgt:
        return {"status": "INCONCLUSIVE", "n_ref": int(r.sum()), "n_tgt": int(t.sum())}
    sx, sy = mad_sigma(e[r]), mad_sigma(n[r])
    sr = math.hypot(sx, sy)
    bx, by = float(np.median(e[r])), float(np.median(n[r]))
    dx, dy = float(np.median(e[t])) - bx, float(np.median(n[t])) - by
    d = math.hypot(dx, dy)
    snr = d / sr if sr > 0 else (1e9 if d > 0 else 0.0)
    return {"status": "DETECTED" if snr >= snr_detect else "BELOW_NOISE_FLOOR",
            "sigma_x_m": sx, "sigma_y_m": sy, "sigma_r_m": sr,
            "ref_bias_x_m": bx, "ref_bias_y_m": by, "disp_x_m": dx, "disp_y_m": dy,
            "disp_m": d, "snr": snr, "n_ref": int(r.sum()), "n_tgt": int(t.sum())}


def wilson(k, n, z=1.96):
    if n == 0:
        return [float("nan")] * 2
    p, d = k / n, 1 + z * z / n
    c, h = p + z * z / (2 * n), z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [max(0.0, (c - h) / d), min(1.0, (c + h) / d)]


def box(shape, r, c, s, pad=0):
    m = np.zeros(shape, bool)
    m[max(0, r - pad):r + s + pad, max(0, c - pad):c + s + pad] = True
    return m


def place(valid, s, n, rng, min_frac=0.6, tries=50000):
    """Non-overlapping s x s placements with enough valid cells."""
    H, W = valid.shape
    out = []
    if H <= s or W <= s:
        return out
    for _ in range(tries):
        r, c = int(rng.integers(0, H - s)), int(rng.integers(0, W - s))
        if valid[r:r + s, c:c + s].mean() < min_frac:
            continue
        if any(abs(r - a) < 2 * s and abs(c - b) < 2 * s for a, b in out):
            continue
        out.append((r, c))
        if len(out) == n:
            break
    return out


def load(a):
    z = np.load(a.npz)
    e, n = np.asarray(z[a.east_key], float), np.asarray(z[a.north_key], float)
    v = np.asarray(z[a.valid_key], bool) if a.valid_key and a.valid_key in z.files else np.ones(e.shape, bool)
    return z, e, n, v & np.isfinite(e) & np.isfinite(n)


def clean(o):
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [clean(v) for v in o]
    if isinstance(o, (np.floating, float)):
        f = float(o)
        return f if math.isfinite(f) else None
    if isinstance(o, np.integer):
        return int(o)
    return o


def emit(obj, out):
    s = json.dumps(clean(obj), indent=2)
    if out:
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        Path(out).write_text(s)
    print(s)


# ---------- step 1: noise floor ----------------------------------------------
def cmd_noise(a):
    z, e, n, v = load(a)
    emit(classify(e, n, v, np.asarray(z[a.tgt_key], bool), np.asarray(z[a.ref_key], bool), a.snr), a.out)


# ---------- step 2: negative control ----------------------------------------
def cmd_null(a):
    _, e, n, v = load(a)
    rng = np.random.default_rng(a.seed)
    rows = []
    for r, c in place(v, a.size, a.n, rng):
        tgt = box(v.shape, r, c, a.size)
        ref = v & ~box(v.shape, r, c, a.size, a.buffer)
        rows.append(classify(e, n, v, tgt, ref, a.snr))
    ok = [x for x in rows if x["status"] != "INCONCLUSIVE"]
    fp = sum(x["status"] == "DETECTED" for x in ok)
    snr = np.array([x["snr"] for x in ok]) if ok else np.array([np.nan])
    res = {"placements": len(rows), "evaluable": len(ok), "false_positives": fp,
           "fp_rate": fp / len(ok) if ok else None,
           "fp_rate_95ci_wilson": wilson(fp, len(ok)),
           "rule_of_three_upper_95": 3 / len(ok) if ok and fp == 0 else None,
           "snr_percentiles": {p: float(np.nanpercentile(snr, p)) for p in (50, 90, 95, 99, 100)},
           "median_sigma_r_m": float(np.median([x["sigma_r_m"] for x in ok])) if ok else None,
           "suggested_snr_detect": float(max(a.snr, np.nanpercentile(snr, 95))),
           "snr_detect_used": a.snr, "region_cells": a.size}
    emit(res, a.out)


# ---------- step 3: injection-recovery --------------------------------------
def cmd_inject(a):
    _, e, n, v = load(a)
    rng = np.random.default_rng(a.seed)
    spots = place(v, a.size, a.trials, rng)
    az = rng.uniform(0, 2 * np.pi, len(spots))
    out = {"spots": len(spots), "region_cells": a.size, "gate_cap_m": a.cap, "by_amplitude_m": {}}
    for amp in [0.0] + list(a.amps):
        err, det, ok = [], 0, 0
        for (r, c), th in zip(spots, az):
            tgt = box(v.shape, r, c, a.size)
            e2, n2 = e.copy(), n.copy()
            e2[tgt] += amp * math.sin(th)
            n2[tgt] += amp * math.cos(th)
            v2 = v & (np.hypot(e2, n2) <= a.cap)  # same reject-not-clip gate
            res = classify(e2, n2, v2, tgt, v2 & ~box(v.shape, r, c, a.size, a.buffer), a.snr)
            if res["status"] == "INCONCLUSIVE":
                continue
            ok += 1
            det += res["status"] == "DETECTED"
            err.append(res["disp_m"] - amp)
        err = np.array(err) if err else np.array([np.nan])
        out["by_amplitude_m"][str(amp)] = {
            "evaluable": ok, "detect_rate": det / ok if ok else None,
            "detect_rate_95ci_wilson": wilson(det, ok),
            "mean_signed_error_m": float(np.nanmean(err)),
            "rmse_m": float(np.sqrt(np.nanmean(err ** 2))),
            "median_abs_error_m": float(np.nanmedian(np.abs(err))),
            "p90_abs_error_m": float(np.nanpercentile(np.abs(err), 90)),
            "relative_rmse": float(np.sqrt(np.nanmean(err ** 2)) / amp) if amp > 0 else None}
    emit(out, a.out)


# ---------- step 4: external benchmark --------------------------------------
def block_med(x, b):
    H, W = (x.shape[0] // b) * b, (x.shape[1] // b) * b
    t = x[:H, :W].reshape(H // b, b, W // b, b).transpose(0, 2, 1, 3).reshape(H // b, W // b, b * b)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        m = np.nanmedian(t, axis=-1)
    m[np.isfinite(t).sum(-1) < (b * b) // 2] = np.nan
    return m


def boot_r(x, y, lab, reps, rng):
    groups = [np.where(lab == i)[0] for i in np.unique(lab)]
    rs = []
    for _ in range(reps):
        idx = np.concatenate([groups[i] for i in rng.integers(0, len(groups), len(groups))])
        if idx.size > 2 and x[idx].std() > 0 and y[idx].std() > 0:
            rs.append(np.corrcoef(x[idx], y[idx])[0, 1])
    return [float(q) for q in np.percentile(rs, [2.5, 97.5])] if rs else [float("nan")] * 2


def cmd_bench(a):
    import rasterio
    from rasterio.warp import reproject, Resampling

    def read(path, band):
        with rasterio.open(path) as s:
            x = s.read(band).astype(float)
            if s.nodata is not None:
                x[x == s.nodata] = np.nan
            return x, s.transform, s.crs

    ge, tf, crs = read(a.goff_e, a.band)
    gn, _, _ = read(a.goff_n, a.band)
    scale = {"m/yr": a.days / 365.25, "m/day": a.days, "m": 1.0}[a.ref_units]
    ref = {}
    for k, p in (("e", a.ref_e), ("n", a.ref_n)):
        src, st, scrs = read(p, 1)
        dst = np.full(ge.shape, np.nan)
        reproject(src, dst, src_transform=st, src_crs=scrs, dst_transform=tf, dst_crs=crs,
                  resampling=Resampling.bilinear, src_nodata=np.nan, dst_nodata=np.nan)
        ref[k] = dst * scale
        if scrs != crs:
            print("WARNING: CRS differ; vx/vy axes may need rotation before comparison.")
    be, bn = block_med(ge, a.block), block_med(gn, a.block)
    re_, rn = block_med(ref["e"], a.block), block_med(ref["n"], a.block)
    m = np.isfinite(be) & np.isfinite(bn) & np.isfinite(re_) & np.isfinite(rn)
    m &= np.hypot(re_, rn) >= a.min_ref_m
    rr, cc = np.nonzero(m)
    lab = (rr // a.boot_block) * 100000 + (cc // a.boot_block)
    rng = np.random.default_rng(a.seed)
    res = {"cells": int(m.sum()), "interval_days": a.days, "block_cells": a.block,
           "min_ref_displacement_m": a.min_ref_m, "bootstrap_superblock": a.boot_block}
    for name, x, y in (("east", be[m], re_[m]), ("north", bn[m], rn[m]),
                       ("magnitude", np.hypot(be, bn)[m], np.hypot(re_, rn)[m])):
        if x.size < 5:
            res[name] = "TOO_FEW_CELLS"
            continue
        sl = float(np.polyfit(y, x, 1)[0])
        res[name] = {"pearson_r": float(np.corrcoef(x, y)[0, 1]),
                     "r_95ci_block_bootstrap": boot_r(x, y, lab, a.reps, rng),
                     "rmse_m": float(np.sqrt(np.mean((x - y) ** 2))),
                     "bias_goff_minus_ref_m": float(np.mean(x - y)), "slope_goff_vs_ref": sl}
    emit(res, a.out)


# ---------- cli -------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    def common(s):
        s.add_argument("--npz", required=True)
        s.add_argument("--east-key", default="east_m")
        s.add_argument("--north-key", default="north_m")
        s.add_argument("--valid-key", default="valid")
        s.add_argument("--snr", type=float, default=3.0)
        s.add_argument("--seed", type=int, default=20261112)
        s.add_argument("--out")

    s = sub.add_parser("noise"); common(s)
    s.add_argument("--ref-key", default="reference_mask"); s.add_argument("--tgt-key", default="target_mask")
    s.set_defaults(f=cmd_noise)
    s = sub.add_parser("null"); common(s)
    s.add_argument("--size", type=int, default=10); s.add_argument("--n", type=int, default=60)
    s.add_argument("--buffer", type=int, default=5); s.set_defaults(f=cmd_null)
    s = sub.add_parser("inject"); common(s)
    s.add_argument("--size", type=int, default=10); s.add_argument("--trials", type=int, default=60)
    s.add_argument("--buffer", type=int, default=5); s.add_argument("--cap", type=float, default=10.0)
    s.add_argument("--amps", type=float, nargs="+", default=[1.0, 2.5, 5.0]); s.set_defaults(f=cmd_inject)
    s = sub.add_parser("bench")
    for k in ("goff_e", "goff_n", "ref_e", "ref_n"):
        s.add_argument("--" + k.replace("_", "-"), required=True)
    s.add_argument("--days", type=float, required=True)
    s.add_argument("--ref-units", choices=["m/yr", "m/day", "m"], default="m/yr")
    s.add_argument("--band", type=int, default=1); s.add_argument("--block", type=int, default=5)
    s.add_argument("--boot-block", type=int, default=4); s.add_argument("--reps", type=int, default=2000)
    s.add_argument("--min-ref-m", type=float, default=0.0); s.add_argument("--seed", type=int, default=20261112)
    s.add_argument("--out"); s.set_defaults(f=cmd_bench)
    a = p.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
