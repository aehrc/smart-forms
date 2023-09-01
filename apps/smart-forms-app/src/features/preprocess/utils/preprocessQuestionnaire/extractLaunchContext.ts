import type { Questionnaire } from 'fhir/r4';
import type { LaunchContext } from '../../../prepopulate/types/populate.interface.ts';
import { isLaunchContext } from '../../../prepopulate/utils/getExtensions.ts';

export function extractLaunchContexts(questionnaire: Questionnaire): Record<string, LaunchContext> {
  if (!questionnaire.extension || questionnaire.extension.length === 0) {
    return {};
  }

  const launchContexts: Record<string, LaunchContext> = {};
  for (const ext of questionnaire.extension) {
    if (isLaunchContext(ext)) {
      const launchContextName = ext.extension[0].valueId ?? ext.extension[0].valueCoding?.code;
      if (launchContextName) {
        launchContexts[launchContextName] = ext;
      }
    }
  }

  return launchContexts;
}
