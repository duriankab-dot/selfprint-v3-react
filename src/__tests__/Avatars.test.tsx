/**
 * Avatars.test.tsx
 * Unit tests for NovaAvatar and TwinAvatar components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NovaAvatar } from '../components/features/NovaAvatar';
import { TwinAvatar } from '../components/features/TwinAvatar';

describe('NovaAvatar', () => {
  it('should render Nova avatar with default size', () => {
    const { container } = render(<NovaAvatar />);
    const avatar = container.querySelector('div[style*="width"]');
    expect(avatar).toBeDefined();
  });

  // QA-02: "Nova" is the code/implementation name only — the label the user
  // sees was renamed to "Self Print" (NovaAvatar.tsx:88).
  it('should display the Self Print label when showLabel is true', () => {
    render(<NovaAvatar showLabel={true} />);
    expect(screen.getByText('Self Print')).toBeInTheDocument();
  });

  it('should not display label when showLabel is false', () => {
    const { container } = render(<NovaAvatar showLabel={false} />);
    expect(container.textContent).not.toContain('Self Print');
  });

  it('should render all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { container } = render(<NovaAvatar size={size} showLabel={false} />);
      expect(container.querySelector('div')).toBeDefined();
    });
  });

  it('should have golden glow styling', () => {
    const { container } = render(<NovaAvatar showLabel={false} />);
    const avatar = container.querySelector('div[style*="radial-gradient"]');
    // QA-02: jsdom's CSS serialiser normalises hex colours to rgb(), so the
    // #ffd700 written in NovaAvatar.tsx:38 comes back as rgb(255, 215, 0) —
    // the literal 'ffd700' is never in the serialised style attribute. Same
    // colour, different notation.
    expect(avatar?.getAttribute('style')).toContain('radial-gradient');
    expect(avatar?.getAttribute('style')).toMatch(/rgb\(255,\s*215,\s*0\)|#ffd700/i);
  });

  it('should accept className prop', () => {
    const { container } = render(<NovaAvatar className="custom-class" showLabel={false} />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have animation keyframes', () => {
    const { container } = render(<NovaAvatar showLabel={false} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('nova-glow');
  });
});

describe('TwinAvatar', () => {
  it('should render Twin avatar with default props', () => {
    const { container } = render(<TwinAvatar />);
    const avatar = container.querySelector('div[style*="perspective"]');
    expect(avatar).toBeDefined();
  });

  it('should display Twin name when provided', () => {
    render(<TwinAvatar name="Aria" showLabel={true} />);
    expect(screen.getByText('Aria')).toBeDefined();
  });

  it('should display stage number when no name provided', () => {
    const { container } = render(<TwinAvatar stage={3} showLabel={true} />);
    expect(container.textContent).toContain('Stage 3');
  });

  it('should not display label when showLabel is false', () => {
    const { container } = render(<TwinAvatar name="Aria" showLabel={false} />);
    expect(container.textContent).not.toContain('Aria');
  });

  it('should render all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { container } = render(<TwinAvatar size={size} showLabel={false} />);
      expect(container.querySelector('div[style*="perspective"]')).toBeDefined();
    });
  });

  it('should render all mood variants', () => {
    const moods = ['curious', 'confident', 'learning', 'reflective', 'playful'] as const;
    moods.forEach((mood) => {
      const { container } = render(<TwinAvatar mood={mood} showLabel={false} />);
      expect(container.querySelector('div[style*="perspective"]')).toBeDefined();
    });
  });

  it('should render all evolution stages', () => {
    const stages = [1, 2, 3, 4, 5] as const;
    stages.forEach((stage) => {
      const { container } = render(<TwinAvatar stage={stage} showLabel={false} />);
      expect(container.textContent).toContain(stage.toString());
    });
  });

  it('should show stage indicator with number', () => {
    const { container } = render(<TwinAvatar stage={3} showLabel={false} />);
    expect(container.textContent).toContain('3');
  });

  it('should have hologram styling', () => {
    const { container } = render(<TwinAvatar showLabel={false} />);
    const style = container.querySelector('style');
    expect(style?.textContent).toContain('twin-pulse');
  });

  it('should accept className prop', () => {
    const { container } = render(<TwinAvatar className="custom-class" showLabel={false} />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have different colors for different moods', () => {
    const { container: curiousContainer } = render(
      <TwinAvatar mood="curious" showLabel={false} />
    );
    const { container: confidentContainer } = render(
      <TwinAvatar mood="confident" showLabel={false} />
    );

    const curiousStyle = curiousContainer
      .querySelector('div[style*="perspective"]')
      ?.querySelector('div')?.getAttribute('style');
    const confidentStyle = confidentContainer
      .querySelector('div[style*="perspective"]')
      ?.querySelector('div')?.getAttribute('style');

    expect(curiousStyle).not.toBe(confidentStyle);
  });
});
