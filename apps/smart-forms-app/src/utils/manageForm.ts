import type { BuildFormParams } from '@aehrc/smart-forms-renderer';
import { buildForm, destroyForm } from '@aehrc/smart-forms-renderer';

export async function resetAndBuildForm(params: BuildFormParams) {
  // Destroy previous questionnaire state before building a new one
  destroyForm();

  // Build new questionnaire state
  await buildForm(params);
}
