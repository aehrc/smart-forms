import {
  BaseRenderer,
  buildForm,
  RendererThemeProvider,
  useQuestionnaireResponseStore,
  useQuestionnaireStore,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';
import type { Questionnaire } from 'fhir/r4';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Patient } from 'fhir/r4';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { useEffect, useState } from 'react';
import { inAppExtract, type InAppExtractOutput } from '@aehrc/sdc-template-extract';
import Button from '@mui/material/Button';
const terminologyServerUrl = 'https://r4.ontoserver.csiro.au/fhir';

export type RequestDefinition = {
  urlPrefix: string;
  params?: Record<string, string>;
  responseBody: any;
};

interface AboriginalFormProps {
  patient?: Patient;
  requestDefinitions?: RequestDefinition[];
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
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
        <SaveControl onExtractResult={props.onExtractResult} />
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

function SaveControl({
  onExtractResult
}: {
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
}) {
  const qr = useQuestionnaireResponseStore.use.updatableResponse();
  const q = useQuestionnaireStore.use.sourceQuestionnaire();

  return (
    <Button
      data-testid="save-button"
      onClick={async () => {
        const result = await inAppExtract(qr, q, null);

        onExtractResult?.(result);
      }}>
      Save
    </Button>
  );
}
