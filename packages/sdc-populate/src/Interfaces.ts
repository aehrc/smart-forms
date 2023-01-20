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
  resource: OperationOutcome;
}

export interface ValueSetPromise {
  promise: Promise<ValueSet>;
  value: string;
}
