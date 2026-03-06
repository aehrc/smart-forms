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

test('Completed questionnaire for 13 years', async () => {
  const { container } = render(<AboriginalForm />);
  await waitFor(() => expect(container.innerHTML).toContain('Patient Details'));
  // Patient details
  await inputText(container, 'Name', 'John');
  await inputText(container, 'Preferred name', 'John');
  await chooseSelectOption(container, 'Preferred pronouns', 'he/him/his/his/himself');
  await chooseSelectOption(container, 'Gender identity', 'Identifies as female gender');
  await chooseSelectOption(container, 'Sex assigned at birth', 'Male');
  await inputDate(container, 'Date of birth', '01/01/2024');
  await inputInteger(container, 'Age', 13);
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
  await inputText(container, 'Street address', '123 Main St');
  await inputText(container, 'City', 'Sydney');
  await chooseSelectOption(container, 'State', 'New South Wales');
  await inputText(container, 'Postcode', '2000');
  await inputText(container, 'Home phone', '02 9374 1234');
  await inputText(container, 'Mobile phone', '0412 345 678');
  const emergencyContactContainer = await findByLinkIdOrLabel(container, 'Emergency contact');
  await inputText(emergencyContactContainer, 'Name', 'Jane');
  await inputText(emergencyContactContainer, 'Relationship to patient', 'Mother');
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
  await checkRadioOption(container, 'Do you have children?', 'Yes');
  await inputInteger(container, 'Number of children', 1);
  await inputInteger(container, 'Number of children in your care', 1);
  const someonesCarerContainer = await findByLinkIdOrLabel(container, "Someone's carer");
  await checkRadioOption(
    someonesCarerContainer,
    'Are you responsible for caring for someone else?',
    'Yes'
  );
  await inputText(someonesCarerContainer, 'Details', 'Mother');
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
    'Consent given after discussion of process and benefits of a health check',
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
  await inputText(container, 'Is there anything you are worried about?', 'Worried things');
  await inputText(
    container,
    'Do you have any specific health goals? Is there anything in particular about your health and wellbeing that you would like to improve?',
    'Health goals'
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
    'Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
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
    'Provide relevant family history information (including diabetes, heart disease, cancer, mental health)',
    'Provide relevant family history information'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Social and emotional wellbeing
  await selectTab(container, 'Social and emotional wellbeing');
  const stressfulLifeEvents = await findByLinkIdOrLabel(container,'Stressful life events')
  await checkRadioOption(
    stressfulLifeEvents,
    'Have there been any particular stressful life events that are impacting on you/your health lately?',
    'Yes'
  );
  await inputText(stressfulLifeEvents, 'Details', 'School stress');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Home and family
  await selectTab(container, 'Home and family');
  await inputText(container, 'Who do you live with?', 'Who do you live with?');
  const housingStabilityContainer = await findByLinkIdOrLabel(container, 'Housing stability');
  await checkRadioOption(housingStabilityContainer, 'Do you have stable housing?', 'No');
  await inputText(housingStabilityContainer, 'Details', 'Stable housing details');
  const homeSafetyContainer = await findByLinkIdOrLabel(container, 'Home safety');
  await checkRadioOption(homeSafetyContainer, 'Do you feel safe at home?', 'No');
  await inputText(homeSafetyContainer, 'Details', 'Safe at home details');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Learning and work
  await selectTab(container, 'Learning and work');
  const learningContainer = await findByLinkIdOrLabel(container, 'Learning');
  await checkRadioOption(learningContainer, 'Are you studying at school/uni?', 'Yes');
  await inputText(learningContainer, 'Details', 'Studying at school/uni details');
  const workContainer = await findByLinkIdOrLabel(container, 'Work');
  await checkRadioOption(workContainer, 'Are you working?', 'Yes');
  await inputText(
    workContainer,
    'Details (occupation including occupational hazards, study, training, disability, etc)',
    'Working details'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Mood
  await selectTab(container, 'Mood');
  await inputText(container, 'How have you been feeling lately?', 'Normal');
  await inputText(
    container,
    'If indicated, ask about depression (consider screening tools, eg aPHQ-9, K5 or K10) and complete risk assessment',
    'Depression and other mental health concerns'
  );
  await inputText(
    container,
    'Explore other mental health concerns as indicated',
    'Other mental health concerns'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Healthy eating
  await selectTab(container, 'Healthy eating');
  const dietOrWeightConcernsContainer = await findByLinkIdOrLabel(
    container,
    'Diet or weight concerns'
  );
  await checkRadioOption(
    dietOrWeightConcernsContainer,
    'Do you have any worries about your diet or weight?',
    'Yes'
  );
  await inputText(dietOrWeightConcernsContainer, 'Details', 'Diet or weight concerns');
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
    'Physical activity or screen time concerns'
  );
  await checkRadioOption(
    physicalActivityConcernsContainer,
    'Do you have any worries about physical activity or screen time?',
    'Yes'
  );
  await inputText(physicalActivityConcernsContainer, 'Details', 'Physical activity or screen time concerns');
  await inputText(
    container,
    'Document conversation about age-appropriate recommendations re physical activity and screen time',
    'Physical activity and screen time'
  );
  await inputText(
    container,
    'Document conversation about social connection, which could include questions about sports/hobbies/clubs/other activities',
    'Social connection'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Substance use, including tobacco
  await selectTab(container, 'Substance use, including tobacco');
  await chooseSelectOption(container, 'Smoking status', 'Current smoker');
  await inputText(container, 'How many?', '1');
  await inputText(container, 'How long as a smoker?', '1');
  await inputDate(container, 'New date', '01/01/2024');
  await inputText(
    container,
    'Quantity and frequency of: alcohol; caffeine (coffee, soft drinks, iced coffee); cannabis/yarndi/gunja; other substance use: IVDU, methamphetamine, opiates, solvents, other',
    '10 drinks per week'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Gambling
  await selectTab(container, 'Gambling');
  const gamblingIssuesContainer = await findByLinkIdOrLabel(container, 'Gambling issues');
  await checkRadioOption(
    gamblingIssuesContainer,
    'Have you or someone close to you ever had issues with gambling?',
    'Yes'
  );
  await inputText(gamblingIssuesContainer, 'Details', 'Gambling concerns');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Sexual health
  await selectTab(
    container,
    'Sexual health (sexual activity, contraception, safe sex/protection, sexual orientation, gender identity, pressure to have sex, STIs)'
  );
  const sexualHealthContainer = await findByLinkIdOrLabel(container, 'Puberty and sexual health concerns');
  await checkRadioOption(
    sexualHealthContainer,
    'Is there anything that you are worried about in relation to puberty/your sexual health?',
    'Yes'
  );
  await inputText(sexualHealthContainer, 'Details', 'Puberty/sexual health concerns');
  await inputText(
    container,
    'Consider discussing as relevant to age/sex/gender: menstruation (including risk of anaemia); current sexual activity; contraception; safe sex practice (eg use of condoms); sexually transmitted infection symptoms and screening; blood-borne virus screening',
    'current sexual activity;'
  );
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Eye health
  await selectTab(container, 'Eye health');
  const visionConcernsContainer = await findByLinkIdOrLabel(container, 'Vision concerns')
  await checkRadioOption(
    visionConcernsContainer,
    'Is there anything that you are worried about with your vision?',
    'Yes'
  );
  await inputText(visionConcernsContainer, 'Details', 'Eye health concerns');
  const visualAcuityContainer = await findByLinkIdOrLabel(container, 'Visual acuity')
  await inputText(visualAcuityContainer, 'Left eye', 'Left eye');
  await inputText(visualAcuityContainer, 'Right eye', 'Right eye');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Ear health and hearing
  await selectTab(container, 'Ear health and hearing');
  const hearingConcernsContainer = await findByLinkIdOrLabel(container, 'Hearing concerns')
  await checkRadioOption(
    hearingConcernsContainer,
    'Is there anything that you are worried about with your hearing?',
    'Yes'
  );
  await inputText(hearingConcernsContainer, 'Details', 'Hearing concerns');
  await inputDate(container, 'Last hearing test (audiology)', '01/01/2024');
  await checkCheckboxOption(container, 'Left ear', 'Clear and intact');
  await checkCheckboxOption(container, 'Left ear', 'Dull and intact');
  await checkCheckboxOption(container, 'Left ear', 'Discharge');
  await checkCheckboxOption(container, 'Left ear', 'Retracted');
  await checkCheckboxOption(container, 'Left ear', 'Unable to view eardrum');
  await checkCheckboxOption(container, 'Left ear', 'Wax');
  await checkCheckboxOption(container, 'Right ear', 'Clear and intact');
  await checkCheckboxOption(container, 'Right ear', 'Dull and intact');
  await checkCheckboxOption(container, 'Right ear', 'Discharge');
  await checkCheckboxOption(container, 'Right ear', 'Retracted');
  await checkCheckboxOption(container, 'Right ear', 'Unable to view eardrum');
  await checkCheckboxOption(container, 'Right ear', 'Wax');
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Oral and dental health
  await selectTab(container, 'Oral and dental health');
  const dentalConcernsContainer = await findByLinkIdOrLabel(container, 'Dental concerns')
  await checkRadioOption(
    dentalConcernsContainer,
    'Is there anything that you are worried about with your teeth?',
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
  const skinProblemsContainer = await findByLinkIdOrLabel(container,'Skin problems')
  await checkRadioOption(
    skinProblemsContainer,
    'Is there anything that you are worried about with your skin?',
    'Yes'
  );
  await inputText(skinProblemsContainer, 'Details', 'Skin concerns');
  await checkRadioOption(container, 'Do you use sun protection?', 'Yes');
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
  await inputDecimal(container, 'obs-heartrate-newresult', 80.5);
  await checkRadioOption(container, 'obs-heartrhythm-newresult', 'Regular heart rhythm');
  await inputInteger(container, 'Systolic', 80);
  await inputInteger(container, 'Diastolic', 60);
  await inputText(
    container,
    'Health priorities, actions and follow-up',
    'Health priorities, actions and follow-up'
  );

  //Investigations
  await selectTab(container, 'Investigations');
  await inputText(
    container,
    'Chlamydia, gonorrhoea: <=30, first void urine (male and female) and/or endocervical swab or self-administered vaginal swab (female) or throat and anal swab (men who have sex with men [MSM])',
    'Chlamydia, gonorrhoea'
  );
  await inputText(container, 'Syphilis (endemic areas, MSM, others at high risk)', 'Syphilis');
  await inputText(
    container,
    'Trichomoniasis (<=30, male and female, remote areas and other endemic areas, first void urine and/or endocervical swab or self-administered vaginal swab)',
    'Trichomoniasis'
  );
  await inputText(
    container,
    'Blood-borne virus screening: HBV if status not known/not recorded on file, HCV if risk factors, HIV if risk factors',
    'Viral screening'
  );
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
  expect(await getInputText(tabContainer, 'Social and emotional wellbeing')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Home and family')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Learning and work')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Mood')).toBe('Health priorities, actions and follow-up');
  expect(await getInputText(tabContainer, 'Healthy eating')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Physical activity and screen time')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Substance use, including tobacco')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Gambling')).toBe(
    'Health priorities, actions and follow-up'
  );
  expect(await getInputText(tabContainer, 'Sexual health')).toBe(
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
    'Patient priorities and goals: What does the patient say are the important things that have come out of this health check?',
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
    'Physical activity and exercise'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Mental health and wellbeing'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Safety/risky behaviours'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Smoking cessation'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Substance use/harm minimisation'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Safe sex/contraception'
  );
  await checkCheckboxOption(
    container,
    'Brief intervention: advice and information provided during health check',
    'Care of teeth and gums'
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
  await chooseSelectOption(container, 'Who', 'Dentist');
  await inputDate(container, 'When', '01/01/2024');
  await inputText(container, 'Recall entered', 'Recall entered');
  await inputText(container, 'Patient actions', 'Patient actions');
  await checkRadioOption(
    container,
    'A copy of this health check has been offered - including details of follow-up and future appointments',
    'Yes, copy taken'
  );
}, 3000000);
