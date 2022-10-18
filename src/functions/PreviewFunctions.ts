import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

export function qrToHTML(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
) {
  if (!questionnaireResponse.item) return '';

  const title = `<div style="font-size:40px; margin-bottom: 50px"><b>${questionnaire.title}</b></div>`;
  const qrForm = qrFormToHTML(questionnaireResponse.item[0]);

  return `<div>${title + qrForm}</div>`;
}

export function qrFormToHTML(questionnaireResponseForm: QuestionnaireResponseItem) {
  if (!questionnaireResponseForm.item) return null;

  let formInHTML = '';
  questionnaireResponseForm.item.forEach((item) => {
    formInHTML = readQuestionnaireResponseItem(item, formInHTML, 0);
  });

  return formInHTML;
}

function readQuestionnaireResponseItem(
  item: QuestionnaireResponseItem,
  formInHTML: string,
  nestedLevel: number
) {
  const items = item.item;
  if (items && items.length > 0) {
    formInHTML += qrGroupDivStartRenderSwitcher(item, nestedLevel);
    items.forEach((item) => {
      formInHTML = readQuestionnaireResponseItem(item, formInHTML, nestedLevel + 1);
    });
    formInHTML += qrGroupDivEndRenderSwitcher(item, nestedLevel);

    return formInHTML;
  }
  formInHTML += qrItemDivRenderSwitcher(item, nestedLevel);

  return formInHTML;
}

function qrItemDivRenderSwitcher(item: QuestionnaireResponseItem, nestedLevel: number) {
  let qrItemAnswer = '';
  item.answer?.forEach((answer) => {
    const answerValueInString = qrItemAnswerValueTypeSwitcher(answer);
    qrItemAnswer += `<div>${answerValueInString}</div>`;
  });

  const qrItemRender = `<div style="flex: 50%;">${item.text}</div><div style="flex: 50%;" >${qrItemAnswer}</div>`;

  switch (nestedLevel) {
    case 0:
      return `<div style="margin-bottom: 40px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
    default:
      return `<div style="margin-bottom: 20px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
  }
}

function qrGroupDivStartRenderSwitcher(item: QuestionnaireResponseItem, nestedLevel: number) {
  const text = item.text;

  switch (nestedLevel) {
    case 0:
      return `<div style="font-size: 26px; font-weight: bold">${text}</div><hr style="margin-bottom: 15px">`;
    default:
      return `<div style="font-size: 18px; font-weight: bold; margin: 20px 0 15px">${text}</div>`;
  }
}

function qrGroupDivEndRenderSwitcher(item: QuestionnaireResponseItem, nestedLevel: number) {
  switch (nestedLevel) {
    case 0:
      return `<div style="margin-bottom: 80px"></div>`;
    default:
      return `<div style="margin-bottom: 40px"/>`;
  }
}

function qrItemAnswerValueTypeSwitcher(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) return `${answer.valueBoolean}`;
  else if (answer.valueDecimal) return `${answer.valueDecimal}`;
  else if (answer.valueInteger) return `${answer.valueInteger}`;
  else if (answer.valueDate) return `${answer.valueDate}`;
  else if (answer.valueDateTime) return `${answer.valueDateTime}`;
  else if (answer.valueTime) return `${answer.valueTime}`;
  else if (answer.valueString) return `${answer.valueString}`;
  else if (answer.valueCoding?.code) return `${answer.valueCoding?.code}`;
  else if (answer.valueQuantity) return `${answer.valueQuantity}`;
  return '';
}
