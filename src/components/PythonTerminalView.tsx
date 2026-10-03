import React, { useState } from 'react';
import { StorageFile, OptimizationResult } from '../types';
import { formatPythonCLIOutput } from '../lib/knapsack';
import { Terminal, Code, Copy, Check, Download, FileCode } from 'lucide-react';

interface PythonTerminalViewProps {
  files: StorageFile[];
  capacity: number;
  result: OptimizationResult;
}

const PYTHON_SOURCE_CODE = `"""
Digital File Storage Optimizer
Algorithm: 0/1 Knapsack
Language: Python 3
"""

def storage_optimizer(files, capacity):
    n = len(files)

    # DP table
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]

    # Build DP table
    for i in range(1, n + 1):
        name, size, value = files[i - 1]

        for space in range(capacity + 1):
            if size <= space:
                dp[i][space] = max(
                    dp[i - 1][space],
                    value + dp[i - 1][space - size]
                )
            else:
                dp[i][space] = dp[i - 1][space]

    # Find selected files
    selected_files = []
    space = capacity

    for i in range(n, 0, -1):
        if dp[i][space] != dp[i - 1][space]:
            name, size, value = files[i - 1]
            selected_files.append(files[i - 1])
            space -= size

    selected_files.reverse()

    return selected_files, dp[n][capacity]


def main():
    print("=" * 55)
    print("       DIGITAL FILE STORAGE OPTIMIZER")
    print("          Using 0/1 Knapsack Algorithm")
    print("=" * 55)

    files = []

    try:
        number = int(input("\\nEnter number of files: "))

        if number <= 0:
            print("Number of files must be greater than 0.")
            return

        # Get file information
        for i in range(number):
            print(f"\\nFile {i + 1}")

            name = input("Enter file name: ").strip()

            if not name:
                name = f"File_{i + 1}"

            size = int(input("Enter file size (MB): "))
            value = int(input("Enter file importance/value: "))

            if size <= 0 or value < 0:
                print("Invalid size or value.")
                return

            files.append((name, size, value))

        capacity = int(input("\\nEnter available storage capacity (MB): "))

        if capacity <= 0:
            print("Storage capacity must be greater than 0.")
            return

        # Optimize storage
        selected, total_value = storage_optimizer(files, capacity)

        # Calculate total size
        total_size = sum(file[1] for file in selected)

        print("\\n" + "=" * 55)
        print("              OPTIMIZATION RESULT")
        print("=" * 55)

        if not selected:
            print("No files can be stored within the given capacity.")
        else:
            print("\\nSelected Files:")
            print("-" * 55)
            print(f"{'File Name':<20}{'Size (MB)':<15}{'Value':<10}")
            print("-" * 55)

            for name, size, value in selected:
                print(f"{name:<20}{size:<15}{value:<10}")

            print("-" * 55)
            print(f"Total Storage Used : {total_size} MB")
            print(f"Storage Available  : {capacity} MB")
            print(f"Remaining Storage  : {capacity - total_size} MB")
            print(f"Total Value        : {total_value}")

        print("\\n" + "=" * 55)
        print("Optimization completed successfully!")
        print("=" * 55)

    except ValueError:
        print("\\nError: Please enter valid numbers for size, value, and capacity.")


if __name__ == "__main__":
    main()
`;

export const PythonTerminalView: React.FC<PythonTerminalViewProps> = ({
  files,
  capacity,
  result,
}) => {
  const [activeView, setActiveView] = useState<'terminal' | 'source'>('terminal');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  const cliOutput = formatPythonCLIOutput(files, capacity, result);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(PYTHON_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyTerminal = async () => {
    await navigator.clipboard.writeText(cliOutput);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([PYTHON_SOURCE_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file_storage_optimizer.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([cliOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization_report_${capacity}MB.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {activeView === 'terminal' ? (
            <Terminal className="h-4 w-4 text-cyan-400" />
          ) : (
            <Code className="h-4 w-4 text-cyan-400" />
          )}
          <div>
            <h2 className="text-sm font-semibold text-white">
              {activeView === 'terminal' ? 'Python CLI Terminal Execution' : 'Python 3 Source Code'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {activeView === 'terminal'
                ? 'Emulated stdout output running the Python script on your current files and capacity'
                : 'Complete standalone Python 3 program implementing the 0/1 Knapsack optimizer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            <button
              onClick={() => setActiveView('terminal')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeView === 'terminal'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal className="h-3 w-3" />
              Terminal Output
            </button>
            <button
              onClick={() => setActiveView('source')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                activeView === 'source'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Code className="h-3 w-3" />
              Python Code
            </button>
          </div>

          {activeView === 'terminal' ? (
            <>
              <button
                onClick={handleCopyTerminal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {copiedTerminal ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTerminal ? 'Copied' : 'Copy Output'}
              </button>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                Download Report
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? 'Copied' : 'Copy Python'}
              </button>
              <button
                onClick={handleDownloadPy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                <Download className="h-3.5 w-3.5" />
                Download .py
              </button>
            </>
          )}
        </div>
      </div>

      {/* Terminal or Code container */}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">
              {activeView === 'terminal' ? 'bash - python3 optimizer.py' : 'file_storage_optimizer.py'}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            {activeView === 'terminal' ? 'status: exit 0' : 'Python 3.12'}
          </span>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-x-auto max-h-[500px]">
          {activeView === 'terminal' ? (
            <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre selection:bg-emerald-500/20 selection:text-emerald-200">
              {cliOutput}
            </pre>
          ) : (
            <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre selection:bg-cyan-500/20 selection:text-cyan-200">
              {PYTHON_SOURCE_CODE}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
