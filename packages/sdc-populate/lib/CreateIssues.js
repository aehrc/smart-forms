"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvalidQueryIssue = exports.createInvalidPatientIssue = exports.createInvalidQuestionnaireIssue = exports.createInvalidParametersIssue = void 0;
const CreateParameters_1 = require("./CreateParameters");
function createInvalidParametersIssue() {
    return (0, CreateParameters_1.createParameters)({
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
    return (0, CreateParameters_1.createParameters)({
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
    return (0, CreateParameters_1.createParameters)({
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
    return (0, CreateParameters_1.createParameters)({
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
//# sourceMappingURL=CreateIssues.js.map