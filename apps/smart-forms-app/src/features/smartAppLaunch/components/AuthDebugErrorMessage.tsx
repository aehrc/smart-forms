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
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AuthDebugErrorMessageProps {
  errorMessage: string;
}

function AuthDebugErrorMessage(props: AuthDebugErrorMessageProps) {
  const { errorMessage } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Accordion expanded={isExpanded} onChange={(_, expanded) => setIsExpanded(expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>Error provided from launcher:</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>{errorMessage}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default AuthDebugErrorMessage;
