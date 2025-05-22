/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Coding, Extension, ParametersParameter } from 'fhir/r4';
import type {
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
  ResourceIdExtensionSlice,
  TemplateExtensionSlice
} from '../interfaces/templateExtractReference.interface';

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

export function valueIsCoding(value: any): value is Coding {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('system' in value || 'code' in value || 'display' in value)
  );
}
