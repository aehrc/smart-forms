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
import { Box } from '@mui/material';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import { isQuestionnaire } from '../typePredicates/isQuestionnaire.ts';
import type { BuildState } from '../types/buildState.interface.ts';
import { useLocalStorage } from 'usehooks-ts';
import {
  extractObservationBased,
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import RendererDebugFooter from '../../renderer/components/RendererDebugFooter/RendererDebugFooter.tsx';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import { TERMINOLOGY_SERVER_URL } from '../../../globals.ts';
import PlaygroundPicker from './PlaygroundPicker.tsx';
import type { Patient, Practitioner, Questionnaire, Observation } from 'fhir/r4';
import PlaygroundHeader from './PlaygroundHeader.tsx';
import { HEADERS } from '../../../api/headers.ts';
import { useExtractOperationStore } from '../stores/extractOperationStore.ts';
import { buildFormWrapper, destroyFormWrapper } from '../../../utils/manageForm.ts';
import { processTemplateObservations } from '../../../utils/templateProcessing';

const defaultFhirServerUrl = 'https://hapi.fhir.org/baseR4';
const defaultExtractEndpoint = 'https://proxy.smartforms.io/fhir';

const defaultTerminologyServerUrl = TERMINOLOGY_SERVER_URL;

function Playground() {
  // Source FHIR Server to do pre-pop and write back
  const [sourceFhirServerUrl, setSourceFhirServerUrl] = useLocalStorage<string>(
    'playgroundSourceFhirServerUrl',
    defaultFhirServerUrl
  );
  const [patient, setPatient] = useLocalStorage<Patient | null>('playgroundLaunchPatient', null);
  const [user, setUser] = useLocalStorage<Practitioner | null>('playgroundLaunchUser', null);

  // Terminology Server to do terminology queries
  const [terminologyServerUrl, setTerminologyServerUrl] = useLocalStorage<string>(
    'playgroundTerminologyServerUrl',
    defaultTerminologyServerUrl
  );

  const [jsonString, setJsonString] = useLocalStorage('playgroundJsonString', '');
  const [buildingState, setBuildingState] = useState<BuildState>('idle');

  // $extract-related states
  const [isExtracting, setExtracting] = useState(false);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  const setExtractedResource = useExtractOperationStore.use.setExtractedResource();

  const { enqueueSnackbar } = useSnackbar();

  function handleDestroyForm() {
    setBuildingState('idle');
    destroyFormWrapper();
  }

  async function handleBuildQuestionnaireFromString(jsonString: string) {
    setBuildingState('building');

    setJsonString(jsonString);

    try {
      const parsedQuestionnaire = JSON.parse(jsonString);
      if (isQuestionnaire(parsedQuestionnaire)) {
        await buildFormWrapper(parsedQuestionnaire, undefined, undefined, terminologyServerUrl);
        setBuildingState('built');
      } else {
        enqueueSnackbar('JSON string does not represent a questionnaire', {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
        setBuildingState('idle');
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('JSON string invalid', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
      setBuildingState('idle');
    }
  }

  async function handleBuildQuestionnaireFromResource(questionnaire: Questionnaire) {
    setBuildingState('building');

    setJsonString(JSON.stringify(questionnaire, null, 2));

    await buildFormWrapper(questionnaire, undefined, undefined, terminologyServerUrl);
    setBuildingState('built');
  }

  function handleBuildQuestionnaireFromFile(jsonFile: File) {
    setBuildingState('building');

    if (!jsonFile.name.endsWith('.json')) {
      enqueueSnackbar('Attached file must be a JSON file', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar />
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
          const questionnaire = JSON.parse(jsonString);
          await buildFormWrapper(questionnaire, undefined, undefined, terminologyServerUrl);
          setBuildingState('built');
        } else {
          enqueueSnackbar('There was an issue with the attached JSON file.', {
            variant: 'error',
            preventDuplicate: true,
            action: <CloseSnackbar />
          });
          setBuildingState('idle');
        }
      } catch (error) {
        enqueueSnackbar('Attached file has invalid JSON format', {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
        setBuildingState('idle');
      }
    };
  }

  // Observation $extract
  function handleObservationExtract() {
    const observations = extractObservationBased(sourceQuestionnaire, updatableResponse);
    setExtractedResource(observations);

    if (observations.length > 0) {
      enqueueSnackbar(
        'Observation-based extraction successful. See Advanced Properties > Extracted to view extracted resource.',
        {
          preventDuplicate: true,
          action: <CloseSnackbar />,
          autoHideDuration: 8000
        }
      );
    } else {
      enqueueSnackbar('Extraction performed but no observations are extracted.', {
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
    }
  }

  // StructureMap $extract
  async function handleStructureMapExtract() {
    setExtracting(true);

    const response = await fetch(defaultExtractEndpoint + '/QuestionnaireResponse/$extract', {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(removeEmptyAnswersFromResponse(sourceQuestionnaire, updatableResponse))
    });
    setExtracting(false);

    if (!response.ok) {
      enqueueSnackbar('Failed to extract resource', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
      return;
    }

    const extractedResource = await response.json();
    setExtractedResource(extractedResource);

    enqueueSnackbar(
      'StructureMap-based extraction successful. See Advanced Properties > Extracted to view extracted resource.',
      {
        preventDuplicate: true,
        action: <CloseSnackbar />,
        autoHideDuration: 8000
      }
    );
  }

  // Template-based extract
  async function handleTemplateExtract() {
    setExtracting(true);
    try {
      if (!sourceQuestionnaire.contained || sourceQuestionnaire.contained.length === 0) {
        enqueueSnackbar('No templates found in the questionnaire for template-based extraction', {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
        return;
      }

      // Process templates
      const result = await processTemplateObservations(sourceQuestionnaire, updatableResponse);

      if (result.errors && result.errors.length > 0) {
        enqueueSnackbar('Some errors occurred during template extraction', {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
      }

      if (result.observations.length === 0) {
        enqueueSnackbar('No data could be extracted from the templates', {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar />
        });
        return;
      }

      // Create transaction bundle with extracted observations
      const transactionBundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: result.observations.map((observation: Observation) => ({
          resource: observation
        }))
      };

      // Update the extracted resource
      setExtractedResource(transactionBundle);

      enqueueSnackbar('Successfully extracted resources from templates', {
        variant: 'success',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
    } catch (error) {
      console.error('Error during template extraction:', error);
      enqueueSnackbar('Failed to perform template-based extraction', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
    } finally {
      setExtracting(false);
    }
  }

  // Test function to create a sample questionnaire with Observation templates
  function createTestQuestionnaire() {
    const testQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-questionnaire',
      title: 'Test Questionnaire with Templates',
      status: 'active',
      contained: [
        {
          resourceType: 'Observation',
          id: 'template1',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure panel'
            }]
          },
          component: [
            {
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '8480-6',
                  display: 'Systolic blood pressure'
                }]
              },
              extension: [{
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
                valueString: "QuestionnaireResponse.item.where(linkId='systolic').answer.value"
              }]
            },
            {
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '8462-4',
                  display: 'Diastolic blood pressure'
                }]
              },
              extension: [{
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
                valueString: "QuestionnaireResponse.item.where(linkId='diastolic').answer.value"
              }]
            }
          ]
        },
        {
          resourceType: 'Observation',
          id: 'template2',
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Heart rate'
            }]
          },
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath',
            valueString: "QuestionnaireResponse.item.where(linkId='hr').answer.value"
          }]
        }
      ],
      item: [
        {
          linkId: 'bp',
          text: 'Blood Pressure',
          type: 'group',
          item: [
            {
              linkId: 'systolic',
              text: 'Systolic',
              type: 'integer',
              extension: [{
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                valueReference: {
                  reference: '#template1'
                }
              }]
            },
            {
              linkId: 'diastolic',
              text: 'Diastolic',
              type: 'integer',
              extension: [{
                url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
                valueReference: {
                  reference: '#template1'
                }
              }]
            }
          ]
        },
        {
          linkId: 'hr',
          text: 'Heart Rate',
          type: 'integer',
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate',
            valueReference: {
              reference: '#template2'
            }
          }]
        }
      ]
    };

    handleBuildQuestionnaireFromResource(testQuestionnaire);
  }

  return (
    <>
      <PlaygroundHeader
        sourceFhirServerUrl={sourceFhirServerUrl}
        patient={patient}
        user={user}
        terminologyServerUrl={terminologyServerUrl}
        onSourceFhirServerUrlChange={(url) => {
          setSourceFhirServerUrl(url);
        }}
        onPatientChange={(patient) => {
          setPatient(patient);
        }}
        onUserChange={(user) => {
          setUser(user);
        }}
        onTerminologyServerUrlChange={(url) => {
          setTerminologyServerUrl(url);
        }}
      />
      <DndProvider backend={HTML5Backend} context={window}>
        <Allotment defaultSizes={[40, 60]}>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            {buildingState === 'built' ? (
              <PlaygroundRenderer
                sourceFhirServerUrl={sourceFhirServerUrl}
                patient={patient}
                user={user}
                terminologyServerUrl={terminologyServerUrl}
                isExtracting={isExtracting}
                onObservationExtract={handleObservationExtract}
                onStructureMapExtract={handleStructureMapExtract}
                onTemplateExtract={handleTemplateExtract}
              />
            ) : buildingState === 'building' ? (
              <PopulationProgressSpinner message={'Building form'} />
            ) : (
              <PlaygroundPicker
                patient={patient}
                user={user}
                onBuildQuestionnaireFromFile={handleBuildQuestionnaireFromFile}
                onBuildQuestionnaireFromResource={handleBuildQuestionnaireFromResource}
                onTestQuestionnaire={createTestQuestionnaire}
              />
            )}
          </Box>
          <JsonEditor
            jsonString={jsonString}
            onJsonStringChange={(jsonString: string) => setJsonString(jsonString)}
            buildingState={buildingState}
            sourceFhirServerUrl={sourceFhirServerUrl}
            onBuildForm={handleBuildQuestionnaireFromString}
            onDestroyForm={handleDestroyForm}
          />
        </Allotment>
        <RendererDebugFooter />
      </DndProvider>
    </>
  );
}

export default Playground;
