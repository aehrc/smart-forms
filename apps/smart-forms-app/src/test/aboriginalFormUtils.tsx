import {
  BaseRenderer,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { QueryClientProvider } from '@tanstack/react-query';

export function AboriginalForm() {
  return <BuildFormWrapper questionnaire={aboriginalForm as Questionnaire} />;
}

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormWrapper(props: BuildFormWrapperForStorybookProps) {
  const { questionnaire, questionnaireResponse } = props;
  const queryClient = useRendererQueryClient();
  const isBuilding = useBuildForm({
    questionnaire,
    questionnaireResponse,
    terminologyServerUrl: 'https://r4.ontoserver.csiro.au/fhir'
  });

  if (isBuilding) {
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
