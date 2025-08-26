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
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowTerminologyServerStoreProperty from '../../hooks/useShowTerminologyServerStoreProperty.ts';

const terminologyServerStorePropertyNames: string[] = ['url'];

interface TerminologyServerStoreViewerProps {
  statePropNameFilter: string;
}

function TerminologyServerStoreViewer(props: TerminologyServerStoreViewerProps) {
  const { statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('url');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const propertyObject = useShowTerminologyServerStoreProperty(selectedProperty);

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={terminologyServerStorePropertyNames}
        statePropNameFilter={statePropNameFilter}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={propertyObject}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </>
  );
}

export default TerminologyServerStoreViewer;
