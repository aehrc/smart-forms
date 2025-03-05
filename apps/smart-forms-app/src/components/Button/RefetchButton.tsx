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

import { Box, Fade, IconButton, Tooltip, Typography } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

interface RefetchButtonProps {
  isFetching: boolean;
  refetchResources: () => void;
}

function RefetchButton(props: RefetchButtonProps) {
  const { isFetching, refetchResources } = props;

  return (
    <Box display="flex" alignItems="center" sx={{ px: 1.5 }} columnGap={1}>
      <Tooltip title="Sync">
        <span>
          <IconButton onClick={refetchResources} disabled={isFetching}>
            <SyncIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Fade in={isFetching}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ pb: 0.25 }}>
          Updating...
        </Typography>
      </Fade>
    </Box>
  );
}

export default RefetchButton;
