"""Tests for reference polygon stationarity and spatial gradient audit.

Audit rule:
Reference polygon is audited for spatial stationarity by fitting a first-order
planar surface to horizontal displacement magnitude across valid reference cells.
If spatial gradient sqrt(a^2 + b^2) <= max_gradient_m_per_km (default 0.5 m/km),
status is 'VERIFIED_SPATIALLY_UNIFORM'. If gradient exceeds threshold,
status is 'WARNING_SPATIAL_GRADIENT_DETECTED'. If valid cells < min_reference_pixels (30),
status is 'INSUFFICIENT_REFERENCE_PIXELS'.
"""
from __future__ import annotations

import math

import numpy as np
import pytest

from tools.know_place.aoi_runner import (
    DEFAULT_MAX_REFERENCE_GRADIENT_M_PER_KM,
    DEFAULT_REFERENCE_PIXEL_SPACING_M,
    _DEFAULT_MIN_REFERENCE_PIXELS,
    _reference_noise_floor,
    audit_reference_stationarity,
    summarize_generic_pair,
)


def _make_grids(
    rows: int = 40,
    cols: int = 80,
    *,
    ref_east: float = 0.0,
    ref_north: float = 0.0,
    tgt_east: float = 3.0,
    tgt_north: float = 0.0,
    gradient_x_m_per_m: float = 0.0,
    noise_std: float = 0.0,
    seed: int = 42,
):
    """Build test grid with reference in left half and target in right half."""
    rng = np.random.RandomState(seed)
    east = np.zeros((rows, cols), dtype=float)
    north = np.zeros((rows, cols), dtype=float)
    valid = np.ones((rows, cols), dtype=bool)
    ref_mask = np.zeros((rows, cols), dtype=bool)
    tgt_mask = np.zeros((rows, cols), dtype=bool)

    mid = cols // 2
    ref_mask[:, :mid] = True
    tgt_mask[:, mid:] = True

    # Reference values: base + linear ramp in X + noise
    col_coords = np.arange(cols, dtype=float) * DEFAULT_REFERENCE_PIXEL_SPACING_M
    x_ramp = col_coords[:mid] * gradient_x_m_per_m

    for r in range(rows):
        east[r, :mid] = ref_east + x_ramp + rng.normal(0, noise_std, mid)
        north[r, :mid] = ref_north + rng.normal(0, noise_std, mid)

    east[tgt_mask] = tgt_east
    north[tgt_mask] = tgt_north

    return east, north, valid, tgt_mask, ref_mask


def test_uniform_reference_is_verified_spatially_uniform():
    """Flat/uniform reference block passes stationarity audit."""
    east, north, valid, tgt, ref = _make_grids(
        rows=30, cols=60,
        ref_east=0.5, ref_north=0.2,
        noise_std=0.01,
        gradient_x_m_per_m=0.0,
    )
    result = audit_reference_stationarity(east, north, valid, ref)

    assert result["stationarity_status"] == "VERIFIED_SPATIALLY_UNIFORM"
    assert result["reference_spatial_gradient_m_per_km"] < DEFAULT_MAX_REFERENCE_GRADIENT_M_PER_KM
    assert result["reference_gradient_threshold_m_per_km"] == DEFAULT_MAX_REFERENCE_GRADIENT_M_PER_KM
    assert result["valid_reference_pixels"] == int(ref.sum())


def test_tilted_creeping_reference_triggers_gradient_warning():
    """Reference block with strong slope/ramp triggers spatial gradient warning."""
    # Ramp of 0.002 m/m = 2.0 m/km (steep displacement tilt > 0.5 m/km threshold)
    east, north, valid, tgt, ref = _make_grids(
        rows=30, cols=60,
        gradient_x_m_per_m=0.002,
    )
    result = audit_reference_stationarity(east, north, valid, ref)

    assert result["stationarity_status"] == "WARNING_SPATIAL_GRADIENT_DETECTED"
    # Recovered gradient should be approximately 2.0 m/km
    assert result["reference_spatial_gradient_m_per_km"] == pytest.approx(2.0, rel=0.1)
    assert result["reference_spatial_gradient_m_per_km"] > DEFAULT_MAX_REFERENCE_GRADIENT_M_PER_KM


def test_tiny_reference_status_is_insufficient_pixels():
    """Fewer valid reference cells than threshold marks stationarity inconclusive."""
    # 3x5 reference = 15 pixels (< 30)
    east, north, valid, tgt, ref = _make_grids(rows=3, cols=10)
    assert int(ref.sum()) < _DEFAULT_MIN_REFERENCE_PIXELS

    result = audit_reference_stationarity(east, north, valid, ref)

    assert result["stationarity_status"] == "INSUFFICIENT_REFERENCE_PIXELS"
    assert math.isnan(result["reference_spatial_gradient_m_per_km"])
    assert result["valid_reference_pixels"] == int(ref.sum())


def test_gradient_threshold_is_configurable_parameter():
    """Threshold can be overridden by config, not fixed to a magic number."""
    # Gradient of 1.0 m/km
    east, north, valid, tgt, ref = _make_grids(
        rows=30, cols=60,
        gradient_x_m_per_m=0.001,
    )

    # Under strict threshold (0.5 m/km) -> WARNING
    strict = audit_reference_stationarity(
        east, north, valid, ref,
        max_gradient_m_per_km=0.5,
    )
    assert strict["stationarity_status"] == "WARNING_SPATIAL_GRADIENT_DETECTED"
    assert strict["reference_gradient_threshold_m_per_km"] == 0.5

    # Under relaxed threshold (2.0 m/km) -> VERIFIED
    relaxed = audit_reference_stationarity(
        east, north, valid, ref,
        max_gradient_m_per_km=2.0,
    )
    assert relaxed["stationarity_status"] == "VERIFIED_SPATIALLY_UNIFORM"
    assert relaxed["reference_gradient_threshold_m_per_km"] == 2.0


def test_noise_floor_and_pair_summary_include_stationarity_keys():
    """_reference_noise_floor and summarize_generic_pair return stationarity keys."""
    east, north, valid, tgt, ref = _make_grids(
        rows=30, cols=60,
        ref_east=0.1, ref_north=0.1,
        tgt_east=3.0, tgt_north=0.0,
    )

    noise = _reference_noise_floor(
        east, north, valid, tgt, ref,
        interval_days=12,
    )
    assert "stationarity_status" in noise
    assert "reference_spatial_gradient_m_per_km" in noise
    assert noise["stationarity_status"] == "VERIFIED_SPATIALLY_UNIFORM"

    pair = summarize_generic_pair(
        east, north, valid, tgt,
        reference_mask=ref,
        interval_days=12,
    )
    assert "noise_floor" in pair
    assert "stationarity_status" in pair["noise_floor"]
    assert pair["noise_floor"]["stationarity_status"] == "VERIFIED_SPATIALLY_UNIFORM"


def test_invalid_max_gradient_raises_value_error():
    """Non-finite or non-positive gradient limit raises ValueError."""
    east = np.ones((5, 10))
    valid = np.ones((5, 10), dtype=bool)
    with pytest.raises(ValueError, match="MAX_GRADIENT_MUST_BE_FINITE_AND_POSITIVE"):
        audit_reference_stationarity(east, east, valid, valid, max_gradient_m_per_km=0.0)
    with pytest.raises(ValueError, match="MAX_GRADIENT_MUST_BE_FINITE_AND_POSITIVE"):
        audit_reference_stationarity(east, east, valid, valid, max_gradient_m_per_km=-1.0)
