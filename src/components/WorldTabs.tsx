/**
 * WorldTabs.tsx
 * 12-world selector tabs for P0 #5 World Routing
 *
 * Features:
 * - Display all 12 worlds
 * - Show current world indicator
 * - Display world expertise/mastery level
 * - Record world visits
 * - World stats summary (visits, decisions, insights)
 */

import { useWorld } from '../context/WorldContext';
import { WORLDS, type WorldId } from '../constants/worlds';

interface WorldTabsProps {
  className?: string;
  /**
   * DISCONNECT-001 FIX: called in addition to the internal WorldContext
   * update. Callers that keep their own "current world" state (e.g.
   * TwinChat.tsx, which uses a local variable to build the actual AI
   * prompt) must pass this — otherwise clicking a tab here visually
   * "switches worlds" but the AI prompt silently keeps using whatever
   * world was active before, because it never reads WorldContext at all.
   */
  onWorldSelect?: (world: WorldId) => void;
}

/**
 * WorldTabs Component
 *
 * Displays 12 world selector tabs with expertise levels
 * Allows switching between worlds and tracks visits
 * @param className - Optional CSS classes for styling
 */
export function WorldTabs({ className = '', onWorldSelect }: WorldTabsProps) {
  const {
    currentWorld,
    setCurrentWorld,
    worldStats,
    recordWorldVisit,
  } = useWorld();

  /**
   * Handle world selection
   * Updates current world and records visit
   */
  const handleWorldSelect = async (world: WorldId) => {
    setCurrentWorld(world);
    onWorldSelect?.(world);
    await recordWorldVisit(world);
  };

  const worldIds = Object.keys(WORLDS) as WorldId[];

  return (
    <div className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-white">
          {currentWorld ? `🌍 ${WORLDS[currentWorld].name}` : '🌍 Select a World'}
        </h3>
      </div>

      {/* World Tabs Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 mb-3">
        {worldIds.map((worldId) => {
          const world = WORLDS[worldId];
          const isActive = currentWorld === worldId;
          const stats = worldStats[worldId];
          const expertise = stats?.timeSpentMinutes ? Math.min((stats.timeSpentMinutes / 60) * 10, 100) : 10;

          return (
            <button
              key={worldId}
              onClick={() => handleWorldSelect(worldId)}
              className={`
                flex flex-col items-center px-2 py-2 rounded-md transition-all
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
              title={`${world.name}: ${stats?.visitsCount || 0} visits`}
              aria-pressed={isActive}
              aria-label={`${world.name} world`}
            >
              {/* Icon */}
              <span className="text-xl mb-1">{world.emoji}</span>

              {/* Name */}
              <span className="text-xs font-semibold truncate w-full text-center">
                {world.name.substring(0, 4)}
              </span>

              {/* Expertise Bar */}
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    isActive ? 'bg-white' : 'bg-blue-400'
                  }`}
                  style={{ width: `${expertise}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Summary */}
      {currentWorld && worldStats[currentWorld] && (
        <div className="bg-gray-900 rounded p-2 text-xs text-gray-300 border border-gray-700">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="font-semibold text-white">Visits:</span> {worldStats[currentWorld].visitsCount}
            </div>
            <div>
              <span className="font-semibold text-white">Decisions:</span> {worldStats[currentWorld].decisionsMade}
            </div>
            <div>
              <span className="font-semibold text-white">Insights:</span> {worldStats[currentWorld].insightsGained}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldTabs;
