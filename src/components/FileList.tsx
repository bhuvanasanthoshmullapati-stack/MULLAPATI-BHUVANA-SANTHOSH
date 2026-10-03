import React, { useState } from 'react';
import { StorageFile, OptimizationResult, PresetScenario } from '../types';
import { PRESET_SCENARIOS } from '../lib/presets';
import { getCategoryIcon, getCategoryColor } from './DriveCapacityBar';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  Shuffle,
  FolderOpen,
} from 'lucide-react';

interface FileListProps {
  files: StorageFile[];
  result: OptimizationResult;
  onAddFile: () => void;
  onEditFile: (file: StorageFile) => void;
  onDeleteFile: (id: string) => void;
  onDuplicateFile: (file: StorageFile) => void;
  onLoadPreset: (preset: PresetScenario) => void;
  onAddRandomFile: () => void;
  onClearFiles: () => void;
  activePresetId: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  result,
  onAddFile,
  onEditFile,
  onDeleteFile,
  onDuplicateFile,
  onLoadPreset,
  onAddRandomFile,
  onClearFiles,
  activePresetId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const selectedFileIds = new Set(result.selectedFiles.map((f) => f.id));

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Preset selector bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-800/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Preset Storage Scenarios</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Switch between real-world workloads and textbook knapsack benchmarks
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadPreset(preset)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                activePresetId === preset.id
                  ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action and Search bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'database', 'media', 'archive', 'system', 'code'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors capitalize ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-cyan-300 ring-1 ring-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddRandomFile}
            title="Generate random test file"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <Shuffle className="h-3 w-3" />
            <span className="hidden sm:inline">Random File</span>
          </button>
          <button
            onClick={onAddFile}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Add File
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400">
            <tr>
              <th className="py-2.5 pl-4 pr-2 font-medium">Optimization Status</th>
              <th className="px-3 py-2.5 font-medium">File Name</th>
              <th className="px-3 py-2.5 font-medium">Category</th>
              <th className="px-3 py-2.5 font-medium text-right">Size (MB)</th>
              <th className="px-3 py-2.5 font-medium text-right">Importance Value</th>
              <th className="px-3 py-2.5 font-medium text-right">Density (Val/MB)</th>
              <th className="py-2.5 pl-3 pr-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No files found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFileIds.has(file.id);
                const colors = getCategoryColor(file.category);
                const density = file.size > 0 ? (file.value / file.size).toFixed(2) : '0';

                return (
                  <tr
                    key={file.id}
                    className={`transition-colors hover:bg-slate-800/30 ${
                      isSelected ? 'bg-cyan-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 pl-4 pr-2 whitespace-nowrap">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="font-medium text-[11px]">Selected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="h-4 w-4" />
                          <span className="text-[11px]">Skipped</span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2.5 font-medium text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${colors.bg} ${colors.text}`}>
                          {getCategoryIcon(file.category)}
                        </span>
                        <span>{file.name}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap capitalize">
                      <span className="text-[11px]">{file.category}</span>
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-300 tabular-nums whitespace-nowrap">
                      {file.size} <span className="text-slate-500 font-normal text-[11px]">MB</span>
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-300 tabular-nums whitespace-nowrap">
                      {file.value}
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {density}
                    </td>

                    <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onDuplicateFile(file)}
                          title="Duplicate file"
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEditFile(file)}
                          title="Edit file parameters"
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFile(file.id)}
                          title="Delete file"
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {filteredFiles.length} of {files.length} candidate files
        </div>
        {files.length > 0 && (
          <button
            onClick={onClearFiles}
            className="text-slate-500 transition-colors hover:text-rose-400"
          >
            Clear all files
          </button>
        )}
      </div>
    </div>
  );
};
