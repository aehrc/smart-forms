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

import {
  BaseRenderer,
  buildForm,
  RendererThemeProvider,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';
import { QueryClientProvider } from '@tanstack/react-query';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { useEffect, useState } from 'react';
import { inAppExtract, type InAppExtractOutput } from '@aehrc/sdc-template-extract';
import { terminologyServerUrl as defaultTerminologyServerUrl } from './behavioralTestConstants';
import type { BehavioralTestWrapperProps, RequestDefinition } from './behavioralTestTypes';

/**
 * Mounts a Questionnaire in the renderer for behaviour and integration tests.
 *
 * When a patient is supplied, the questionnaire is populated first. Resource requests made by
 * population are resolved from requestDefinitions, which keeps the test independent of a FHIR
 * server. The rendered response can be extracted through the Save button exposed by the wrapper.
 */
export function BehavioralTestWrapper(props: BehavioralTestWrapperProps) {
  const {
    questionnaire,
    patient,
    requestDefinitions,
    terminologyServerUrl = defaultTerminologyServerUrl
  } = props;

  // Validate during render so a misuse fails the test loudly, rather than as an unhandled
  // rejection inside the effect that would leave the harness stuck on "Loading...".
  if (requestDefinitions && !patient) {
    throw new Error('Patient must be provided when request definitions are provided');
  }

  const queryClient = useRendererQueryClient();
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsPopulating(true);

      try {
        if (patient) {
          const result = await populateQuestionnaire({
            questionnaire,
            patient,
            fetchResourceCallback: buildFetchResourceCallback(requestDefinitions ?? []),
            fetchResourceRequestConfig: { sourceServerUrl: 'http://mock.example' }
          });

          const { populateSuccess, populateResult } = result;
          if (!populateSuccess || !populateResult) {
            return;
          }

          const { populatedResponse, populatedContext } = populateResult;
          await buildForm({
            questionnaire,
            questionnaireResponse: populatedResponse,
            terminologyServerUrl,
            additionalContext: {
              patient,
              ...populatedContext
            }
          });
        } else {
          await buildForm({
            questionnaire,
            terminologyServerUrl
          });
        }
      } finally {
        setIsPopulating(false);
      }
    };

    void load();
  }, [questionnaire, patient, requestDefinitions, terminologyServerUrl]);

  if (isPopulating) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
        <SaveControl onExtractResult={props.onExtractResult} />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

function buildFetchResourceCallback(requestDefinitions: RequestDefinition[]) {
  return async (url: string) => {
    const [path, queryString] = url.split('?');
    const searchParams = new URLSearchParams(queryString ?? '');
    const paramsObject: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });

    const match = requestDefinitions.find((definition) => {
      if (!path.startsWith(definition.urlPrefix)) {
        return false;
      }

      if (!definition.params) {
        return true;
      }

      return Object.entries(definition.params).every(([key, value]) => paramsObject[key] === value);
    });

    if (match) {
      return match.responseBody;
    }

    return {};
  };
}

function SaveControl({
  onExtractResult
}: {
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
}) {
  const qr = useQuestionnaireResponseStore.use.updatableResponse();
  const q = useQuestionnaireStore.use.sourceQuestionnaire();

  return (
    <button
      data-testid="save-button"
      type="button"
      onClick={async () => {
        const result = await inAppExtract(qr, q, null);
        onExtractResult?.(result);
      }}>
      Save
    </button>
  );
}
