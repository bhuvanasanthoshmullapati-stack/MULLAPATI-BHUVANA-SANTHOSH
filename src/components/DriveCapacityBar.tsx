import React from 'react';
import { OptimizationResult, StorageFile } from '../types';
import { HardDrive, CheckCircle2, Sliders, Database, Archive, FileText, Cpu, Film, Code } from 'lucide-react';

interface DriveCapacityBarProps {
  result: OptimizationResult;
  capacity: number;
  setCapacity: (cap: number) => void;
  files: StorageFile[];
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database':
      return <Database className="h-3.5 w-3.5" />;
    case 'archive':
      return <Archive className="h-3.5 w-3.5" />;
    case 'media':
      return <Film className="h-3.5 w-3.5" />;
    case 'system':
      return <Cpu className="h-3.5 w-3.5" />;
    case 'code':
      return <Code className="h-3.5 w-3.5" />;
    case 'document':
    default:
      return <FileText className="h-3.5 w-3.5" />;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'database':
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        solidBg: 'bg-amber-500',
      };
    case 'archive':
      return {
        bg: 'bg-indigo-500/20',
        border: 'border-indigo-500/40',
        text: 'text-indigo-300',
        solidBg: 'bg-indigo-500',
      };
    case 'media':
      return {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/40',
        text: 'text-purple-300',
        solidBg: 'bg-purple-500',
      };
    case 'system':
      return {
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/40',
        text: 'text-rose-300',
        solidBg: 'bg-rose-500',
      };
    case 'code':
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/40',
        text: 'text-cyan-300',
        solidBg: 'bg-cyan-500',
      };
    case 'document':
    default:
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        solidBg: 'bg-emerald-500',
      };
  }
};

export const DriveCapacityBar: React.FC<DriveCapacityBarProps> = ({
  result,
  capacity,
  setCapacity,
  files,
}) => {
  const [hoveredFile, setHoveredFile] = React.useState<StorageFile | null>(null);

  const quickCapacities = [16, 25, 35, 50, 75];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Top metrics row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-r border-slate-800/80 pr-4">
          <div className="text-xs font-medium text-slate-400">Total Value Captured</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
              {result.totalValue}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              / {result.allFilesTotalValue} max
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {result.allFilesTotalValue > 0
              ? `${Math.round((result.totalValue / result.allFilesTotalValue) * 100)}% value collected`
              : '0%'}
          </div>
        </div>

        <div className="border-r border-slate-800/80 pr-4">
          <div className="text-xs font-medium text-slate-400">Storage Utilized</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {result.totalSize}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              / {capacity} MB
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {result.storageEfficiency.toFixed(1)}% drive filled
          </div>
        </div>

        <div className="border-r border-slate-800/80 pr-4">
          <div className="text-xs font-medium text-slate-400">Remaining Space</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              {result.remainingStorage}
            </span>
            <span className="text-xs text-slate-500">MB free</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            0/1 Knapsack optimal limit
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-400">Allocation Yield</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
              {result.valueEfficiency.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">value / MB</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {result.selectedFiles.length} of {files.length} files selected
          </div>
        </div>
      </div>

      {/* Visual Disk Allocation Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5 text-slate-400" />
            <span>Target Drive Layout</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-300 tabular-nums">{capacity} MB total</span>
          </span>
          <span className="font-mono text-slate-400 tabular-nums">
            {hoveredFile
              ? `${hoveredFile.name} (${hoveredFile.size} MB · Value: ${hoveredFile.value})`
              : `${result.selectedFiles.length} files allocated`}
          </span>
        </div>

        {/* Partition blocks */}
        <div className="mt-2.5 flex h-7 w-full overflow-hidden rounded-lg bg-slate-950 p-1 ring-1 ring-slate-800">
          {result.selectedFiles.map((file) => {
            const widthPct = capacity > 0 ? (file.size / capacity) * 100 : 0;
            const colors = getCategoryColor(file.category);

            return (
              <div
                key={file.id}
                onMouseEnter={() => setHoveredFile(file)}
                onMouseLeave={() => setHoveredFile(null)}
                style={{ width: `${widthPct}%` }}
                className={`relative group h-full transition-all duration-150 cursor-pointer overflow-hidden border-r border-slate-900 last:border-r-0 ${colors.solidBg} hover:opacity-90`}
                title={`${file.name}: ${file.size} MB (Value: ${file.value})`}
              >
                <div className="absolute inset-0 flex items-center justify-center px-1 text-[10px] font-mono font-semibold text-slate-950 truncate">
                  {widthPct > 8 ? file.name.split('.')[0] : ''}
                </div>
              </div>
            );
          })}

          {/* Unallocated / Free space block */}
          {result.remainingStorage > 0 && (
            <div
              style={{
                width: `${capacity > 0 ? (result.remainingStorage / capacity) * 100 : 0}%`,
              }}
              className="h-full bg-slate-800/40 relative flex items-center justify-center px-1 text-[10px] font-mono text-slate-500 overflow-hidden"
              title={`Free Space: ${result.remainingStorage} MB`}
            >
              {result.remainingStorage >= 3 ? `${result.remainingStorage} MB free` : ''}
            </div>
          )}
        </div>

        {/* Legend / Category indicators */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Document</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Database</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Archive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            <span>Code / Config</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Media</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span>Free Space</span>
          </div>
        </div>
      </div>

      {/* Capacity slider control */}
      <div className="mt-5 border-t border-slate-800/80 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <label htmlFor="capacity-slider" className="text-xs font-semibold text-slate-300">
              Target Capacity Limit (MB)
            </label>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1">
              <input
                id="capacity-input"
                type="number"
                min={1}
                max={500}
                value={capacity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setCapacity(Math.min(val, 500));
                }}
                className="w-16 bg-transparent font-mono text-sm font-bold text-cyan-300 focus:outline-none tabular-nums"
              />
              <span className="text-xs text-slate-500">MB</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Presets:</span>
            {quickCapacities.map((cap) => (
              <button
                key={cap}
                onClick={() => setCapacity(cap)}
                className={`rounded px-2 py-0.5 font-mono text-xs font-medium transition-colors tabular-nums ${
                  capacity === cap
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cap} MB
              </button>
            ))}
          </div>
        </div>

        <input
          id="capacity-slider"
          type="range"
          min={1}
          max={100}
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
        />
      </div>
    </div>
  );
};
