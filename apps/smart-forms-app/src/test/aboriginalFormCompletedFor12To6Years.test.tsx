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
  checkCheckboxOption,
  getInputText,
  inputDecimal,
  getVisibleTab,
  inputDateTime
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

test('Completed questionnaire for 12 years', async () => {
  const { container } = render(<AboriginalForm />);
  await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
  // Patient details
  await inputText(container, 'Name', 'John');
  await inputText(container, 'Preferred name', 'John');
  await chooseSelectOption(container, 'Preferred pronouns', 'he/him/his/his/himself');
  await chooseSelectOption(container, 'Gender identity', 'Identifies as female gender');
  await chooseSelectOption(container, 'Sex assigned at birth', 'Male');
  await inputDate(container, 'Date of birth', '01/01/2024');
  await inputInteger(container, 'Age', 12);
  await checkRadioOption(
    container,
    'Aboriginal and/or Torres Strait Islander status',
    'Aboriginal'
  );
  await checkCheckboxOption(container, 'Parents/primary carer/s', 'mother');
  await checkCheckboxOption(container, 'Parents/primary carer/s', 'father');
  await checkCheckboxOption(container, 'Parents/primary carer/s', 'grandparent');
  await checkCheckboxOption(container, 'Parents/primary carer/s', 'not applicable');
  await inputText(container, 'Other family', 'Uncle');
  await inputText(container, 'Other', 'Other');
  await inputText(container, 'Name of parent/primary carer', 'John');
  await inputText(container, 'Relationship to child', 'Mother');
  await inputText(container, 'Street address', '123 Main St');
  await inputText(container, 'City', 'Sydney');
  await chooseSelectOption(container, 'State', 'New South Wales');
  await inputText(container, 'Postcode', '2000');
  await inputText(container, 'Home phone', '02 9374 1234');
  await inputText(container, 'Mobile phone', '0412 345 678');
  const emergencyContactContainer = await findByLinkIdOrLabel(container, 'Emergency contact');
  await inputText(emergencyContactContainer, 'Name', 'Jane');
  await inputText(emergencyContactContainer, 'Relationship to child', 'Mother');
  await inputText(emergencyContactContainer, 'Phone', '02 9374 1234');
  await inputText(container, 'Number', '1234567890');
  await inputText(container, 'Reference number', '1234567890');
  await inputText(container, 'Expiry', '01/01/2024');
  await inputText(container, 'Pensioner Card Number', '1234567890');
  await inputText(container, 'Health Care Card Number', '1234567890');
  await checkRadioOption(
    container,
    'Registered for Closing the Gap PBS Co-payment Measure (CTG)',
    'Yes'
  );
  await checkRadioOption(container, 'Registered for NDIS', 'Yes');
  await inputText(container, 'NDIS Number', '1234567890');
  await checkRadioOption(
    container,
    'Are name and contact details of other key providers (eg case workers, support services) up to date?',
    'Yes'
  );
  const providersContainer = await findByLinkIdOrLabel(container, 'Providers');
  await inputText(providersContainer, 'Details', 'Some text');

  //About the health check
  await selectTab(container, 'About the health check');
  await checkRadioOption(container, 'Eligible for health check', 'Yes');
  await checkRadioOption(container, 'Health check already in progress?', 'Yes');
  await inputDateTime(
    container,
    'Date of last completed health check',
    '01/01/2024',
    '12:00',
    'PM'
  );
  await inputDate(container, 'Date this health check commenced', '01/01/2024');

  //Consent
  await selectTab(container, 'Consent');
  await checkRadioOption(
    container,
    'Consent given by parent/primary carer after discussion of process and benefits of a health check',
    'Yes'
  );
  await checkRadioOption(container, 'Parent/primary caregiver is present for health check?', 'Yes');
  await inputText(container, 'Relationship to child', 'Mother');
  await checkRadioOption(
    container,
    'Consent given for sharing of information with relevant healthcare providers?',
    'Yes'
  );
  await inputText(container, 'Who/details', 'Mother');
  await inputDate(container, 'Date', '03/02/2026');
  await inputText(container, 'Doctor', 'Dr. John Doe');
  await inputText(container, 'Nurse', 'Nurse Doe');
  await inputText(
    container,
    'Aboriginal and/or Torres Strait Islander Health Worker / Health Practitioner',
    'practitioner Doe'
  );
  await chooseSelectOption(container, 'Location of health check', 'Clinic');

  //Current priorities
  await selectTab(container, 'Current health/patient priorities');
  await inputText(
    container,
    'What are the important things for you in this health check today?',
    'Important things'
  );
  await inputText(
    container,
    "Is there anything that you are worried about with your child's health or wellbeing?",
    'Worried things'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Medical history and current problems
  await selectTab(container, 'Medical history and current problems');
  await inputText(container, 'Condition', 'Test diet');
  await chooseSelectOption(container, 'Clinical status', 'Active');
  await inputDate(container, 'Onset date', '01/01/2024');
  await inputDate(container, 'Abatement date', '01/01/2024');
  const newDiagnosisContainer = await findByLinkIdOrLabel(container, 'New diagnosis');
  await inputText(newDiagnosisContainer, 'Condition', 'Test diet');
  await inputDate(newDiagnosisContainer, 'Onset date', '01/01/2024');
  await inputText(newDiagnosisContainer, 'Comment', 'Test comment');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Regular medications

  await selectTab(container, 'Regular medications');
  const currentMedicationsContainer = await findByLinkIdOrLabel(container, 'Current medications');
  await inputText(currentMedicationsContainer, 'Medication', 'Aspirin 100 mg tablet');
  await chooseSelectOption(currentMedicationsContainer, 'Status', 'Active');
  await inputText(currentMedicationsContainer, 'Dosage', 'Test dosage');
  await inputText(currentMedicationsContainer, 'Clinical indication', 'Test clinical indication');
  await inputText(currentMedicationsContainer, 'Comment', 'Test comment');
  const newMedicationsContainer = await findByLinkIdOrLabel(container, 'New medications');
  await inputText(newMedicationsContainer, 'Medication', 'Paracetamol 500 mg tablet');
  await inputText(newMedicationsContainer, 'Dosage', 'Test dosage');
  await inputText(newMedicationsContainer, 'Clinical indication', 'Test clinical indication');
  await inputText(newMedicationsContainer, 'Comment', 'Test comment');
  await checkRadioOption(
    container,
    'Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
    'Yes'
  );
  await checkRadioOption(container, 'Check the health record is up to date', 'Yes');
  await checkRadioOption(
    container,
    'Check medication understanding and adherence with patient',
    'Yes'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Allergies/adverse reactions
  await selectTab(container, 'Allergies/adverse reactions');
  const adverseReactionContainer = await findByLinkIdOrLabel(
    container,
    'Adverse reaction risk summary'
  );
  await inputText(adverseReactionContainer, 'Substance', 'Freon');
  await chooseSelectOption(adverseReactionContainer, 'Status', 'Active');
  await inputText(adverseReactionContainer, 'Manifestation', 'Head burn');
  await inputText(adverseReactionContainer, 'Comment', 'Test comment');
  const newAdverseReactionContainer = await findByLinkIdOrLabel(
    container,
    'New adverse reaction risks'
  );
  await inputText(newAdverseReactionContainer, 'Substance', 'Freon');
  await inputText(newAdverseReactionContainer, 'Manifestation', 'Head burn');
  await inputText(newAdverseReactionContainer, 'Comment', 'Test comment');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Family history
  await selectTab(container, 'Family history');
  await inputText(
    container,
    'Provide relevant family history information',
    'Provide relevant family history information'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Social history
  await selectTab(
    container,
    "Social history: Information about family and child's living arrangements"
  );
  await inputText(
    container,
    'Who lives in your household? / Who does the child live with?',
    'Social history'
  );
  const stressfulLifeEvents = await findByLinkIdOrLabel(container, 'Stressful life events');
  await checkRadioOption(
    stressfulLifeEvents,
    'Have there been any stressful life events that would cause you or your child to be upset?',
    'Yes'
  );
  await inputText(stressfulLifeEvents, 'Details', 'School stress');
  await inputText(
    container,
    'If indicated, ask about depression and other mental health concerns',
    'depression and other mental health concerns'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Learning and development
  await selectTab(container, 'Learning and development');
  await inputText(
    container,
    "Is there anything that you are worried about with your child's learning?",
    'Worried about learning'
  );
  await inputText(
    container,
    "Is there anything that you are worried about with your child's behaviour?",
    'Worried about behaviour'
  );
  await inputText(
    container,
    "Is there anything that you are worried about with your child's sleep?",
    'Worried about sleep'
  );
  await inputText(
    container,
    'Is there anything you are worried about at school?',
    'Worried about school'
  );
  await inputText(
    container,
    'How often does your child miss school?',
    'How often does your child miss school'
  );
  await inputText(
    container,
    'Is your child having any difficulties making friends?',
    'Worried about making friends'
  );
  await inputText(
    container,
    "Are there any other concerns about your child's learning and development?",
    'Worried about other concerns'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Healthy eating
  await selectTab(container, 'Healthy eating');
  const childEatingConcernsContainer = await findByLinkIdOrLabel(
    container,
    'Child eating concerns'
  );
  await checkRadioOption(
    childEatingConcernsContainer,
    "Is there anything that you are worried about with your child's eating?",
    'Yes'
  );
  await inputText(childEatingConcernsContainer, 'Details', 'Feeding concerns');
  await inputText(
    container,
    'Document conversation about healthy eating which could include: current diet including food and drinks; recommendations about fruit and vegetable intake, water as the main drink, avoiding sugary drinks, avoiding highly processed foods (including supermarket-bought and take-away like KFC, Maccas, etc)',
    'food'
  );
  const foodAvailabilityIssuesContainer = await findByLinkIdOrLabel(
    container,
    'Food availability issues'
  );
  await checkRadioOption(
    foodAvailabilityIssuesContainer,
    'Are there any issues about availability of food?',
    'Yes'
  );
  await inputText(foodAvailabilityIssuesContainer, 'Details', 'Food availability concerns');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Physical activity and screen time
  await selectTab(container, 'Physical activity and screen time');
  const physicalActivityConcernsContainer = await findByLinkIdOrLabel(
    container,
    'Physical activity concerns'
  );
  await checkRadioOption(
    physicalActivityConcernsContainer,
    "Is there anything that you are worried about with your child's level of physical activity?",
    'Yes'
  );
  await inputText(physicalActivityConcernsContainer, 'Details', 'Physical activity concerns');
  const screenTimeConcernsContainer = await findByLinkIdOrLabel(container, 'Screen time concerns');
  await checkRadioOption(
    screenTimeConcernsContainer,
    "Is there anything that you are worried about with your child's level of screen time?",
    'Yes'
  );
  await inputText(screenTimeConcernsContainer, 'Details', 'Screen time concerns');
  await inputText(
    container,
    'Document conversation about age-appropriate recommendations re physical activity and screen time',
    'Document conversation about age-appropriate recommendations re physical activity and screen time'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Eye health
  await selectTab(container, 'Eye health');
  const visionConcernsContainer = await findByLinkIdOrLabel(container, 'Vision concerns');
  await checkRadioOption(
    visionConcernsContainer,
    "Is there anything that you are worried about with your child's vision?",
    'Yes'
  );
  await inputText(visionConcernsContainer, 'Details', 'Eye health concerns');
  const visualAcuityContainer = await findByLinkIdOrLabel(container, 'Visual acuity');
  await inputText(visualAcuityContainer, 'Left eye', 'Left eye');
  await inputText(visualAcuityContainer, 'Right eye', 'Right eye');
  const evidenceOfSquintContainer = await findByLinkIdOrLabel(
    container,
    'Evidence of squint or other abnormality'
  );
  await inputText(evidenceOfSquintContainer, 'Left eye', 'Left eye');
  await inputText(evidenceOfSquintContainer, 'Right eye', 'Right eye');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Ear health and hearing
  await selectTab(container, 'Ear health and hearing');
  const childListeningConcernsContainer = await findByLinkIdOrLabel(
    container,
    'Child listening concerns'
  );
  await checkRadioOption(
    childListeningConcernsContainer,
    "Is there anything that you are worried about with your child's listening?",
    'Yes'
  );
  await inputText(childListeningConcernsContainer, 'Details', 'Listening concerns');
  const childLanguageConcernsContainer = await findByLinkIdOrLabel(
    container,
    'Child language concerns'
  );
  await checkRadioOption(
    childLanguageConcernsContainer,
    "Is there anything you are worried about with your child's language/talking?",
    'Yes'
  );
  await inputText(childLanguageConcernsContainer, 'Details', 'Language concerns');
  const childSnoringContainer = await findByLinkIdOrLabel(container, 'Child snoring');
  await checkRadioOption(
    childSnoringContainer,
    'Do you notice snoring/noisy breathing at night/while your child is sleeping?',
    'Yes'
  );
  await inputText(childSnoringContainer, 'Details', 'Snoring concerns');
  await inputDate(container, 'Last hearing test (audiology)', '01/01/2024');
  await checkCheckboxOption(container, 'Left ear', 'Clear and intact');
  await checkCheckboxOption(container, 'Left ear', 'Dull and intact');
  await checkCheckboxOption(container, 'Left ear', 'Discharge');
  await checkCheckboxOption(container, 'Left ear', 'Retracted');
  await checkCheckboxOption(container, 'Left ear', 'Unable to view eardrum');
  await checkCheckboxOption(container, 'Left ear', 'Wax');
  await checkCheckboxOption(container, 'Left ear', 'Grommet in canal');
  await checkCheckboxOption(container, 'Left ear', 'Grommet in eardrum');
  await checkCheckboxOption(container, 'Left ear', 'Perforation');
  await checkCheckboxOption(container, 'Left ear', 'Red/bulging');
  await checkCheckboxOption(container, 'Right ear', 'Clear and intact');
  await checkCheckboxOption(container, 'Right ear', 'Dull and intact');
  await checkCheckboxOption(container, 'Right ear', 'Discharge');
  await checkCheckboxOption(container, 'Right ear', 'Retracted');
  await checkCheckboxOption(container, 'Right ear', 'Unable to view eardrum');
  await checkCheckboxOption(container, 'Right ear', 'Wax');
  await checkCheckboxOption(container, 'Right ear', 'Grommet in canal');
  await checkCheckboxOption(container, 'Right ear', 'Grommet in eardrum');
  await checkCheckboxOption(container, 'Right ear', 'Perforation');
  await checkCheckboxOption(container, 'Right ear', 'Red/bulging');
  const tympanometryContainer = await findByLinkIdOrLabel(container, 'Tympanometry');
  await inputText(tympanometryContainer, 'Left ear', 'Left ear');
  await inputText(tympanometryContainer, 'Right ear', 'Right ear');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Oral and dental health
  await selectTab(container, 'Oral and dental health');
  const dentalConcernsContainer = await findByLinkIdOrLabel(container, 'Dental concerns');
  await checkRadioOption(
    dentalConcernsContainer,
    "Is there anything that you are worried about with your child's teeth or mouth?",
    'Yes'
  );
  await inputText(dentalConcernsContainer, 'Details', 'Oral and dental health concerns');
  await inputDate(container, 'Last dental checkup', '01/01/2024');
  await inputText(container, 'Examination findings', 'Examination findings');
  await inputText(
    container,
    'Document conversation about oral health and care of teeth',
    'Document conversation about oral health and care of teeth'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Skin
  await selectTab(container, 'Skin');
  const skinProblemsContainer = await findByLinkIdOrLabel(container, 'Skin problems');
  await checkRadioOption(skinProblemsContainer, 'Does your child have any skin problems?', 'Yes');
  await inputText(skinProblemsContainer, 'Details', 'Skin problems');
  await inputText(
    container,
    'Document conversation about sun protection as appropriate (ie sunscreen, hats, shade).',
    'Document conversation about sun protection as appropriate (ie sunscreen, hats, shade).'
  );
  await inputText(
    container,
    'General skin examination findings',
    'General skin examination findings'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Immunisation
  await selectTab(container, 'Immunisation');
  const vaccinesPreviouslyGivenContainer = await findByLinkIdOrLabel(
    container,
    'Vaccines previously given'
  );
  await inputText(vaccinesPreviouslyGivenContainer, 'Vaccine', 'Priorix-Tetra');
  await inputText(vaccinesPreviouslyGivenContainer, 'Batch number', '1234567890');
  await inputDate(vaccinesPreviouslyGivenContainer, 'Administration date', '01/01/2024');
  await inputText(vaccinesPreviouslyGivenContainer, 'Comment', 'Comment');
  await checkRadioOption(container, 'Immunisations are up to date?', 'Yes');
  await inputText(container, 'Immunisations due', 'Priorix-Tetra');
  const vaccinesGivenTodayContainer = await findByLinkIdOrLabel(container, 'Vaccines given today');
  await inputText(vaccinesGivenTodayContainer, 'Vaccine', 'Priorix-Tetra');
  await inputText(vaccinesGivenTodayContainer, 'Batch number', '1234567890');
  await inputDate(vaccinesGivenTodayContainer, 'Administration date', '01/01/2024');
  await inputText(vaccinesGivenTodayContainer, 'Comment', 'Comment');
  await checkRadioOption(
    container,
    'Have all vaccines been recorded on the Australian Immunisation Register?',
    'Yes'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Examination
  await selectTab(container, 'Examination');
  await inputDecimal(container, 'obs-height-newresult', 50.5);
  await inputDecimal(container, 'obs-weight-newresult', 10.5);
  await inputDecimal(container, 'obs-headcircumference-newresult', 20.5);
  await inputDecimal(container, 'obs-heartrate-newresult', 80.5);
  await checkRadioOption(container, 'obs-heartrhythm-newresult', 'Regular heart rhythm');
  await inputText(container, 'Cardiac auscultation', 'Normal');
  await inputText(container, 'Abdominal examination', 'Normal');
  await inputText(
    container,
    'Gait examination (musculoskeletal structure, balance, coordination)',
    'Normal'
  );
  await inputText(container, 'Haemoglobin (children at risk of iron deficiency anaemia)', 'Normal');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Health Priorities Summary
  await selectTab(container, 'Health Priorities, Actions And Follow-Up Summary');
  const tabContainer = await getVisibleTab(container);
  expect(await getInputText(tabContainer, 'Current health/patient priorities')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Medical history and current problems')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Regular medications')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Family history')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Social history')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Learning and development')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Healthy eating')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Physical activity and screen time')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Eye health')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Ear health and hearing')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Oral and dental health')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Skin')).toBe('Health priorities, actions and follow-up');
  expect(await getInputText(tabContainer, 'Immunisation')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Examination')).toBe(
    'Health priorities, actions and follow-up'
  );

  //Finalising the health check
  await selectTab(container, 'Finalising the health check');
  await inputText(
    container,
    'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?',
    'Patient priorities and goals'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Healthy eating'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Screen use'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Sun protection'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Environmental exposure to harmful elements (e.g. tobacco smoke)'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Sugary drinks'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Physical activity and exercise'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Parenting advice'
  );
  await inputText(
    container,
    'Care provided as part of the health check (eg immunisations, medication review, investigations requested)',
    'health check'
  );
  await inputText(
    container,
    'Identified needs and plan (including new diagnoses)',
    'identified needs and plan'
  );
  await chooseSelectOption(container, 'Who', 'Mental health');
  await inputDate(container, 'When', '01/01/2024');
  await inputText(container, 'Recall entered', 'Recall entered');
  await inputText(container, 'Parent/patient actions', 'Parent/patient actions');
  await checkRadioOption(
    container,
    'A copy of this health check has been offered - including details of follow-up and future appointments',
    'Yes, copy taken'
  );
}, 3000000);
