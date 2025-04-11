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
import { populateQuestionnaire, PopulateQuestionnaireParams } from '@aehrc/sdc-populate';
import { BaseRenderer, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import type { Patient, Practitioner } from 'fhir/r4';
import { Box, Typography } from '@mui/material';
import useLaunchContextNames from '../hooks/useLaunchContextNames.ts';
import ExtractMenu from './ExtractMenu.tsx';
import DebugPanel from '@aehrc/smart-forms-renderer/src/features/template-extraction/debug/DebugPanel.tsx';
import { debugUtils, TemplateExtractionDebugger } from '@aehrc/smart-forms-renderer/src/features/template-extraction/debug/debugUtils.ts';

interface PlaygroundRendererProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  isExtracting: boolean;
  onObservationExtract: () => void;
  onStructureMapExtract: () => void;
  onTemplateExtract: () => void;
}

export default function PlaygroundRenderer(props: PlaygroundRendererProps) {
  const { sourceFhirServerUrl, patient, user, isExtracting, onObservationExtract, onStructureMapExtract, onTemplateExtract } = props;
  const [prePopEnabled] = useState(true);
  const [isPopulating, setIsPopulating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ steps: any[]; questionnaireId: string } | null>(null);

  const { patientName, userName } = useLaunchContextNames(patient, user);
  const questionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const handlePrepopulate = async () => {
    if (!sourceFhirServerUrl || !patient || !user || !questionnaire) {
      return;
    }

    setIsPopulating(true);
    try {
      const params: PopulateQuestionnaireParams = {
        questionnaire,
        patient,
        user,
        fetchResourceCallback,
        requestConfig: {
          baseUrl: sourceFhirServerUrl
        }
      };
      await populateQuestionnaire(params);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleTemplateExtract = async () => {
    if (!questionnaire) return;
    
    // Create a proper TemplateExtractionDebugger instance
    const debugLogger = new TemplateExtractionDebugger(questionnaire.id || 'unknown');

    // Log questionnaire structure
    debugUtils.logQuestionnaireStructure(debugLogger, questionnaire);
    
    // Log observation templates
    debugUtils.logObservationTemplates(debugLogger, questionnaire);
    
    // Log item templates
    debugUtils.logItemTemplates(debugLogger, questionnaire);

    // Get the debug info
    const info = debugUtils.getPlaygroundDebugInfo(debugLogger);
    setDebugInfo(info);

    // Call the template extract handler
    onTemplateExtract();
  };

  return (
    <>
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
      {debugInfo && (
        <DebugPanel
          steps={debugInfo.steps}
          questionnaireId={debugInfo.questionnaireId}
        />
      )}
      {isPopulating ? null : (
        <Box px={1}>
          <BaseRenderer />
        </Box>
      )}
    </>
  );
}
