"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readQuestionnaire = exports.constructResponse = void 0;
const cleanQuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
};
function constructResponse(questionnaire, initialExpressions) {
    const questionnaireResponse = cleanQuestionnaireResponse;
    if (!questionnaire.item)
        return questionnaireResponse;
    const qForm = questionnaire.item[0];
    let qrForm = {
        linkId: qForm.linkId,
        text: qForm.text
    };
    qrForm = readQuestionnaire(questionnaire, qrForm, initialExpressions);
    questionnaireResponse.questionnaire = 'Questionnaire/' + questionnaire.id;
    questionnaireResponse.item = [qrForm];
    return questionnaireResponse;
}
exports.constructResponse = constructResponse;
function readQuestionnaire(questionnaire, qrForm, initialExpressions) {
    if (!questionnaire.item)
        return qrForm;
    questionnaire.item.forEach((item) => {
        const newQrForm = readQuestionnaireItem(item, qrForm, initialExpressions);
        if (newQrForm) {
            qrForm = Object.assign({}, newQrForm);
        }
    });
    return qrForm;
}
exports.readQuestionnaire = readQuestionnaire;
function readQuestionnaireItem(qItem, qrItem, initialExpressions) {
    const items = qItem.item;
    if (items && items.length > 0) {
        // iterate through items of item recursively
        const qrItems = [];
        items.forEach((item) => {
            const newQrItem = readQuestionnaireItem(item, qrItem, initialExpressions);
            if (newQrItem) {
                qrItems.push(newQrItem);
            }
        });
        return qrItems.length > 0
            ? {
                linkId: qItem.linkId,
                text: qItem.text,
                item: qrItems
            }
            : null;
    }
    if (initialExpressions[qItem.linkId]) {
        const initialValues = initialExpressions[qItem.linkId].value;
        if (initialValues && initialValues.length) {
            return {
                linkId: qItem.linkId,
                text: qItem.text,
                answer: getAnswerValues(initialValues)
            };
        }
    }
    return null;
    // Use this return statement instead to also list items with no answers
    // return {
    //   linkId: qItem.linkId,
    //   text: qItem.text
    // };
}
function getAnswerValues(initialValues) {
    return initialValues.map((value) => {
        if (typeof value === 'boolean') {
            return { valueBoolean: value };
        }
        else if (typeof value === 'object') {
            return { valueCoding: value };
        }
        else if (typeof value === 'number') {
            return Number.isInteger(value) ? { valueInteger: value } : { valueDecimal: value };
        }
        else if (checkIsDate(value)) {
            return { valueDate: value };
        }
        else {
            return { valueString: value };
        }
    });
}
function checkIsDate(value) {
    const hasDateHyphens = value[4] === '-' && value[7] === '-';
    const hasYear = /^-?\d+$/.test(value.slice(0, 4));
    const hasMonth = /^-?\d+$/.test(value.slice(5, 7));
    const hasDate = /^-?\d+$/.test(value.slice(8, 10));
    return hasDateHyphens && hasYear && hasMonth && hasDate && value.length === 10;
}
//# sourceMappingURL=ConstructQuestionnaireResponse.js.map