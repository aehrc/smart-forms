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

import Editor, { useMonaco } from '@monaco-editor/react';
import { useState } from 'react';
import type { editor } from 'monaco-editor';
import { Box, Button, Divider, Stack } from '@mui/material';
import Iconify from '../../../components/Iconify/Iconify.tsx';

interface Props {
  jsonString: string;
  onJsonStringChange: (jsonString: string) => void;
  buildingState: 'idle' | 'building' | 'built';
  onBuildForm: (jsonString: string) => unknown;
  onDestroyForm: () => unknown;
}

function JsonEditor(props: Props) {
  const { jsonString, onJsonStringChange, buildingState, onBuildForm, onDestroyForm } = props;

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
      <Stack direction="row" gap={2} sx={{ py: 0.75, px: 1.5 }}>
        <Button
          startIcon={<Iconify icon="ph:hammer" />}
          disabled={errorMessages.length > 0 || jsonString === ''}
          onClick={() => onBuildForm(jsonString)}>
          {buildingState === 'built' ? 'Rebuild form' : 'Build form'}
        </Button>

        {buildingState !== 'idle' ? (
          <>
            <Button color="error" startIcon={<Iconify icon="mdi:nuke" />} onClick={onDestroyForm}>
              Destroy Form
            </Button>
            <Box flexGrow={1} />
            <Button
              startIcon={<Iconify icon="gg:format-left" />}
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
          </>
        ) : null}
      </Stack>
      <Divider />

      <Editor
        height="100%"
        defaultLanguage="json"
        defaultValue="// alternatively, paste questionnaire JSON string here (only JSON is supported at the moment!)"
        onChange={handleEditorChange}
        value={jsonString}
        onValidate={handleEditorValidation}
      />
    </Box>
  );
}

export default JsonEditor;
