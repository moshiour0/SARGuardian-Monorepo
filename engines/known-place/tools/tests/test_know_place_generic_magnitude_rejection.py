"""Tests for generic pair-summary magnitude rejection quality gate.

Quality gate rule:
Reject (exclude from valid mask before median/bootstrap/noise_floor) cells
with horizontal magnitude > max_horizontal_magnitude_m (default 10.0 m, named constant).
Report rejected_magnitude count and valid_fraction in the pair dict as new keys;
keep existing flag keys.
"""
from __future__ import annotations

import numpy as np
import pytest

from tools.know_place.aoi_runner import (
    DEFAULT_MAX_HORIZONTAL_MAGNITUDE_M,
    apply_generic_magnitude_rejection,
    summarize_generic_pair,
)


def test_field_with_30_pct_cells_at_300m_are_excluded_and_median_is_unaffected():
    """Field with 30% cells at 300 m; assert they are excluded and median is unaffected."""
    # 100-cell field: 70 cells at 2.0 m, 30 cells (30%) at 300.0 m outlier
    n_total = 100
    n_outliers = 30
    n_clean = 70

    east = np.full((10, 10), 2.0, dtype=float)
    north = np.zeros((10, 10), dtype=float)
    # Exactly 30% of cells set to 300 m magnitude
    east.flat[:n_outliers] = 300.0

    valid = np.ones((10, 10), dtype=bool)
    field_mask = np.ones((10, 10), dtype=bool)

    # 1. Assert rejection excludes the 300 m cells
    updated_valid, rejected_count, valid_frac = apply_generic_magnitude_rejection(
        east, north, valid, field_mask,
        max_horizontal_magnitude_m=DEFAULT_MAX_HORIZONTAL_MAGNITUDE_M,
    )
    assert rejected_count == n_outliers
    assert valid_frac == pytest.approx(0.70)
    assert int(updated_valid.sum()) == n_clean
    assert not updated_valid.flat[:n_outliers].any()  # all 300 m cells excluded
    assert updated_valid.flat[n_outliers:].all()       # all 2.0 m cells preserved

    # 2. Pair summary: assert pair dict keys and that median is unaffected
    pair = summarize_generic_pair(
        east, north, valid, field_mask,
        max_horizontal_magnitude_m=DEFAULT_MAX_HORIZONTAL_MAGNITUDE_M,
    )

    # New keys reported
    assert "rejected_magnitude" in pair
    assert "valid_fraction" in pair
    assert pair["rejected_magnitude"] == 30
    assert pair["valid_fraction"] == pytest.approx(0.70)
    assert pair["valid_aoi_pixels"] == 70
    assert pair["aoi_total_grid_cells"] == 100
    assert pair["valid_aoi_fraction"] == pytest.approx(0.70)

    # Existing flag keys kept
    assert "high_magnitude_threshold" in pair
    assert "high_magnitude_flagged_pixels" in pair
    assert "magnitude_policy" in pair
    assert pair["high_magnitude_threshold"] == DEFAULT_MAX_HORIZONTAL_MAGNITUDE_M

    # Assert median is completely unaffected by the 300 m outliers
    # (Median of 70 valid cells at 2.0 m is exactly 2.0 m, not pulled by 300 m)
    stats = pair["statistics"]
    assert stats["crown_median_horizontal_magnitude_m"] == pytest.approx(2.0)
    assert stats["aoi_median_horizontal_magnitude_m"] == pytest.approx(2.0)
    assert stats["valid_crown_pixels"] == 70
    assert stats["aoi_valid_pixels"] == 70


def test_clean_field_has_zero_rejections_and_full_valid_fraction():
    """Field where all cells are within threshold has zero rejections."""
    east = np.full((10, 10), 1.5, dtype=float)
    north = np.full((10, 10), 2.0, dtype=float)  # magnitude = 2.5 m (< 10.0 m)
    valid = np.ones((10, 10), dtype=bool)
    field_mask = np.ones((10, 10), dtype=bool)

    pair = summarize_generic_pair(east, north, valid, field_mask)

    assert pair["rejected_magnitude"] == 0
    assert pair["valid_fraction"] == pytest.approx(1.0)
    assert pair["valid_aoi_pixels"] == 100
    assert pair["statistics"]["aoi_median_horizontal_magnitude_m"] == pytest.approx(2.5)


def test_configurable_threshold_override():
    """Threshold is a configurable parameter, not a hardcoded magic number."""
    east = np.full((10, 10), 15.0, dtype=float)  # magnitude = 15.0 m
    north = np.zeros((10, 10), dtype=float)
    valid = np.ones((10, 10), dtype=bool)
    field_mask = np.ones((10, 10), dtype=bool)

    # With default threshold 10.0 m -> all 100 rejected
    pair_default = summarize_generic_pair(
        east, north, valid, field_mask,
        max_horizontal_magnitude_m=DEFAULT_MAX_HORIZONTAL_MAGNITUDE_M,
    )
    assert pair_default["rejected_magnitude"] == 100
    assert pair_default["valid_fraction"] == 0.0

    # With relaxed threshold 20.0 m -> 0 rejected
    pair_relaxed = summarize_generic_pair(
        east, north, valid, field_mask,
        max_horizontal_magnitude_m=20.0,
    )
    assert pair_relaxed["rejected_magnitude"] == 0
    assert pair_relaxed["valid_fraction"] == pytest.approx(1.0)
    assert pair_relaxed["statistics"]["aoi_median_horizontal_magnitude_m"] == pytest.approx(15.0)


def test_threshold_validation_rejects_nonpositive():
    """Assert nonpositive or nonfinite threshold raises ValueError."""
    east = np.ones((4, 4))
    valid = np.ones((4, 4), dtype=bool)
    with pytest.raises(ValueError, match="MAX_HORIZONTAL_MAGNITUDE_MUST_BE_FINITE_AND_POSITIVE"):
        apply_generic_magnitude_rejection(east, east, valid, valid, max_horizontal_magnitude_m=0.0)
    with pytest.raises(ValueError, match="MAX_HORIZONTAL_MAGNITUDE_MUST_BE_FINITE_AND_POSITIVE"):
        apply_generic_magnitude_rejection(east, east, valid, valid, max_horizontal_magnitude_m=-5.0)
    with pytest.raises(ValueError, match="MAX_HORIZONTAL_MAGNITUDE_MUST_BE_FINITE_AND_POSITIVE"):
        apply_generic_magnitude_rejection(east, east, valid, valid, max_horizontal_magnitude_m=float("nan"))

