/**
 * Component Showcase — All 10 Primitives
 * Shows variants + responsive + dark mode
 * Temporary — for testing only
 */

import { useState } from 'react';
import { Button, Input, Card, Badge, Text, Divider, Checkbox, Radio, Toggle } from '@/components/primitives';
import { useEmotion } from '@/context/EmotionContext';
import { useHub } from '@/context/HubContext';
import { TwinPresence } from '@/components/twin/TwinPresence';
import { getAllWorlds } from '@/constants/worlds';

export default function ComponentShowcase() {
  const { mood } = useEmotion();
  const { currentHub } = useHub();
  const [toggle, setToggle] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'var(--hub-bg-gradient)',
        backgroundAttachment: 'fixed',
        color: 'var(--color-text-primary)',
        padding: 'var(--space-xl)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Text as="h1" variant="h1">
          Component Showcase
        </Text>
        <Text variant="body-small" style={{ color: 'var(--color-text-secondary)' }}>
          Hub: {currentHub} | Mood: {mood}
        </Text>

        <Divider />

        {/* Buttons */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Buttons
          </Text>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="lg" variant="primary">
              Large
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <Divider />

        {/* Inputs */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Inputs
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: '300px', marginTop: 'var(--space-md)' }}>
            <Input label="Name" placeholder="Enter your name" />
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Error" error="This field is required" />
          </div>
        </section>

        <Divider />

        {/* Cards */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Cards
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
            <Card>
              <Text as="h3" variant="h3">
                Default Card
              </Text>
              <Text variant="body-small" style={{ color: 'var(--color-text-secondary)' }}>
                This is a default card with shadow.
              </Text>
            </Card>
            <Card variant="elevated">
              <Text as="h3" variant="h3">
                Elevated Card
              </Text>
              <Text variant="body-small" style={{ color: 'var(--color-text-secondary)' }}>
                This is an elevated card with accent border.
              </Text>
            </Card>
          </div>
        </section>

        <Divider />

        {/* Badges */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Badges
          </Text>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            <Badge>Default</Badge>
            <Badge variant="mood">Mood</Badge>
            <Badge>Identity</Badge>
            <Badge>{mood}</Badge>
          </div>
        </section>

        <Divider />

        {/* Form Elements */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Form Elements
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <Checkbox label="Option 1" defaultChecked />
            <Checkbox label="Option 2" />
            <div style={{ marginTop: 'var(--space-md)' }}>
              <Radio label="Choice A" name="test" defaultChecked />
              <Radio label="Choice B" name="test" />
            </div>
            <Toggle label="Toggle me" checked={toggle} onChange={setToggle} />
          </div>
        </section>

        <Divider />

        {/* P0-H Gap 4 (Visual Tests): "Twin per World" preview — same Twin
            (fixed archetype + seedKey), one card per World, so the
            contextual posture/accessory/expression layer (twinWorldContext.ts)
            is inspectable and Playwright-testable without needing an
            authenticated session or a real Twin (this route is public,
            unlike /worlds/:worldId). Only the World changes between cards —
            core color/shape/facets stay identical, demonstrating "Twin
            identity recognizable across all worlds" from the P0-H checklist. */}
        <section data-testid="twin-world-preview-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
          <Text as="h2" variant="h2">
            Twin per World (P0-H visual QA)
          </Text>
          <Text variant="body-small" style={{ color: 'var(--color-text-secondary)' }}>
            Same Twin (sage archetype, fixed seed) across all 12 Worlds — posture, accessory, and
            expression are the only things that change.
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 'var(--space-md)',
              marginTop: 'var(--space-md)',
            }}
          >
            {getAllWorlds().map((world) => (
              <div
                key={world.id}
                data-testid={`twin-world-preview-${world.id}`}
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#0A1A3F',
                }}
              >
                <TwinPresence
                  primaryArchetype="sage"
                  worldColor={world.color}
                  seedKey="showcase-preview"
                  worldId={world.id}
                  contained
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 8,
                    bottom: 6,
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.85)',
                    pointerEvents: 'none',
                  }}
                >
                  {world.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Text Variants */}
        <section>
          <Text as="h2" variant="h2">
            Typography
          </Text>
          <div style={{ marginTop: 'var(--space-md)' }}>
            <Text as="h1" variant="h1">
              Heading 1
            </Text>
            <Text as="h2" variant="h2">
              Heading 2
            </Text>
            <Text as="h3" variant="h3">
              Heading 3
            </Text>
            <Text variant="body-large">Body Large</Text>
            <Text variant="body">Body Text</Text>
            <Text variant="body-small">Body Small</Text>
            <Text variant="caption">Caption</Text>
          </div>
        </section>
      </div>
    </div>
  );
}
