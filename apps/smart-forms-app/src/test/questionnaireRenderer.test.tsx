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
import { checkRadioOption, chooseSelectOption, inputDate, inputInteger, inputText, selectTab, findByLinkIdOrLabel, checkCheckBox, checkCheckboxOption, inputDecimal, getInputText } from './testUtils.ts';


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


  test('for now status shows nothing', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    
    await expect(async()=>await findByLinkIdOrLabel(container, 'Quit status')).rejects.toThrow();
    
  });


  test('for current smoker', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Current smoker');

    await inputInteger(container, 'How many?', 10);
    await inputInteger(container, 'How long as a smoker?', 5);
  });

  test('for never smoker', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Never smoked');

    await expect(async()=>await findByLinkIdOrLabel(container, 'How many?')).rejects.toThrow();
  });

  test('for exposure to second hand tobacco smoke', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Exposure to second hand tobacco smoke');

    await expect(async()=>await findByLinkIdOrLabel(container, 'How many?')).rejects.toThrow();
  });

  test('for wants to quit', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Wants to quit');

    await inputInteger(container, 'How many?', 10);
    await inputInteger(container, 'How long as a smoker?', 5);
  });

  test('for other tobacco use', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Substance use, including tobacco');
    await chooseSelectOption(container, 'New status', 'Other tobacco use');

    await expect(async()=>await findByLinkIdOrLabel(container, 'How many?')).rejects.toThrow();
  });


});

describe('Parent/primary caregiver present question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'Yes');

    await inputText(container, 'Relationship to child', 'Mother');
   
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'No');

    await expect(async()=>await findByLinkIdOrLabel(container, 'Relationship to child')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'N/A');

    await expect(async()=>await findByLinkIdOrLabel(container, 'Relationship to child')).rejects.toThrow();
  });


});

describe('Consent for sharing of information question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Consent given for sharing of information with relevant healthcare providers?', 'Yes');

    await inputText(container, 'Who/details', 'Mother');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Consent given for sharing of information with relevant healthcare providers?', 'No');

    await expect(async()=>await findByLinkIdOrLabel(container, 'Who/details')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Consent');
    await checkRadioOption(container, 'Consent given for sharing of information with relevant healthcare providers?', 'N/A');

    await expect(async()=>await findByLinkIdOrLabel(container, 'Who/details')).rejects.toThrow();
  });
});

describe('Home address question', () => {
  test('for no fixed address', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);

    await checkCheckBox(container, 'No fixed address');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Street address')).rejects.toThrow();

  });
});


describe('My Aged Care question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await checkRadioOption(container, 'Registered for My Aged Care', 'Yes');
    await inputInteger(container, 'My Aged Care Number', 1234567890);

  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Registered for My Aged Care', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'My Aged Care Number')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Registered for My Aged Care', 'N/A');
    await expect(async()=>await findByLinkIdOrLabel(container, 'My Aged Care Number')).rejects.toThrow();
  });
});


describe('National Disability Insurance Scheme question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'Yes');

    await inputInteger(container, 'NDIS Number', 1234567890);
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'No');

    await expect(async()=>await findByLinkIdOrLabel(container, 'NDIS Number')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'N/A');

    await expect(async()=>await findByLinkIdOrLabel(container, 'NDIS Number')).rejects.toThrow();
  });
});

describe('Children question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Do you have children?', 'Yes');
    await inputInteger(container, 'Number of children', 1);
    await inputInteger(container, 'Number of children in your care', 1);
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Do you have children?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Number of children')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Do you have children?', 'N/A');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Number of children')).rejects.toThrow();
  });
});

describe('Someone\'s carer question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Are you responsible for caring for someone else?', 'Yes');
    await inputText(container, 'Details', 'Mother');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Are you responsible for caring for someone else?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, '4c14b158-3ae4-4994-8446-76e02640702c')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Are you responsible for caring for someone else?', 'N/A');
    await expect(async()=>await findByLinkIdOrLabel(container, '4c14b158-3ae4-4994-8446-76e02640702c')).rejects.toThrow();
  });
});

describe('Your carer question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Do you have a carer?', 'Yes');

    const yourCarerContainer = await findByLinkIdOrLabel(container, 'Your carer');
    await inputText(yourCarerContainer, 'Details', 'Daughter');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Do you have a carer?', 'No');
    const yourCarerContainer = await findByLinkIdOrLabel(container, 'Your carer');
    await expect(async()=>await findByLinkIdOrLabel(yourCarerContainer, 'Details')).rejects.toThrow();
  });

  test('for not applicable', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Do you have a carer?', 'N/A');
    const yourCarerContainer = await findByLinkIdOrLabel(container, 'Your carer');
    await expect(async()=>await findByLinkIdOrLabel(yourCarerContainer, 'Details')).rejects.toThrow();
  });
});

