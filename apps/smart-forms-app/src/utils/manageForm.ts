import type { BuildFormParams } from '@aehrc/smart-forms-renderer';
import { buildForm, destroyForm, rendererConfigStore } from '@aehrc/smart-forms-renderer';

export async function resetAndBuildForm(params: BuildFormParams) {
  // Destroy previous questionnaire state before building a new one
  destroyForm();

  // Build new questionnaire state
  await buildForm(params);

  // The smart-forms-app renders its own title in the app header, so suppress
  // the renderer's built-in title to avoid displaying it twice.
  rendererConfigStore.getState().setRendererConfig({ hideQuestionnaireTitle: true });
}
