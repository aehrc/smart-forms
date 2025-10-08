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

import React from 'react';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { getSliderMarks } from '../../../utils/slider';
import Stack from '@mui/material/Stack';
import SliderLabels from './SliderLabels';
import SliderDisplayValue from './SliderDisplayValue';
import { useRendererConfigStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';
import { StandardSlider } from './Slider.styles';

interface SliderFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  value: number;
  minValue: number;
  minLabel: string;
  maxValue: number;
  maxLabel: string;
  stepValue: number;
  isInteracted: boolean;
  feedback: string;
  readOnly: boolean;
  onValueChange: (newValue: number) => void;
}

function SliderField(props: SliderFieldProps) {
  const {
    linkId,
    itemType,
    value,
    minValue,
    maxValue,
    stepValue,
    minLabel,
    maxLabel,
    isInteracted,
    feedback,
    readOnly,
    isTabled,
    onValueChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  const sliderMarks = getSliderMarks(minValue, maxValue, minLabel, maxLabel, stepValue);

  const sliderSx = {
    maxWidth: !isTabled ? textFieldWidth : 3000,
    minWidth: 160
  };

  const hasLabels = !!(minLabel || maxLabel);

  return (
    <>
      <Stack sx={{ ...sliderSx }}>
        <SliderDisplayValue value={value} hasLabels={hasLabels} isInteracted={isInteracted} />
        {hasLabels ? <SliderLabels minLabel={minLabel} maxLabel={maxLabel} /> : null}
        <StandardSlider
          id={itemType + '-' + linkId}
          value={value}
          min={minValue}
          max={maxValue}
          step={stepValue}
          marks={sliderMarks}
          sx={{ ...sliderSx }}
          onChange={(_, newValue) => {
            // If item.readOnly=true, do not allow any changes
            if (readOnly) {
              return;
            }

            if (typeof newValue === 'number') {
              onValueChange(newValue);
            }
          }}
          disabled={readOnly && readOnlyVisualStyle === 'disabled'}
          readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
          aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
          valueLabelDisplay="auto"
          data-test="q-item-slider-field"
        />
      </Stack>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default SliderField;
