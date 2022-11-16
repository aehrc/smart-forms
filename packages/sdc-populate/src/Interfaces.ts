import {
  Bundle,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Patient,
  QuestionnaireResponse,
  Reference
} from "fhir/r5";

interface InitialExpression {
  expression: string;
  value: any[] | undefined;
}

export interface PopulateInputParameters extends Parameters {
  parameter: [PatientParameter, QueryParameter]
}

export interface PatientParameter extends ParametersParameter {
  name: "patient",
  resource: Patient
}

export interface QueryParameter extends ParametersParameter {
  name: "query",
  resource: Bundle;
}

export interface PopulateOutputParameters extends Parameters {
  parameter: [ResponseParameter, IssuesParameter]
}

interface ResponseParameter extends ParametersParameter {
  name: "response",
  resource: QuestionnaireResponse;
}

interface IssuesParameter extends ParametersParameter {
  name: "issues",
  resource: OperationOutcome;
}

