import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
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

  questionnaireResponse.questionnaire = 'Questionnaire/' + questionnaire.id;

  let qrForm: QuestionnaireResponseItem = {
    linkId: qForm.linkId,
    text: qForm.text
  };

  qrForm = readQuestionnaire(questionnaire, qrForm, initialExpressions);
  console.log(qrForm);

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
    const initialAnswer = initialExpressions[qItem.linkId].value;

    if (initialAnswer && initialAnswer.length) {
      return {
        linkId: qItem.linkId,
        text: qItem.text,
        answer: initialExpressions[qItem.linkId].value
      };
    }
  }

  return null;
}
