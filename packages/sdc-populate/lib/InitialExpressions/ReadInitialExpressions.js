"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitialExpression = exports.readInitialExpressions = void 0;
function readInitialExpressions(questionnaire) {
    if (!questionnaire.item)
        return {};
    const initialExpressions = {};
    questionnaire.item.forEach((item) => {
        readQuestionnaireItem(item, initialExpressions);
    });
    return initialExpressions;
}
exports.readInitialExpressions = readInitialExpressions;
function readQuestionnaireItem(item, initialExpressions) {
    const items = item.item;
    if (items && items.length > 0) {
        // iterate through items of item recursively
        items.forEach((item) => {
            readQuestionnaireItem(item, initialExpressions);
        });
        return initialExpressions;
    }
    // Read initial expression of qItem
    const initialExpression = getInitialExpression(item);
    if (initialExpression && initialExpression.expression) {
        initialExpressions[item.linkId] = {
            expression: initialExpression.expression,
            value: undefined
        };
    }
    return initialExpressions;
}
function getInitialExpression(qItem) {
    var _a;
    const itemControl = (_a = qItem.extension) === null || _a === void 0 ? void 0 : _a.find((extension) => extension.url ===
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression');
    if (itemControl) {
        if (itemControl.valueExpression) {
            return itemControl.valueExpression;
        }
    }
    return null;
}
exports.getInitialExpression = getInitialExpression;
//# sourceMappingURL=ReadInitialExpressions.js.map