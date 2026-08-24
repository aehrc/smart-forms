import type { Patient, Questionnaire } from 'fhir/r4';
import type { BehavioralTestWrapperProps } from '@aehrc/questionnaire-test-toolkit';
import { BehavioralTestWrapper } from '@aehrc/questionnaire-test-toolkit';
import gpccmpForm from '../questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json';
import { render, waitFor } from '@testing-library/react';
import {
  chooseSelectOption,
  selectTab,
  inputInteger,
  checkRadioOption,
  findByLinkIdOrLabel,
  inputText
} from '@aehrc/questionnaire-test-toolkit';

function GpccmpForm(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={gpccmpForm as Questionnaire} {...props} />;
}

//Patient details
describe('My Aged Care boundary values', () => {
  test('for patients over 50 years of age', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await inputInteger(container, 'Age', 51);

    await checkRadioOption(container, 'Registered for My Aged Care', 'Yes');
    await inputInteger(container, 'My Aged Care Number', 1234567890);
    await inputText(container, 'Comment', 'This is a comment');
  });

  test('for patients under 50 years of age', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await inputInteger(container, 'Age', 49);
    await expect(
      async () => await findByLinkIdOrLabel(container, 'My Aged Care')
    ).rejects.toThrow();
  });

  test('for patients aged 50 years', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await inputInteger(container, 'Age', 50);

    await checkRadioOption(container, 'Registered for My Aged Care', 'Yes');
    await inputInteger(container, 'My Aged Care Number', 1234567890);
    await inputText(container, 'Comment', 'This is a comment');
  });
});

const noFixedAddressPatient: Patient = {
  resourceType: 'Patient',
  id: 'patient-no-fixed-address',
  name: [{ use: 'official', family: 'Doe', given: ['Jane'] }],
  birthDate: '1990-01-01',
  gender: 'female',
  address: [
    {
      use: 'home',
      extension: [
        {
          url: 'http://hl7.org.au/fhir/StructureDefinition/no-fixed-address',
          valueBoolean: true
        }
      ]
    }
  ]
};

describe('Home Address', () => {
  test('for patients with a home address', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await inputText(container, 'Street address', '123 Main St');
    await inputText(container, 'City', 'Sydney');
    await chooseSelectOption(container, 'State', 'New South Wales');
    await inputText(container, 'Postcode', '2000');
  });

  // `No fixed address` cannot be ticked by hand: its group `patient-contact-homeaddress` is
  // `readOnly: true`, so the checkbox renders with `pointer-events: none` and a click is a no-op.
  // The item carries an initialExpression reading the `no-fixed-address` extension off the
  // patient's home address, so population is the only way this flag is ever set — and the only
  // way to reach the state this test is about.
  test('for patients without a home address', async () => {
    const { container } = render(<GpccmpForm patient={noFixedAddressPatient} />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await expect(
      async () => await findByLinkIdOrLabel(container, 'Street address')
    ).rejects.toThrow();

    await expect(async () => await findByLinkIdOrLabel(container, 'City')).rejects.toThrow();

    await expect(async () => await findByLinkIdOrLabel(container, 'Postcode')).rejects.toThrow();
  });
});

//Practitioner details

describe('Clinic Address', () => {
  test('clinic address', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });

    await selectTab(container, 'Practitioner details');
    const addressContainer = await findByLinkIdOrLabel(container, 'Address');
    await inputText(addressContainer, 'Street address', '123 Main St');
    await inputText(addressContainer, 'City', 'Sydney');
    await chooseSelectOption(addressContainer, 'State', 'New South Wales');
    await inputText(addressContainer, 'Postcode', '2000');
  });
});
