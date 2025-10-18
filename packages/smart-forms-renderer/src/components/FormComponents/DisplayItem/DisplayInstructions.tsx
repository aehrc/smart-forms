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

import type { ReactNode } from 'react';
import React, { memo } from 'react';
import Typography from '@mui/material/Typography';
import { DisplayInstructionsWrapper } from './DisplayInstructions.styles';

interface DisplayInstructionsProps {
  id?: string;
  readOnly: boolean;
  children?: ReactNode;
}

const DisplayInstructions = memo(function DisplayInstructions(props: DisplayInstructionsProps) {
  const { id, readOnly, children } = props;

  return children ? (
    <DisplayInstructionsWrapper>
      <Typography
        id={id}
        component="span"
        variant="caption"
        color={readOnly ? 'text.secondary' : 'text.primary'}>
        <>{children}</>
      </Typography>
    </DisplayInstructionsWrapper>
  ) : null;
});

export default DisplayInstructions;
