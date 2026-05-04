import type { BuildFormParams } from '@aehrc/smart-forms-renderer';
import { buildForm, destroyForm, rendererConfigStore } from '@aehrc/smart-forms-renderer';

export async function resetAndBuildForm(params: BuildFormParams, hideQuestionnaireTitle = false) {
  // Destroy previous questionnaire state before building a new one
  destroyForm();

  // Build new questionnaire state
  await buildForm(params);

  rendererConfigStore.getState().setRendererConfig({ hideQuestionnaireTitle });
}
