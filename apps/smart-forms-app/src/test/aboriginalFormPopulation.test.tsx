import { render, waitFor } from '@testing-library/react';
import { vi, beforeAll } from 'vitest';

import { AboriginalForm } from './aboriginalFormUtils.tsx';

import {
  getBirthDateForAge,
  getInputText,
  getCqfText,
  selectTab,
  findByLinkIdOrLabel,
  findAllByLinkIdOrLabel,
  getSelectText
} from './testUtils.ts';
import { patient, requestDefinitions } from './aboriginalFormIntegrationData.ts';
import { Patient } from 'fhir/r4';

vi.mock('fhirclient', () => ({
  client: () => ({})
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Population workflow for', () => {
  test('Patient details', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Patient Details');

    const patientAge = await getInputText(container, 'Age');
    expect(patientAge).toBe('33');

    const patientName = await getInputText(container, 'Name');
    expect(patientName).toBe('John, Snow');

    const preferredName = await getInputText(container, 'Preferred name');
    expect(preferredName).toBe('Johnny');

    const preferredPronouns = await getInputText(container, 'Preferred pronouns');
    expect(preferredPronouns).toBe('he/him/his/his/himself');

    const genderIdentity = await getInputText(container, 'Gender identity');
    expect(genderIdentity).toBe('Identifies as male gender');

    const sexAssignedAtBirth = await getInputText(container, 'Sex assigned at birth');
    expect(sexAssignedAtBirth).toBe('Male');

    const dateOfBirth = await getInputText(container, 'Date of birth');
    const birthDateIso = getBirthDateForAge(33);
    const [year, month, day] = birthDateIso.split('-');
    const expectedDateOfBirth = `${day}/${month}/${year}`;
    expect(dateOfBirth).toBe(expectedDateOfBirth);

    const aboriginalAndTorresStraitIslanderStatus = await getInputText(
      container,
      'Aboriginal and/or Torres Strait Islander status'
    );
    expect(aboriginalAndTorresStraitIslanderStatus).toBe('1');

    // Home address
    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    const streetAddress = await getInputText(homeAddress, 'Street address');
    expect(streetAddress).toBe('123 Winter Lane');
    const city = await getInputText(homeAddress, 'City');
    expect(city).toBe('Melbourne');
    const state = await getInputText(homeAddress, 'State');
    expect(state).toBe('Victoria');
    const postalCode = await getInputText(homeAddress, 'Postcode');
    expect(postalCode).toBe('3000');

    // Postal address
    const postalAddress = await findByLinkIdOrLabel(container, 'Postal address');
    const postalStreetAddress = await getInputText(postalAddress, 'Street address');
    expect(postalStreetAddress).toBe('123 Winter Lane');
    const postalCity = await getInputText(postalAddress, 'City');
    expect(postalCity).toBe('Melbourne');
    const postalState = await getInputText(postalAddress, 'State');
    expect(postalState).toBe('Victoria');
    const postalPostcode = await getInputText(postalAddress, 'Postcode');
    expect(postalPostcode).toBe('3000');

    const homePhone = await getInputText(container, 'Home phone');
    expect(homePhone).toBe('0398765432');
    const mobilePhone = await getInputText(container, 'Mobile phone');
    expect(mobilePhone).toBe('0412345678');

    const emergencyContact = await findByLinkIdOrLabel(container, 'Emergency contact');
    const emergencyContactName = await getInputText(emergencyContact, 'Name');
    expect(emergencyContactName).toBe('Stark, Arya');
    const emergencyContactPhone = await getInputText(emergencyContact, 'Phone');
    expect(emergencyContactPhone).toBe('0400000000');

    const medicareNumber = await findByLinkIdOrLabel(container, 'Medicare number');
    const medicareNumberNumber = await getInputText(medicareNumber, 'Number');
    expect(medicareNumberNumber).toBe('1234567890');
    const medicareNumberReferenceNumber = await getInputText(medicareNumber, 'Reference number');
    expect(medicareNumberReferenceNumber).toBe('1');
    const medicareNumberExpiry = await getInputText(medicareNumber, 'Expiry');
    expect(medicareNumberExpiry).toBe('2025-12-31');

    const pensionerCardNumber = await getInputText(container, 'Pensioner Card Number');
    expect(pensionerCardNumber).toBe('PEN123456');

    const healthcareCardNumber = await getInputText(container, 'Health Care Card Number');
    expect(healthcareCardNumber).toBe('HC987654');

    const closingTheGapRegistration = await getInputText(
      container,
      'Registered for Closing the Gap PBS Co-payment Measure (CTG)'
    );
    expect(closingTheGapRegistration).toBe('true');
  });

  test('Patient with no fixed address', async () => {
    const patientNoFixedAddress: Patient = {
      ...patient,
      address: [
        {
          use: 'home',
          type: 'physical',
          extension: [
            {
              url: 'http://hl7.org.au/fhir/StructureDefinition/no-fixed-address',
              valueBoolean: true
            }
          ]
        },
        ...(patient.address ?? []).filter((a) => a.use === 'home' && a.type === 'postal')
      ]
    };
    const { container } = render(
      <AboriginalForm patient={patientNoFixedAddress} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Patient Details');

    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    await expect(
      async () => await findByLinkIdOrLabel(homeAddress, 'Street address')
    ).rejects.toThrow();
  });

  test('Medical conditions', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');

    const medicalHistorySummary = await findByLinkIdOrLabel(container, 'Medical history summary');
    const mhRow1: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(1)')!;
    expect(mhRow1).toBeTruthy();

    const medicalHistory = await getInputText(mhRow1, 'Condition');
    expect(medicalHistory).toBe("Parkinson's disease");
    const medicalHistoryClinicalStatus = await getInputText(mhRow1, 'Clinical status');
    expect(medicalHistoryClinicalStatus).toBe('Active');
    const medicalHistoryOnsetDate = await getInputText(mhRow1, 'Onset date');
    expect(medicalHistoryOnsetDate).toBe('10/10/2025');

    const mhRow2: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(2)')!;
    expect(mhRow2).toBeTruthy();
    const medicalHistory2 = await getInputText(mhRow2, 'Condition');
    expect(medicalHistory2).toBe('Non-SNOMED condition');
    const medicalHistoryClinicalStatus2 = await getInputText(mhRow2, 'Clinical status');
    expect(medicalHistoryClinicalStatus2).toBe('Active');
    const medicalHistoryOnsetDate2 = await getInputText(mhRow2, 'Onset date');
    expect(medicalHistoryOnsetDate2).toBe('10/10/2025');

    const mhRow3: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(3)')!;
    expect(mhRow3).toBeTruthy();
    const medicalHistory3 = await getInputText(mhRow3, 'Condition');
    expect(medicalHistory3).toBe('Resolved condition');
    const medicalHistoryClinicalStatus3 = await getInputText(mhRow3, 'Clinical status');
    expect(medicalHistoryClinicalStatus3).toBe('Inactive');
    const medicalHistoryOnsetDate3 = await getInputText(mhRow3, 'Onset date');
    expect(medicalHistoryOnsetDate3).toBe('10/10/2025');
    const medicalHistoryAbatementDate3 = await getInputText(mhRow3, 'Abatement date');
    expect(medicalHistoryAbatementDate3).toBe('01/01/2026');
  });

  test('About the health check', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'About the health check');

    const healthCheckAlreadyInProgress = await getInputText(
      container,
      'Health check already in progress?'
    );
    expect(healthCheckAlreadyInProgress).toBe('true');

    const dateOfLastCompletedHealthCheck = await getInputText(
      container,
      'Date of last completed health check'
    );
    expect(dateOfLastCompletedHealthCheck).toBe('01/03/2026');

    const dateOfHealthCheckCommenced = await getInputText(
      container,
      'Date this health check commenced'
    );

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}/${month}/${year}`;

    expect(dateOfHealthCheckCommenced).toBe(formattedToday);
  });

  test('Consent', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Consent');

    const consentDate = await getInputText(container, 'Date');

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}/${month}/${year}`;

    expect(consentDate).toBe(formattedToday);
  });
  test('Regular medications', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');

    const medicationRows = await findAllByLinkIdOrLabel(
      container,
      'regularmedications-summary-current'
    );
    expect(medicationRows.length).toBe(2);

    const medRow1 = medicationRows[0]!;
    const currentMedication = await getInputText(medRow1, 'Medication');
    expect(currentMedication).toBe('Paracetamol 500mg tablet');
    const currentMedicationStatus = await getInputText(medRow1, 'Status');
    expect(currentMedicationStatus).toBe('Active');
    const currentMedicationDosage = await getInputText(medRow1, 'Dosage');
    expect(currentMedicationDosage).toBe('Once daily, 10mg');
    const currentMedicationReasonCode = await getInputText(medRow1, 'Clinical indication');
    expect(currentMedicationReasonCode).toBe('Clinical indication for medication');
    const currentMedicationComment = await getInputText(medRow1, 'Comment');
    expect(currentMedicationComment).toBe('Patient should take with food');

    const medRow2 = medicationRows[1]!;
    const currentMedication2 = await getInputText(medRow2, 'Medication');
    expect(currentMedication2).toBe('Non-SNOMED medication');
    const currentMedicationStatus2 = await getInputText(medRow2, 'Status');
    expect(currentMedicationStatus2).toBe('Active');
    const currentMedicationDosage2 = await getInputText(medRow2, 'Dosage');
    expect(currentMedicationDosage2).toBe('Once daily, 5mg');
    const currentMedicationReasonCode2 = await getInputText(medRow2, 'Clinical indication');
    expect(currentMedicationReasonCode2).toBe('Non-SNOMED clinical indication for medication');
    const currentMedicationComment2 = await getInputText(medRow2, 'Comment');
    expect(currentMedicationComment2).toBe('Non-SNOMED medication note');
  });

  test('Allergies', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');

    const allergiesRows = container.querySelectorAll<HTMLElement>('[data-linkid="allergysummary"]');
    expect(allergiesRows.length).toBe(2);
    const allergyRow1 = allergiesRows[0]!;
    const allergySubstance = await getInputText(allergyRow1, 'Substance');
    expect(allergySubstance).toBe('Cashew nuts');
    const allergyStatus = await getInputText(allergyRow1, 'Status');
    expect(allergyStatus).toBe('Active');
    const allergyManifestation = await getInputText(allergyRow1, 'Manifestation');
    expect(allergyManifestation).toBe('Rash');
    const allergyComment = await getInputText(allergyRow1, 'Comment');
    expect(allergyComment).toBe('Patient experiences rash and swelling');

    const allergyRow2 = allergiesRows[1]!;
    const allergySubstance2 = await getInputText(allergyRow2, 'Substance');
    expect(allergySubstance2).toBe('Non-SNOMED allergen');
    const allergyStatus2 = await getInputText(allergyRow2, 'Status');
    expect(allergyStatus2).toBe('Active');
    const allergyManifestation2 = await getInputText(allergyRow2, 'Manifestation');
    expect(allergyManifestation2).toBe('Non-SNOMED reaction');
    const allergyComment2 = await getInputText(allergyRow2, 'Comment');
    expect(allergyComment2).toBe('Non-SNOMED allergy note');
  });

  test('Substance use, including tobacco', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Substance use, including tobacco');

    const smokingStatusStringContainer = await findByLinkIdOrLabel(container, 'Smoking status');
    const lastResultSmokingStatus = await getCqfText(smokingStatusStringContainer, 'Last status');
    expect(lastResultSmokingStatus).toBe('Current smoker ( 1 Dec 2025 )');
  });

  test('Immunizations', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Immunisation');

    const vaccinesPreviouslyGiven = await findByLinkIdOrLabel(
      container,
      'Vaccines previously given'
    );
    const vaccinesRow1: HTMLElement =
      vaccinesPreviouslyGiven.querySelector('tbody tr:nth-child(1)')!;
    expect(vaccinesRow1).toBeTruthy();
    const vaccine1 = await getInputText(vaccinesRow1, 'Vaccine');
    expect(vaccine1).toBe('Vaccine');
    const vaccineBatchNumber1 = await getInputText(vaccinesRow1, 'Batch number');
    expect(vaccineBatchNumber1).toBe('BATCH-123');
    const vaccineDate1 = await getInputText(vaccinesRow1, 'Administration date');
    expect(vaccineDate1).toBe('01/03/2026');
    const vaccineComment1 = await getInputText(vaccinesRow1, 'Comment');
    expect(vaccineComment1).toBe('Routine immunisation comment');

    const vaccinesRow2: HTMLElement =
      vaccinesPreviouslyGiven.querySelector('tbody tr:nth-child(2)')!;
    expect(vaccinesRow2).toBeTruthy();
    const vaccine2 = await getInputText(vaccinesRow2, 'Vaccine');
    expect(vaccine2).toBe('Non-SNOMED vaccine');
    const vaccineBatchNumber2 = await getInputText(vaccinesRow2, 'Batch number');
    expect(vaccineBatchNumber2).toBe('BATCH-456');
    const vaccineDate2 = await getInputText(vaccinesRow2, 'Administration date');
    expect(vaccineDate2).toBe('02/03/2026');
    const vaccineComment2 = await getInputText(vaccinesRow2, 'Comment');
    expect(vaccineComment2).toBe('Non-SNOMED immunisation comment');
  });

  test('Examination', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');

    const heightStringContainer = await findByLinkIdOrLabel(container, 'Height');
    const lastResultHeight = await getCqfText(heightStringContainer, 'Last result');
    expect(lastResultHeight).toBe('170 cm ( 20 Nov 2025 )');
    const weightStringContainer = await findByLinkIdOrLabel(container, 'Weight');
    const lastResultWeight = await getCqfText(weightStringContainer, 'Last result');
    expect(lastResultWeight).toBe('70 kg ( 21 Nov 2025 )');
    const bmiStringContainer = await findByLinkIdOrLabel(container, 'BMI (calculated)');
    const lastResultBmi = await getCqfText(bmiStringContainer, 'Last result');
    expect(lastResultBmi).toBe('24.2 kg/m2');
    const waistCircumferenceStringContainer = await findByLinkIdOrLabel(
      container,
      'Waist circumference'
    );
    const lastResultWaistCircumference = await getCqfText(
      waistCircumferenceStringContainer,
      'Last result'
    );
    expect(lastResultWaistCircumference).toBe('90 cm ( 23 Nov 2025 )');
    const heartRateStringContainer = await findByLinkIdOrLabel(container, 'Heart rate');
    const lastResultHeartRate = await getCqfText(heartRateStringContainer, 'Last result');
    expect(lastResultHeartRate).toBe('72 /min ( 4 Dec 2025 )');
    const heartRhythmStringContainer = await findByLinkIdOrLabel(container, 'Heart rhythm');
    const lastResultHeartRhythm = await getCqfText(heartRhythmStringContainer, 'Last result');
    expect(lastResultHeartRhythm).toBe('Regular heart rhythm ( 3 Dec 2025 )');
  });

  test('CVD risk', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Absolute cardiovascular disease risk calculation');

    const cvdRiskResult = await findByLinkIdOrLabel(container, 'CVD risk result');
    const cvdRiskResultValue = await getInputText(cvdRiskResult, 'Latest available result');
    expect(cvdRiskResultValue).toBe('10% Low risk ( 5 Dec 2025 )');
    const smokingStatus = await findByLinkIdOrLabel(container, 'Smoking status');
    const smokingStatusValue = await getSelectText(smokingStatus, 'Value');
    expect(smokingStatusValue).toBe('Current smoker');
    const smokingStatusDatePerformed = await getInputText(smokingStatus, 'Date performed');
    expect(smokingStatusDatePerformed).toBe('01/12/2025');
    const bloodPressure = await findByLinkIdOrLabel(container, 'Systolic Blood Pressure');
    const bloodPressureValue = await getInputText(bloodPressure, 'Value');
    expect(bloodPressureValue).toBe('120');
    const bloodPressureDatePerformed = await getInputText(bloodPressure, 'Date performed');
    expect(bloodPressureDatePerformed).toBe('02/12/2025');
    const totalCholesterol = await findByLinkIdOrLabel(container, 'Total Cholesterol');
    const totalCholesterolValue = await getInputText(totalCholesterol, 'Value');
    expect(totalCholesterolValue).toBe('5.2');
    const totalCholesterolDatePerformed = await getInputText(totalCholesterol, 'Date performed');
    expect(totalCholesterolDatePerformed).toBe('15/11/2025');
    const hdlCholesterol = await findByLinkIdOrLabel(container, 'HDL Cholesterol');
    const hdlCholesterolValue = await getInputText(hdlCholesterol, 'Value');
    expect(hdlCholesterolValue).toBe('1.3');
    const hdlCholesterolDatePerformed = await getInputText(hdlCholesterol, 'Date performed');
    expect(hdlCholesterolDatePerformed).toBe('16/11/2025');
    const type2Diabetes = await getInputText(container, 'Type 2 diabetes mellitus');
    expect(type2Diabetes).toBe('true');
  });
});
