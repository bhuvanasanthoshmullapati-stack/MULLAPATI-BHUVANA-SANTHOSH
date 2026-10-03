import React from 'react';
import { StorageFile } from '../types';
import { compareHeuristics } from '../lib/knapsack';
import { Scale, Trophy, AlertTriangle, CheckCircle2, BookOpen, Clock, HardDrive } from 'lucide-react';
import { getCategoryColor } from './DriveCapacityBar';

interface AlgorithmComparisonProps {
  files: StorageFile[];
  capacity: number;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  files,
  capacity,
}) => {
  const comparisons = compareHeuristics(files, capacity);
  const dpOptimal = comparisons.find((c) => c.strategy === 'dp_optimal')!;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">
                Algorithmic Strategy Benchmark & Optimality Comparison
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Why 0/1 Knapsack Dynamic Programming is provably superior to heuristic shortcuts
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">Capacity:</span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">{capacity} MB</span>
          </div>
        </div>

        {/* Strategy comparison cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {comparisons.map((comp) => {
            const isOptimal = comp.strategy === 'dp_optimal';
            const hasGap = comp.optimalityGap > 0;

            return (
              <div
                key={comp.strategy}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  isOptimal
                    ? 'border-cyan-500/50 bg-cyan-950/20 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                    {isOptimal ? (
                      <span className="flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-500/40">
                        <Trophy className="h-3 w-3" />
                        OPTIMAL
                      </span>
                    ) : hasGap ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                        <AlertTriangle className="h-3 w-3" />
                        -{comp.optimalityGap}% Gap
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400">
                        Matched DP
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed min-h-[48px]">
                    {comp.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Total Value</div>
                      <div
                        className={`font-mono text-xl font-bold tabular-nums ${
                          isOptimal ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {comp.totalValue}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Storage Used</div>
                      <div className="font-mono text-xl font-bold text-slate-200 tabular-nums">
                        {comp.totalSize} <span className="text-xs text-slate-500">MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected files preview */}
                  <div className="mt-4 border-t border-slate-800/80 pt-3">
                    <div className="text-[10px] font-semibold text-slate-400">
                      Selected Files ({comp.selectedFiles.length}):
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {comp.selectedFiles.map((file) => {
                        const colors = getCategoryColor(file.category);
                        return (
                          <span
                            key={file.id}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-mono truncate max-w-[130px] ${colors.bg} ${colors.text} border ${colors.border}`}
                            title={`${file.name} (${file.size}MB, Value: ${file.value})`}
                          >
                            {file.name}
                          </span>
                        );
                      })}
                      {comp.selectedFiles.length === 0 && (
                        <span className="text-[11px] text-slate-600 italic">None fit</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800/80 pt-2 text-[11px] font-mono text-slate-500">
                  Efficiency: {(comp.totalSize > 0 ? (comp.totalValue / comp.totalSize).toFixed(2) : '0')} val/MB
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithmic Theory & Mathematical Foundation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Why Greedy Fails */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Why Greedy Heuristics Fail on 0/1 Knapsack</span>
          </div>

          <div className="mt-3 space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              In the <strong className="text-cyan-300">Fractional Knapsack</strong> problem, items can be split into arbitrary pieces, so greedily choosing the highest density items <span className="font-mono text-amber-300">value / size</span> is mathematically optimal.
            </p>
            <p>
              However, in digital file storage, files are <strong className="text-white">indivisible (0 or 1)</strong>. You cannot store half a database file or half an executable. Choosing a high-density file may leave an awkward amount of unused remaining capacity that cannot accommodate any other valuable file.
            </p>
            <p className="rounded-lg bg-slate-950/80 p-3 border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-slate-500">// Classic Counter-Example:</span>
              <br />Capacity: 50 MB
              <br />File A: Size 10 MB, Value 60 (Density: 6.0)
              <br />File B: Size 20 MB, Value 100 (Density: 5.0)
              <br />File C: Size 30 MB, Value 120 (Density: 4.0)
              <br />
              <span className="text-rose-400">Greedy density:</span> Picks A (10MB, val 60) + B (20MB, val 100) = 160 Value (20MB left over, C cannot fit!)
              <br />
              <span className="text-emerald-400">0/1 Knapsack DP:</span> Picks B (20MB, val 100) + C (30MB, val 120) = <strong className="text-white">220 Value</strong> (Exact 50MB fit)!
            </p>
          </div>
        </div>

        {/* Complexity & Dynamic Programming Principles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Complexity & Recurrence Relation</span>
          </div>

          <div className="mt-3 space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800 font-mono text-[11px]">
              <div className="text-cyan-400 font-semibold">The Bellman Recurrence Equation:</div>
              <div className="mt-1 text-slate-200">
                dp[i][w] = max(
                  <br />&nbsp;&nbsp;dp[i-1][w],&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// File excluded</span>
                  <br />&nbsp;&nbsp;value[i] + dp[i-1][w - size[i]]&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// File included</span>
                  <br />)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <div className="text-[10px] text-slate-500 font-medium">Time Complexity</div>
                <div className="font-mono text-sm font-bold text-white mt-0.5">O(N × W)</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Pseudo-polynomial time. Iterates through all N items and W capacity increments.
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
                <div className="text-[10px] text-slate-500 font-medium">Space Complexity</div>
                <div className="font-mono text-sm font-bold text-white mt-0.5">O(N × W) or O(W)</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  2D table allows full backtracking recovery of selected items; 1D array needs only O(W).
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              The 0/1 knapsack problem is classified as <strong className="text-slate-200">NP-complete</strong>, but in digital storage where capacity is bounded by integers, dynamic programming yields exact optimal solutions in milliseconds!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
