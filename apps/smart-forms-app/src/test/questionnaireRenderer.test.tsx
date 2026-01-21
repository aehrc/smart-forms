import { act, render, waitFor } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';
import { QueryClientProvider } from '@tanstack/react-query';
import { vi, beforeAll } from 'vitest';

import {
  BaseRenderer,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';
import { checkRadioOption, chooseSelectOption, inputDate, inputInteger, inputText, selectTab } from './testUtils.ts';

vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));


beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

test('behaviour-test-example', async () => {
  const form = aboriginalForm as Questionnaire;

  const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
  await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

  await act(async () => {
    await inputText(container, 'Name', 'David');
    await inputDate(container, 'Date of birth', '11/11/2021');
    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'Yes');
    await inputText(container, 'NDIS Number', 'Some text');
  });
});

describe('smoking status question', () => {
  test('for ex-smoker', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Ex-smoker');

    await checkRadioOption(container, 'Quit status', 'Quit >12 months');
    await inputInteger(container, 'How many?', 10);
    await inputInteger(container, 'How long as a smoker?', 5);
  });
});

interface BuildFormWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function BuildFormWrapperForStorybook(props: BuildFormWrapperForStorybookProps) {
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
