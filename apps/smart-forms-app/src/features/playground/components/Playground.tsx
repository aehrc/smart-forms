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

import JsonEditor from './JsonEditor.tsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// @ts-ignore
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { useContext, useState } from 'react';
import type { VariantType } from 'notistack';
import { useSnackbar } from 'notistack';
import PlaygroundRenderer from './PlaygroundRenderer.tsx';
import { Box } from '@mui/material';
import PopulationProgressSpinner from '../../../components/Spinners/PopulationProgressSpinner.tsx';
import { isQuestionnaire } from '../typePredicates/isQuestionnaire.ts';
import type { BuildState } from '../interfaces/buildState.interface.ts';
import { useLocalStorage } from 'usehooks-ts';
import {
  destroyForm,
  extractObservationBased,
  removeEmptyAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useSmartConfigStore
} from '@aehrc/smart-forms-renderer';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import PlaygroundPicker from './PlaygroundPicker.tsx';
import type {
  OperationOutcomeIssue,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import PlaygroundHeader from './PlaygroundHeader.tsx';
import { useExtractDebuggerStore } from '../stores/extractDebuggerStore.ts';
import { resetAndBuildForm } from '../../../utils/manageForm.ts';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
import type Client from 'fhirclient/lib/Client';
import { ConfigContext } from '../../configChecker/contexts/ConfigContext.tsx';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from '../../prepopulate/utils/callback.ts';

const defaultFhirServerUrl = 'https://hapi.fhir.org/baseR4';

function Playground() {
  const { config } = useContext(ConfigContext);

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
    config.terminologyServerUrl
  );

  const [jsonString, setJsonString] = useLocalStorage('playgroundJsonString', '');
  const [buildingState, setBuildingState] = useState<BuildState>('idle');

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  // $extract-related states
  const [isExtracting, setExtracting] = useState(false);

  // Observation-based
  const setObservationExtractResult = useExtractDebuggerStore.use.setObservationExtractResult();

  // Template-based
  const setTemplateExtractResult = useExtractDebuggerStore.use.setTemplateExtractResult();
  const setTemplateExtractDebugInfo = useExtractDebuggerStore.use.setTemplateExtractDebugInfo();
  const setTemplateExtractIssues = useExtractDebuggerStore.use.setTemplateExtractIssues();
  const resetExtractDebuggerStore = useExtractDebuggerStore.use.resetStore();

  // SMART Config
  const setSmartConfigStoreClient = useSmartConfigStore.use.setClient();
  const setSmartConfigStorePatient = useSmartConfigStore.use.setPatient();
  const setSmartConfigStoreUser = useSmartConfigStore.use.setUser();

  const { enqueueSnackbar } = useSnackbar();

  function handleDestroyForm() {
    setBuildingState('idle');

    // Clean up extract debugger store
    resetExtractDebuggerStore();

    destroyForm();
  }

  async function handleBuildQuestionnaireFromString(jsonString: string) {
    setBuildingState('building');

    setJsonString(jsonString);

    try {
      const parsedQuestionnaire = JSON.parse(jsonString);
      if (isQuestionnaire(parsedQuestionnaire)) {
        // Set (artificial) SMART configs
        setSmartConfigStoreClient({
          state: {
            serverUrl: sourceFhirServerUrl
          }
        } as Client);

        if (patient) {
          setSmartConfigStorePatient(patient);
        }

        if (user) {
          setSmartConfigStoreUser(user);
        }

        // Before building the form, reset any existing form state
        await resetAndBuildForm({ questionnaire: parsedQuestionnaire, terminologyServerUrl });

        setBuildingState('built');
      } else {
        enqueueSnackbar('JSON string does not represent a questionnaire', {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar variant="error" />
        });
        setBuildingState('idle');
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('JSON string invalid', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar variant="error" />
      });
      setBuildingState('idle');
    }
  }

  async function handleBuildQuestionnaireFromResource(questionnaire: Questionnaire) {
    setBuildingState('building');

    setJsonString(JSON.stringify(questionnaire, null, 2));

    await resetAndBuildForm({ questionnaire, terminologyServerUrl });
    setBuildingState('built');
  }

  function handleBuildQuestionnaireFromFile(jsonFile: File) {
    setBuildingState('building');

    if (!jsonFile.name.endsWith('.json')) {
      enqueueSnackbar('Attached file must be a JSON file', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar variant="error" />
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

          // Add more detailed validation
          if (!questionnaire) {
            throw new Error('Empty questionnaire');
          }

          if (!isQuestionnaire(questionnaire)) {
            throw new Error(
              'Invalid questionnaire format. Must have resourceType: "Questionnaire"'
            );
          }

          await resetAndBuildForm({
            questionnaire,
            terminologyServerUrl: config.terminologyServerUrl
          });
          setBuildingState('built');
        } else {
          enqueueSnackbar('There was an issue reading the file content.', {
            variant: 'error',
            preventDuplicate: true,
            action: <CloseSnackbar variant="error" />
          });
          setBuildingState('idle');
        }
      } catch (error: unknown) {
        console.error('Error parsing questionnaire:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        enqueueSnackbar(`Error loading questionnaire: ${errorMessage}`, {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar variant="error" />
        });
        setBuildingState('idle');
      }
    };

    reader.onerror = () => {
      enqueueSnackbar('Error reading file', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar variant="error" />
      });
      setBuildingState('idle');
    };
  }

  // Observation $extract
  function handleObservationExtract() {
    const observations = extractObservationBased(sourceQuestionnaire, updatableResponse);
    setObservationExtractResult(observations);

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

  // Template-based $extract
  async function handleTemplateExtract(modifiedOnly: boolean) {
    if (!sourceFhirServerUrl || !patient) {
      enqueueSnackbar('Failed to run template-based extraction. No source server provided', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    setExtracting(true);

    // If modifiedOnly is true, populate a fresh copy of the questionnaire to compare against
    let responseToCompare: QuestionnaireResponse | null = null;
    if (modifiedOnly) {
      const populateRes = await populateQuestionnaire({
        questionnaire: sourceQuestionnaire,
        fetchResourceCallback: fetchResourceCallback,
        fetchResourceRequestConfig: {
          sourceServerUrl: sourceFhirServerUrl,
          authToken: null
        },
        patient: patient,
        user: user ?? undefined,
        encounter: undefined
      });

      responseToCompare = populateRes.populateResult?.populatedResponse ?? null;
    }

    // Perform template-based extraction to get a transaction bundle
    const responseToExtract = removeEmptyAnswersFromResponse(
      sourceQuestionnaire,
      structuredClone(updatableResponse)
    );
    const inAppExtractOutput = await inAppExtract(
      responseToExtract,
      sourceQuestionnaire,
      modifiedOnly ? responseToCompare : null
    );
    setExtracting(false);

    const { extractResult } = inAppExtractOutput;

    if (extractResultIsOperationOutcome(extractResult)) {
      // If there is only one issue in the OperationOutcome, show its details directly in the snackbar
      if (extractResult.issue.length === 1) {
        const variantMap: Record<OperationOutcomeIssue['severity'], VariantType> = {
          error: 'error',
          warning: 'warning',
          fatal: 'error',
          information: 'info'
        };

        const variant = variantMap[extractResult.issue[0].severity] || 'error';
        enqueueSnackbar(`${extractResult.issue[0].details?.text}`, {
          variant: variant,
          preventDuplicate: true,
          action: <CloseSnackbar variant={variant} />
        });
        console.warn(extractResult);
        return;
      }

      // Multiple issues, show a generic error message
      enqueueSnackbar(
        'Ran template-based extraction but an error occurred. See console for error details.',
        {
          variant: 'error',
          preventDuplicate: true,
          action: <CloseSnackbar variant="error" />
        }
      );
      console.error(extractResult);
      return;
    }

    // Handle returnParameter
    console.log(
      `Extracted bundle from template-based extraction ${modifiedOnly ? '(modified only)' : ''}:`,
      extractResult.extractedBundle
    );
    const hasIssues =
      extractResult.issues && extractResult.issues.resourceType === 'OperationOutcome';
    enqueueSnackbar(
      `Successful template-based extraction${hasIssues ? ' with issues' : ''}. See Advanced Properties > Extracted to view extracted bundle${hasIssues ? ' + issues' : ''}.`,
      {
        preventDuplicate: true,
        action: <CloseSnackbar />,
        autoHideDuration: 8000
      }
    );
    setTemplateExtractResult(extractResult.extractedBundle);
    setTemplateExtractIssues(extractResult.issues ?? null);
    setTemplateExtractDebugInfo(extractResult.debugInfo ?? null);
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
      </DndProvider>
    </>
  );
}

export default Playground;