describe('Child Health Book question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 5);
    await selectTab(container, 'Current health/patient priorities');
    await checkRadioOption(container, 'Does your child have a Child Health Book?', 'Yes');
    await checkRadioOption(container, 'Is it up to date?', 'Yes');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 5);
    await selectTab(container, 'Current health/patient priorities');
    await checkRadioOption(container, 'Does your child have a Child Health Book?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Is it up to date?')).rejects.toThrow();
  });
    
});

describe('Child regular medications question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 5);
    await selectTab(container, 'Regular medications');
    await checkRadioOption(container, 'Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?', 'Yes');
    await checkRadioOption(container, 'Check medication understanding and adherence with patient', 'Yes');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 5);
    await selectTab(container, 'Regular medications');
    await checkRadioOption(container, 'Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Check medication understanding and adherence with patient')).rejects.toThrow();
  });


});

describe('Regular medications question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 16);
    await selectTab(container, 'Regular medications');
    await checkRadioOption(container, 'Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?', 'Yes');
    await checkRadioOption(container, 'Check medication understanding and adherence with patient', 'Yes');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 16);
    await selectTab(container, 'Regular medications');
    await checkRadioOption(container, 'Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Check medication understanding and adherence with patient')).rejects.toThrow();
  });
});

describe('Stressful life events question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 16);
    await selectTab(container, 'Social and emotional wellbeing');
    await checkRadioOption(container, 'Have there been any particular stressful life events that are impacting on you/your health lately?', 'Yes');
    await inputText(container, 'Details', 'Work stress');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 16);
    await selectTab(container, 'Social and emotional wellbeing');
    await checkRadioOption(container, 'Have there been any particular stressful life events that are impacting on you/your health lately?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

});

describe('Child stressful life events question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 8);
    await selectTab(container, 'Social history: Information about family and child\'s living arrangements');
    await checkRadioOption(container, 'Have there been any stressful life events that would cause you or your child to be upset?', 'Yes');
    await inputText(container, 'Details', 'School stress');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 8);
    await selectTab(container, 'Social history: Information about family and child\'s living arrangements');
    await checkRadioOption(container, 'Have there been any stressful life events that would cause you or your child to be upset?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
    
});

describe('Housing stability question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Home and family');
    await checkRadioOption(container, 'Do you have stable housing?', 'Yes');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Home and family');
    await checkRadioOption(container, 'Do you have stable housing?', 'No');
    await inputText(container, 'Details', 'Homeless');
  });
    

});

describe('Home safety question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Home and family');
    await checkRadioOption(container, 'Do you feel safe at home?', 'Yes');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Home and family');
    await checkRadioOption(container, 'Do you feel safe at home?', 'No');
    await inputText(container, 'Details', 'Unsafe');
  });
});

describe('Personal concerns about your memory or thinking question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Memory and thinking');
    await checkRadioOption(container, 'Do you have any worries about your memory or thinking?', 'Yes');
    await inputText(container, 'Details', 'Memory loss');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Memory and thinking');
    await checkRadioOption(container, 'Do you have any worries about your memory or thinking?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
    
});

describe('Family concerns about your memory or thinking question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Memory and thinking');
    await checkRadioOption(container, 'Does anyone in your family have any worries about your memory or thinking?', 'Yes');
    await inputText(container, 'Details', 'Memory loss');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Memory and thinking');
    await checkRadioOption(container, 'Does anyone in your family have any worries about your memory or thinking?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
    
});

