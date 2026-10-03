import React, { useState, useEffect } from 'react';
import { StorageFile, FileCategory } from '../types';
import { X, Plus, Save, FileText, Database, Archive, Film, Cpu, Code } from 'lucide-react';

interface AddEditFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileData: Omit<StorageFile, 'id'>, editId?: string) => void;
  initialFile?: StorageFile | null;
}

export const AddEditFileDialog: React.FC<AddEditFileDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFile,
}) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState<number>(10);
  const [value, setValue] = useState<number>(50);
  const [category, setCategory] = useState<FileCategory>('document');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFile) {
      setName(initialFile.name);
      setSize(initialFile.size);
      setValue(initialFile.value);
      setCategory(initialFile.category);
    } else {
      setName('');
      setSize(8);
      setValue(45);
      setCategory('database');
    }
    setError(null);
  }, [initialFile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please provide a file name.');
      return;
    }
    if (size <= 0) {
      setError('File size must be greater than 0 MB.');
      return;
    }
    if (value < 0) {
      setError('File importance value cannot be negative.');
      return;
    }

    onSave(
      {
        name: trimmedName,
        size,
        value,
        category,
      },
      initialFile ? initialFile.id : undefined
    );
    onClose();
  };

  const templates: { name: string; size: number; value: number; category: FileCategory }[] = [
    { name: 'Customer_Ledger_Snapshot.sql', size: 15, value: 90, category: 'database' },
    { name: 'Security_Audit_Logs.tar.gz', size: 7, value: 75, category: 'archive' },
    { name: '4K_Drone_Survey.mp4', size: 24, value: 65, category: 'media' },
    { name: 'System_Kernel_Patch.bin', size: 10, value: 85, category: 'system' },
    { name: 'Annual_Financial_Filing.pdf', size: 4, value: 60, category: 'document' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-white">
            {initialFile ? 'Edit File Parameters' : 'Add New File Candidate'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick templates (only when adding) */}
        {!initialFile && (
          <div className="mt-3">
            <span className="text-[11px] font-medium text-slate-500">Quick template:</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setName(tpl.name);
                    setSize(tpl.size);
                    setValue(tpl.value);
                    setCategory(tpl.category);
                  }}
                  className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white truncate max-w-[160px]"
                >
                  {tpl.name.split('.')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">File Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Database_Dump.sql"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                File Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10) || 1)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 focus:border-cyan-500 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">
                Importance / Value
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                required
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-amber-300 focus:border-cyan-500 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Category</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {[
                { id: 'database', label: 'Database', icon: Database },
                { id: 'archive', label: 'Archive', icon: Archive },
                { id: 'document', label: 'Document', icon: FileText },
                { id: 'media', label: 'Media', icon: Film },
                { id: 'system', label: 'System', icon: Cpu },
                { id: 'code', label: 'Code', icon: Code },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as FileCategory)}
                    className={`flex items-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {initialFile ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {initialFile ? 'Save Changes' : 'Add File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
