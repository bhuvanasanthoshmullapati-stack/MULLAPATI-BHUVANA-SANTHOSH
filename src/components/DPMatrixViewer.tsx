import React, { useState } from 'react';
import { OptimizationResult, StorageFile } from '../types';
import { Table, Eye, GitCommit, Info, Sparkles, HelpCircle } from 'lucide-react';

interface DPMatrixViewerProps {
  result: OptimizationResult;
  files: StorageFile[];
  capacity: number;
}

export const DPMatrixViewer: React.FC<DPMatrixViewerProps> = ({
  result,
  files,
  capacity,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; w: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ i: number; w: number } | null>(null);
  const [showBacktrackPath, setShowBacktrackPath] = useState(true);
  const [cellSize, setCellSize] = useState<'compact' | 'standard'>('standard');

  const { dpTable, backtrackPath, backtrackItems } = result;

  // Build a lookup set for backtracking path coordinates: "i,w"
  const backtrackSet = new Set(backtrackPath.map((p) => `${p.i},${p.w}`));

  const activeCell = selectedCell || hoveredCell;

  // Calculate dependency cells for active cell
  let cellInfo = null;
  if (activeCell && activeCell.i > 0) {
    const { i, w } = activeCell;
    const file = files[i - 1];
    const prevVal = dpTable[i - 1][w];
    const fits = file.size <= w;
    const takeVal = fits ? file.value + dpTable[i - 1][w - file.size] : null;
    const currentVal = dpTable[i][w];
    const isIncluded = fits && takeVal !== null && takeVal >= prevVal;

    cellInfo = {
      i,
      w,
      file,
      fits,
      prevVal,
      prevCellCoord: { i: i - 1, w },
      takeVal,
      takeCellCoord: fits ? { i: i - 1, w: w - file.size } : null,
      currentVal,
      isIncluded,
    };
  }

  // Find max value in table for heat gradient
  const maxValue = result.totalValue || 1;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header and view options */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Dynamic Programming Matrix (2D Knapsack Table)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Dimensions: {files.length + 1} rows (files) × {capacity + 1} columns (capacity slots) · Hover/click any cell to inspect recurrence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBacktrackPath(!showBacktrackPath)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showBacktrackPath
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            Backtrack Path
          </button>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setCellSize('compact')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                cellSize === 'compact'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Dense
            </button>
            <button
              onClick={() => setCellSize('standard')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                cellSize === 'standard'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Standard
            </button>
          </div>
        </div>
      </div>

      {/* Recurrence Inspector Callout */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 text-xs">
        {cellInfo ? (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">
                  Cell dp[{cellInfo.i}][{cellInfo.w}]
                </span>
                <span className="text-slate-500"> — File {cellInfo.i}: </span>
                <span className="font-medium text-cyan-300">{cellInfo.file.name}</span>
                <span className="text-slate-400">
                  {' '}(Size: {cellInfo.file.size} MB, Value: {cellInfo.file.value})
                </span>

                <div className="mt-1 font-mono text-[11px] text-slate-300">
                  {cellInfo.fits ? (
                    <span>
                      Formula: max(dp[{cellInfo.i - 1}][{cellInfo.w}], {cellInfo.file.value} + dp[{cellInfo.i - 1}][{cellInfo.w - cellInfo.file.size}])
                      {' = '}
                      max(<span className="text-indigo-300">{cellInfo.prevVal}</span>, <span className="text-emerald-300">{cellInfo.takeVal}</span>)
                      {' → '}
                      <span className="font-bold text-cyan-300">{cellInfo.currentVal}</span>
                    </span>
                  ) : (
                    <span>
                      File size ({cellInfo.file.size} MB) exceeds space ({cellInfo.w} MB) → copies above cell dp[{cellInfo.i - 1}][{cellInfo.w}] = <span className="font-bold text-cyan-300">{cellInfo.currentVal}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                <span>Exclude: dp[{cellInfo.i - 1}][{cellInfo.w}]</span>
              </span>
              {cellInfo.fits && (
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Include: dp[{cellInfo.i - 1}][{cellInfo.w - cellInfo.file.size}]</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="h-4 w-4 text-slate-500 shrink-0" />
            <span>
              Hover or click any cell in the table below to see the recurrence equation and parent dependency cells.
            </span>
          </div>
        )}
      </div>

      {/* DP Table Container */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            {/* Column header: capacity slots 0 to capacity */}
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
              <th className="sticky left-0 z-20 border-r border-slate-800 bg-slate-950 px-3 py-2 text-left font-sans text-[11px] font-semibold text-slate-300 whitespace-nowrap min-w-[180px]">
                File (i \ w)
              </th>
              {Array.from({ length: capacity + 1 }).map((_, w) => (
                <th
                  key={w}
                  className={`border-r border-slate-800/80 px-1.5 py-2 text-center text-[10px] font-semibold text-slate-400 tabular-nums ${
                    cellSize === 'compact' ? 'min-w-[28px]' : 'min-w-[38px]'
                  } ${activeCell?.w === w ? 'bg-cyan-500/10 text-cyan-300' : ''}`}
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 0: Base case (0 files available) */}
            <tr className="border-b border-slate-800/60 transition-colors hover:bg-slate-900/40">
              <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 text-slate-500 font-sans text-[11px] whitespace-nowrap">
                <span className="font-mono text-slate-400">i=0</span> · Base Case (0 files)
              </td>
              {Array.from({ length: capacity + 1 }).map((_, w) => {
                const isBacktrack = showBacktrackPath && backtrackSet.has(`0,${w}`);
                const isTarget = activeCell?.i === 0 && activeCell?.w === w;

                return (
                  <td
                    key={w}
                    onClick={() => setSelectedCell({ i: 0, w })}
                    onMouseEnter={() => setHoveredCell({ i: 0, w })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`border-r border-slate-800/50 p-1 text-center text-[11px] tabular-nums cursor-pointer transition-colors ${
                      isTarget
                        ? 'bg-cyan-500/30 text-white font-bold ring-1 ring-cyan-400'
                        : isBacktrack
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                        : 'text-slate-600 hover:bg-slate-800/50'
                    }`}
                  >
                    0
                  </td>
                );
              })}
            </tr>

            {/* Rows 1 to N */}
            {files.map((file, idx) => {
              const i = idx + 1;
              const isRowActive = activeCell?.i === i;

              return (
                <tr
                  key={file.id}
                  className={`border-b border-slate-800/60 transition-colors hover:bg-slate-900/40 ${
                    isRowActive ? 'bg-slate-900/70' : ''
                  }`}
                >
                  {/* Sticky Row Header */}
                  <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 font-sans text-[11px] whitespace-nowrap">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                        <span className="font-mono text-[10px] text-slate-500">i={i}</span>
                        <span className="font-medium text-slate-300 truncate" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {file.size}MB/{file.value}v
                      </span>
                    </div>
                  </td>

                  {/* DP Cells */}
                  {Array.from({ length: capacity + 1 }).map((_, w) => {
                    const val = dpTable[i]?.[w] ?? 0;
                    const isBacktrack = showBacktrackPath && backtrackSet.has(`${i},${w}`);
                    const isTarget = activeCell?.i === i && activeCell?.w === w;

                    // Is this cell a dependency for current active cell?
                    const isPrevDep =
                      cellInfo?.prevCellCoord.i === i && cellInfo?.prevCellCoord.w === w;
                    const isTakeDep =
                      cellInfo?.takeCellCoord?.i === i && cellInfo?.takeCellCoord?.w === w;

                    // Value opacity ratio
                    const intensity = maxValue > 0 ? val / maxValue : 0;

                    let cellStyle = 'text-slate-400 hover:bg-slate-800/60';
                    if (isTarget) {
                      cellStyle = 'bg-cyan-500/30 text-white font-bold ring-1 ring-cyan-400';
                    } else if (isPrevDep) {
                      cellStyle = 'bg-indigo-500/30 text-indigo-200 font-bold ring-1 ring-indigo-400';
                    } else if (isTakeDep) {
                      cellStyle = 'bg-emerald-500/30 text-emerald-200 font-bold ring-1 ring-emerald-400';
                    } else if (isBacktrack) {
                      cellStyle = 'bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/40';
                    } else if (val > 0) {
                      cellStyle = `text-slate-200 hover:bg-slate-800/80`;
                    }

                    return (
                      <td
                        key={w}
                        onClick={() => setSelectedCell({ i, w })}
                        onMouseEnter={() => setHoveredCell({ i, w })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`border-r border-slate-800/50 p-1 text-center text-[11px] tabular-nums cursor-pointer transition-colors relative ${cellStyle}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Backtrack decision trail */}
      <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-slate-800/80 md:flex-row md:items-center md:justify-between text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500/30 ring-1 ring-emerald-400" />
            <span>Optimal Backtrack Path</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-indigo-500/30 ring-1 ring-indigo-400" />
            <span>Exclude Predecessor dp[i-1][w]</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500/40 ring-1 ring-emerald-400" />
            <span>Include Predecessor dp[i-1][w - size]</span>
          </span>
        </div>

        <div className="font-mono text-slate-400">
          Result cell: <span className="font-bold text-cyan-300">dp[{files.length}][{capacity}] = {result.totalValue}</span>
        </div>
      </div>

      {/* Backtracking Decision Trace breakdown */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <GitCommit className="h-3.5 w-3.5 text-emerald-400" />
          <span>Backtracking Recovery Trace (How the algorithm determined which files to keep)</span>
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Traversing backward from dp[{files.length}][{capacity}] down to base case:
        </p>

        <div className="mt-3 space-y-2">
          {backtrackItems.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-2.5 text-xs transition-colors ${
                item.included
                  ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-200'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  {idx + 1}. {item.file.name}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    item.included ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {item.included ? '✓ SELECTED' : '✗ SKIPPED'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
              <div className="mt-1 flex items-center gap-3 font-mono text-[10px] text-slate-500">
                <span>Capacity before: {item.capacityBefore} MB</span>
                <span>→</span>
                <span>Capacity after: {item.capacityAfter} MB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
