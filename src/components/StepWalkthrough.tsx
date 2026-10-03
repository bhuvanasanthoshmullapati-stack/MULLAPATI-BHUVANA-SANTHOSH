import React, { useState, useEffect, useRef } from 'react';
import { StorageFile, KnapsackStep } from '../types';
import { generateKnapsackSteps } from '../lib/knapsack';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Gauge,
  Info,
} from 'lucide-react';

interface StepWalkthroughProps {
  files: StorageFile[];
  capacity: number;
}

export const StepWalkthrough: React.FC<StepWalkthroughProps> = ({
  files,
  capacity,
}) => {
  const [steps, setSteps] = useState<KnapsackStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(300); // ms per step

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate steps whenever files or capacity change
  useEffect(() => {
    const generated = generateKnapsackSteps(files, capacity);
    setSteps(generated);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [files, capacity]);

  // Handle auto-playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, steps.length]);

  const currentStep = steps[currentStepIndex];

  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    setIsPlaying(false);
    setCurrentStepIndex(steps.length - 1);
  };

  if (!currentStep) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        No steps available. Add files and set capacity to view the walkthrough.
      </div>
    );
  }

  const progressPct = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Knapsack Dynamic Execution Player
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Step-by-step evaluation of the 0/1 Knapsack recurrence relation for every (file, space) coordinate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Step {currentStepIndex + 1} / {steps.length}
          </span>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
            {[600, 300, 100].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed === 600 ? '0.5x' : speed === 300 ? '1x' : '3x'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-cyan-400 transition-all duration-150"
          />
        </div>
      </div>

      {/* Current Step Focus Stage */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Current File card */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="text-[11px] font-medium text-slate-500">Active File Being Considered</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">File {currentStep.i} of {files.length}</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
              {currentStep.file.category}
            </span>
          </div>
          <div className="mt-2 text-base font-bold text-white truncate" title={currentStep.file.name}>
            {currentStep.file.name}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
            <div>
              <div className="text-[10px] text-slate-500">File Size (Weight)</div>
              <div className="font-mono text-lg font-bold text-slate-200 tabular-nums">
                {currentStep.file.size} <span className="text-xs text-slate-500">MB</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Importance Value</div>
              <div className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                {currentStep.file.value}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-800/80 pt-3 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Capacity Slot:</span>
              <span className="font-mono font-bold text-cyan-300 tabular-nums">{currentStep.w} MB</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-slate-400">
              <span>Can fit in slot?</span>
              <span
                className={`font-semibold ${
                  currentStep.canFit ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentStep.canFit ? 'YES (size ≤ slot)' : 'NO (size > slot)'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Recurrence Decision Engine */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium text-slate-500">Mathematical Decision at dp[{currentStep.i}][{currentStep.w}]</div>
              <span
                className={`rounded px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  currentStep.decision === 'included'
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                    : currentStep.decision === 'excluded'
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep.decision === 'included'
                  ? 'Include File (+Value)'
                  : currentStep.decision === 'excluded'
                  ? 'Exclude File (Preserve)'
                  : 'Cannot Fit (Carry Over)'}
              </span>
            </div>

            {/* Comparison panels */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`rounded-lg border p-3 ${
                  currentStep.decision === 'excluded'
                    ? 'border-indigo-500/40 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-indigo-300">Option A: Exclude File</div>
                <div className="mt-1 text-slate-400 text-[11px]">
                  Inherit optimal value from subproblem with previous files:
                </div>
                <div className="mt-2 font-mono text-sm text-slate-200">
                  dp[{currentStep.i - 1}][{currentStep.w}] = <span className="font-bold text-white">{currentStep.prevVal}</span>
                </div>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  currentStep.decision === 'included'
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-emerald-300">Option B: Include File</div>
                {currentStep.canFit ? (
                  <>
                    <div className="mt-1 text-slate-400 text-[11px]">
                      Value + optimal value from remaining space ({currentStep.w - currentStep.file.size} MB):
                    </div>
                    <div className="mt-2 font-mono text-sm text-slate-200">
                      {currentStep.file.value} + dp[{currentStep.i - 1}][{currentStep.w - currentStep.file.size}] = <span className="font-bold text-white">{currentStep.takeVal}</span>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-rose-400 text-[11px]">
                    Impossible: File size ({currentStep.file.size} MB) exceeds available space ({currentStep.w} MB).
                  </div>
                )}
              </div>
            </div>

            {/* Narrative explanation */}
            <div className="mt-3 rounded-md bg-slate-900/80 p-3 text-xs text-slate-300 leading-relaxed border border-slate-800">
              <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Execution Narrative:</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">{currentStep.explanation}</p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">
              Computed Result Cell: <span className="font-bold text-cyan-300">dp[{currentStep.i}][{currentStep.w}] = {currentStep.resultVal}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          onClick={handleReset}
          title="Restart from beginning"
          className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={handleStepBackward}
          disabled={currentStepIndex === 0}
          title="Previous Step"
          className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={handlePlayPause}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            isPlaying
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>{currentStepIndex >= steps.length - 1 ? 'Replay' : 'Play Walkthrough'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleStepForward}
          disabled={currentStepIndex >= steps.length - 1}
          title="Next Step"
          className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 transition-colors"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        <button
          onClick={handleJumpToEnd}
          title="Jump to completion"
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Fast-Forward to Result
        </button>
      </div>
    </div>
  );
};
