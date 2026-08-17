/**
 * AskCoach.test.tsx
 *
 * Mocks useAuth/useEmotion (context), isInRollout (Phase 5.6 gate — มีเทส
 * ของตัวเองแยกใน rollout.test.ts อยู่แล้ว ที่นี่ mock ให้คุมได้ตรง ๆ ว่า
 * in/out เพื่อไม่ให้เทส component ผูกกับผลลัพธ์ hash จริง) และ fetch (network)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const useAuthMock = vi.fn();
const useEmotionMock = vi.fn();
const isInRolloutMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/context/EmotionContext', () => ({
  useEmotion: () => useEmotionMock(),
}));

vi.mock('@/lib/rollout', () => ({
  isInRollout: (...args: unknown[]) => isInRolloutMock(...args),
}));

import AskCoach from '../AskCoach';

const SESSION = { access_token: 'tok-123', user: { id: 'user-1' } };

function mockFetchSequence(responses: Array<{ ok: boolean; json: unknown }>) {
  let call = 0;
  global.fetch = vi.fn(() => {
    const r = responses[Math.min(call, responses.length - 1)];
    call++;
    return Promise.resolve({
      ok: r.ok,
      json: () => Promise.resolve(r.json),
    }) as unknown as Promise<Response>;
  });
}

describe('AskCoach', () => {
  beforeEach(() => {
    useEmotionMock.mockReturnValue({ mood: 'ready' });
  });

  it('renders nothing when outside the rollout bucket', () => {
    isInRolloutMock.mockReturnValue(false);
    useAuthMock.mockReturnValue({ session: null });
    const { container } = render(<AskCoach />);
    expect(container.firstChild).toBeNull();
  });

  it('shows a login hint when in rollout but not logged in', () => {
    isInRolloutMock.mockReturnValue(true);
    useAuthMock.mockReturnValue({ session: null });
    render(<AskCoach />);
    expect(screen.getByText('ต้อง login ก่อนเพื่อถาม Coach')).toBeInTheDocument();
  });

  it('shows the ask form once logged in with a birth date on file', async () => {
    isInRolloutMock.mockReturnValue(true);
    useAuthMock.mockReturnValue({ session: SESSION });
    mockFetchSequence([{ ok: true, json: { profile: { date_of_birth: '1990-01-15' } } }]);

    render(<AskCoach />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ควรเปลี่ยนงาน/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'ถาม Coach' })).toBeDisabled();
  });

  it('submits a question and shows the answer', async () => {
    isInRolloutMock.mockReturnValue(true);
    useAuthMock.mockReturnValue({ session: SESSION });
    mockFetchSequence([
      { ok: true, json: { profile: { date_of_birth: '1990-01-15' } } },
      {
        ok: true,
        json: {
          answer: 'คำตอบจาก Coach',
          contextUsed: { decisionStyle: 'มั่นคง', patternsFound: 2 },
        },
      },
    ]);

    const user = userEvent.setup();
    render(<AskCoach />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ถาม Coach' })).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/ควรเปลี่ยนงาน/), 'ควรเปลี่ยนงานไหม');
    await user.click(screen.getByRole('button', { name: 'ถาม Coach' }));

    await waitFor(() => {
      expect(screen.getByText('คำตอบจาก Coach')).toBeInTheDocument();
    });
    expect(screen.getByText(/2 รูปแบบ/)).toBeInTheDocument();
  });

  it('shows an error message when the API call fails', async () => {
    isInRolloutMock.mockReturnValue(true);
    useAuthMock.mockReturnValue({ session: SESSION });
    mockFetchSequence([
      { ok: true, json: { profile: { date_of_birth: '1990-01-15' } } },
      { ok: false, json: { message: 'พังแล้ว' } },
    ]);

    const user = userEvent.setup();
    render(<AskCoach />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ถาม Coach' })).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/ควรเปลี่ยนงาน/), 'ควรเปลี่ยนงานไหม');
    await user.click(screen.getByRole('button', { name: 'ถาม Coach' }));

    await waitFor(() => {
      expect(screen.getByText(/พังแล้ว/)).toBeInTheDocument();
    });
  });
});
