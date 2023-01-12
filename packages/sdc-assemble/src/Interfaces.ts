import type {
  Extension,
  OperationOutcome,
  Parameters,
  ParametersParameter,
  Questionnaire
} from 'fhir/r5';

export interface AssembleInputParameters extends Parameters {
  parameter: [QuestionnaireParameter];
}

export interface QuestionnaireParameter extends ParametersParameter {
  name: 'questionnaire';
  resource: Questionnaire;
}

export interface AssembleOutputParameters extends Parameters {
  parameter: [ReturnParameter];
}

export interface ReturnParameter extends ParametersParameter {
  name: 'return';
  resource: Questionnaire;
}

export interface AssembleOutputParametersWithIssues extends Parameters {
  parameter: [OutcomeParameter];
}

export interface OutcomeParameter extends ParametersParameter {
  name: 'outcome';
  resource: OperationOutcome;
}

export interface PropagatedExtensions {
  rootLevelExtensions: Extension[];
  itemLevelExtensions: (Extension[] | null)[];
}
