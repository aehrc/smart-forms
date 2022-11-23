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

  const title = `<div style="font-size:24px; font-weight: bold">${questionnaire.title}</div><hr />`;
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
    // Group
    formInHTML += renderGroupHeadingDiv(item, nestedLevel);
    items.forEach((item) => {
      formInHTML = readQuestionnaireResponseItem(item, formInHTML, nestedLevel + 1);
    });
    formInHTML += renderGroupBottomMargin();
  } else {
    // Item
    formInHTML += renderItemDiv(item, nestedLevel, false);
  }
  formInHTML += renderGeneralBottomMargin(nestedLevel);
  // formInHTML += renderBottomDivider(nestedLevel);

  return formInHTML;
}

function renderItemDiv(
  item: QuestionnaireResponseItem,
  nestedLevel: number,
  inRepeatGroup: boolean
) {
  if (!item.answer) return '';

  let qrItemAnswer = '';
  let qrItemRender = '';

  item.answer.forEach((answer, i) => {
    const repeatGroup = answer.item;

    if (repeatGroup) {
      qrItemAnswer += `<div style="flex: 100%; margin-top: 10px; text-decoration: underline">Answer ${
        i + 1
      }</div>`;
      // recursively get item answers from repeat groups
      repeatGroup.forEach((repeatGroupAnswerItem) => {
        qrItemAnswer += renderItemDiv(repeatGroupAnswerItem, nestedLevel, true);
      });
      qrItemAnswer += `<div style="margin-bottom: 10px"></div>`;

      qrItemRender = `<div style="flex: 100%; font-weight: bold">${item.text}</div>
                        <div style="flex: 100%;">${qrItemAnswer}</div>`;
    } else {
      // if not repeat group, get item answer and construct div
      const answerValueInString = qrItemAnswerValueTypeSwitcher(answer);
      console.log(answer);
      console.log(answerValueInString);

      qrItemAnswer += `<div>${
        answerValueInString[0].toUpperCase() + answerValueInString.slice(1)
      }</div>`;

      qrItemRender = `<div style="flex:40%;">${item.text}</div>
                        <div style="flex: 10%;"></div>
                        <div style="flex: 50%;" >${qrItemAnswer}</div>`;
    }
  });

  if (inRepeatGroup) {
    return `<div style="margin: 10px 0 10px; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
  } else {
    return `<div style="margin-top: ${
      nestedLevel === 0 ? '20px' : '10px'
    }; display: flex; flex-wrap: wrap;">${qrItemRender}</div>`;
  }
}

function renderGroupHeadingDiv(item: QuestionnaireResponseItem, nestedLevel: number) {
  return `<div style="font-size: ${
    nestedLevel === 0 ? '18px' : '16px'
  }; font-weight: bold; margin-top: 15px">${item.text}</div>`;
}

function qrItemAnswerValueTypeSwitcher(answer: QuestionnaireResponseItemAnswer): string {
  if (answer.valueBoolean !== undefined) return `${answer.valueBoolean}`;
  else if (answer.valueDecimal) return `${answer.valueDecimal}`;
  else if (answer.valueInteger !== undefined) return `${answer.valueInteger}`;
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

function renderGroupBottomMargin() {
  return `<div style="margin-bottom: 30px;"></div>`;
}

function renderGeneralBottomMargin(nestedLevel: number) {
  return nestedLevel === 0 ? `<div style="margin: 60px 0 20px;"></div>` : '';
}
