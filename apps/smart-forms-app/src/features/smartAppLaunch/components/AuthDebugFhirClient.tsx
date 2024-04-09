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

import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { grey } from '@mui/material/colors';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import type Client from 'fhirclient/lib/Client';

interface AuthDebugFhirClientProps {
  smartClient: Client | null;
}

function AuthDebugFhirClient(props: AuthDebugFhirClientProps) {
  const { smartClient } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Accordion expanded={isExpanded} onChange={(_, expanded) => setIsExpanded(expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>FHIRClient:</Typography>
        <Typography fontWeight={600}>FHIRClient:</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography>FhirClient object</Typography>
          <Tooltip title="Log to console" color="primary">
            <IconButton size="small" onClick={() => console.log(smartClient)}>
              <HistoryEduIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box mt={0.5} mb={2} p={1} sx={{ border: `1px solid ${grey.A200}`, borderRadius: 1 }}>
          <pre style={{ fontSize: 9 }}>{JSON.stringify(smartClient, null, 2)}</pre>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

export default AuthDebugFhirClient;