describe('Child eating concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s feeding/eating?', 'Yes');
    await inputText(container, 'Details', 'Feeding concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s feeding/eating?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Child eating concerns', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 8);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s eating?', 'Yes');
    await inputText(container, 'Details', 'Eating concerns');
  });
  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 8);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s eating?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Diet or weight concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Do you have any worries about your diet or weight?', 'Yes');
    await inputText(container, 'Details', 'Diet concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Do you have any worries about your diet or weight?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Unintended weight loss question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Have you lost weight without trying to in the last three months?', 'Yes');
    await inputText(container, 'Details', 'Weight loss');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Have you lost weight without trying to in the last three months?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Food availability issues question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Are there any issues about availability of food?', 'Yes');
    await inputText(container, 'Details', 'Food availability issues');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Healthy eating');
    await checkRadioOption(container, 'Are there any issues about availability of food?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Physical activity concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s level of physical activity?', 'Yes');
    await inputText(container, 'Details', 'Physical activity concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s level of physical activity?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Screen time concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s level of screen time?', 'Yes');
    await inputText(container, 'Details', 'Screen time concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s level of screen time?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Physical activity or screen time concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Do you have any worries about physical activity or screen time?', 'Yes');
    await inputText(container, 'Details', 'Physical activity or screen time concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Physical activity and screen time');
    await checkRadioOption(container, 'Do you have any worries about physical activity or screen time?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Physical activity concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Physical activity');
    await checkRadioOption(container, 'Do you have any worries about physical activity?', 'Yes');
    await inputText(container, 'Details', 'Physical activity concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;

    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));

    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Physical activity');
    await checkRadioOption(container, 'Do you have any worries about physical activity?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Red flags early identification guide for children question', () => {
  test('for 6 months Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '6 months');
    await checkCheckboxOption(container, 'Social Emotional', 'Does not smile or interact with people');
  });

  test('for 6 moths Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '6 months');
    await checkCheckboxOption(container, 'Communication', 'Not starting to babble (e.g. aahh, oohh)');
  });

  test('for 6 months Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '6 months');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Not reaching for and holding (grasping) toys');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Hands frequently clenched');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not explore objects with hand and mouth');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not bring hands together at midline');
  });

  test('for 6 months Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '6 months');
    await checkCheckboxOption(container, 'Gross motor', 'Not holding head and shoulders up with good control when lying on tummy');
    await checkCheckboxOption(container, 'Gross motor', 'Not holding head with good control in supported sitting');
  });


  test('for 9 months Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '9 months');
    await checkCheckboxOption(container, 'Social Emotional', 'Not sharing enjoyment with others using eye contact or facial expression');
  });

  test('for 9 months Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '9 months');
    await checkCheckboxOption(container, 'Communication', 'Not using gestures (e.g. pointing, showing, waving)');
    await checkCheckboxOption(container, 'Communication', 'Not using two part babble (e.g. bubu, dada)');
  });

  test('for 9 months Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '9 months');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not hold objects');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', "Does not 'give' objects on request");
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Cannot move toy from one hand to another');
  });

  test('for 9 months Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '9 months');
    await checkCheckboxOption(container, 'Gross motor', 'Not rolling');
    await checkCheckboxOption(container, 'Gross motor', 'Not sitting independently/ without support');
    await checkCheckboxOption(container, 'Gross motor', 'Not moving (eg creeping, crawling)');
    await checkCheckboxOption(container, 'Gross motor', 'Not taking weight on legs when held in standing');
  });

  test('for 12 months Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '12 months');
    await checkCheckboxOption(container, 'Social Emotional', 'Does not notice someone new');
    await checkCheckboxOption(container, 'Social Emotional', 'Does not play early turn taking games (e.g. peekaboo, rolling a ball)');
  });

  test('for 12 months Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '12 months');
    await checkCheckboxOption(container, 'Communication', 'No babbled phrases that sound like talking');
    await checkCheckboxOption(container, 'Communication', 'No response to familiar words (e.g. bottle, daddy)');
  });

  test('for 12 months Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '12 months');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not feed self finger foods or hold own bottle/cup');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Unable to pick up small items using index finger and thumb');
  });

  test('for 12 months Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '12 months');
    await checkCheckboxOption(container, 'Gross motor', 'No form of independent mobility (e.g. crawling, commando crawling, bottom shuffle)');
    await checkCheckboxOption(container, 'Gross motor', 'Not pulling to stand independently and holding on for support');
  });

  test('for 18 months Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '18 months');
    await checkCheckboxOption(container, 'Social Emotional', 'Lacks interest in playing and interacting with others');
  });
  test('for 18 months Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '18 months');
    await checkCheckboxOption(container, 'Communication', 'No clear words');
    await checkCheckboxOption(container, 'Communication', "Cannot understand short requests (e.g. 'Where is the ball?')");
  });

  test('for 18 months Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '18 months');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not scribble with a crayon');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not attempt to stack blocks after demonstration');
  });

  test('for 18 months Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '18 months');
    await checkCheckboxOption(container, 'Gross motor', 'Not standing independently');
    await checkCheckboxOption(container, 'Gross motor', 'Not attempting to walk without support');
  });

  test('for 2 years Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '2 years');
    await checkCheckboxOption(container, 'Social Emotional', 'When playing with toys tends to bang, drop, or throw them rather than use them for their purpose (e.g. cuddle doll, build blocks)');
  });

  test('for 2 years Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '2 years');
    await checkCheckboxOption(container, 'Communication', 'Not learning new words');
    await checkCheckboxOption(container, 'Communication', "Not putting words together (e.g. 'push car')");
  });

  test('for 2 years Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '2 years');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not attempt to feed self using a spoon and/or help with dressing');
  });

  test('for 2 years Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '2 years');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to walk independently');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to walk up and down stairs holding on');
  });

  test('for 3 years Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '3 years');
    await checkCheckboxOption(container, 'Social Emotional', 'No interest in pretend play or interacting with other children');
    await checkCheckboxOption(container, 'Social Emotional', 'Difficulty noticing and understanding feelings in themselves and others (eg happy, sad)');
  });

  test('for 3 years Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '3 years');
    await checkCheckboxOption(container, 'Communication', 'Speech is difficult for familiar people to understand');
    await checkCheckboxOption(container, 'Communication', 'Not using simple sentences (e.g. big car go)');
  });

  test('for 3 years Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '3 years');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Does not attempt everyday care skills (such as feeding or dressing)');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Difficulty in manipulating small objects (e.g. threading beads)');
  });

  test('for 3 years Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '3 years');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to walk up and down stairs independently');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to run or jump');
  });

  test('for 4 years Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '4 years');
    await checkCheckboxOption(container, 'Social Emotional', 'Unwilling or unable to play cooperatively');
  });

  test('for 4 years Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '4 years');
    await checkCheckboxOption(container, 'Communication', 'Speech difficult to understand');
    await checkCheckboxOption(container, 'Communication', 'Not able to follow directions with two steps (e.g. \'Put your bag away and then go play\')');
  });

  test('for 4 years Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '4 years');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Not toilet trained by day');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Not able to draw lines and circles');
  });

  test('for 4 years Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '4 years');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to walk, run, climb, jump and uses stairs confidently');
  });

  test('for 5 years Social and emotional', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '5 years');
    await checkCheckboxOption(container, 'Social Emotional', 'Play is different than their friends');
  });

  test('for 5 years Communication', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '5 years');
    await checkCheckboxOption(container, 'Communication', 'Difficulty telling a parent what is wrong');
    await checkCheckboxOption(container, 'Communication', "Not able to answer questions in a simple conversation (e.g. What's your name? Who is your family?)");
  });

  test('for 5 years Cognition, fine motor and self care', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '5 years');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Concerns from teacher about school readiness');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Not independently able to complete everyday routines such as feeding and dressing');
    await checkCheckboxOption(container, 'Cognition, fine motor and self care', 'Cannot draw simple pictures (e.g. stick person)');
  });

  test('for 5 years Gross motor', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 1);
    await selectTab(container, 'Red flags early identification guide for children');
    await checkCheckboxOption(container, 'What age group is the child closest to?', '5 years');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to walk, run, climb, jump and use stairs confidently');
    await checkCheckboxOption(container, 'Gross motor', 'Not able to hop five times on one leg and stand on one leg for five seconds');
  });
});

