"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdcPopulate = void 0;
const ReadInitialExpressions_1 = require("./ReadInitialExpressions");
const ConstructQuestionnaireResponse_1 = require("./ConstructQuestionnaireResponse");
const EvaulateInitialExpressions_1 = require("./EvaulateInitialExpressions");
const CreateIssues_1 = require("./CreateIssues");
const CreateParameters_1 = require("./CreateParameters");
function sdcPopulate(parameters) {
    var _a, _b, _c;
    const parameterArr = parameters.parameter;
    if (!parameterArr)
        return (0, CreateIssues_1.createInvalidParametersIssue)();
    const questionnaire = (_a = parameterArr.find((parameter) => parameter.name === 'questionnaire')) === null || _a === void 0 ? void 0 : _a.resource;
    const patient = (_b = parameterArr.find((parameter) => parameter.name === 'patient')) === null || _b === void 0 ? void 0 : _b.resource;
    const query = (_c = parameterArr.find((parameter) => parameter.name === 'query')) === null || _c === void 0 ? void 0 : _c.resource;
    if (!questionnaire || !patient || !query)
        return (0, CreateIssues_1.createInvalidParametersIssue)();
    if (questionnaire.resourceType !== 'Questionnaire')
        return (0, CreateIssues_1.createInvalidQuestionnaireIssue)();
    if (patient.resourceType !== 'Patient')
        return (0, CreateIssues_1.createInvalidPatientIssue)();
    if (query.resourceType !== 'Bundle')
        return (0, CreateIssues_1.createInvalidQueryIssue)();
    let initialExpressions = (0, ReadInitialExpressions_1.readInitialExpressions)(questionnaire);
    initialExpressions = (0, EvaulateInitialExpressions_1.evaluateInitialExpressions)(initialExpressions, {
        LaunchPatient: patient,
        PrePopQuery: query
    });
    const questionnaireResponse = (0, ConstructQuestionnaireResponse_1.constructResponse)(questionnaire, initialExpressions);
    return (0, CreateParameters_1.createParameters)({
        name: 'QuestionnaireResponse',
        resource: questionnaireResponse
    });
}
exports.sdcPopulate = sdcPopulate;
//# sourceMappingURL=index.js.map