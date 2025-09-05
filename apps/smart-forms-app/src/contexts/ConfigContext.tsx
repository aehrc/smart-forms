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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppConfig {
  terminologyServerUrl: string;
  formsServerUrl: string;
  launchScope: string;
  launchClientId: string;
  inAppPopulate: boolean;
  enableDynamicClientRegistration: boolean;
  dynamicRegistrationFallbackEnabled: boolean;
  additionalRedirectUris: string;
  appTitle: string;
  showDebugMode: boolean;
}

interface ClientConfig {
  [issuer: string]: string;
}

interface Config {
  clientIds: ClientConfig;
  appConfig: AppConfig;
}

interface ConfigContextType {
  config: Config | null;
  loading: boolean;
  error: string | null;
  getClientId: (issuer: string) => string | null;
  getAppConfig: () => AppConfig | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Default configuration fallback
const defaultConfig: Config = {
  clientIds: {},
  appConfig: {
    terminologyServerUrl: 'https://tx.ontoserver.csiro.au/fhir',
    formsServerUrl: 'https://smartforms.csiro.au/api/fhir',
    launchScope: 'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs',
    launchClientId: 'smart-forms-client-id',
    inAppPopulate: true,
    enableDynamicClientRegistration: true,
    dynamicRegistrationFallbackEnabled: true,
    additionalRedirectUris: '',
    appTitle: 'Smart Forms',
    showDebugMode: false
  }
};

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading configuration from config.json');
        const response = await fetch('/config.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
        }

        const loadedConfig: Config = await response.json();
        
        // Validate configuration
        const validationResult = validateConfig(loadedConfig);
        if (!validationResult.isValid) {
          console.error('Configuration validation failed:', validationResult.errors);
          setError(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
          // Redirect to config checker if there are critical errors
          if (window.location.pathname !== '/config-check') {
            window.location.href = '/config-check';
            return;
          }
        }
        
        setConfig(loadedConfig);
        console.log('Configuration loaded successfully:', loadedConfig);
      } catch (err) {
        console.error('Error loading configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        // Use default configuration as fallback
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const validateConfig = (config: Config): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if config has required structure
    if (!config.clientIds || typeof config.clientIds !== 'object') {
      errors.push('Missing or invalid clientIds configuration');
    }

    if (!config.appConfig || typeof config.appConfig !== 'object') {
      errors.push('Missing or invalid appConfig configuration');
    } else {
      const { appConfig } = config;

      // Required string fields
      const requiredStringFields = [
        'terminologyServerUrl',
        'formsServerUrl',
        'launchScope',
        'launchClientId',
        'appTitle'
      ];

      requiredStringFields.forEach(field => {
        if (!appConfig[field as keyof AppConfig] || typeof appConfig[field as keyof AppConfig] !== 'string') {
          errors.push(`Missing or invalid ${field} in appConfig`);
        }
      });

      // Required boolean fields
      const requiredBooleanFields = [
        'inAppPopulate',
        'enableDynamicClientRegistration',
        'dynamicRegistrationFallbackEnabled',
        'showDebugMode'
      ];

      requiredBooleanFields.forEach(field => {
        if (typeof appConfig[field as keyof AppConfig] !== 'boolean') {
          errors.push(`Missing or invalid ${field} in appConfig (must be boolean)`);
        }
      });

      // URL validation
      try {
        new URL(appConfig.terminologyServerUrl);
      } catch {
        errors.push('terminologyServerUrl is not a valid URL');
      }

      try {
        new URL(appConfig.formsServerUrl);
      } catch {
        errors.push('formsServerUrl is not a valid URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getClientId = (issuer: string): string | null => {
    if (!config) return null;
    return config.clientIds[issuer] || null;
  };

  const getAppConfig = (): AppConfig | null => {
    if (!config) return null;
    return config.appConfig;
  };

  const value: ConfigContextType = {
    config,
    loading,
    error,
    getClientId,
    getAppConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