describe('Gambling issues question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Gambling');
    await checkRadioOption(container, 'Have you or someone close to you ever had issues with gambling?', 'Yes');
    await inputText(container, 'Details', 'Gambling issues');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Gambling');
    await checkRadioOption(container, 'Have you or someone close to you ever had issues with gambling?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Puberty and sexual health concerns', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to puberty/your sexual health?', 'Yes');
    await inputText(container, 'Details', 'Puberty and sexual health concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to puberty/your sexual health?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for not asked', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to puberty/your sexual health?', 'Not Asked');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for asked but declined', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to puberty/your sexual health?', 'Asked But Declined');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Genitourinary and sexual health question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to your sexual health?', 'Yes');
    await inputText(container, 'Details', 'Genitourinary and sexual health concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to your sexual health?', 'No');
    const sexualHealthContainer = await findByLinkIdOrLabel(container, 'Sexual health concerns');
    await expect(async()=>await findByLinkIdOrLabel(sexualHealthContainer, 'Details')).rejects.toThrow();
  });

  test('for not asked', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to your sexual health?', 'Not Asked');
    const sexualHealthContainer = await findByLinkIdOrLabel(container, 'Sexual health concerns');
    await expect(async()=>await findByLinkIdOrLabel(sexualHealthContainer, 'Details')).rejects.toThrow();
  });

  test('for asked but declined', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Is there anything that you are worried about in relation to your sexual health?', 'Asked But Declined');
    const sexualHealthContainer = await findByLinkIdOrLabel(container, 'Sexual health concerns');
    await expect(async()=>await findByLinkIdOrLabel(sexualHealthContainer, 'Details')).rejects.toThrow();
  });
});

