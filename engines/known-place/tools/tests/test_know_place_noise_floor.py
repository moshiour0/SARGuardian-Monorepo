"""Tests for per-pair noise floor, SNR and detection status.

Scenarios
---------
1. quiet_reference   – low-noise reference, strong target signal → DETECTED
2. strong_target     – signal well above noise → DETECTED with correct SNR
3. weak_target       – signal below noise → BELOW_NOISE_FLOOR
4. tiny_reference    – too few reference pixels → INCONCLUSIVE
"""
from __future__ import annotations

import math

import numpy as np
import pytest

from tools.know_place.aoi_runner import (
    _DEFAULT_MIN_REFERENCE_PIXELS,
    _DEFAULT_SNR_DETECT,
    _MAD_SIGMA,
    _reference_noise_floor,
)


# ---- helpers ---------------------------------------------------------------

def _make_grids(
    rows: int,
    cols: int,
    *,
    ref_east: float,
    ref_north: float,
    tgt_east: float,
    tgt_north: float,
    ref_noise_std: float = 0.0,
    seed: int = 42,
):
    """Build east/north arrays with separate reference and target regions.

    Left half  = reference polygon.
    Right half = target (measurement) polygon.
    """
    rng = np.random.RandomState(seed)
    east = np.full((rows, cols), np.nan)
    north = np.full((rows, cols), np.nan)
    valid = np.ones((rows, cols), dtype=bool)
    ref_mask = np.zeros((rows, cols), dtype=bool)
    tgt_mask = np.zeros((rows, cols), dtype=bool)

    mid = cols // 2
    ref_mask[:, :mid] = True
    tgt_mask[:, mid:] = True

    # Reference region – constant + optional Gaussian noise
    east[ref_mask] = ref_east + rng.normal(0, ref_noise_std, int(ref_mask.sum()))
    north[ref_mask] = ref_north + rng.normal(0, ref_noise_std, int(ref_mask.sum()))

    # Target region – constant displacement
    east[tgt_mask] = tgt_east
    north[tgt_mask] = tgt_north

    return east, north, valid, tgt_mask, ref_mask


# ---- 1. quiet reference, strong target → DETECTED -------------------------

def test_quiet_reference_strong_target_detected():
    """Constant (zero-noise) reference with clear target signal → DETECTED."""
    east, north, valid, tgt, ref = _make_grids(
        40, 80,
        ref_east=0.0, ref_north=0.0,
        tgt_east=3.0, tgt_north=4.0,
        ref_noise_std=0.0,
    )
    result = _reference_noise_floor(
        east, north, valid, tgt, ref, interval_days=12,
    )

    assert result["status"] == "DETECTED"
    # Zero-noise reference → noise_floor == 0, SNR → inf
    assert result["noise_floor_m"] == 0.0
    assert result["noise_floor_rate_m_per_day"] == 0.0
    assert result["snr"] == float("inf")
    assert result["valid_reference_pixels"] == int(ref.sum())
    assert result["snr_detect_threshold"] == _DEFAULT_SNR_DETECT
    assert result["min_reference_pixels_threshold"] == _DEFAULT_MIN_REFERENCE_PIXELS


# ---- 2. strong target – correct SNR calculation ---------------------------

def test_strong_target_snr_correct():
    """Moderate reference noise with strong target → DETECTED + correct SNR."""
    noise_std = 0.01
    east, north, valid, tgt, ref = _make_grids(
        40, 80,
        ref_east=0.0, ref_north=0.0,
        tgt_east=3.0, tgt_north=4.0,
        ref_noise_std=noise_std,
        seed=99,
    )
    result = _reference_noise_floor(
        east, north, valid, tgt, ref, interval_days=12,
    )

    assert result["status"] == "DETECTED"
    assert result["noise_floor_m"] > 0.0
    assert result["noise_floor_rate_m_per_day"] == pytest.approx(
        result["noise_floor_m"] / 12
    )
    target_mag = 5.0  # hypot(3, 4)
    assert result["snr"] == pytest.approx(target_mag / result["noise_floor_m"])
    assert result["snr"] >= _DEFAULT_SNR_DETECT


