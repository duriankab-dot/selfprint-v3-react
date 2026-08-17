import { useState, useEffect } from 'react';

interface SCIEResultProps {
  accuracy: number;
  disciplines: Record<string, any>;
  onNext: () => void;
}

export function SCIEResult({ accuracy, disciplines, onNext }: SCIEResultProps) {
  const [displayAccuracy, setDisplayAccuracy] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayAccuracy((prev) => Math.min(prev + 5, accuracy));
    }, 50);
    return () => clearInterval(interval);
  }, [accuracy]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Your SICE Baseline</h2>

      {/* Accuracy Meter */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Accuracy</span>
          <span className="text-lg font-bold text-blue-600">{displayAccuracy}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${displayAccuracy}%` }}
          />
        </div>
      </div>

      {/* Disciplines Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(disciplines).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm capitalize mb-2">{key}</h3>
            <p className="text-xs text-gray-600">
              {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNext}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Next: Fine-tune
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}