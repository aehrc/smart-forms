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

import Editor, { useMonaco } from '@monaco-editor/react';
import { useState } from 'react';
import type { editor } from 'monaco-editor';
import { Box, Button, Divider, Stack } from '@mui/material';
import type { StateStore } from './StoreStateViewer.tsx';
import StoreStateViewer from './StoreStateViewer.tsx';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

interface JsonEditorProps {
  jsonString: string;
  onJsonStringChange: (jsonString: string) => void;
  buildingState: 'idle' | 'building' | 'built';
  fhirServerUrl: string;
  onBuildForm: (jsonString: string) => unknown;
  onDestroyForm: () => unknown;
}

function JsonEditor(props: JsonEditorProps) {
  const {
    jsonString,
    onJsonStringChange,
    buildingState,
    fhirServerUrl,
    onBuildForm,
    onDestroyForm
  } = props;

  const [view, setView] = useState<'editor' | 'storeState'>('editor');
  const [selectedStore, setSelectedStore] = useState<StateStore>('questionnaireResponseStore');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  function handleEditorChange(value: string | undefined) {
    onJsonStringChange(value ?? '');
  }

  function handleEditorValidation(markers: editor.IMarkerData[] | undefined) {
    const markerMessages = markers?.map((marker) => marker.message);

    if (markerMessages) {
      setErrorMessages(markerMessages);
    }
  }

  const monaco = useMonaco();

  return (
    <Box height="100%">
      <Stack direction="row" gap={0.5} sx={{ py: 0.25, px: 1, overflowX: 'auto' }}>
        <Button
          disabled={errorMessages.length > 0 || jsonString === ''}
          onClick={() => onBuildForm(jsonString)}>
          {buildingState === 'built' ? 'Rebuild form' : 'Build form'}
        </Button>

        {buildingState !== 'idle' ? (
          <>
            <Button
              color="error"
              onClick={() => {
                setView('editor');
                onDestroyForm();
              }}>
              Destroy Form
            </Button>
            {view === 'editor' ? (
              <Button
                data-test="see-store-state-button-playground"
                onClick={() => {
                  setView('storeState');
                }}>
                See advanced properties
              </Button>
            ) : (
              <Stack direction="row" alignItems="center" gap={0.55}>
                <Button
                  onClick={() => {
                    setView('editor');
                  }}>
                  Show editor
                </Button>
                <ToggleButtonGroup
                  size="small"
                  color="primary"
                  value={selectedStore}
                  sx={{ height: 32 }}
                  exclusive
                  data-test="store-state-toggle-playground"
                  onChange={(_, newSelectedStore) => setSelectedStore(newSelectedStore)}>
                  <ToggleButton value="questionnaireStore">Q</ToggleButton>
                  <ToggleButton value="questionnaireResponseStore">QR</ToggleButton>
                  <ToggleButton value="terminologyServerStore">Terminology</ToggleButton>
                  <ToggleButton value="extractedResource">Extracted</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
            <Box flexGrow={1} />
            {view === 'editor' ? (
              <Button
                disabled={errorMessages.length > 0 || jsonString === ''}
                onClick={() => {
                  if (monaco) {
                    const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
                    const editor = monaco.editor.getModels()[0];
                    editor.setValue(formattedJson);
                  }
                }}>
                Format JSON
              </Button>
            ) : null}
          </>
        ) : null}
      </Stack>
      <Divider />
      {view === 'editor' ? (
        <Editor
          height="100%"
          defaultLanguage="json"
          defaultValue="// alternatively, paste questionnaire JSON string here (only JSON is supported at the moment!)"
          onChange={handleEditorChange}
          value={jsonString}
          onValidate={handleEditorValidation}
        />
      ) : (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          <StoreStateViewer selectedStore={selectedStore} fhirServerUrl={fhirServerUrl} />
        </Box>
      )}
    </Box>
  );
}

export default JsonEditor;
