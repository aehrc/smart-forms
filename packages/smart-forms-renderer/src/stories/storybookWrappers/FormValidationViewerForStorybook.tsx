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

// @ts-ignore
import React from 'react';
import { useQuestionnaireResponseStore } from '../../stores';

function FormValidationViewerForStorybook() {
  const invalidItems = useQuestionnaireResponseStore.use.invalidItems();

  return <pre style={{ fontSize: 9 }}>{JSON.stringify(invalidItems, null, 2)}</pre>;
}

export default FormValidationViewerForStorybook;
