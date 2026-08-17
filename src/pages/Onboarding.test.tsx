/**
 * Onboarding.test.tsx
 *
 * E2E-style tests for the start of the Onboarding flow (Step 1: mood
 * check-in, Step 2: Nova conversation greeting). Focused on real current
 * Thai UI text/behavior — not English placeholder copy from an old version.
 *
 * Deeper per-step behavior (accuracy meters, fine-tuning questions, full
 * analysis) is covered as isolated unit tests in
 * src/components/onboarding/__tests__/components.test.tsx instead of
 * driving the whole multi-step, timer-heavy Onboarding component end to end.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from './Onboarding';
import { EmotionProvider } from '@/context/EmotionContext';
import { useUserStore } from '@/store/userStore';

const MOOD_STORAGE_KEY = 'selfprint_mood';

const renderOnboarding = () => {
  return render(
    <BrowserRouter>
      <EmotionProvider>
        <Onboarding />
      </EmotionProvider>
    </BrowserRouter>
  );
};

describe('Onboarding Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    // zustand persist hydrates once at module load; reset in-memory state
    // too so a birthDate set in one test doesn't leak into the next.
    useUserStore.setState({ profile: {} });
  });

  describe('STEP 1: เช็คอินอารมณ์ (Emotion Selector)', () => {
    it('แสดงหน้าเช็คอินอารมณ์เมื่อเข้าครั้งแรก', () => {
      renderOnboarding();
      expect(
        screen.getByRole('heading', { name: 'วันนี้คุณรู้สึกยังไง?' })
      ).toBeInTheDocument();
    });

    it('มีตัวเลือกอารมณ์ครบ 6 แบบ', () => {
      renderOnboarding();
      const moods = ['เครียด', 'สับสน', 'มั่นใจ', 'หมดแรง', 'พร้อม', 'สะท้อนใจ'];
      moods.forEach((label) => {
        expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
      });
    });

    it('เลือกอารมณ์แล้วบันทึกลง localStorage', async () => {
      renderOnboarding();
      const user = userEvent.setup();

      const readyButton = screen.getByRole('button', { name: /พร้อม/ });
      await user.click(readyButton);

      expect(localStorage.getItem(MOOD_STORAGE_KEY)).toBe('ready');
    });

    it('กดปุ่ม "ไปต่อ" แล้วไปหน้าบทสนทนากับ Nova', async () => {
      renderOnboarding();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: 'ไปต่อ' }));

      await waitFor(() => {
        expect(screen.getByText('Nova')).toBeInTheDocument();
      });
    });

    it('ข้ามหน้าเช็คอินอารมณ์อัตโนมัติถ้าเคยเช็คอินมาแล้ว (ไม่ถามซ้ำ)', async () => {
      // จำลองว่าผู้ใช้เช็คอินอารมณ์มาแล้วจากที่อื่น (เช่นหน้าแรก)
      localStorage.setItem(MOOD_STORAGE_KEY, 'ready');

      renderOnboarding();

      // ไม่ควรเห็นหน้าเช็คอินอารมณ์อีก ต้องข้ามไปหน้า Nova เลย
      await waitFor(() => {
        expect(screen.getByText('Nova')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('heading', { name: 'วันนี้คุณรู้สึกยังไง?' })
      ).not.toBeInTheDocument();
    });
  });

  describe('STEP 2: บทสนทนากับ Nova (เก็บวันเกิด)', () => {
    it('แสดงข้อความทักทายจาก Nova หลังเลือกอารมณ์', async () => {
      renderOnboarding();
      const user = userEvent.setup();

      // เลือกอารมณ์ครั้งแรกทำให้ hasCheckedIn เปลี่ยนเป็น true ซึ่งไปทริกเกอร์
      // auto-skip logic ใน Onboarding.tsx ให้ข้ามไปหน้า Nova ทันที (ไม่ต้องกด
      // "ไปต่อ" ซ้ำ — ปุ่มนั้นจะหายไปพร้อมหน้าเช็คอินอารมณ์)
      await user.click(screen.getByRole('button', { name: /พร้อม/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/ขอถามอะไรบางอย่างที่สำคัญ/)
        ).toBeInTheDocument();
      });
    });

    it('ถามวันเกิดต่อจากคำทักทาย', async () => {
      renderOnboarding();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /พร้อม/ }));

      await waitFor(
        () => {
          expect(screen.getByPlaceholderText('เช่น 1990-01-15')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('State Management & Persistence', () => {
    it('เก็บอารมณ์ที่เลือกไว้ใน localStorage', async () => {
      renderOnboarding();
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /หมดแรง/ }));

      expect(localStorage.getItem(MOOD_STORAGE_KEY)).toBe('drained');
    });
  });

  describe('Accessibility', () => {
    it('มี heading หลักระดับ 1 ในหน้าเช็คอินอารมณ์', () => {
      renderOnboarding();
      expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThanOrEqual(1);
    });

    it('ปุ่มทุกปุ่มมี label ที่อ่านได้', () => {
      renderOnboarding();
      screen.getAllByRole('button').forEach((btn) => {
        expect(btn.textContent?.trim()).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('ไม่ throw error ตอน render ครั้งแรก', () => {
      expect(() => renderOnboarding()).not.toThrow();
    });
  });
});
