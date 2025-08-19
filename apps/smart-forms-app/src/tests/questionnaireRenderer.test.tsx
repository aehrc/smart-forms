import { test, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import { QueryClientProvider } from '@tanstack/react-query';


import {
  BaseRenderer,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));

test('Basic component renders correctly', async () => {
  const form = aboriginalForm as Questionnaire;

  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(container.innerHTML).toContain('Patient Details')

});

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormWrapperForStorybook(props: BuildFormWrapperForStorybookProps) {
  const { questionnaire, questionnaireResponse } = props;

  const queryClient = useRendererQueryClient();
  const isBuilding = useBuildForm(questionnaire, questionnaireResponse, undefined, 'https://r4.ontoserver.csiro.au/fhir');

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
