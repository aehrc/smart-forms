"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvalidQueryIssue = exports.createInvalidPatientIssue = exports.createInvalidQuestionnaireIssue = exports.createInvalidParametersIssue = void 0;
function createParameters(parameter) {
    return {
        resourceType: 'Parameters',
        parameter: [parameter]
    };
}
function createInvalidParametersIssue() {
    return createParameters({
        name: 'issues',
        resource: {
            resourceType: 'OperationOutcome',
            issue: [
                {
                    code: 'invalid',
                    severity: 'fatal',
                    details: {
                        text: 'Parameters are invalid.'
                    }
                }
            ]
        }
    });
}
exports.createInvalidParametersIssue = createInvalidParametersIssue;
function createInvalidQuestionnaireIssue() {
    return createParameters({
        name: 'issues',
        resource: {
            resourceType: 'OperationOutcome',
            issue: [
                {
                    code: 'invalid',
                    severity: 'fatal',
                    details: {
                        text: 'Questionnaire is invalid.'
                    }
                }
            ]
        }
    });
}
exports.createInvalidQuestionnaireIssue = createInvalidQuestionnaireIssue;
function createInvalidPatientIssue() {
    return createParameters({
        name: 'issues',
        resource: {
            resourceType: 'OperationOutcome',
            issue: [
                {
                    code: 'invalid',
                    severity: 'fatal',
                    details: {
                        text: 'Patient is invalid.'
                    }
                }
            ]
        }
    });
}
exports.createInvalidPatientIssue = createInvalidPatientIssue;
function createInvalidQueryIssue() {
    return createParameters({
        name: 'issues',
        resource: {
            resourceType: 'OperationOutcome',
            issue: [
                {
                    code: 'invalid',
                    severity: 'fatal',
                    details: {
                        text: 'Query is invalid.'
                    }
                }
            ]
        }
    });
}
exports.createInvalidQueryIssue = createInvalidQueryIssue;
//# sourceMappingURL=Issues.js.map