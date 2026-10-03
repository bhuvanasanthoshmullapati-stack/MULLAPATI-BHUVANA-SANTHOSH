import React from 'react';
import { HardDrive, Plus, RotateCcw, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'matrix' | 'walkthrough' | 'benchmark' | 'python';
  setActiveTab: (tab: 'dashboard' | 'matrix' | 'walkthrough' | 'benchmark' | 'python') => void;
  onOpenAddModal: () => void;
  onResetPreset: () => void;
  onExportReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onResetPreset,
  onExportReport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30">
            <HardDrive className="h-4 w-4" />
          </div>
          <a
            href="/"
            className="text-base font-bold tracking-tight text-white transition-colors hover:text-cyan-400"
          >
            StorageOptimizer
          </a>
          <span className="hidden text-xs text-slate-500 sm:inline-block">
            0/1 Knapsack Engine
          </span>
        </div>

        {/* Zone 2: Clean text navigation links / view tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drive & Files
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DP Matrix Table
          </button>
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'walkthrough'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Step Player
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'benchmark'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Optimal vs Greedy
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'python'
                ? 'border-b-2 border-cyan-400 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Python CLI
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetPreset}
            title="Reset to scenario defaults"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:inline-flex whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset
          </button>
          <button
            onClick={onExportReport}
            title="Export optimization report"
            className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:inline-flex whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            Export
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            Add File
          </button>
        </div>
      </div>
    </header>
  );
};
