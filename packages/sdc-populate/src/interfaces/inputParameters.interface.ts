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

import type {
  FhirResource,
  Identifier,
  Parameters,
  ParametersParameter,
  Questionnaire,
  Reference
} from 'fhir/r4';

/**
 * Input parameters for the $populate operation
 * @see {@link http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate}
 *
 * @author Sean Fong
 */
export interface InputParameters extends Parameters {
  parameter: InputParamsArray;
}

export type InputParamsArray =
  | [
      QuestionnaireDataParameter,
      CanonicalParameter,
      SubjectParameter,
      ...ContextParameter[],
      LocalParameter
    ] // with both canonical and local
  | [QuestionnaireDataParameter, CanonicalParameter, SubjectParameter, ...ContextParameter[]] // with canonical, without local
  | [QuestionnaireDataParameter, SubjectParameter, ...ContextParameter[], LocalParameter] // with local, without canonical
  | [QuestionnaireDataParameter, SubjectParameter, ...ContextParameter[]]; // without both local and canonical

// Only can have one of IdentifierParameter, QuestionnaireParameter and QuestionnaireRefParameter
export type QuestionnaireDataParameter =
  | IdentifierParameter
  | QuestionnaireParameter
  | QuestionnaireRefParameter;

// QuestionnaireData parameters
export interface IdentifierParameter extends ParametersParameter {
  name: 'identifier';
  valueIdentifier: Identifier;
}

export interface QuestionnaireParameter extends ParametersParameter {
  name: 'questionnaire';
  resource: Questionnaire;
}

export interface QuestionnaireRefParameter extends ParametersParameter {
  name: 'questionnaireRef';
  valueReference: Reference;
}

// Other parameters
export interface CanonicalParameter extends ParametersParameter {
  name: 'canonical';
  valueCanonical: string;
}

export interface SubjectParameter extends ParametersParameter {
  name: 'subject';
  valueReference: Reference;
}

export interface ContextParameter extends ParametersParameter {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: string;
    },
    ContextContentParameter
  ];
}

type ContextContentParameter = ReferenceContextContent | ResourceContextContent;

interface ResourceContextContent extends ParametersParameter {
  name: 'content';
  resource: FhirResource;
}

interface ReferenceContextContent extends ParametersParameter {
  name: 'content';
  valueReference: Reference;
}

export interface ResourceContext {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: string;
    },
    ResourceContextContent
  ];
}

export interface ReferenceContext {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: string;
    },
    ReferenceContextContent
  ];
}

export interface LocalParameter extends ParametersParameter {
  name: 'local';
  valueBoolean: boolean;
}
