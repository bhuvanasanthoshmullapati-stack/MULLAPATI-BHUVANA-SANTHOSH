export type FileCategory = 'database' | 'media' | 'document' | 'archive' | 'system' | 'code';

export interface StorageFile {
  id: string;
  name: string;
  size: number; // in MB
  value: number; // importance score / utility
  category: FileCategory;
  extension?: string;
  locked?: boolean;
}

export interface DPMatrixCell {
  value: number;
  selectedFile?: boolean;
  isBacktrackPath?: boolean;
  fromPrevious?: boolean;
  fromTake?: boolean;
}

export interface KnapsackStep {
  stepIndex: number;
  i: number; // 1-based file index
  w: number; // capacity slot
  file: StorageFile;
  canFit: boolean;
  prevVal: number; // dp[i-1][w]
  takeVal?: number; // file.value + dp[i-1][w - file.size]
  resultVal: number; // dp[i][w]
  decision: 'skip_too_large' | 'excluded' | 'included';
  explanation: string;
}

export interface BacktrackItem {
  file: StorageFile;
  fileIndex: number;
  capacityBefore: number;
  capacityAfter: number;
  included: boolean;
  reason: string;
}

export interface OptimizationResult {
  selectedFiles: StorageFile[];
  totalSize: number;
  capacity: number;
  remainingStorage: number;
  totalValue: number;
  dpTable: number[][]; // (n+1) x (capacity+1)
  backtrackPath: { i: number; w: number; fileIndex?: number; selected?: boolean }[];
  backtrackItems: BacktrackItem[];
  runtimeMs: number;
  allFilesTotalSize: number;
  allFilesTotalValue: number;
  storageEfficiency: number; // % of capacity filled
  valueEfficiency: number; // Total Value / Total Size
}

export interface HeuristicComparison {
  name: string;
  strategy: 'dp_optimal' | 'greedy_density' | 'greedy_value' | 'greedy_size';
  selectedFiles: StorageFile[];
  totalSize: number;
  totalValue: number;
  optimalityGap: number; // % relative to DP optimal
  description: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  capacity: number;
  unit: string;
  files: StorageFile[];
}