describe('Genitourinary and sexual health concerns for older adults', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Consider asking when appropriate: Is there anything that you are worried about in relation to your sexual health?', 'Yes');
    await inputText(container, 'Details', 'Sexual health concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Consider asking when appropriate: Is there anything that you are worried about in relation to your sexual health?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for not asked', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Consider asking when appropriate: Is there anything that you are worried about in relation to your sexual health?', 'Not Asked');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });

  test('for asked but declined', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Consider asking when appropriate: Is there anything that you are worried about in relation to your sexual health?', 'Asked But Declined');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Continence issues question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Do you have problems with urine leaking?', 'Yes');
    await inputText(container, 'Details', 'Continence issues');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Genitourinary and sexual health');
    await checkRadioOption(container, 'Do you have problems with urine leaking?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Vision concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Eye health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s vision?', 'Yes');
    await inputText(container, 'Details', 'Vision concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Eye health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s vision?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Vision concerns for older adults', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Eye health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your vision?', 'Yes');
    await inputText(container, 'Details', 'Vision concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Eye health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your vision?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Child listening concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s listening?', 'Yes');
    await inputText(container, 'Details', 'Listening concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s listening?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Child language concerns question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything you are worried about with your child\'s language/talking?', 'Yes');
    await inputText(container, 'Details', 'Language concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything you are worried about with your child\'s language/talking?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Child snoring question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Do you notice snoring/noisy breathing at night/while your child is sleeping?', 'Yes');
    await inputText(container, 'Details', 'Snoring concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Do you notice snoring/noisy breathing at night/while your child is sleeping?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Hearing concerns', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything that you are worried about with your hearing?', 'Yes');
    await inputText(container, 'Details', 'Hearing concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Ear health and hearing');
    await checkRadioOption(container, 'Is there anything that you are worried about with your hearing?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Dental concerns', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Oral and dental health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s teeth or mouth?', 'Yes');
    await inputText(container, 'Details', 'Dental concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Oral and dental health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your child\'s teeth or mouth?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Dental concerns for older adults', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Oral and dental health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your teeth?', 'Yes');
    await inputText(container, 'Details', 'Dental concerns');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Oral and dental health');
    await checkRadioOption(container, 'Is there anything that you are worried about with your teeth?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Skin problems question', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Skin');
    await checkRadioOption(container, 'Does your child have any skin problems?', 'Yes');
    await inputText(container, 'Details', 'Skin problems');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Skin');
    await checkRadioOption(container, 'Does your child have any skin problems?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Skin problems for older adults', () => {
  test('for yes', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Skin');
    await checkRadioOption(container, 'Is there anything that you are worried about with your skin?', 'Yes');
    await inputText(container, 'Details', 'Skin problems');
  });

  test('for no', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Skin');
    await checkRadioOption(container, 'Is there anything that you are worried about with your skin?', 'No');
    await expect(async()=>await findByLinkIdOrLabel(container, 'Details')).rejects.toThrow();
  });
});

describe('Referrals and appointments questions', () => {
  test('for 2 years old', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Finalising the health check');
    await chooseSelectOption(container, 'Who','Dentist')
    await inputDate(container, 'When', '03/02/2026')
  });

  test('for 10 years old', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 10);
    await selectTab(container, 'Finalising the health check');
    await chooseSelectOption(container, 'Who','Dentist')
    await inputDate(container, 'When', '03/02/2026')
  });

  test('for 24 years old', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Finalising the health check');
    await chooseSelectOption(container, 'Who','Dentist')
    await inputDate(container, 'When', '03/02/2026')
  });

  test('for 33 years old', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Finalising the health check');
    await chooseSelectOption(container, 'Who','Dentist')
    await inputDate(container, 'When', '03/02/2026')
  });

  test('for 51 years old', async () => {
    const form = aboriginalForm as Questionnaire;
    const { container } = render(<BuildFormWrapperForStorybook questionnaire={form} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);
    await selectTab(container, 'Finalising the health check');
    await chooseSelectOption(container, 'Who','Dentist')
    await inputDate(container, 'When', '03/02/2026')
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
