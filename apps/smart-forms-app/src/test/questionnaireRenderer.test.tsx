import { render } from '@testing-library/react';
import { evaluate } from 'fhirpath';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import { QueryClientProvider } from '@tanstack/react-query';
import { testUtils } from '@aehrc/smart-forms-renderer';
import { vi } from 'vitest';

import {
  BaseRenderer,
  questionnaireResponseStore,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

const { inputText, inputDate, inputInteger, checkRadioOption } = testUtils;
vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));

export async function getAnswerRecursiveByLabel(text: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  console.log(1);
  const result = await evaluate(
    qr,
    `QuestionnaireResponse.repeat(item).where((text = '${text}')).answer`
  );
  return result;
}

test('behaviour-test-example', async () => {
  const form = aboriginalForm as Questionnaire;

  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(container.innerHTML).toContain('Patient Details');

  await inputText(container, 'Name', 'David');
  await inputDate(container, 'Date of birth', '11/11/2021');
  await inputInteger(container, 'Age', 24);
  await checkRadioOption(container, 'Registered for NDIS', 'Yes');
  await inputText(container, 'NDIS Number', 'Some text');
});

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormWrapperForStorybook(props: BuildFormWrapperForStorybookProps) {
  const { questionnaire, questionnaireResponse } = props;
  const queryClient = useRendererQueryClient();
  const isBuilding = useBuildForm(
    questionnaire,
    questionnaireResponse,
    undefined,
    'https://r4.ontoserver.csiro.au/fhir'
  );

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
