const FLAGS = {
  LIVING_DIAGRAM: import.meta.env.VITE_FEATURE_LIVING_DIAGRAM === 'true',
  UNIFIED_PIPELINE: import.meta.env.VITE_FEATURE_UNIFIED_PIPELINE === 'true',
  NO_ASTRO_LANG: import.meta.env.VITE_FEATURE_NO_ASTRO_LANG !== 'false',
} as const;

export type FeatureFlagName = keyof typeof FLAGS;

export function useFeatureFlag(flag: FeatureFlagName): boolean {
  return FLAGS[flag];
}

export interface FeatureFlagProps {
  name: FeatureFlagName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  return FLAGS[name] ? <>{children}</> : <>{fallback}</>;
}

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  return FLAGS[flag];
}

export const featureFlags = FLAGS;