# ---- 3. weak target – below noise floor -----------------------------------

def test_weak_target_below_noise_floor():
    """Target displacement smaller than reference scatter → BELOW_NOISE_FLOOR."""
    noise_std = 1.0
    tiny_signal = 0.001
    east, north, valid, tgt, ref = _make_grids(
        40, 80,
        ref_east=0.0, ref_north=0.0,
        tgt_east=tiny_signal, tgt_north=0.0,
        ref_noise_std=noise_std,
        seed=7,
    )
    result = _reference_noise_floor(
        east, north, valid, tgt, ref, interval_days=12,
    )

    assert result["status"] == "BELOW_NOISE_FLOOR"
    assert result["noise_floor_m"] > 0.0
    assert result["snr"] < _DEFAULT_SNR_DETECT


# ---- 4. tiny reference – INCONCLUSIVE -------------------------------------

def test_tiny_reference_inconclusive():
    """Fewer valid reference pixels than threshold → INCONCLUSIVE."""
    # Build a small grid where reference region has fewer pixels than default threshold
    east, north, valid, tgt, ref = _make_grids(
        4, 10,  # 4*5=20 reference pixels, below default 30
        ref_east=0.0, ref_north=0.0,
        tgt_east=3.0, tgt_north=4.0,
    )
    assert int(ref.sum()) < _DEFAULT_MIN_REFERENCE_PIXELS

    result = _reference_noise_floor(
        east, north, valid, tgt, ref, interval_days=12,
    )

    assert result["status"] == "INCONCLUSIVE"
    assert math.isnan(result["noise_floor_m"])
    assert math.isnan(result["noise_floor_rate_m_per_day"])
    assert math.isnan(result["snr"])
    assert result["valid_reference_pixels"] == int(ref.sum())


# ---- edge-case guards -----------------------------------------------------

def test_interval_days_must_be_positive():
    east = np.zeros((10, 20))
    valid = np.ones((10, 20), dtype=bool)
    ref = valid.copy()
    tgt = valid.copy()
    with pytest.raises(ValueError, match="NOISE_FLOOR_INTERVAL_DAYS_MUST_BE_POSITIVE"):
        _reference_noise_floor(east, east, valid, tgt, ref, interval_days=0)


def test_output_keys_are_complete():
    """Every call returns the documented key set."""
    east, north, valid, tgt, ref = _make_grids(
        40, 80,
        ref_east=0.0, ref_north=0.0,
        tgt_east=1.0, tgt_north=0.0,
    )
    result = _reference_noise_floor(
        east, north, valid, tgt, ref, interval_days=12,
    )
    required = {
        "noise_floor_m", "noise_floor_rate_m_per_day", "snr", "status",
        "valid_reference_pixels", "min_reference_pixels_threshold",
        "snr_detect_threshold",
    }
    assert required.issubset(result.keys())


def test_custom_thresholds_respected():
    """Caller can override snr_detect and min_reference_pixels."""
    east, north, valid, tgt, ref = _make_grids(
        40, 80,
        ref_east=0.0, ref_north=0.0,
        tgt_east=0.1, tgt_north=0.0,
        ref_noise_std=0.01,
        seed=11,
    )
    # With a very high snr_detect threshold the same signal is BELOW_NOISE_FLOOR
    high = _reference_noise_floor(
        east, north, valid, tgt, ref,
        interval_days=12, snr_detect=1000.0,
    )
    assert high["status"] == "BELOW_NOISE_FLOOR"
    assert high["snr_detect_threshold"] == 1000.0

    # With min_reference_pixels set above available → INCONCLUSIVE
    strict = _reference_noise_floor(
        east, north, valid, tgt, ref,
        interval_days=12, min_reference_pixels=99999,
    )
    assert strict["status"] == "INCONCLUSIVE"
    assert strict["min_reference_pixels_threshold"] == 99999
