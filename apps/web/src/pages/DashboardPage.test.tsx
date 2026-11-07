import { rateInterval, rateUncertaintyLabel } from '../api/knownPlace';

describe('Known Place conditional spatial rate intervals', () => {
  it('formats a finite conditional bootstrap interval in metres per day', () => {
    const pair = {
      median_horizontal_displacement_rate_95pct_interval_m_per_day: [0.02, 0.03] as [number, number],
      spatial_uncertainty_status: 'COMPUTED_EXPLORATORY',
      spatial_uncertainty_valid_block_count: 12,
      spatial_uncertainty_minimum_blocks_required: 8,
    };

    expect(rateInterval(pair)).toEqual([0.02, 0.03]);
    expect(rateUncertaintyLabel(pair)).toBe('Conditional spatial bootstrap 95%: 0.020–0.030 m/day');
  });

  it('withholds interval bounds when spatial block support is insufficient', () => {
    const pair = {
      median_horizontal_displacement_rate_95pct_interval_m_per_day: null,
      spatial_uncertainty_status: 'INSUFFICIENT_SPATIAL_BLOCKS',
      spatial_uncertainty_valid_block_count: 4,
      spatial_uncertainty_minimum_blocks_required: 8,
    };

    expect(rateInterval(pair)).toBeNull();
    expect(rateUncertaintyLabel(pair)).toBe('No interval: 4/8 valid blocks');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

describe('refresh-safe saved dashboard page', () => {
  const jobId = '736bd4e6-8963-43be-a916-bc62336c8557';

  it('waits for Firebase auth restoration before requesting a private saved dashboard', () => {
    const html = renderToStaticMarkup(
      <DashboardPage jobId={jobId} view="public" user={null} authState="loading" authError={null} onSignIn={vi.fn()} />,
    );
    expect(html).toContain('Restoring your account session');
    expect(html).toContain('Checking your existing SARGuardian sign-in');
  });

  it('offers sign-in without discarding the dashboard route when no session exists', () => {
    const html = renderToStaticMarkup(
      <DashboardPage jobId={jobId} view="science" user={null} authState="idle" authError={null} onSignIn={vi.fn()} />,
    );
    expect(html).toContain('Sign in to open this dashboard');
    expect(html).toContain('Back to Archive');
  });

  it('rejects an incomplete dashboard URL instead of falling back to Home', () => {
    const html = renderToStaticMarkup(
      <DashboardPage jobId="" view="public" user={null} authState="idle" authError={null} onSignIn={vi.fn()} />,
    );
    expect(html).toContain('Dashboard link is incomplete');
    expect(html).toContain('Back to Archive');
  });
});
