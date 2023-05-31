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

import Editor from '@monaco-editor/react';
import { useState } from 'react';
import type { editor } from 'monaco-editor';
import { Box, Button, Divider } from '@mui/material';

interface Props {
  onBuildQuestionnaire: (jsonString: string) => unknown;
}

function JsonEditor(props: Props) {
  const { onBuildQuestionnaire } = props;

  const [jsonString, setJsonString] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  function handleEditorChange(value: string | undefined) {
    setJsonString(value ?? '');
  }

  function handleEditorValidation(markers: editor.IMarkerData[] | undefined) {
    const markerMessages = markers?.map((marker) => marker.message);

    if (markerMessages) {
      setErrorMessages(markerMessages);
    }
  }

  return (
    <Box height="100%">
      <Box sx={{ p: 1 }}>
        <Button
          disabled={errorMessages.length > 0 || jsonString === ''}
          onClick={() => onBuildQuestionnaire(jsonString)}>
          Build questionnaire
        </Button>
      </Box>
      <Divider />

      <Editor
        height="100%"
        defaultLanguage="json"
        defaultValue="// alternatively, paste questionnaire JSON here (only JSON is supported at the moment!)"
        onChange={handleEditorChange}
        value={jsonString}
        onValidate={handleEditorValidation}
      />
    </Box>
  );
}

export default JsonEditor;
