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

import { Box, Chip, Typography } from '@mui/material';
import { Cancel, CheckCircle } from '@mui/icons-material';

interface ConfigCheckerListItemProps {
  label: string;
  isValid: boolean;
  type: string;
  description: string;
}

function ConfigCheckerListItem({ label, isValid, type, description }: ConfigCheckerListItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none'
        }
      }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" component="div">
            {label}
          </Typography>
          <Chip
            label={type}
            size="small"
            variant="outlined"
            sx={{
              fontSize: '0.75rem',
              height: 20
            }}
          />
        </Box>
        <Typography color="text.secondary" sx={{ wordBreak: 'break-word' }}>
          {description}
        </Typography>
      </Box>
      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
        {isValid ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
            <CheckCircle fontSize="small" />
            <Typography>Valid</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
            <Cancel fontSize="small" />
            <Typography>Invalid</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ConfigCheckerListItem;
