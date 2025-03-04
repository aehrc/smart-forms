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

import type { JSX } from 'react';
import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useQuestionnaireStore } from '../../../stores';

interface FlyoverItemProps {
  displayFlyover: string | JSX.Element | JSX.Element[];
  readOnly: boolean;
}

function FlyoverItem(props: FlyoverItemProps) {
  const { displayFlyover, readOnly } = props;

  const sdcUiOverrideComponents = useQuestionnaireStore.use.sdcUiOverrideComponents();
  const FlyoverOverrideComponent = sdcUiOverrideComponents['flyover'];

  // If a flyover override component is defined for this item, render it
  if (FlyoverOverrideComponent && typeof FlyoverOverrideComponent === 'function') {
    return <FlyoverOverrideComponent displayText={displayFlyover} readOnly={readOnly} />;
  }

  return (
    <Tooltip
      title={displayFlyover}
      placement="top"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8]
              }
            }
          ]
        }
      }}>
      <span>
        <InfoOutlinedIcon sx={{ color: 'text.secondary' }} fontSize="small" />
      </span>
    </Tooltip>
  );
}

export default FlyoverItem;
