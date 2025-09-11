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

import { Box, Paper, Typography } from '@mui/material';
import { AppConfig, isValidRegisteredClientIds, isValidUrl } from '../utils/config.ts';
import ConfigCheckerProgress from './ConfigCheckerProgress.tsx';
import ConfigCheckerListItem from './ConfigCheckerListItem.tsx';
import { useMemo } from 'react';

export interface ConfigCheckerItem {
  label: string;
  isValid: boolean;
  type: string;
  description: string;
}

interface ConfigCheckerListProps {
  config: Partial<AppConfig>;
}

function ConfigCheckerList(props: ConfigCheckerListProps) {
  const { config } = props;

  const mandatoryConfigItems: ConfigCheckerItem[] = [
    {
      label: 'Terminology Server URL',
      isValid: isValidUrl(config.terminologyServerUrl),
      type: 'string',
      description: config.terminologyServerUrl || 'Terminology server not configured'
    },
    {
      label: 'Forms Server URL',
      isValid: isValidUrl(config.formsServerUrl),
      type: 'string',
      description: config.formsServerUrl || 'Forms server not configured'
    },
    {
      label: 'Default Client ID',
      isValid: typeof config.defaultClientId === 'string' && config.defaultClientId !== '',
      type: 'string',
      description: config.defaultClientId || 'Default SMART App Launch client ID not configured'
    },
    {
      label: 'Default Launch Scope',
      isValid: typeof config.defaultLaunchScope === 'string' && config.defaultLaunchScope !== '',
      type: 'string',
      description: config.defaultLaunchScope || 'Default SMART App Launch scopes  not configured'
    },
    {
      label: 'InAppPopulate',
      isValid: typeof config.inAppPopulate === 'boolean',
      type: 'boolean',
      description:
        typeof config.inAppPopulate === 'boolean'
          ? config.inAppPopulate.toString()
          : 'Authorization setting not configured'
    }
  ];

  const formattedRegisteredClientIds = useMemo(() => {
    return config.registeredClientIds
      ? Object.entries(config.registeredClientIds)
          .map(([key, value]: [string, string]) => `<${key}, ${value}>`)
          .join(', ')
      : 'null';
  }, [config.registeredClientIds]);

  const nullableConfigItems: ConfigCheckerItem[] = [
    ...(config.registeredClientIdsUrl !== undefined
      ? [
          {
            label: 'Registered Client IDs URL',
            isValid: isValidUrl(config.registeredClientIdsUrl),
            type: 'string',
            description: `Set value: ${
              config.registeredClientIdsUrl === ''
                ? '<empty string>'
                : config.registeredClientIdsUrl
            }`
          }
        ]
      : []),
    ...(config.registeredClientIds !== undefined
      ? [
          {
            label: 'Registered Client IDs',
            isValid: isValidRegisteredClientIds(config.registeredClientIds),
            type: 'object',
            description: `Set value: ${
              config.registeredClientIdsUrl === null ? 'null' : formattedRegisteredClientIds
            }`
          }
        ]
      : [])
  ];

  const mandatoryValidCount = mandatoryConfigItems.filter((item) => item.isValid).length;
  const mandatoryTotalCount = mandatoryConfigItems.length;
  const optionalValidCount = nullableConfigItems.filter((item) => item.isValid).length;
  const optionalTotalCount = nullableConfigItems.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Mandatory Configuration */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Mandatory Configuration
        </Typography>
        <ConfigCheckerProgress totalCount={mandatoryTotalCount} validCount={mandatoryValidCount} />

        <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
          {mandatoryConfigItems.map((item, index) => (
            <ConfigCheckerListItem
              key={index}
              label={item.label}
              isValid={item.isValid}
              type={item.type}
              description={item.description}
            />
          ))}
        </Paper>
      </Box>

      {/* Nullable Configuration */}
      {nullableConfigItems.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Nullable Configuration
          </Typography>
          <ConfigCheckerProgress validCount={optionalValidCount} totalCount={optionalTotalCount} />
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            {nullableConfigItems.map((item, index) => (
              <ConfigCheckerListItem
                key={index}
                label={item.label}
                isValid={item.isValid}
                type={item.type}
                description={item.description}
              />
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ConfigCheckerList;
