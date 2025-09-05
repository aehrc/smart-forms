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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { ErrorOutline, Warning } from '@mui/icons-material';
import { useConfig } from '../contexts/ConfigContext';

interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const ConfigChecker: React.FC = () => {
  const { config, loading, error } = useConfig();
  const [validationResult, setValidationResult] = useState<ConfigValidationResult | null>(null);

  useEffect(() => {
    if (!loading && config) {
      validateConfig(config);
    }
  }, [config, loading]);

  const validateConfig = (config: any): void => {
    const errors: string[] = [];
    const warnings: string[] = [];

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

      requiredStringFields.forEach((field) => {
        if (!appConfig[field] || typeof appConfig[field] !== 'string') {
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

      requiredBooleanFields.forEach((field) => {
        if (typeof appConfig[field] !== 'boolean') {
          errors.push(`Missing or invalid ${field} in appConfig (must be boolean)`);
        }
      });

      // Optional fields validation
      if (
        appConfig.additionalRedirectUris &&
        typeof appConfig.additionalRedirectUris !== 'string'
      ) {
        warnings.push('additionalRedirectUris should be a string');
      }

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

    // Check if there are any client IDs configured
    if (config.clientIds && Object.keys(config.clientIds).length === 0) {
      warnings.push('No client IDs configured - app will use default client ID only');
    }

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading configuration...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent>
            <Alert severity="error">
              <AlertTitle>Configuration Error</AlertTitle>
              Failed to load configuration: {error}
            </Alert>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="contained" onClick={handleRetry}>
                Retry
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!validationResult) {
    return null;
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Configuration Checker
          </Typography>

          {validationResult.isValid ? (
            <Alert severity="success">
              <AlertTitle>Configuration Valid</AlertTitle>
              All configuration settings are valid. You can proceed to use the application.
            </Alert>
          ) : (
            <Alert severity="error">
              <AlertTitle>Configuration Invalid</AlertTitle>
              Please fix the following errors before proceeding:
            </Alert>
          )}

          {validationResult.errors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Errors:
              </Typography>
              <List dense>
                {validationResult.errors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ErrorOutline color="error" />
                    </ListItemIcon>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {validationResult.warnings.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Warnings:
              </Typography>
              <List dense>
                {validationResult.warnings.map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {validationResult.isValid && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="contained" onClick={() => (window.location.href = '/')}>
                Continue to Application
              </Button>
            </Box>
          )}

          {!validationResult.isValid && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="contained" onClick={handleRetry}>
                Retry Configuration Check
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Configuration File:</strong> public/config.json
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Documentation:</strong> See LOCAL_DEVELOPMENT.md for configuration details
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigChecker;
