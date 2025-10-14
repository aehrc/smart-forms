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

import Editor, { useMonaco } from '@monaco-editor/react';
import { useState } from 'react';
import type { editor } from 'monaco-editor';
import { Box, Button, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import type { StateStore } from './StoreStateViewer.tsx';
import StoreStateViewer from './StoreStateViewer.tsx';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import PlaygroundCustomisationToggles from './PlaygroundCustomisationToggles.tsx';
import PlaygroundAdvancedPropsMenu from './PlaygroundAdvancedPropsMenu.tsx';

interface JsonEditorProps {
  jsonString: string;
  onJsonStringChange: (jsonString: string) => void;
  buildingState: 'idle' | 'building' | 'built';
  sourceFhirServerUrl: string;
  onBuildForm: (jsonString: string) => unknown;
  onDestroyForm: () => unknown;
}

function JsonEditor(props: JsonEditorProps) {
  const {
    jsonString,
    onJsonStringChange,
    buildingState,
    sourceFhirServerUrl,
    onBuildForm,
    onDestroyForm
  } = props;

  const [view, setView] = useState<'editor' | 'storeState'>('editor');
  const [selectedStore, setSelectedStore] = useState<StateStore>('questionnaireResponseStore');
  const [propKeyFilter, setPropKeyFilter] = useState<string>('');
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
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        sx={{ py: 0.25, px: 1, overflowX: 'auto' }}>
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
                Advanced props
              </Button>
            ) : (
              <PlaygroundAdvancedPropsMenu
                selectedStore={selectedStore}
                propKeyFilter={propKeyFilter}
                onSetView={setView}
                onSetSelectedStore={(selectedStore) => setSelectedStore(selectedStore)}
                onSetPropKeyFilter={(filterString) => setPropKeyFilter(filterString)}
              />
            )}
            <Box flexGrow={1} />
            <PlaygroundCustomisationToggles />
            {view === 'editor' ? (
              <Tooltip title="Format JSON">
                <span>
                  <IconButton
                    disabled={errorMessages.length > 0 || jsonString === ''}
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (monaco) {
                        const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
                        const editor = monaco.editor.getModels()[0];
                        editor.setValue(formattedJson);
                      }
                    }}>
                    <FormatAlignLeftIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </>
        ) : null}
      </Stack>
      <Divider />
      <Box sx={{ height: '100%' }}>
        <Box
          sx={{
            display: view === 'editor' ? 'block' : 'none',
            height: '100%'
          }}>
          <Editor
            height="calc(100% - 40px)"
            defaultLanguage="json"
            defaultValue={`// Alternatively, paste questionnaire JSON string here (only JSON is supported!)
// The contents of this editor are saved automatically in your browser's local storage.
// Your changes will persist across sessions.
`}
            onChange={handleEditorChange}
            value={jsonString}
            onValidate={handleEditorValidation}
            options={{
              minimap: { enabled: false }
            }}
          />
        </Box>
        <Box
          sx={{
            display: view === 'storeState' ? 'block' : 'none',
            height: '100%',
            marginLeft: '1px'
          }}>
          <StoreStateViewer
            selectedStore={selectedStore}
            sourceFhirServerUrl={sourceFhirServerUrl}
            propKeyFilter={propKeyFilter}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default JsonEditor;
