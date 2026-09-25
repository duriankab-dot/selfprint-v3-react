import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, fireEvent } from '@testing-library/react';
import SVGCore, { SICE_LABELS_TH, SICE_LABELS_EN } from '../SVGCore';
import LivingDiagram from '../LivingDiagram';
import TwinDNAAvatar from '../TwinDNAAvatar';
import { generateTwinDNA } from '../../../lib/twinVisualDNA';

const DNA_A = generateTwinDNA({ dob: '1995-06-15', time: '08:30', place: 'Bangkok, TH' }, 'user-aaaa');
const DNA_B = generateTwinDNA({ dob: '1988-12-01', time: '03:45', place: 'Chiang Mai, TH' }, 'user-bbbb');

const svgOf = (r: { container: HTMLElement }) =>
  r.container.querySelector('#living-svg-core, [data-testid="living-svg-core"]')?.outerHTML ?? '';

describe('TC-102 SVGCore — pure parameterized SVG scene', () => {
  it('renders 12 SICE labels at progress=1 (TH + EN)', () => {
    const r = render(<SVGCore progress={1} labels={SICE_LABELS_TH} />);
    const svg = r.container.querySelector('[data-testid="living-svg-core"]') as unknown as SVGSVGElement;
    expect(svg.getAttribute('data-progress')).toBe('1.000');
    SICE_LABELS_TH.forEach((lbl) => {
      expect(svg.textContent).toContain(lbl);
    });
    r.unmount();
    // EN default labels
    const r2 = render(<SVGCore progress={1} />);
    SICE_LABELS_EN.forEach((lbl) => {
      expect(r2.container.textContent).toContain(lbl);
    });
    r2.unmount();
  });

  it('is deterministic — same props produce identical serialized output', () => {
    const r1 = render(<SVGCore progress={0.7} dna={DNA_A} />);
    const html1 = svgOf(r1);
    r1.unmount();
    const r2 = render(<SVGCore progress={0.7} dna={DNA_A} />);
    expect(svgOf(r2)).toBe(html1);
    r2.unmount();
  });

  it('different DNA → different serialization (visual uniqueness contract)', () => {
    const r1 = render(<SVGCore progress={1} dna={DNA_A} />);
    const html1 = svgOf(r1);
    r1.unmount();
    const r2 = render(<SVGCore progress={1} dna={DNA_B} />);
    expect(svgOf(r2)).not.toBe(html1);
    r2.unmount();
  });

  it('progress drives phases — transition hidden at 0, visible at 1', () => {
    const r0 = render(<SVGCore progress={0} />);
    const el0 = r0.container.querySelector('[data-testid="living-svg-core"]') as unknown as SVGSVGElement;
    const gsphere0 = el0.querySelector('#ld-gsphere') as unknown as SVGGraphicsElement;
    expect(gsphere0.style.opacity).toBe('0');
    r0.unmount();

    const r1 = render(<SVGCore progress={1} />);
    const el1 = r1.container.querySelector('[data-testid="living-svg-core"]') as unknown as SVGSVGElement;
    const gsphere1 = el1.querySelector('#ld-gsphere') as unknown as SVGGraphicsElement;
    const gnodes1 = el1.querySelector('#ld-gnodes') as unknown as SVGGraphicsElement;
    expect(parseFloat(gsphere1.style.opacity)).toBeCloseTo(1, 1);
    expect(parseFloat(gnodes1.style.opacity)).toBeCloseTo(1, 1);
    r1.unmount();
  });

  it('scores drive the behavioral map polygon (data-driven)', () => {
    const r = render(<SVGCore progress={1} scores={[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.4, 0.6]} />);
    const poly = r.container.querySelector('polygon') as unknown as SVGPolygonElement;
    const pts = poly.getAttribute('points')?.trim().split(/\s+/);
    expect(pts?.length).toBe(12);
    r.unmount();
  });

  it('source contains no hardcoded hex/rgb colors (token gate contract)', () => {
    // jsdom normalizes hsl→rgb in serialized styles, so assert on the SOURCE
    const src = readFileSync(
      join(__dirname, '..', 'SVGCore.tsx'),
      'utf-8',
    );
    expect(src).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(src).not.toMatch(/rgb\(/);
    const avatarSrc = readFileSync(
      join(__dirname, '..', 'TwinDNAAvatar.tsx'),
      'utf-8',
    );
    expect(avatarSrc).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(avatarSrc).not.toMatch(/rgb\(/);
  });
});

describe('TC-103 LivingDiagram — 3 drivers', () => {
  it('landing mode: renders scene with explicit progress', () => {
    const r = render(<LivingDiagram mode="landing" progress={0.5} />);
    const host = r.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement;
    expect(host.getAttribute('data-mode')).toBe('landing');
    expect(host.querySelector('#ld-gp1')).toBeTruthy();
    r.unmount();
  });

  it('onboarding mode: step maps to discrete progress', () => {
    const r = render(<LivingDiagram mode="onboarding" step={0} isTh />);
    const host = r.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement;
    expect(host.getAttribute('data-mode')).toBe('onboarding');
    r.unmount();
    const r2 = render(<LivingDiagram mode="onboarding" step={4} isTh />);
    expect((r2.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement).getAttribute('data-mode')).toBe('onboarding');
    r2.unmount();
  });

  it('dashboard mode: full render + version badge + confidence', () => {
    const r = render(
      <LivingDiagram mode="dashboard" dna={DNA_A} version={3} confidence={0.85} />,
    );
    const host = r.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement;
    expect(host.getAttribute('data-mode')).toBe('dashboard');
    expect(host.textContent).toContain('v3');
    expect(host.textContent).toContain('85%');
    r.unmount();
  });
});

describe('TC-107 TwinDNAAvatar', () => {
  it('renders distinct avatars for distinct DNA', () => {
    const r1 = render(<TwinDNAAvatar dna={DNA_A} />);
    const html1 = r1.container.querySelector('svg')?.outerHTML ?? '';
    r1.unmount();
    const r2 = render(<TwinDNAAvatar dna={DNA_B} />);
    expect(r2.container.querySelector('svg')?.outerHTML).not.toBe(html1);
    r2.unmount();
  });
});

describe('TC-301/303 LivingDiagram — mobile sheet + a11y', () => {
  it('mobileSheet: toggle button toggles the SICE summary sheet', () => {
    const r = render(<LivingDiagram mode="dashboard" mobileSheet scores={Array(12).fill(0.5)} />);
    const host = r.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement;
    const toggle = r.container.querySelector('.ld-sheet-toggle') as unknown as HTMLButtonElement;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('ld-sheet-panel');

    const sheet = r.container.querySelector('#ld-sheet-panel') as unknown as HTMLElement;
    expect(sheet.textContent).toContain('12 SICE');
    expect(sheet.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(sheet.getAttribute('aria-hidden')).toBe('false');
    r.unmount();
  });

  it('mobileSheet: dashboard lists all 12 labels with score percentages', () => {
    const scores = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.2, 0.3];
    const r = render(<LivingDiagram mode="dashboard" mobileSheet scores={scores} />);
    const sheet = r.container.querySelector('#ld-sheet-panel') as unknown as HTMLElement;
    fireEvent.click(r.container.querySelector('.ld-sheet-toggle') as unknown as HTMLButtonElement);
    for (const lbl of ['Self', 'Mind', 'Decisions', 'Future']) {
      expect(sheet.textContent).toContain(lbl);
    }
    expect(sheet.textContent).toContain('100%');
    expect(sheet.textContent).toContain('10%');
    r.unmount();
  });

  it('a11y: shell role="section" + SVG role="img" (no aria-hidden)', () => {
    const r = render(<LivingDiagram mode="landing" progress={0.5} />);
    const host = r.container.querySelector('[data-testid="living-diagram"]') as unknown as HTMLElement;
    expect(host.getAttribute('role')).toBe('section');
    const svg = r.container.querySelector('[data-testid="living-svg-core"]') as unknown as SVGSVGElement;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBeTruthy();
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    r.unmount();
  });
});