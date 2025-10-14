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

import { useState } from 'react';
import StorePropertyViewer from './StorePropertyViewer.tsx';
import useSelectedProperty from '../../hooks/useSelectedProperty.ts';
import { useTerminologyServerStore } from '@aehrc/smart-forms-renderer';
import StorePropertyPicker from './StorePropertyPicker.tsx';

interface TerminologyServerStoreViewerProps {
  propKeyFilter: string;
}

function TerminologyServerStoreViewer(props: TerminologyServerStoreViewerProps) {
  const { propKeyFilter } = props;

  const [selectedPropKey, setSelectedPropKey] = useState('url');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const { selectedPropVal, allPropKeys } = useSelectedProperty(
    selectedPropKey,
    useTerminologyServerStore.use
  );

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  return (
    <>
      <StorePropertyPicker
        propKeys={allPropKeys}
        propKeyFilter={propKeyFilter}
        selectedProp={selectedPropKey}
        onSelectProp={setSelectedPropKey}
      />
      <StorePropertyViewer
        selectedPropKey={selectedPropKey}
        selectedPropVal={selectedPropVal}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </>
  );
}

export default TerminologyServerStoreViewer;
