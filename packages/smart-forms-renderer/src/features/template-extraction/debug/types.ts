export interface DebugStep {
  step: string;
  status: 'success' | 'error' | 'warning';
  timestamp: string;
  data?: any;
  message?: string;
} 