import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import './style/LiveMarketWidget.css';

export function LiveMarketWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock market data with more realistic values
  const marketData = [
    { time: '9:30', value: 16240 },
    { time: '9:45', value: 16255 },
    { time: '10:00', value: 16248 },
    { time: '10:15', value: 16268 },
    { time: '10:30', value: 16275 },
    { time: '10:45', value: 16282 },
    { time: '11:00', value: 16295 },
    { time: '11:15', value: 16288 },
    { time: '11:30', value: 16302 },
    { time: '11:45', value: 16315 },
    { time: '12:00', value: 16308 },
    { time: '12:15', value: 16320 },
    { time: '12:30', value: 16335 },
    { time: '12:45', value: 16328 },
    { time: '1:00', value: 16342 },
    { time: '1:15', value: 16355 },
    { time: '1:30', value: 16348 },
    { time: '1:45', value: 16362 },
    { time: '2:00', value: 16375 },
    { time: '2:15', value: 16385 },
  ];

  const maxValue = Math.max(...marketData.map(d => d.value));
  const minValue = Math.min(...marketData.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-900">NASDAQ Composite</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+2.4%</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">Live Market Data</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>

          {/* Line chart */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`M 0,${((maxValue - marketData[0].value) / range) * 100} ${marketData
                .map((d, i) => {
                  const x = (i / (marketData.length - 1)) * 100;
                  const y = ((maxValue - d.value) / range) * 100;
                  return `L ${x},${y}`;
                })
                .join(' ')} L 100,100 L 0,100 Z`}
              fill="url(#chartGradient)"
              className={mounted ? 'opacity-100 transition-opacity duration-1000' : 'opacity-0'}
            />
            {/* Line - smooth curve */}
            <path
              d={`M 0,${((maxValue - marketData[0].value) / range) * 100} ${marketData
                .map((d, i) => {
                  const x = (i / (marketData.length - 1)) * 100;
                  const y = ((maxValue - d.value) / range) * 100;
                  return `L ${x},${y}`;
                })
                .join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={mounted ? 'opacity-100 transition-opacity duration-1000' : 'opacity-0'}
            />
          </svg>
        </div>
      </div>

      {/* Time labels */}
      <div className="ml-8 flex justify-between text-xs text-gray-400">
        <span>9:30 AM</span>
        <span>11:30 AM</span>
        <span>2:00 PM</span>
      </div>

      {/* Stats row */}
      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">High</p>
          <p className="text-sm text-gray-900">{maxValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Low</p>
          <p className="text-sm text-gray-900">{minValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Volume</p>
          <p className="text-sm text-gray-900">2.4B</p>
        </div>
      </div>
    </div>
  );
}

