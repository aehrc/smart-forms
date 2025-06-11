/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar, VariantType } from 'notistack';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { grey } from '@mui/material/colors';

interface CloseSnackbarProps {
  variant?: VariantType;
}

function CloseSnackbar(props: CloseSnackbarProps) {
  const { variant } = props;

  const { closeSnackbar } = useSnackbar();
  const theme = useTheme();

  const colorMap = useMemo(
    () => ({
      default: grey[500],
      success: grey[200],
      error: grey[200],
      warning: grey[200],
      info: grey[200]
    }),
    [theme.palette]
  );

  return (
    <>
      <Tooltip title="Close">
        <IconButton
          sx={{
            ...(variant && colorMap[variant] && { color: colorMap[variant] })
          }}
          onClick={() => {
            closeSnackbar();
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default CloseSnackbar;
