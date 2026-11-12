import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { RiverShiftResultsPage } from './RiverShiftResultsPage';

describe('RiverShiftResultsPage', () => {
  const mockUser = {
    uid: 'test-user-123',
    getIdToken: vi.fn().mockResolvedValue('test-token'),
  } as unknown as User;

  it('renders the results header and back navigation button', () => {
    const html = renderToStaticMarkup(
      <RiverShiftResultsPage
        user={mockUser}
        authState="ready"
        onSignIn={vi.fn().mockResolvedValue(undefined)}
        onSignOut={vi.fn().mockResolvedValue(undefined)}
        onBack={vi.fn()}
      />,
    );
    expect(html).toContain('River Shift Results');
    expect(html).toContain('Back to processing');
    expect(html).toContain('03 · RESULTS EXPLORER');
    expect(html).toContain('04 · LOCAL EXPOSURE CONTEXT');
  });
});

