import { QuestionnaireResponse } from 'fhir/r4';

type RendererOperation = 'preview' | 'save-progress' | 'save-final' | 'repopulate';

// Determine allowed operations based on QuestionnaireResponse status
export function getAllowedRendererOperations(status: QuestionnaireResponse['status']) {
  const actions = new Set<RendererOperation>();

  // Always available
  actions.add('preview');

  // Terminal states (not supported currently)
  if (status === 'entered-in-error' || status === 'stopped') {
    return actions;
  }

  // In-progress only
  if (status === 'in-progress') {
    actions.add('save-progress');
  }

  // Save-as-final (incl amendments)
  actions.add('save-final');

  // Other helpers
  actions.add('repopulate');

  return actions;
}
