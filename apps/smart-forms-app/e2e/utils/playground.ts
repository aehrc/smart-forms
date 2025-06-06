import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { PLAYWRIGHT_APP_URL, PLAYWRIGHT_FORMS_SERVER_URL } from '../globals';

export async function goToPlayground(page: Page) {
  // Go to /playground route
  const fetchQsPromise = page.waitForResponse(
    (response) =>
      response.url().startsWith(`${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire`) &&
      response.url().includes('_sort=-date') &&
      response.request().method() === 'GET'
  );

  const launchUrl = `${PLAYWRIGHT_APP_URL}/playground`;
  console.log('Playwright navigating to: ', launchUrl);
  await page.goto(launchUrl);

  const fetchQResponse = await fetchQsPromise;
  expect(fetchQResponse.status()).toBe(200);
}

export interface QuestionnaireDetails {
  pickerInput: string;
  questionnaireId: string;
  questionnaireUrl: string;
}

export async function selectQuestionnaireInPlayground(
  page: Page,
  questionnaireDetails: QuestionnaireDetails
) {
  const { pickerInput, questionnaireId, questionnaireUrl } = questionnaireDetails;

  // Select questionnaire in questionnaire picker
  await page.getByTestId('questionnaire-picker-playground').locator('input').fill(pickerInput);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(questionnaireId);
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    questionnaireUrl
  );

  // Build questionnaire
  await page.getByTestId('picker-build-form-button-playground').click();
  await expect(page.getByText('"resourceType": "Questionnaire"')).toBeInViewport();
  await expect(page.getByText(`"id": "${questionnaireId}"`)).toBeInViewport();
}
