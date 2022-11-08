import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

const cleanQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export function constructResponse(
  questionnaire: Questionnaire,
  initialExpressions: Record<string, InitialExpression>
): QuestionnaireResponse {
  const questionnaireResponse = cleanQuestionnaireResponse;

  if (!questionnaire.item) return questionnaireResponse;
  const qForm = questionnaire.item[0];

  let qrForm: QuestionnaireResponseItem = {
    linkId: qForm.linkId,
    text: qForm.text
  };
  qrForm = readQuestionnaire(questionnaire, qrForm, initialExpressions);

  questionnaireResponse.questionnaire = 'Questionnaire/' + questionnaire.id;
  questionnaireResponse.item = [qrForm]

  return questionnaireResponse;
}

export function readQuestionnaire(
  questionnaire: Questionnaire,
  qrForm: QuestionnaireResponseItem,
  initialExpressions: Record<string, InitialExpression>
): QuestionnaireResponseItem {
  if (!questionnaire.item) return qrForm;

  questionnaire.item.forEach((item) => {
    const newQrForm = readQuestionnaireItem(item, qrForm, initialExpressions);
    if (newQrForm) {
      qrForm = {...newQrForm};
    }
  });
  return qrForm;
}

function readQuestionnaireItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem,
  initialExpressions: Record<string, InitialExpression>
): QuestionnaireResponseItem | null {
  const items = qItem.item;

  if (items && items.length > 0) {
    // iterate through items of item recursively
    const qrItems: QuestionnaireResponseItem[] = [];

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
  return {
    linkId: qItem.linkId,
    text: qItem.text
  };
}

function getAnswerValues(initialValues: any[]) {
  return initialValues.map((value: any): QuestionnaireResponseItemAnswer => {
    console.log(value)
    if (typeof value === 'boolean') {
      return {valueBoolean: value};
    } else if (typeof value === 'object') {
      return {valueCoding: value};
    } else if (typeof value === 'number') {
      return Number.isInteger(value) ? {valueInteger: value} : {valueDecimal: value};
    } else if (checkIsDate(value)) {
      return {valueDate: value};
    } else {
      return {valueString: value};
    }
  });
}

function checkIsDate(value: any) {
  const hasDateHyphens = value[4] === '-' && value[7] === '-';
  const hasYear = /^-?\d+$/.test(value.slice(0, 4));
  const hasMonth = /^-?\d+$/.test(value.slice(5, 7));
  const hasDate = /^-?\d+$/.test(value.slice(8, 10));

  return hasDateHyphens && hasYear && hasMonth && hasDate && value.length === 10;
}
