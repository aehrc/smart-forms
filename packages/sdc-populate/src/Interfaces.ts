import type {
  Bundle,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
  Reference
} from 'fhir/r5';

export interface InitialExpression {
  expression: string;
  value: any[] | undefined;
}

export interface PopulateInputParameters extends Parameters {
  parameter: [QuestionnaireParameter, SubjectParameter, ContextParameter];
}

export interface QuestionnaireParameter extends ParametersParameter {
  name: 'questionnaire';
  resource: Questionnaire;
}

export interface SubjectParameter extends ParametersParameter {
  name: 'subject';
  valueReference: Reference;
}

export interface ContextParameter extends ParametersParameter {
  name: 'context';
  part: [ContextPatientParameter, ContextQueryParameter];
}

export interface ContextPatientParameter extends ParametersParameter {
  name: 'context.patient';
  resource: Patient;
}

export interface ContextQueryParameter extends ParametersParameter {
  name: 'context.query';
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
