/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Configuration interface for mounted config file
 */
export interface MountedConfig {
  client_id?: string;
  forms_server_url?: string;
  terminology_server_url?: string;
  launch_scope?: string;
  in_app_populate?: boolean;
  show_debug_mode?: boolean;
}

/**
 * Configuration loader that supports both mounted config files and environment variables
 * Priority: Environment Variables > Mounted Config File > Default Values
 */
class ConfigLoader {
  private mountedConfig: MountedConfig | null = null;
  private configLoaded = false;

  /**
   * Load configuration from mounted config file
   * This is called asynchronously to avoid blocking the initial render
   */
  async loadMountedConfig(): Promise<void> {
    if (this.configLoaded) return;

    try {
      const response = await fetch('/config/config.json');
      if (response.ok) {
        this.mountedConfig = await response.json();
        console.log('Configuration loaded from mounted config file:', this.mountedConfig);
      } else {
        console.log('No mounted config file found, using environment variables and defaults');
      }
    } catch (error) {
      console.log('Failed to load mounted config file, using environment variables and defaults:', error);
    } finally {
      this.configLoaded = true;
    }
  }

  /**
   * Get configuration value with priority: env var > mounted config > default
   */
  getConfigValue(
    envKey: string,
    configKey: keyof MountedConfig,
    defaultValue: string | boolean
  ): string | boolean {
    // Priority 1: Environment variable
    const envValue = import.meta.env[envKey];
    if (envValue !== undefined) {
      return typeof defaultValue === 'boolean' ? envValue === 'true' : envValue;
    }

    // Priority 2: Mounted config file
    if (this.mountedConfig && this.mountedConfig[configKey] !== undefined) {
      return this.mountedConfig[configKey] as string | boolean;
    }

    // Priority 3: Default value
    return defaultValue;
  }

  /**
   * Get string configuration value
   */
  getStringValue(envKey: string, configKey: keyof MountedConfig, defaultValue: string): string {
    return this.getConfigValue(envKey, configKey, defaultValue) as string;
  }

  /**
   * Get boolean configuration value
   */
  getBooleanValue(envKey: string, configKey: keyof MountedConfig, defaultValue: boolean): boolean {
    return this.getConfigValue(envKey, configKey, defaultValue) as boolean;
  }

  /**
   * Check if mounted config is available
   */
  hasMountedConfig(): boolean {
    return this.mountedConfig !== null;
  }

  /**
   * Get the mounted config (for debugging)
   */
  getMountedConfig(): MountedConfig | null {
    return this.mountedConfig;
  }
}

// Export singleton instance
export const configLoader = new ConfigLoader();

// Load mounted config asynchronously
configLoader.loadMountedConfig();
