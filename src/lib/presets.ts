import { PresetScenario } from '../types';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'cloud_backup',
    name: 'Cloud Disaster Recovery',
    description: 'Critical database snapshots, SSL keys, server configurations, and user logs under tight snapshot quotas.',
    capacity: 35,
    unit: 'MB',
    files: [
      { id: 'f-1', name: 'Postgres_Core_Dump.sql', size: 14, value: 92, category: 'database', extension: 'sql' },
      { id: 'f-2', name: 'SSL_Wildcard_Certs.tar', size: 3, value: 85, category: 'archive', extension: 'tar' },
      { id: 'f-3', name: 'Env_Configs_Production.env', size: 2, value: 75, category: 'code', extension: 'env' },
      { id: 'f-4', name: 'User_Telemetry_Archive.parquet', size: 18, value: 65, category: 'database', extension: 'parquet' },
      { id: 'f-5', name: 'Docker_Service_Images.tar.gz', size: 22, value: 78, category: 'archive', extension: 'tar.gz' },
      { id: 'f-6', name: 'Audit_Compliance_Report.pdf', size: 8, value: 58, category: 'document', extension: 'pdf' },
      { id: 'f-7', name: 'Redis_State_Snapshot.rdb', size: 9, value: 68, category: 'database', extension: 'rdb' },
    ],
  },
  {
    id: 'python_cli_demo',
    name: 'Python Script Classic',
    description: 'Standard textbook problem demonstrating the exact DP Knapsack execution path from the reference code.',
    capacity: 16,
    unit: 'MB',
    files: [
      { id: 'p-1', name: 'Research_Paper.pdf', size: 3, value: 12, category: 'document', extension: 'pdf' },
      { id: 'p-2', name: 'Raw_Dataset_Sample.csv', size: 5, value: 20, category: 'database', extension: 'csv' },
      { id: 'p-3', name: 'Compressed_Logs.zip', size: 6, value: 24, category: 'archive', extension: 'zip' },
      { id: 'p-4', name: 'Kernel_Patch.bin', size: 8, value: 34, category: 'system', extension: 'bin' },
      { id: 'p-5', name: 'System_Image.iso', size: 10, value: 42, category: 'system', extension: 'iso' },
    ],
  },
  {
    id: 'expedition_field',
    name: 'Off-Grid Expedition Drive',
    description: 'Field research team saving drone telemetry, topographic lidar maps, and emergency firmware before radio blackout.',
    capacity: 28,
    unit: 'MB',
    files: [
      { id: 'e-1', name: 'Lidar_Elevation_Mesh.obj', size: 12, value: 88, category: 'media', extension: 'obj' },
      { id: 'e-2', name: 'Satellite_Weather_Grid.nc', size: 7, value: 72, category: 'database', extension: 'nc' },
      { id: 'e-3', name: 'GPS_Route_Waypoints.gpx', size: 2, value: 95, category: 'document', extension: 'gpx' },
      { id: 'e-4', name: 'Thermal_Drone_Scan.mp4', size: 15, value: 60, category: 'media', extension: 'mp4' },
      { id: 'e-5', name: 'Emergency_Radio_Firmware.bin', size: 4, value: 90, category: 'system', extension: 'bin' },
      { id: 'e-6', name: 'Species_Sample_Catalog.sqlite', size: 8, value: 55, category: 'database', extension: 'sqlite' },
    ],
  },
  {
    id: 'edge_cache',
    name: 'Embedded Edge RAM Buffer',
    description: 'High-speed edge node selecting in-memory working sets to maximize hit-rate within a restricted 20 MB buffer.',
    capacity: 20,
    unit: 'MB',
    files: [
      { id: 'b-1', name: 'High_Frequency_Orderbook.dat', size: 6, value: 80, category: 'database', extension: 'dat' },
      { id: 'b-2', name: 'Auth_Session_Tokens.bin', size: 4, value: 70, category: 'system', extension: 'bin' },
      { id: 'b-3', name: 'CDN_CSS_Bundle.min.css', size: 2, value: 40, category: 'code', extension: 'css' },
      { id: 'b-4', name: 'Fraud_Detection_Weights.onnx', size: 11, value: 95, category: 'system', extension: 'onnx' },
      { id: 'b-5', name: 'Locale_Translations.json', size: 5, value: 35, category: 'document', extension: 'json' },
    ],
  },
];
