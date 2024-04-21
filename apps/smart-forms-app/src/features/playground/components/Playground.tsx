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

import JsonEditor from './JsonEditor.tsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// @ts-ignore
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import PlaygroundRenderer from './PlaygroundRenderer.tsx';
import { Box, Stack } from '@mui/material';
import FileCollector from './FileCollector.tsx';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import { isQuestionnaire } from '../typePredicates/isQuestionnaire.ts';
import type { BuildState } from '../types/buildState.interface.ts';
import { useLocalStorage } from 'usehooks-ts';
import { buildForm, destroyForm } from '@aehrc/smart-forms-renderer';
import RendererDebugFooter from '../../renderer/components/RendererDebugFooter/RendererDebugFooter.tsx';

function Playground() {
  const [jsonString, setJsonString] = useLocalStorage('playgroundJsonString', '');
  const [buildingState, setBuildingState] = useState<BuildState>('idle');

  const { enqueueSnackbar } = useSnackbar();

  function handleDestroyForm() {
    setBuildingState('idle');
    destroyForm();
  }

  async function handleBuildQuestionnaireFromString(jsonString: string) {
    setBuildingState('building');
    setJsonString(jsonString);

    try {
      const parsedQuestionnaire = JSON.parse(jsonString);
      if (isQuestionnaire(parsedQuestionnaire)) {
        await buildForm(parsedQuestionnaire);
        setBuildingState('built');
      } else {
        enqueueSnackbar('JSON string does not represent a questionnaire', {
          variant: 'error',
          preventDuplicate: true
        });
        setBuildingState('idle');
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('JSON string invalid', {
        variant: 'error',
        preventDuplicate: true
      });
      setBuildingState('idle');
    }
  }

  function handleBuildQuestionnaireFromFile(jsonFile: File) {
    setBuildingState('building');
    if (!jsonFile.name.endsWith('.json')) {
      enqueueSnackbar('Attached file must be a JSON file', {
        variant: 'error',
        preventDuplicate: true
      });
      setBuildingState('idle');
      return;
    }

    const reader = new FileReader();
    reader.readAsText(jsonFile, 'UTF-8');
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result;
        if (typeof jsonString === 'string') {
          setJsonString(jsonString);
          await buildForm(JSON.parse(jsonString));
          setBuildingState('built');
        } else {
          enqueueSnackbar('There was an issue with the attached JSON file.', {
            variant: 'error',
            preventDuplicate: true
          });
          setBuildingState('idle');
        }
      } catch (error) {
        enqueueSnackbar('Attached file has invalid JSON format', {
          variant: 'error',
          preventDuplicate: true
        });
        setBuildingState('idle');
      }
    };
  }

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <Allotment defaultSizes={[40, 60]}>
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {buildingState === 'built' ? (
            <PlaygroundRenderer />
          ) : buildingState === 'building' ? (
            <PopulationProgressSpinner message={'Building form'} />
          ) : (
            <Box display="flex" justifyContent="center">
              <Stack gap={3} sx={{ my: 5 }}>
                <FileCollector onBuild={handleBuildQuestionnaireFromFile} />
              </Stack>
            </Box>
          )}
        </Box>
        <JsonEditor
          jsonString={jsonString}
          onJsonStringChange={(jsonString: string) => setJsonString(jsonString)}
          buildingState={buildingState}
          onBuildForm={handleBuildQuestionnaireFromString}
          onDestroyForm={handleDestroyForm}
        />
      </Allotment>
      <RendererDebugFooter />
    </DndProvider>
  );
}

export default Playground;
