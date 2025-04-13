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

import { useState } from 'react';
import PrePopButtonForPlayground from './PrePopButtonForPlayground.tsx';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { 
  BaseRenderer, 
  useQuestionnaireStore, 
  useQuestionnaireResponseStore, 
  extractTemplateBased
} from '@aehrc/smart-forms-renderer';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import type { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r4';
import { Box, Typography } from '@mui/material';
import useLaunchContextNames from '../hooks/useLaunchContextNames.ts';
import { buildFormWrapper } from '../../../utils/manageForm.ts';
import ExtractMenu from './ExtractMenu.tsx';
import TemplateExtractionDebug from './TemplateExtractionDebug';
import { useExtractOperationStore } from '../stores/extractOperationStore.ts';

interface PlaygroundRendererProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  isExtracting: boolean;
  onObservationExtract: () => void;
  onStructureMapExtract: () => void;
}

function PlaygroundRenderer(props: PlaygroundRendererProps) {
  const {
    sourceFhirServerUrl,
    patient,
    user,
    terminologyServerUrl,
    isExtracting,
    onObservationExtract,
    onStructureMapExtract
  } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setExtractionResult = useExtractOperationStore.use.setExtractionResult();
  const setExtractionError = useExtractOperationStore.use.setExtractionError();
  const setDebugInfo = useExtractOperationStore.use.setDebugInfo();
  const startExtraction = useExtractOperationStore.use.startExtraction();
  const clearExtraction = useExtractOperationStore.use.clearExtraction();
  const extractionResult = useExtractOperationStore.use.extractionResult();
  const extractionError = useExtractOperationStore.use.extractionError();
  const debugInfo = useExtractOperationStore.use.debugInfo();
  const isExtractionStarted = useExtractOperationStore.use.isExtractionStarted();

  const [isPopulating, setIsPopulating] = useState(false);
  const [populatedContext, setPopulatedContext] = useState<Record<string, object> | null>(null);

  const { patientName, userName } = useLaunchContextNames(patient, user);

  const prePopEnabled = sourceFhirServerUrl !== null && patient !== null;

  function handlePrepopulate() {
    if (!prePopEnabled) {
      return;
    }

    setIsPopulating(true);

    populateQuestionnaire({
      questionnaire: sourceQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: sourceFhirServerUrl,
        authToken: null
      },
      patient: patient,
      user: user ?? undefined
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
      await buildFormWrapper(
        sourceQuestionnaire,
        populatedResponse,
        undefined,
        terminologyServerUrl,
        { patient }
      );
      if (populatedContext) {
        setPopulatedContext(populatedContext);
      }

      setIsPopulating(false);
    });
  }

  const prepareResponseForExtraction = (response: QuestionnaireResponse, patientId: string): QuestionnaireResponse => {
    if (!response) {
      throw new Error('Missing questionnaire response');
    }
    if (!patientId) {
      throw new Error('Missing patient ID');
    }
    return {
      ...response,
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      subject: {
        reference: `Patient/${patientId}`
      },
      item: response.item || [],
      authored: response.authored || new Date().toISOString(),
      author: response.author || {
        reference: `Practitioner/${user?.id || 'unknown'}`
      }
    };
  };

  const handleTemplateExtract = async () => {
    if (!sourceQuestionnaire) {
      console.error('Missing sourceQuestionnaire');
      setExtractionError('Missing questionnaire');
      return;
    }
    if (!updatableResponse) {
      console.error('Missing updatableResponse');
      setExtractionError('Missing response');
      return;
    }

    try {
      // Start extraction and show debug info immediately
      startExtraction();
      setDebugInfo({
        contentAnalysis: {
          detectedSigns: [],
          patterns: [],
          confidence: 'Analyzing...'
        },
        fieldMapping: {
          mappedFields: {},
          assumptions: [],
          alternatives: []
        },
        valueProcessing: {
          values: {},
          transformations: [],
          qualityChecks: []
        }
      });

      console.log('Preparing response for extraction:', updatableResponse);
      const preparedResponse = prepareResponseForExtraction(updatableResponse, patient?.id || 'unknown');
      console.log('Prepared response:', preparedResponse);

      const { result, error, debugInfo: extractionDebugInfo } = await extractTemplateBased(sourceQuestionnaire, preparedResponse);
      console.log('Extraction result:', result);
      console.log('Extraction error:', error);
      console.log('Extraction debug info:', extractionDebugInfo);

      if (error) {
        setExtractionError(error);
        setDebugInfo(extractionDebugInfo);
        return;
      }

      if (result && result.length > 0) {
        // Convert Observation[] to QuestionnaireResponse
        const qr: QuestionnaireResponse = {
          resourceType: 'QuestionnaireResponse',
          status: 'completed',
          subject: patient?.id ? {
            reference: `Patient/${patient.id}`
          } : undefined,
          item: [],
          contained: result
        };
        setExtractionResult(qr);
        setDebugInfo(extractionDebugInfo);
      } else {
        setExtractionError('No observations were generated from the extraction');
        setDebugInfo(extractionDebugInfo);
      }
    } catch (error) {
      console.error('Error during template extraction:', error);
      setExtractionError(error instanceof Error ? error.message : 'Unknown error during extraction');
      setDebugInfo({
        contentAnalysis: {
          detectedSigns: [],
          patterns: [],
          confidence: 'Error'
        },
        fieldMapping: {
          mappedFields: {},
          assumptions: [],
          alternatives: []
        },
        valueProcessing: {
          values: {},
          transformations: [],
          qualityChecks: []
        }
      });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" alignItems="center" columnGap={1.5} mx={1}>
        <PrePopButtonForPlayground
          prePopEnabled={prePopEnabled}
          isPopulating={isPopulating}
          onPopulate={handlePrepopulate}
        />
        <ExtractMenu
          isExtracting={isExtracting}
          onObservationExtract={onObservationExtract}
          onStructureMapExtract={onStructureMapExtract}
          onTemplateExtract={handleTemplateExtract}
        />
        <Box flexGrow={1} />
        {patientName ? (
          <Typography variant="subtitle2" color="text.secondary">
            Patient: {patientName}
          </Typography>
        ) : null}
        {userName ? (
          <Typography variant="subtitle2" color="text.secondary">
            User: {userName}
          </Typography>
        ) : null}
      </Box>
      {isPopulating ? null : (
        <Box px={1}>
          <BaseRenderer />
        </Box>
      )}
      <TemplateExtractionDebug />
    </Box>
  );
}

export default PlaygroundRenderer;
