import { render, waitFor } from '@testing-library/react';
import { vi, beforeAll } from 'vitest';

import {
  checkRadioOption,
  chooseSelectOption,
  inputDate,
  inputInteger,
  inputText,
  selectTab,
  findByLinkIdOrLabel,
  checkCheckBox,
  checkCheckboxOption,
  getInputText,
  inputDecimal,
  getVisibleTab,
} from './testUtils.ts';
import { AboriginalForm } from './aboriginalFormUtils.tsx';

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

describe('New result calculation field', () => {
  test('Length/Height field -> enter length/height,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');
    
    
    const dateFieldValueBefore = await getInputText(container, 'obs-lengthheight-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-lengthheight-newresult', 20.55);
    
    
    const dateFieldValueAfter = await getInputText(container, 'obs-lengthheight-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Weight field -> enter weight,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');
    
    const dateFieldValueBefore = await getInputText(container, 'obs-weight-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-weight-newresult', 4.55);
    
    const dateFieldValueAfter = await getInputText(container, 'obs-weight-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Head circumference field -> enter head circumference,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'obs-headcircumference-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-headcircumference-newresult', 4.55);
    
    const dateFieldValueAfter = await getInputText(container, 'obs-headcircumference-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Heart rate field -> enter heart rate,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'obs-heartrate-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-heartrate-newresult', 60);
    
    const dateFieldValueAfter = await getInputText(container, 'obs-heartrate-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
    
    
  });

  test('Heart rhythm -> select regular heart rhythm,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'obs-heartrhythm-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await chooseSelectOption(container, 'obs-heartrhythm-newresult', 'Regular heart rhythm');
    
    const dateFieldValueAfter = await getInputText(container, 'obs-heartrhythm-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
    
    
  });

  test('Heart rhythm -> select irregular heart rhythm,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 2);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'obs-heartrhythm-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await chooseSelectOption(container, 'obs-heartrhythm-newresult', 'Irregular heart rhythm');
    
    const dateFieldValueAfter = await getInputText(container, 'obs-heartrhythm-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Height field -> enter height,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'obs-height-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-height-newresult', 170.55);
    
    const dateFieldValueAfter = await getInputText(container, 'obs-height-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('BMI field -> enter weight and height,the current date is displayed and the BMI is calculated', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');
    
    await inputDecimal(container, 'obs-height-newresult', 170.55);
    await inputDecimal(container, 'obs-weight-newresult', 70.55);

    expect(await getInputText(container, 'obs-bmi-newresult')).toBe('24.3');
  });

  test('Waist circumference field -> enter waist circumference,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');
    
    const dateFieldValueBefore = await getInputText(container, 'obs-waistcircumference-newdate');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'obs-waistcircumference-newresult', 80.55);
    
    const dateFieldValueAfter = await getInputText(container, 'obs-waistcircumference-newdate');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });
});

describe('Date performed field calculated', () => {
  test('Date performed field -> enter Systolic value,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'bp-newbp-date');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'bp-newbp-systolic', 120);
    
    const dateFieldValueAfter = await getInputText(container, 'bp-newbp-date');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Date performed field -> enter Diastolic value,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'bp-newbp-date');
    expect(dateFieldValueBefore).toBe('');
    
    await inputDecimal(container, 'bp-newbp-diastolic', 80);
    
    const dateFieldValueAfter = await getInputText(container, 'bp-newbp-date');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
    
  });

  test('Date performed field -> enter Systolic and Diastolic values,the current date is displayed', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);
    await selectTab(container, 'Examination');

    const dateFieldValueBefore = await getInputText(container, 'bp-newbp-date');
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(container, 'bp-newbp-systolic', 120);
    await inputDecimal(container, 'bp-newbp-diastolic', 80);

    const dateFieldValueAfter = await getInputText(container, 'bp-newbp-date');
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
    
    
  });

});

describe('CVD risk calculator variables', () => {
  test('Checking the Age field pre-fill', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await selectTab(container, 'Absolute cardiovascular disease risk calculation');

    expect(await getInputText(container, 'Age')).toBe('33');
  });

  test('Checking the Postcode field pre-fill', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);
    await inputText(container, 'Postcode', '2000');
    await selectTab(container, 'Absolute cardiovascular disease risk calculation');

    expect(await getInputText(container, 'Postcode')).toBe('2000');
  });
});

