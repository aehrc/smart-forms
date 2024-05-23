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

import QuestionnaireStoreViewer from './StoreStateViewers/QuestionnaireStoreViewer.tsx';
import SmartConfigStoreViewer from './StoreStateViewers/SmartConfigStoreViewer.tsx';
import QuestionnaireResponseStoreViewer from './StoreStateViewers/QuestionnaireResponseStoreViewer.tsx';
import TerminologyServerStoreViewer from './StoreStateViewers/TerminologyServerStoreViewer.tsx';
import { Typography } from '@mui/material';

export type StateStore =
  | 'questionnaireStore'
  | 'questionnaireResponseStore'
  | 'smartConfigStore'
  | 'terminologyServerStore'
  | null;

interface StoreStateViewerProps {
  selectedStore: StateStore;
}

function StoreStateViewer(props: StoreStateViewerProps) {
  const { selectedStore } = props;

  if (selectedStore === 'questionnaireStore') {
    return <QuestionnaireStoreViewer />;
  }

  if (selectedStore === 'questionnaireResponseStore') {
    return <QuestionnaireResponseStoreViewer />;
  }

  if (selectedStore === 'smartConfigStore') {
    return <SmartConfigStoreViewer />;
  }

  if (selectedStore === 'terminologyServerStore') {
    return <TerminologyServerStoreViewer />;
  }

  return <Typography variant="h5">No store selected</Typography>;
}

export default StoreStateViewer;
