import fs from 'fs';
import path from 'path';

export function saveDebugData(data: any, stepName: string): void {
  try {
    // Create timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    
    // Log debug data to console
    console.group(`Debug Data - ${stepName} (${timestamp})`);
    console.log(JSON.stringify(data, null, 2));
    console.groupEnd();
  } catch (error) {
    console.error('Error saving debug data:', error);
  }
} 