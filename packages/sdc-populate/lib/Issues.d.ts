import { ParametersParameter } from 'fhir/r5';
export declare function createInvalidParametersIssue(): {
    resourceType: string;
    parameter: ParametersParameter[];
};
export declare function createInvalidQuestionnaireIssue(): {
    resourceType: string;
    parameter: ParametersParameter[];
};
export declare function createInvalidPatientIssue(): {
    resourceType: string;
    parameter: ParametersParameter[];
};
export declare function createInvalidQueryIssue(): {
    resourceType: string;
    parameter: ParametersParameter[];
};
