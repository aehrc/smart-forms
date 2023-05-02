/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
  Bundle,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
  Reference,
  ValueSet
} from 'fhir/r5';

export interface InitialExpression {
  expression: string;
  value: any[] | undefined;
}

export interface ItemPopulationContext {
  name: string;
  expression: string;
}

export interface PopulationExpressions {
  initialExpressions: Record<string, InitialExpression>;
  itemPopulationContexts: ItemPopulationContext[];
}

export interface ValueSetPromise {
  promise: Promise<ValueSet>;
  valueSet?: ValueSet;
}

export interface PopulateInputParameters extends Parameters {
  parameter: PopulateInputParametersSingleBundle | PopulateInputParametersDoubleBundle;
}

export type PopulateInputParametersSingleBundle = [
  QuestionnaireParameter,
  SubjectParameter,
  LaunchPatientContextParameter,
  ResourceBundleContextParameter
];

export type PopulateInputParametersDoubleBundle = [
  QuestionnaireParameter,
  SubjectParameter,
  LaunchPatientContextParameter,
  PrePopQueryContextParameter,
  VariablesContextParameter
];

export interface QuestionnaireParameter extends ParametersParameter {
  name: 'questionnaire';
  resource: Questionnaire;
}

export interface SubjectParameter extends ParametersParameter {
  name: 'subject';
  valueReference: Reference;
}

export interface LaunchPatientContextParameter extends ParametersParameter {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: 'LaunchPatient';
    },
    {
      name: 'content';
      resource: Patient;
    }
  ];
}

export type ResourceBundleContextParameter =
  | PrePopQueryContextParameter
  | VariablesContextParameter;

export interface PrePopQueryContextParameter extends ParametersParameter {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: 'PrePopQuery';
    },
    {
      name: 'content';
      resource: Bundle;
    }
  ];
}

export interface VariablesContextParameter extends ParametersParameter {
  name: 'context';
  part: [
    {
      name: 'name';
      valueString: 'Variables';
    },
    {
      name: 'content';
      resource: Bundle;
    }
  ];
}

export interface LaunchPatientName extends ParametersParameter {
  name: 'name';
  valueString: 'LaunchPatient';
}

export interface LaunchPatientContent extends ParametersParameter {
  name: 'content';
  resource: Patient;
}

export interface PrePopQueryName extends ParametersParameter {
  name: 'name';
  valueString: 'PrePopQuery';
}

export interface PrePopQueryContent extends ParametersParameter {
  name: 'content';
  resource: Bundle;
}

export interface PopulateOutputParameters extends Parameters {
  parameter: [ResponseParameter];
}

export interface PopulateOutputParametersWithIssues extends Parameters {
  parameter: [ResponseParameter, IssuesParameter];
}

export interface ResponseParameter extends ParametersParameter {
  name: 'response';
  resource: QuestionnaireResponse;
}

export interface IssuesParameter extends ParametersParameter {
  name: 'issues';
  part: IssueParameter[];
}

interface IssueParameter extends ParametersParameter {
  name: 'issue';
  resource: OperationOutcome;
}
