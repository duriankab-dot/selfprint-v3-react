/**
 * WorldTabs.tsx
 * 12-world selector tabs for TwinChat
 *
 * P0 #5: World Routing UI Component
 */

import type { FC } from 'react';
import { WORLDS, type WorldId } from '../constants/worlds';

interface WorldTabsProps {
  currentWorld: WorldId | null;
  onWorldSelect: (world: WorldId) => void;
  className?: string;
}

export const WorldTabs: FC<WorldTabsProps> = ({
  currentWorld,
  onWorldSelect,
  className = '',
}) => {
  const worldIds = Object.keys(WORLDS) as WorldId[];

  return (
    <div className={`flex gap-2 p-3 overflow-x-auto bg-gray-900 rounded-lg ${className}`}>
      {worldIds.map((worldId) => {
        const world = WORLDS[worldId];
        const isActive = currentWorld === worldId;

        return (
          <button
            key={worldId}
            onClick={() => onWorldSelect(worldId)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
            title={world.description}
            aria-pressed={isActive}
            aria-label={`${world.name} world`}
          >
            <span className="mr-1">{world.emoji}</span>
            {world.name}
          </button>
        );
      })}
    </div>
  );
};

export default WorldTabs;
