import {
  BaseRenderer,
  buildForm,
  RendererThemeProvider,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Patient } from 'fhir/r4';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { useEffect, useState } from 'react';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
const terminologyServerUrl = 'https://r4.ontoserver.csiro.au/fhir';

export type RequestDefinition = {
  urlPrefix: string;
  params?: Record<string, string>;
  responseBody: any;
};

interface AboriginalFormProps {
  patient?: Patient;
  requestDefinitions?: RequestDefinition[];
}

export function AboriginalForm(props: AboriginalFormProps) {
  return (
    <BuildFormWrapperWithPopulate questionnaire={aboriginalForm as Questionnaire} {...props} />
  );
}

interface BuildFormWrapperWithPopulateProps extends AboriginalFormProps {
  questionnaire: Questionnaire;
}

function BuildFormWrapperWithPopulate(props: BuildFormWrapperWithPopulateProps) {
  const { questionnaire, patient, requestDefinitions } = props;
  const queryClient = useRendererQueryClient();

  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsPopulating(true);

      if (patient && requestDefinitions) {
        const result = await populateQuestionnaire({
          questionnaire: questionnaire,
          patient: patient,
          fetchResourceCallback: buildFetchResourceCallback(requestDefinitions),
          fetchResourceRequestConfig: { sourceServerUrl: 'http://mock.example' }
        });

        const { populateSuccess, populateResult } = result;
        if (!populateSuccess || !populateResult) {
          setIsPopulating(false);
          return;
        }

        const { populatedResponse, populatedContext } = populateResult;

        await buildForm({
          questionnaire: questionnaire,
          questionnaireResponse: populatedResponse,
          terminologyServerUrl,
          additionalContext: {
            patient: patient,
            ...populatedContext
          }
        });
      } else {
        await buildForm({
          questionnaire: questionnaire,
          terminologyServerUrl
        });
      }

      setIsPopulating(false);
    };

    load();
  }, [questionnaire, patient, requestDefinitions]);

  if (isPopulating) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

function buildFetchResourceCallback(requestDefinitions: RequestDefinition[]) {
  return async (url: string) => {
    const requestUrl = url;
    const [path, queryString] = requestUrl.split('?');

    const searchParams = new URLSearchParams(queryString ?? '');
    const paramsObject: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });

    const match = requestDefinitions.find((def) => {
      if (!path.startsWith(def.urlPrefix)) {
        return false;
      }

      if (!def.params) {
        return true;
      }

      return Object.entries(def.params).every(([key, value]) => paramsObject[key] === value);
    });

    if (match) {
      return Promise.resolve(match.responseBody);
    }

    return Promise.resolve({});
  };
}

export async function runExtract(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire
) {
  const inAppExtractOutput = await inAppExtract(questionnaireResponse, questionnaire, null);

  if (!inAppExtractOutput.extractSuccess) {
    throw new Error('Extract failed');
  }

  const extractResult = inAppExtractOutput.extractResult;
  if (extractResultIsOperationOutcome(extractResult)) {
    throw new Error('Extract failed');
  }

  return extractResult.extractedBundle;
}