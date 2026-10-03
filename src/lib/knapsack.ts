import {
  StorageFile,
  OptimizationResult,
  BacktrackItem,
  KnapsackStep,
  HeuristicComparison,
} from '../types';

/**
 * Solves the 0/1 Knapsack problem for storage optimization.
 * Matches the exact algorithm from the Python script:
 * dp[i][space] = max(dp[i - 1][space], value + dp[i - 1][space - size])
 */
export function storageOptimizer(
  files: StorageFile[],
  capacity: number
): OptimizationResult {
  const t0 = performance.now();
  const n = files.length;
  const safeCapacity = Math.max(0, Math.floor(capacity));

  // Initialize DP table: (n + 1) x (safeCapacity + 1)
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(safeCapacity + 1).fill(0)
  );

  // Build DP table
  for (let i = 1; i <= n; i++) {
    const file = files[i - 1];
    const { size, value } = file;

    for (let space = 0; space <= safeCapacity; space++) {
      if (size <= space) {
        const withoutFile = dp[i - 1][space];
        const withFile = value + dp[i - 1][space - size];
        dp[i][space] = Math.max(withoutFile, withFile);
      } else {
        dp[i][space] = dp[i - 1][space];
      }
    }
  }

  // Backtracking to find selected files and path
  const selectedFiles: StorageFile[] = [];
  const backtrackPath: { i: number; w: number; fileIndex?: number; selected?: boolean }[] = [];
  const backtrackItems: BacktrackItem[] = [];

  let space = safeCapacity;
  backtrackPath.push({ i: n, w: space });

  for (let i = n; i > 0; i--) {
    const file = files[i - 1];
    const beforeSpace = space;

    if (dp[i][space] !== dp[i - 1][space]) {
      // File was included
      selectedFiles.push(file);
      space -= file.size;

      backtrackPath.push({
        i: i - 1,
        w: space,
        fileIndex: i - 1,
        selected: true,
      });

      backtrackItems.push({
        file,
        fileIndex: i - 1,
        capacityBefore: beforeSpace,
        capacityAfter: space,
        included: true,
        reason: `Value at dp[${i}][${beforeSpace}] (${dp[i][beforeSpace]}) differs from dp[${i - 1}][${beforeSpace}] (${dp[i - 1][beforeSpace]}). File '${file.name}' was selected, consuming ${file.size} MB and yielding +${file.value} value.`,
      });
    } else {
      // File was skipped
      backtrackPath.push({
        i: i - 1,
        w: space,
        fileIndex: i - 1,
        selected: false,
      });

      backtrackItems.push({
        file,
        fileIndex: i - 1,
        capacityBefore: beforeSpace,
        capacityAfter: space,
        included: false,
        reason: `Value at dp[${i}][${beforeSpace}] equals dp[${i - 1}][${beforeSpace}] (${dp[i][beforeSpace]}). Leaving file '${file.name}' out provided an equal or better outcome.`,
      });
    }
  }

  selectedFiles.reverse();
  backtrackItems.reverse();

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  const totalValue = dp[n][safeCapacity];
  const allFilesTotalSize = files.reduce((acc, f) => acc + f.size, 0);
  const allFilesTotalValue = files.reduce((acc, f) => acc + f.value, 0);
  const remainingStorage = Math.max(0, safeCapacity - totalSize);
  const storageEfficiency = safeCapacity > 0 ? (totalSize / safeCapacity) * 100 : 0;
  const valueEfficiency = totalSize > 0 ? totalValue / totalSize : 0;
  const runtimeMs = performance.now() - t0;

  return {
    selectedFiles,
    totalSize,
    capacity: safeCapacity,
    remainingStorage,
    totalValue,
    dpTable: dp,
    backtrackPath,
    backtrackItems,
    runtimeMs,
    allFilesTotalSize,
    allFilesTotalValue,
    storageEfficiency,
    valueEfficiency,
  };
}

/**
 * Generates an event-based list of steps for the visual step-by-step DP runner.
 */
export function generateKnapsackSteps(
  files: StorageFile[],
  capacity: number
): KnapsackStep[] {
  const steps: KnapsackStep[] = [];
  const safeCapacity = Math.max(0, Math.floor(capacity));
  const n = files.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(safeCapacity + 1).fill(0)
  );

  let stepCounter = 0;

  for (let i = 1; i <= n; i++) {
    const file = files[i - 1];
    const { size, value } = file;

    for (let w = 0; w <= safeCapacity; w++) {
      const prevVal = dp[i - 1][w];

      if (size <= w) {
        const takeVal = value + dp[i - 1][w - size];
        const resultVal = Math.max(prevVal, takeVal);
        dp[i][w] = resultVal;

        const decision = takeVal > prevVal ? 'included' : 'excluded';
        const explanation =
          decision === 'included'
            ? `File '${file.name}' fits (${size} MB ≤ ${w} MB). Including it yields ${value} + dp[${i - 1}][${w - size}] (${dp[i - 1][w - size]}) = ${takeVal}, higher than excluding it (${prevVal}).`
            : `File '${file.name}' fits (${size} MB ≤ ${w} MB). Taking it yields ${takeVal}, but excluding it preserves ${prevVal}, so we choose max(${prevVal}, ${takeVal}) = ${resultVal}.`;

        steps.push({
          stepIndex: stepCounter++,
          i,
          w,
          file,
          canFit: true,
          prevVal,
          takeVal,
          resultVal,
          decision,
          explanation,
        });
      } else {
        dp[i][w] = prevVal;
        steps.push({
          stepIndex: stepCounter++,
          i,
          w,
          file,
          canFit: false,
          prevVal,
          resultVal: prevVal,
          decision: 'skip_too_large',
          explanation: `File '${file.name}' size (${size} MB) exceeds current capacity slot ${w} MB. Retaining previous value dp[${i - 1}][${w}] = ${prevVal}.`,
        });
      }
    }
  }

  return steps;
}

