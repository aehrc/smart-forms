import { test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { evaluate } from 'fhirpath';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import { QueryClientProvider } from '@tanstack/react-query';
import { inputText, inputDate, inputInteger, checkRadioOption } from '@aehrc/testing-toolkit';
import {
  BaseRenderer,
  questionnaireResponseStore,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));

export async function getAnswerRecurciseByLabel(text: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  console.log(qr);
  const result = await evaluate(
    qr,
    `QuestionnaireResponse.repeat(item).where((text = '${text}')).answer`
  );
  return result;
}

test('Behavior test', async () => {
  const form = aboriginalForm as Questionnaire;

  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(container.innerHTML).toContain('Patient Details');
  const nameTex = 'David';
  await inputText(container, 'Name', nameTex);
  let result = await getAnswerRecurciseByLabel('Name');
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueString: nameTex }));

  const date = '11/11/2021';
  const dateText = '2021-11-11';
  await inputDate(container, 'Date of birth', date);
  result = await getAnswerRecurciseByLabel('Date of birth');
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueDate: dateText }));

  const ageText = 24;
  await inputInteger(container, 'Age', ageText);
  result = await getAnswerRecurciseByLabel('Age');
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueInteger: ageText }));

  const answerCoding = {
    code: 'Y',
    display: 'Yes',
    system: 'http://terminology.hl7.org/CodeSystem/v2-0532'
  };
  const inputTargetText = 'Some text';
  await checkRadioOption(container, 'Registered for NDIS', answerCoding.display);
  await inputText(container, 'NDIS Number', inputTargetText);
  result = await getAnswerRecurciseByLabel('NDIS Number');
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueString: inputTargetText }));
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
