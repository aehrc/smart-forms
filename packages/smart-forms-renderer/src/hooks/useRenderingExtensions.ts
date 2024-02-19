/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import {
  getMaxLength,
  getMinLength,
  getReadOnly,
  getRegexValidation,
  getTextDisplayInstructions,
  getTextDisplayPrompt,
  getTextDisplayUnit
} from '../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import type { RegexValidation } from '../interfaces/regex.interface';
import { structuredDataCapture } from 'fhir-sdc-helpers';

interface RenderingExtensions {
  displayUnit: string;
  displayPrompt: string;
  displayInstructions: string;
  readOnly: boolean;
  entryFormat: string;
  required: boolean;
  regexValidation: RegexValidation | null;
  minLength: number | null;
  maxLength: number | null;
}

function useRenderingExtensions(qItem: QuestionnaireItem): RenderingExtensions {
  return {
    displayUnit: getTextDisplayUnit(qItem),
    displayPrompt: getTextDisplayPrompt(qItem),
    displayInstructions: getTextDisplayInstructions(qItem),
    readOnly: getReadOnly(qItem),
    entryFormat: structuredDataCapture.getEntryFormat(qItem) ?? '',
    required: qItem.required ?? false,
    regexValidation: getRegexValidation(qItem),
    minLength: getMinLength(qItem),
    maxLength: getMaxLength(qItem)
  };
}

export default useRenderingExtensions;
