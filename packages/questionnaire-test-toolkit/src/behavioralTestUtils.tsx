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
import { populateQuestionnaire, type FetchResourceCallback } from '@aehrc/sdc-populate';
import { useEffect, useRef, useState } from 'react';
import { inAppExtract, type InAppExtractOutput } from '@aehrc/sdc-template-extract';
import type { QuestionnaireResponse } from 'fhir/r4';
import { terminologyServerUrl as defaultTerminologyServerUrl } from './behavioralTestConstants';
import type { BehavioralTestWrapperProps, RequestDefinition } from './behavioralTestTypes';

/**
 * Mounts a Questionnaire in the renderer for behaviour and integration tests.
 *
 * When a patient is supplied, the questionnaire is populated first. Resource requests made by
 * population are resolved from requestDefinitions, which keeps the test independent of a FHIR
 * server. A practitioner (`user`) and launch context resources (`fhirContext`) participate in the
 * same population when supplied. The rendered response can be extracted through the Save button
 * exposed by the wrapper.
 *
 * A saved `questionnaireResponse` may be supplied to resume or amend a form. Its answers take
 * precedence over newly generated population answers, while population still runs (when a patient
 * is supplied) to resolve launch context for expressions. `comparisonSourceResponse` switches the
 * Save button to modified-only extraction without rebuilding the form.
 */
export function BehavioralTestWrapper(props: BehavioralTestWrapperProps) {
  const {
    questionnaire,
    questionnaireResponse,
    comparisonSourceResponse,
    patient,
    user,
    fhirContext,
    requestDefinitions,
    fetchResourceCallback,
    terminologyServerUrl = defaultTerminologyServerUrl
  } = props;

  // Validate during render so a misuse fails the test loudly, rather than as an unhandled
  // rejection inside the effect that would leave the harness stuck on "Loading...".
  if (requestDefinitions && !patient) {
    throw new Error('Patient must be provided when request definitions are provided');
  }
  if (requestDefinitions && fetchResourceCallback) {
    throw new Error('Provide either requestDefinitions or fetchResourceCallback, not both');
  }
  if (fetchResourceCallback && !patient) {
    throw new Error('Patient must be provided when a fetchResourceCallback is provided');
  }

  const queryClient = useRendererQueryClient();
  const [isPopulating, setIsPopulating] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  // Rejections thrown by the resource callback may be swallowed by the population module and
  // reported only as a warning. Record them so an unexpected request still fails the harness.
  const callbackError = useRef<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsPopulating(true);
      setInitError(null);
      callbackError.current = null;

      try {
        // Saved answers take precedence over generated ones, but population still runs to
        // resolve patient/user/FHIR launch context for expressions. The saved response is cloned
        // so population and the renderer never mutate the caller's fixture.
        const savedResponse =
          questionnaireResponse !== undefined ? structuredClone(questionnaireResponse) : undefined;

        if (patient) {
          const resourceCallback: FetchResourceCallback =
            fetchResourceCallback ?? buildFetchResourceCallback(requestDefinitions ?? []);

          const result = await populateQuestionnaire({
            questionnaire,
            patient,
            user,
            fhirContext,
            fetchResourceCallback: async (query, requestConfig) => {
              try {
                return await resourceCallback(query, requestConfig);
              } catch (error) {
                callbackError.current = error instanceof Error ? error.message : String(error);
                throw error;
              }
            },
            fetchResourceRequestConfig: { sourceServerUrl: 'http://mock.example' }
          });

          const { populateSuccess, populateResult } = result;
          if (!populateSuccess || !populateResult) {
            throw new Error(
              'Population failed. ' +
                (callbackError.current !== null
                  ? `A resource request failed: ${callbackError.current || 'No error message was provided.'}`
                  : 'No issue details were reported by the population module.') +
                ' The rendered form was not initialised and the Save button is not available.'
            );
          }

          // A rejected request is a harness failure even when the population module tolerates
          // it and only reports a warning.
          if (callbackError.current !== null) {
            throw new Error(
              `Population request failed: ${callbackError.current || 'No error message was provided'}. ` +
                'The rendered form was not initialised and the Save button is not available.'
            );
          }

          const { populatedContext } = populateResult;
          await buildForm({
            questionnaire,
            questionnaireResponse: savedResponse ?? populateResult.populatedResponse,
            terminologyServerUrl,
            additionalContext: {
              patient,
              user,
              ...populatedContext
            }
          });
        } else if (savedResponse) {
          await buildForm({
            questionnaire,
            questionnaireResponse: savedResponse,
            terminologyServerUrl
          });
        } else {
          await buildForm({
            questionnaire,
            terminologyServerUrl
          });
        }
      } catch (error) {
        setInitError(
          error instanceof Error ? error.message : `Initialisation failed: ${String(error)}`
        );
      } finally {
        setIsPopulating(false);
      }
    };

    void load();
  }, [
    questionnaire,
    questionnaireResponse,
    patient,
    user,
    fhirContext,
    requestDefinitions,
    fetchResourceCallback,
    terminologyServerUrl
  ]);

  if (isPopulating) {
    return <div>Loading...</div>;
  }

  if (initError !== null) {
    return (
      <div data-testid="toolkit-init-error" role="alert">
        {initError}
      </div>
    );
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
        <SaveControl
          onExtractResult={props.onExtractResult}
          comparisonSourceResponse={comparisonSourceResponse}
        />
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
  onExtractResult,
  comparisonSourceResponse
}: {
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
  comparisonSourceResponse?: QuestionnaireResponse;
}) {
  const qr = useQuestionnaireResponseStore.use.updatableResponse();
  const q = useQuestionnaireStore.use.sourceQuestionnaire();

  return (
    <button
      data-testid="save-button"
      type="button"
      onClick={async () => {
        // The comparison response is cloned so extraction never mutates the caller's fixture.
        const result = await inAppExtract(
          qr,
          q,
          comparisonSourceResponse !== undefined ? structuredClone(comparisonSourceResponse) : null
        );
        onExtractResult?.(result);
      }}>
      Save
    </button>
  );
}
