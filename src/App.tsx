import React, { useState, useMemo } from 'react';
import { StorageFile, PresetScenario } from './types';
import { PRESET_SCENARIOS } from './lib/presets';
import { storageOptimizer, formatPythonCLIOutput } from './lib/knapsack';
import { Header } from './components/Header';
import { DriveCapacityBar } from './components/DriveCapacityBar';
import { FileList } from './components/FileList';
import { DPMatrixViewer } from './components/DPMatrixViewer';
import { StepWalkthrough } from './components/StepWalkthrough';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { PythonTerminalView } from './components/PythonTerminalView';
import { AddEditFileDialog } from './components/AddEditFileDialog';
import { HardDrive, Cpu, Terminal, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activePreset, setActivePreset] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [files, setFiles] = useState<StorageFile[]>(PRESET_SCENARIOS[0].files);
  const [capacity, setCapacity] = useState<number>(PRESET_SCENARIOS[0].capacity);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'walkthrough' | 'benchmark' | 'python'>('dashboard');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<StorageFile | null>(null);

  // Compute 0/1 Knapsack optimization result
  const optimizationResult = useMemo(() => {
    return storageOptimizer(files, capacity);
  }, [files, capacity]);

  // Handlers
  const handleLoadPreset = (preset: PresetScenario) => {
    setActivePreset(preset);
    setFiles(preset.files);
    setCapacity(preset.capacity);
  };

  const handleResetPreset = () => {
    const original = PRESET_SCENARIOS.find((p) => p.id === activePreset.id) || PRESET_SCENARIOS[0];
    setFiles(original.files);
    setCapacity(original.capacity);
  };

  const handleOpenAddModal = () => {
    setEditingFile(null);
    setIsModalOpen(true);
  };

  const handleEditFile = (file: StorageFile) => {
    setEditingFile(file);
    setIsModalOpen(true);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDuplicateFile = (file: StorageFile) => {
    const copy: StorageFile = {
      ...file,
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${file.name.replace(/\.[^/.]+$/, '')}_copy.${file.name.split('.').pop() || 'dat'}`,
    };
    setFiles((prev) => [...prev, copy]);
  };

  const handleSaveFile = (fileData: Omit<StorageFile, 'id'>, editId?: string) => {
    if (editId) {
      setFiles((prev) =>
        prev.map((f) => (f.id === editId ? { ...fileData, id: editId } : f))
      );
    } else {
      const newFile: StorageFile = {
        ...fileData,
        id: `f-${Date.now()}`,
      };
      setFiles((prev) => [...prev, newFile]);
    }
  };

  const handleAddRandomFile = () => {
    const sampleNames = [
      { name: 'Telemetry_Flight_Log.bin', cat: 'system' as const, size: 7, val: 55 },
      { name: 'Index_Bloom_Filter.dat', cat: 'database' as const, size: 4, val: 62 },
      { name: 'Encrypted_Keyring.tar', cat: 'archive' as const, size: 3, val: 90 },
      { name: 'Satellite_Imagery.tiff', cat: 'media' as const, size: 16, val: 70 },
      { name: 'Audit_Journal.json', cat: 'document' as const, size: 5, val: 40 },
    ];
    const pick = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const uniqueSuffix = Math.floor(Math.random() * 900 + 100);
    const newFile: StorageFile = {
      id: `f-${Date.now()}`,
      name: `${pick.name.split('.')[0]}_${uniqueSuffix}.${pick.name.split('.')[1]}`,
      size: Math.max(1, pick.size + Math.floor(Math.random() * 5 - 2)),
      value: Math.max(5, pick.val + Math.floor(Math.random() * 20 - 10)),
      category: pick.cat,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  const handleExportReport = () => {
    const text = formatPythonCLIOutput(files, capacity, optimizationResult);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage_optimization_report_${capacity}MB.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header adhering strictly to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onResetPreset={handleResetPreset}
        onExportReport={handleExportReport}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Drive Capacity Bar - always visible to anchor storage context */}
        <DriveCapacityBar
          result={optimizationResult}
          capacity={capacity}
          setCapacity={setCapacity}
          files={files}
        />

        {/* Tab Content Panes */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <FileList
              files={files}
              result={optimizationResult}
              onAddFile={handleOpenAddModal}
              onEditFile={handleEditFile}
              onDeleteFile={handleDeleteFile}
              onDuplicateFile={handleDuplicateFile}
              onLoadPreset={handleLoadPreset}
              onAddRandomFile={handleAddRandomFile}
              onClearFiles={handleClearFiles}
              activePresetId={activePreset.id}
            />

            {/* Quick Algorithm Insight Banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  The 0/1 Knapsack engine evaluated <strong className="text-white font-mono tabular-nums">{files.length} candidate files</strong> across <strong className="text-white font-mono tabular-nums">{capacity} MB space increments</strong> in <strong className="text-cyan-400 font-mono tabular-nums">{optimizationResult.runtimeMs.toFixed(2)} ms</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('matrix')}
                  className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Inspect DP Matrix</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <DPMatrixViewer
            result={optimizationResult}
            files={files}
            capacity={capacity}
          />
        )}

        {activeTab === 'walkthrough' && (
          <StepWalkthrough
            files={files}
            capacity={capacity}
          />
        )}

        {activeTab === 'benchmark' && (
          <AlgorithmComparison
            files={files}
            capacity={capacity}
          />
        )}

        {activeTab === 'python' && (
          <PythonTerminalView
            files={files}
            capacity={capacity}
            result={optimizationResult}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Digital File Storage Optimizer · 0/1 Knapsack Dynamic Programming</span>
          <span className="font-mono text-slate-600">O(N × W) Time Complexity</span>
        </div>
      </footer>

      {/* Add / Edit File Modal Dialog */}
      <AddEditFileDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFile}
        initialFile={editingFile}
      />
    </div>
  );
}
