"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateInitialExpressions = void 0;
const fhirpath_1 = __importDefault(require("fhirpath"));
const r4_1 = __importDefault(require("fhirpath/fhir-context/r4"));
const unimplementedFunctions = ['join'];
function evaluateInitialExpressions(initialExpressions, context) {
    for (const linkId in initialExpressions) {
        let expression = initialExpressions[linkId].expression;
        if (unimplementedFunctions.some((fn) => initialExpressions[linkId].expression.includes(fn))) {
            expression = removeUnimplementedFunction(unimplementedFunctions, initialExpressions[linkId].expression);
        }
        initialExpressions[linkId].value = fhirpath_1.default.evaluate({}, expression, context, r4_1.default);
    }
    return initialExpressions;
}
exports.evaluateInitialExpressions = evaluateInitialExpressions;
function removeUnimplementedFunction(unimplementedFunctions, expression) {
    for (const fnName of unimplementedFunctions) {
        const foundFnIndex = expression.indexOf('.' + fnName);
        if (foundFnIndex === -1)
            continue;
        const openingBracketIndex = foundFnIndex + fnName.length + 1;
        const closingBracketIndex = findClosingBracketMatchIndex(expression, openingBracketIndex);
        return expression.slice(0, foundFnIndex - 1) + expression.slice(closingBracketIndex);
    }
    return expression;
}
function findClosingBracketMatchIndex(str, startPosition) {
    if (str[startPosition] != '(') {
        throw new Error("No '(' at index " + startPosition);
    }
    let depth = 1;
    for (let i = startPosition + 1; i < str.length; i++) {
        switch (str[i]) {
            case '(':
                depth++;
                break;
            case ')':
                if (--depth == 0) {
                    return i;
                }
                break;
        }
    }
    return -1; // No matching closing parenthesis
}
//# sourceMappingURL=EvaulateInitialExpressions.js.map