/**
 * Compares DP 0/1 Knapsack with common greedy heuristics
 * to demonstrate why dynamic programming is required for 0/1 knapsack.
 */
export function compareHeuristics(
  files: StorageFile[],
  capacity: number
): HeuristicComparison[] {
  const dpResult = storageOptimizer(files, capacity);
  const dpOptimalValue = dpResult.totalValue;

  // 1. Greedy by Value Density (Value / Size ratio)
  const densitySorted = [...files].sort(
    (a, b) => b.value / b.size - a.value / a.size
  );
  const greedyDensityFiles: StorageFile[] = [];
  let densitySize = 0;
  let densityValue = 0;
  for (const f of densitySorted) {
    if (densitySize + f.size <= capacity) {
      greedyDensityFiles.push(f);
      densitySize += f.size;
      densityValue += f.value;
    }
  }

  // 2. Greedy by Absolute Value
  const valueSorted = [...files].sort((a, b) => b.value - a.value);
  const greedyValueFiles: StorageFile[] = [];
  let valSize = 0;
  let valTotal = 0;
  for (const f of valueSorted) {
    if (valSize + f.size <= capacity) {
      greedyValueFiles.push(f);
      valSize += f.size;
      valTotal += f.value;
    }
  }

  // 3. Greedy by Smallest Size (maximize file count)
  const sizeSorted = [...files].sort((a, b) => a.size - b.size);
  const greedySizeFiles: StorageFile[] = [];
  let sSize = 0;
  let sTotal = 0;
  for (const f of sizeSorted) {
    if (sSize + f.size <= capacity) {
      greedySizeFiles.push(f);
      sSize += f.size;
      sTotal += f.value;
    }
  }

  const calcGap = (val: number) =>
    dpOptimalValue > 0
      ? Math.round(((dpOptimalValue - val) / dpOptimalValue) * 100 * 10) / 10
      : 0;

  return [
    {
      name: '0/1 Knapsack DP (Optimal)',
      strategy: 'dp_optimal',
      selectedFiles: dpResult.selectedFiles,
      totalSize: dpResult.totalSize,
      totalValue: dpResult.totalValue,
      optimalityGap: 0,
      description:
        'Guaranteed globally optimal storage allocation. Evaluates all subproblems via dynamic programming memoization.',
    },
    {
      name: 'Greedy by Value Density',
      strategy: 'greedy_density',
      selectedFiles: greedyDensityFiles,
      totalSize: densitySize,
      totalValue: densityValue,
      optimalityGap: calcGap(densityValue),
      description:
        'Picks files with highest (Value / Size) ratio first. Optimal for fractional knapsack, but often sub-optimal for 0/1 knapsack.',
    },
    {
      name: 'Greedy by Highest Value',
      strategy: 'greedy_value',
      selectedFiles: greedyValueFiles,
      totalSize: valSize,
      totalValue: valTotal,
      optimalityGap: calcGap(valTotal),
      description:
        'Prioritizes the most valuable files first. Can quickly fill space with large, bulky files, leaving no room for high-utility smaller files.',
    },
    {
      name: 'Greedy by Smallest Size',
      strategy: 'greedy_size',
      selectedFiles: greedySizeFiles,
      totalSize: sSize,
      totalValue: sTotal,
      optimalityGap: calcGap(sTotal),
      description:
        'Packs the maximum number of individual files. Maximizes count, but frequently misses high-value critical assets.',
    },
  ];
}

/**
 * Produces the exact console output of the user's Python script.
 */
export function formatPythonCLIOutput(
  files: StorageFile[],
  capacity: number,
  result: OptimizationResult
): string {
  const lines: string[] = [];
  lines.push('=======================================================');
  lines.push('       DIGITAL FILE STORAGE OPTIMIZER');
  lines.push('          Using 0/1 Knapsack Algorithm');
  lines.push('=======================================================');
  lines.push('');
  lines.push(`Enter number of files: ${files.length}`);

  files.forEach((f, idx) => {
    lines.push(`\nFile ${idx + 1}`);
    lines.push(`Enter file name: ${f.name}`);
    lines.push(`Enter file size (MB): ${f.size}`);
    lines.push(`Enter file importance/value: ${f.value}`);
  });

  lines.push(`\nEnter available storage capacity (MB): ${capacity}`);
  lines.push('');
  lines.push('=======================================================');
  lines.push('              OPTIMIZATION RESULT');
  lines.push('=======================================================');

  if (result.selectedFiles.length === 0) {
    lines.push('No files can be stored within the given capacity.');
  } else {
    lines.push('\nSelected Files:');
    lines.push('-------------------------------------------------------');
    lines.push(
      `${'File Name'.padEnd(20)}${'Size (MB)'.padEnd(15)}${'Value'.padEnd(10)}`
    );
    lines.push('-------------------------------------------------------');

    for (const f of result.selectedFiles) {
      lines.push(
        `${f.name.slice(0, 19).padEnd(20)}${String(f.size).padEnd(15)}${String(f.value).padEnd(10)}`
      );
    }

    lines.push('-------------------------------------------------------');
    lines.push(`Total Storage Used : ${result.totalSize} MB`);
    lines.push(`Storage Available  : ${capacity} MB`);
    lines.push(`Remaining Storage  : ${result.remainingStorage} MB`);
    lines.push(`Total Value        : ${result.totalValue}`);
  }

  lines.push('\n=======================================================');
  lines.push('Optimization completed successfully!');
  lines.push('=======================================================');

  return lines.join('\n');
}
