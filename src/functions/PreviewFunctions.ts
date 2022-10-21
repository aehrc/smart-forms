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

  const title = `<div style="font-size:40px;"><b>${questionnaire.title}</b></div><hr style="margin: 20px 0 40px"/>`;
  const qrForm = qrFormToHTML(questionnaireResponse.item[0]);

  return `<div>${title + qrForm}</div>`;
}

export function qrFormToHTML(questionnaireResponseForm: QuestionnaireResponseItem) {
  if (!questionnaireResponseForm.item) return null;

  let formInHTML = '';
  questionnaireResponseForm.item.forEach((item) => {
    formInHTML = readQuestionnaireResponseItem(item, formInHTML, 0, 0);
  });

  return formInHTML;
}

function readQuestionnaireResponseItem(
  item: QuestionnaireResponseItem,
  formInHTML: string,
  nestedLevel: number,
  index: number
) {
  const items = item.item;
  if (items && items.length > 0) {
    formInHTML += qrGroupDivStartRenderSwitcher(item, nestedLevel, index);
    items.forEach((item, i) => {
      formInHTML = readQuestionnaireResponseItem(item, formInHTML, nestedLevel + 1, i);
    });
    formInHTML += qrGroupDivEndRenderSwitcher(item, nestedLevel);

    return formInHTML;
  }
  formInHTML += qrItemDivRenderSwitcher(item, nestedLevel, false);

  return formInHTML;
}

function qrItemDivRenderSwitcher(
  item: QuestionnaireResponseItem,
  nestedLevel: number,
  inRepeatGroup: boolean
) {
  if (!item.answer) return '';

  const marginBottomAnswer = item.answer.length === 1 ? '10px' : '5px';
  let qrItemAnswer = '';
  let qrItemRender = '';

  item.answer.forEach((answer, i) => {
    const repeatGroup = answer.item;

    if (repeatGroup) {
      qrItemAnswer += `<div style="flex: 100%; margin-top: 20px; text-decoration: underline">Answer ${
        i + 1
      }</div>`;
      // recursively get item answers from repeat groups
      repeatGroup.forEach((repeatGroupAnswerItem) => {
        qrItemAnswer += qrItemDivRenderSwitcher(repeatGroupAnswerItem, nestedLevel, true);
      });

      qrItemRender = `<div style="flex: 100%; font-weight: bold">${item.text}</div>
                        <div style="flex: 100%;">${qrItemAnswer}</div>`;
    } else {
      // if not repeat group, get item answer and construct div
      const answerValueInString = qrItemAnswerValueTypeSwitcher(answer);

      qrItemAnswer += `<div style='margin-bottom: ${marginBottomAnswer}'>${
        answerValueInString[0].toUpperCase() + answerValueInString.slice(1)
      }</div>`;

      qrItemRender = `<div style="flex: 40%;">${item.text}</div>
                        <div style="flex: 10%;"></div>
                        <div style="flex: 45%;" >${qrItemAnswer}</div>
                        <div style="flex: 5%;"></div>`;
    }
  });

  if (inRepeatGroup) {
    return `<div style="margin: 10px 0 10px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
  } else {
    switch (nestedLevel) {
      case 0:
        return `<div style="margin: 20px 0 20px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
      default:
        return `<div style="margin: 20px 0 20px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
    }
  }
}

function qrGroupDivStartRenderSwitcher(
  item: QuestionnaireResponseItem,
  nestedLevel: number,
  index: number
) {
  const text = item.text;

  switch (nestedLevel) {
    case 0:
      return `<div style="font-size: 28px; font-weight: bold; margin-top: 100px">${text}</div>`;
    case 1:
      return `<div style="font-size: 20px; font-weight: bold; margin-top: ${
        index === 0 ? '30px' : '60px'
      }">${text}</div>`;
    default:
      return `<div style="font-size: 16px; font-weight: bold; margin-top: ${
        index === 0 ? '30px' : '50px'
      }">${text}</div>`;
  }
}

function qrGroupDivEndRenderSwitcher(item: QuestionnaireResponseItem, nestedLevel: number) {
  switch (nestedLevel) {
    case 0:
      return `<div style="margin-bottom: 100px"></div>`;
    case 1:
      return `<div style="margin-bottom: 75px"></div>`;
    default:
      return `<div style="margin-bottom: 50px"></div>`;
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
  else if (answer.valueCoding?.code) {
    const display = answer.valueCoding?.display;
    return display ? `${display}` : `${answer.valueCoding?.code}`;
  } else if (answer.valueQuantity) return `${answer.valueQuantity}`;
  return '';
}