describe('Health Priorities, Actions And Follow-Up Summary', () => {
  test('Current health/patient priorities are displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Current health/patient priorities');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test priority');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Current health/patient priorities')).toBe('Test priority');
  });

  test('Medical history and current problems are displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Medical history and current problems');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test medical history');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Medical history and current problems')).toBe('Test medical history');
  });

  test('Regular medications are displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Regular medications');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test regular medications');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Regular medications')).toBe('Test regular medications');
  });

  test.skip('Allergies/adverse reactions is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Allergies/adverse reactions');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test allergies/adverse reactions');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Allergies/adverse reactions')).toBe('Test allergies/adverse reactions');
  });

  test('Family history is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Family history');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test family history');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Family history')).toBe('Test family history');
  });

  test('Social and emotional wellbeing is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Social and emotional wellbeing');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test social and emotional wellbeing');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Social and emotional wellbeing')).toBe('Test social and emotional wellbeing');
  });

  test('Social history is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 5);

    await selectTab(container, 'Social history: Information about family and child\'s living arrangements');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test social history');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Social history')).toBe('Test social history');
  });

  test('Home and family is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Home and family');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test home and family');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Home and family')).toBe('Test home and family');
  });

  test('Learning and development is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 5);

    await selectTab(container, 'Learning and development');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test learning and development');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Learning and development')).toBe('Test learning and development');
  });

  test('Learning and work is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Learning and work');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test learning and work');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Learning and work')).toBe('Test learning and work');
  });

  test('Work is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Work');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test work');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Work')).toBe('Test work');
  });

  test('Mood is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Mood');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test mood');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Mood')).toBe('Test mood');
  });

  test('Memory and thinking is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Memory and thinking');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test memory and thinking');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Memory and thinking')).toBe('Test memory and thinking');
  });

  test('Chronic disease associated with ageing is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Chronic disease associated with ageing');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test chronic disease associated with ageing');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Chronic disease associated with ageing')).toBe('Test chronic disease associated with ageing');
  });

  test('Participation in screening programs is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Participation in screening programs');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test participation in screening programs');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Participation in screening programs')).toBe('Test participation in screening programs');
  });

  test('Healthy eating is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Healthy eating');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test healthy eating');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Healthy eating')).toBe('Test healthy eating');
  });

  test('Physical activity and screen time is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Physical activity and screen time');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test physical activity and screen time');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Physical activity and screen time')).toBe('Test physical activity and screen time');
  });

  test('Physical activity is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Physical activity');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test physical activity');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Physical activity')).toBe('Test physical activity');
  });

  test('Substance use, including tobacco is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Substance use, including tobacco');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test substance use, including tobacco');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Substance use, including tobacco')).toBe('Test substance use, including tobacco');
  });

  test('Gambling is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Gambling');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test gambling');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Gambling')).toBe('Test gambling');
  });

  test('Sexual health is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 24);

    await selectTab(container, 'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Sexual health');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Sexual health')).toBe('Test Sexual health');
  });

   test('Genitourinary and sexual health (adults) is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Genitourinary and sexual health');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Genitourinary and sexual health');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Genitourinary and sexual health')).toBe('Test Genitourinary and sexual health');
  });

  test('Genitourinary and sexual health(older adults) is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 51);

    await selectTab(container, 'Genitourinary and sexual health');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Genitourinary and sexual health');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Genitourinary and sexual health')).toBe('Test Genitourinary and sexual health');
  });

  test('Eye health is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Eye health');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Eye health');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Eye health')).toBe('Test Eye health');
  });

  test('Ear health and hearing is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Ear health and hearing');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Ear health and hearing');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Ear health and hearing')).toBe('Test Ear health and hearing');
  });

  test('Oral and dental health is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Oral and dental health');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Oral and dental health');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Oral and dental health')).toBe('Test Oral and dental health');
  });

  test('Skin is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 5);

    await selectTab(container, 'Skin');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Skin');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Skin')).toBe('Test Skin');
  });

  test('Immunisation is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Immunisation');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Immunisation');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Immunisation')).toBe('Test Immunisation');
  });

  test('Examination is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Examination');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Examination');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Examination')).toBe('Test Examination');
  });


  test('Absolute cardiovascular disease risk calculation is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Absolute cardiovascular disease risk calculation');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Absolute cardiovascular disease risk calculation');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Absolute cardiovascular risk calculation')).toBe('Test Absolute cardiovascular disease risk calculation');
  });

  test('Investigations is displayed on the Health Priorities Summary tab.', async () => {
    const { container } = render(<AboriginalForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
    await inputInteger(container, 'Age', 33);

    await selectTab(container, 'Investigations');
    await inputText(container, 'Health priorities, actions and follow-up', 'Test Investigations');
    await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
    const tabContainer = await getVisibleTab(container);
    expect(await getInputText(tabContainer, 'Investigations')).toBe('Test Investigations');
  });

  


});