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

export async function getAnswerRecurcise(linkId: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;

  const result = await evaluate(
    qr,
    `QuestionnaireResponse.repeat(item).where(linkId='${linkId}').answer`
  );
  return result;
}

test('Basic component renders correctly', async () => {
  const form = aboriginalForm as Questionnaire;
  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  expect(container.innerHTML).toContain('Patient Details');
});

test('Add name into name field', async () => {
  const form = aboriginalForm as Questionnaire;
  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  const nameLinkId = '17596726-34cf-4133-9960-7081e1d63558';
  const nameText = 'David';

  await inputText(container, nameLinkId, nameText);

  const result = await getAnswerRecurcise(nameLinkId);
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueString: nameText }));
});

test('Add date into date field', async () => {
  const form = aboriginalForm as Questionnaire;
  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  const dateLinkId = '90ad8f16-16e4-4438-a7aa-b3189f510da2';
  const date = '11/11/2021';
  const dateText = '2021-11-11';

  await inputDate(container, dateLinkId, date);

  const result = await getAnswerRecurcise(dateLinkId);
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueDate: dateText }));
});

test('Add age into age field', async () => {
  const form = aboriginalForm as Questionnaire;
  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  const ageLinkId = 'e2a16e4d-2765-4b61-b286-82cfc6356b30';
  const ageText = 24;

  await inputInteger(container, ageLinkId, ageText);

  const result = await getAnswerRecurcise(ageLinkId);
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(expect.objectContaining({ valueInteger: ageText }));
});

test('Registered for NDIS opening NDIS number field', async () => {
  const form = aboriginalForm as Questionnaire;
  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  const answerCoding = {
    code: 'Y',
    display: 'Yes',
    system: 'http://terminology.hl7.org/CodeSystem/v2-0532'
  };
  const radioLinkId = '924b4500-53ac-4c4e-831b-7ab5569ff981';
  const inputLinkId = '7379a0fd-d95b-4ecb-a781-9f43d1394f10';
  const inputTargetText = 'Some text';

  await checkRadioOption(container, radioLinkId, answerCoding.display);
  await inputText(container, inputLinkId, inputTargetText);

  const result = await getAnswerRecurcise(inputLinkId);
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
