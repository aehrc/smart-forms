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

import { getTextDisplayLower, getTextDisplayUpper } from '../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import { getMaxValue, getMinValue, getSliderStepValue } from '../utils/slider';

const defaultMinValue = 0;
const defaultMinLabel = '0';

const defaultMaxValue = 100;
const defaultMaxLabel = '100';

const defaultStepValue = 1;

interface SliderExtensions {
  minValue: number;
  minLabel: string;
  maxValue: number;
  maxLabel: string;
  stepValue: number;
}

function useSliderExtensions(qItem: QuestionnaireItem): SliderExtensions {
  const minValue = getMinValue(qItem) ?? defaultMinValue;
  const maxValue = getMaxValue(qItem) ?? defaultMaxValue;
  return {
    minValue: minValue,
    minLabel: getTextDisplayLower(qItem) ?? minValue.toString() ?? defaultMinLabel,
    maxValue: maxValue,
    maxLabel: getTextDisplayUpper(qItem) ?? maxValue.toString() ?? defaultMaxLabel,
    stepValue: getSliderStepValue(qItem) ?? defaultStepValue
  };
}

export default useSliderExtensions;
