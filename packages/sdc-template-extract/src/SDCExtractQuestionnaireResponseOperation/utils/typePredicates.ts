/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Coding, Extension, Parameters, ParametersParameter } from 'fhir/r4';
import type {
  CustomComparisonSourceResponseParameter,
  CustomQuestionnaireParameter,
  QuestionnaireResponseParameter
} from '../interfaces/inputParameters.interface';
import type { CanonicalParameter } from '@aehrc/sdc-populate/src/SDCPopulateQuestionnaireOperation/interfaces/inputParameters.interface';
import type {
  FullUrlExtensionSlice,
  IfMatchExtensionSlice,
  IfModifiedSinceExtensionSlice,
  IfNoneExistExtensionSlice,
  IfNoneMatchExtensionSlice,
  PatchRequestUrlExtensionSlice,
  ResourceIdExtensionSlice,
  TemplateExtensionSlice
} from '../interfaces/templateExtractReference.interface';
import type {
  FhirPatchParameters,
  FhirPatchPart,
  FhirPatchPathPart,
  FhirPatchTypePart
} from '../interfaces/fhirpatch.interface';

export function isQuestionnaireResponseParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireResponseParameter {
  return (
    parameter.name === 'questionnaire-response' &&
    parameter.resource?.resourceType === 'QuestionnaireResponse'
  );
}

export function isCustomQuestionnaireParameter(
  parameter: ParametersParameter
): parameter is CustomQuestionnaireParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}

export function isCustomComparisonSourceResponseParameter(
  parameter: ParametersParameter
): parameter is CustomComparisonSourceResponseParameter {
  return (
    parameter.name === 'comparison-source-response' &&
    parameter.resource?.resourceType === 'QuestionnaireResponse'
  );
}

export function isCanonicalParameter(
  parameter: ParametersParameter
): parameter is CanonicalParameter {
  return parameter.name === 'canonical' && !!parameter.valueCanonical;
}

/* Type predicates for http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract */
export function isTemplateExtensionSlice(
  extension: Extension
): extension is TemplateExtensionSlice {
  return (
    extension.url === 'template' &&
    'valueReference' in extension &&
    !!extension.valueReference?.reference &&
    extension.valueReference.reference.startsWith('#')
  );
}

export function isFullUrlExtensionSlice(extension: Extension): extension is FullUrlExtensionSlice {
  return extension.url === 'fullUrl' && !!extension.valueString;
}

export function isResourceIdExtensionSlice(
  extension: Extension
): extension is ResourceIdExtensionSlice {
  return extension.url === 'resourceId' && !!extension.valueString;
}

export function isIfNoneMatchExtensionSlice(
  extension: Extension
): extension is IfNoneMatchExtensionSlice {
  return extension.url === 'ifNoneMatch' && !!extension.valueString;
}

export function isIfModifiedSinceExtensionSlice(
  extension: Extension
): extension is IfModifiedSinceExtensionSlice {
  return extension.url === 'ifModifiedSince' && !!extension.valueString;
}

export function isIfMatchExtensionSlice(extension: Extension): extension is IfMatchExtensionSlice {
  return extension.url === 'ifMatch' && !!extension.valueString;
}

export function isIfNoneExistExtensionSlice(
  extension: Extension
): extension is IfNoneExistExtensionSlice {
  return extension.url === 'ifNoneExist' && !!extension.valueString;
}

export function isPatchRequestUrlExtensionSlice(
  extension: Extension
): extension is PatchRequestUrlExtensionSlice {
  return (
    extension.url ===
      'https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl' &&
    !!extension.valueString
  );
}

export function valueIsCoding(value: any): value is Coding {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('system' in value || 'code' in value || 'display' in value)
  );
}

export const validFhirPatchTypes = new Set(['add', 'insert', 'delete', 'replace', 'move']);

export function parametersIsFhirPatch(parameters: Parameters): parameters is FhirPatchParameters {
  if (parameters.resourceType !== 'Parameters' || !Array.isArray(parameters.parameter)) {
    return false;
  }

  return parameters.parameter.every((param) => {
    if (param.name !== 'operation') return false;

    // If part exists, it must be an array
    if (!Array.isArray(param.part)) return false;

    // Based on https://build.fhir.org/fhirpath-patch.html, there is no mandatory elements, but we enforce ourselves that a  FHIRPatch needs to have a "type" part with a valid operation type.
    const typePart = param.part.find((p) => p.name === 'type' && typeof p.valueCode === 'string');
    if (!typePart || typeof typePart.valueCode !== 'string') {
      return false;
    }

    return validFhirPatchTypes.has(typePart.valueCode);
  });
}

export function isFhirPatchTypePart(part: FhirPatchPart): part is FhirPatchTypePart {
  return part.name === 'type' && 'valueCode' in part;
}

export function isFhirPatchPathPart(part: FhirPatchPart): part is FhirPatchPathPart {
  return part.name === 'path' && 'valueString' in part;
}

export function isFhirPatchNamePart(part: FhirPatchPart): part is FhirPatchPathPart {
  return part.name === 'name' && 'valueString' in part;
}
