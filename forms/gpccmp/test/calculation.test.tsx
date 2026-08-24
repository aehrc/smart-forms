import type { Questionnaire } from 'fhir/r4';
import type { BehavioralTestWrapperProps } from '@aehrc/questionnaire-test-toolkit';
import { BehavioralTestWrapper } from '@aehrc/questionnaire-test-toolkit';
import gpccmpForm from '../questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json';
import { render, waitFor } from '@testing-library/react';
import {
  inputDecimal,
  selectTab,
  inputInteger,
  findByLinkIdOrLabel,
  getInputText,
  chooseSelectOption
} from '@aehrc/questionnaire-test-toolkit';

function GpccmpForm(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={gpccmpForm as Questionnaire} {...props} />;
}

describe('Observation Calculation', () => {
  test('height new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-height-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-height-newresultvalue',
      170.55
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-height-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('weight new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-weight-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-weight-newresultvalue',
      70.55
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-weight-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('BMI calculation', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-height-newresultvalue',
      170.55
    );
    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-weight-newresultvalue',
      70.32
    );
    const bmiFieldValue = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-bmi-newresultvalue'
    );
    expect(bmiFieldValue).toBe('24.2');
  });

  test('Waist circumference new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-waistcircumference-newdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-waistcircumference-newresultvalue',
      80.55
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-waistcircumference-newdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Pulse rate new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserate-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputInteger(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserate-newresultvalue',
      70
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserate-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Pulse rhythm new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserhythm-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await chooseSelectOption(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserhythm-newresultvalue',
      'Pulse regular'
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-pulserhythm-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Oxygen saturation new result date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const observationsContainer = await findByLinkIdOrLabel(container, 'Observations');
    const dateFieldValueBefore = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-oxygensaturation-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      observationsContainer,
      'clinicaldetails-observations-maingrid-oxygensaturation-newresultvalue',
      20
    );
    const dateFieldValueAfter = await getInputText(
      observationsContainer,
      'clinicaldetails-observations-maingrid-oxygensaturation-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });
});

describe('Blood pressure calculations', () => {
  test('Systolic pressure date performed', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const bloodPressureContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    const dateFieldValueBefore = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultsystolic',
      120
    );
    const dateFieldValueAfter = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Diastolic pressure date performed', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const bloodPressureContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    const dateFieldValueBefore = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdiastolic',
      80
    );
    const dateFieldValueAfter = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Systolic and diastolic date performed', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const bloodPressureContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    const dateFieldValueBefore = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await inputDecimal(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultsystolic',
      120
    );
    await inputDecimal(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdiastolic',
      80
    );
    const dateFieldValueAfter = await getInputText(
      bloodPressureContainer,
      'clinicaldetails-observations-bpgrid-bp-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });
});

describe('Substance use calculations', () => {
  test('Smoking new status date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const substanceUseContainer = await findByLinkIdOrLabel(container, 'Substance use');
    const dateFieldValueBefore = await getInputText(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-smokingstatus-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');

    await chooseSelectOption(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-smokingstatus-newresultvalue',
      'Current smoker'
    );
    const dateFieldValueAfter = await getInputText(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-smokingstatus-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });

  test('Alcohol consumption new status date', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Clinical details');
    const substanceUseContainer = await findByLinkIdOrLabel(container, 'Substance use');
    const dateFieldValueBefore = await getInputText(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-alcoholstatus-newresultdate'
    );
    expect(dateFieldValueBefore).toBe('');
    await chooseSelectOption(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-alcoholstatus-newresultvalue',
      'Current drinker'
    );
    const dateFieldValueAfter = await getInputText(
      substanceUseContainer,
      'clinicaldetails-observations-substanceusegrid-alcoholstatus-newresultdate'
    );
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    expect(dateFieldValueAfter).toBe(formattedDate);
  });
});
