import { QuestionnaireItem } from 'fhir/r4';
import { getTerminologyServerUrl } from './valueSet';
import { TERMINOLOGY_SERVER_URL } from '../globals';

/**
 * Returns the terminology server URL to use for a given Questionnaire item.
 *
 * Priority:
 * 1. Use sdc-questionnaire-preferredTerminologyServer extension.
 * 2. Use StructureDefinition/terminology-server extension.
 * 3. Use renderer default server url set at the buildForm() stage.
 * 4. Use global fallback URL from @aehrc/smart-forms-renderer - https://tx.ontoserver.csiro.au/fhir/
 */
export function getItemTerminologyServerToUse(
  qItem: QuestionnaireItem,
  itemPreferredTerminologyServers: Record<string, string>,
  rendererDefaultTerminologyServerUrl: string
): string {
  // Item has sdc-questionnaire-preferredTerminologyServer extension set, use it
  const preferredTerminologyServerUrl = itemPreferredTerminologyServers[qItem.linkId];
  if (preferredTerminologyServerUrl) {
    return preferredTerminologyServerUrl;
  }

  // Item has backwards compatible StructureDefinition/terminology-server extension set, use it
  const terminologyServerUrlBackwardsCompatible = getTerminologyServerUrl(qItem);
  if (terminologyServerUrlBackwardsCompatible) {
    return terminologyServerUrlBackwardsCompatible;
  }

  // A default terminology server is set during renderer initialisation, use it
  if (rendererDefaultTerminologyServerUrl) {
    return rendererDefaultTerminologyServerUrl;
  }

  // Fallback to use default terminology server from env - https://tx.ontoserver.csiro.au/fhir/
  return TERMINOLOGY_SERVER_URL;
}
