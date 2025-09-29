import { evaluate } from 'fhirpath';
import { questionnaireResponseStore } from '../stores';
import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { fireEvent, screen, userEvent, waitFor } from 'storybook/internal/test';

export async function getQuantityTextValues(
  canvasElement: HTMLElement,
  linkId: string,
  unit: boolean
) {
  const element = await findByLinkId(canvasElement, linkId);
  const quantityComparator = element.querySelector(
    'div[data-test="q-item-quantity-comparator"] input'
  );
  const quantityInput = element.querySelector('div[data-test="q-item-quantity-field"] input');
  const quantityUnit = element.querySelector('div[data-test="q-item-unit-field"] input');

  // Error section
  if (!quantityComparator) {
    throw new Error(
      `File input was not found inside [data-test="q-item-quantity-comparator"] block`
    );
  }
  if (!quantityInput) {
    throw new Error(`File input was not found inside [data-test="q-item-quantity-field"] block`);
  }
  if (!quantityUnit && unit) {
    throw new Error(`File input was not found inside [data-test="q-item-unit-field"] block`);
  }

  return {
    comparator: quantityComparator?.getAttribute('value'),
    value: quantityInput?.getAttribute('value'),
    unit: quantityUnit?.getAttribute('value')
  };
}

export async function inputQuantity(
  canvasElement: HTMLElement,
  linkId: string,
  quantity: number,
  unit?: string,
  comparator?: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const comparatorInput = questionElement?.querySelector(
    `div[data-test="q-item-quantity-comparator"] input`
  );
  const quantityInput = questionElement?.querySelector(
    `div[data-test="q-item-quantity-field"] input`
  );
  const unitInput = questionElement?.querySelector(`div[data-test="q-item-unit-field"] input`);

  // Error section
  if (comparator && !comparatorInput) {
    throw new Error(`Input was not found inside [data-test="q-item-quantity-comparator"] block`);
  }
  if (!quantityInput) {
    throw new Error(`Input was not found inside [data-test="q-item-quantity-field"] block`);
  }
  if (!unitInput && unit) {
    throw new Error(`Input was not found inside [data-test="q-item-unit-field"] block`);
  }

  if (comparator && comparatorInput) {
    fireEvent.focus(comparatorInput);
    fireEvent.keyDown(comparatorInput, { key: 'ArrowDown', code: 'ArrowDown' });
    const option = await screen.findByText(comparator);
    fireEvent.click(option);
  }
  if (unit && unitInput) {
    fireEvent.focus(unitInput);
    fireEvent.keyDown(unitInput, { key: 'ArrowDown', code: 'ArrowDown' });
    const option = await screen.findByText(unit);
    fireEvent.click(option);
  }
  fireEvent.change(quantityInput, { target: { value: quantity } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getAnswers(linkId: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;
  const result = await evaluate(qr, `QuestionnaireResponse.item.where(linkId='${linkId}').answer`);
  return result;
}
export async function getGroupAnswers(groupLinkid: string, answerLinkid: string) {
  const qr = questionnaireResponseStore.getState().updatableResponse;

  const result = await evaluate(
    qr,
    groupLinkid
      ? `QuestionnaireResponse.item.where(linkId='${groupLinkid}').item.where(linkId='${answerLinkid}').answer`
      : `QuestionnaireResponse.item.where(linkId='${answerLinkid}').answer`
  );

  return result;
}

export function questionnaireFactory(
  items: QuestionnaireItem[],
  extra?: Omit<Questionnaire, 'resourceType' | 'status' | 'item'>
): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: items,
    ...extra
  };
}

export function qrFactory(items: QuestionnaireResponseItem[]): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: items
  };
}
export function itemControlExtFactory(code: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: {
      coding: [
        {
          system: 'http://hl7.org/fhir/questionnaire-item-control',
          code: code
        }
      ]
    }
  };
}
export function openLabelExtFactory(text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
    valueString: text
  };
}

export function calculatedExpressionExtFactory(text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
    valueExpression: {
      language: 'text/fhirpath',
      expression: text
    }
  };
}

export function variableExtFactory(name: string, text: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/variable',
    valueExpression: {
      name: name,
      language: 'text/fhirpath',
      expression: text
    }
  };
}

export function unitOptionExtFactory(code: string, display: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption',
    valueCoding: {
      system: 'http://unitsofmeasure.org',
      code: code,
      display: display
    }
  };
}
export function unitExtFactory(code: string, display: string): Extension {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
    valueCoding: {
      system: 'http://unitsofmeasure.org',
      code: code,
      display: display
    }
  };
}

export function сqfExpressionFactory(text: string) {
  return {
    url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
    valueExpression: {
      language: 'text/fhirpath',
      expression: text
    }
  };
}

export const ucumSystem = 'http://unitsofmeasure.org';

export async function inputText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean | number
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.change(input, { target: { value: text } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}
export async function checkCheckBox(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.click(input);

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function inputFile(
  canvasElement: HTMLElement,
  linkId: string,
  files: File | File[],
  url: string,
  filename: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input = questionElement?.querySelector('input');

  const textareaUrl = questionElement?.querySelector(`textarea[data-test="q-item-attachment-url"]`);
  const textareaName = questionElement?.querySelector(
    `textarea[data-test="q-item-attachment-file-name"]`
  );

  if (!input) {
    throw new Error(`File input was not found inside [data-linkid=${linkId}] block`);
  }
  if (!textareaUrl) {
    throw new Error(`File input was not found inside [data-linkid="URL"] block`);
  }
  if (!textareaName) {
    throw new Error(`File input was not found inside [data-linkid="File name (optional)"] block`);
  }

  const fileList = Array.isArray(files) ? files : [files];
  await userEvent.upload(input, fileList);

  fireEvent.change(textareaUrl, { target: { value: url } });
  fireEvent.change(textareaName, { target: { value: filename } });
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function inputDate(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputTime(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputReference(
  canvasElement: HTMLElement,
  linkId: string,
  text: string | boolean
) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputDecimal(canvasElement: HTMLElement, linkId: string, text: number) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputUrl(canvasElement: HTMLElement, linkId: string, text: string) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputInteger(canvasElement: HTMLElement, linkId: string, text: number) {
  return await inputText(canvasElement, linkId, text);
}

export async function inputDateTime(
  canvasElement: HTMLElement,
  linkId: string,
  date: string,
  time: string,
  amPm: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  console.log(questionElement, 777);
  const inputDate = questionElement?.querySelector('div[data-test="date"] input');
  const inputTime = questionElement?.querySelector('div[data-test="time"] input');
  const inputAmPm = questionElement?.querySelector('div[data-test="ampm"] input');

  if (!inputTime) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }
  if (!inputDate) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }
  if (!inputAmPm) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.change(inputDate, { target: { value: date } });
  fireEvent.change(inputTime, { target: { value: time } });
  fireEvent.change(inputAmPm, { target: { value: amPm } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function checkRadioOption(canvasElement: HTMLElement, linkId: string, text: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const radio = questionElement?.querySelector(`span[data-test="radio-single-${text}"] input`);

  if (!radio) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  fireEvent.click(radio);
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function getInputText(canvasElement: HTMLElement, linkId: string) {
  const questionElement = await findByLinkId(canvasElement, linkId);
  const input =
    questionElement?.querySelector('input') ?? questionElement?.querySelector('textarea');

  if (!input) {
    throw new Error(`Input or textarea was not found inside ${`[data-linkid=${linkId}] block`}`);
  }

  return input.value;
}

export async function chooseSelectOption(
  canvasElement: HTMLElement,
  linkId: string,
  optionLabel: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const input = questionElement.querySelector('input, textarea');
  if (!input) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  fireEvent.focus(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

  const option = await screen.findByText(optionLabel);
  fireEvent.click(option);
}
export async function chooseQuantityOption(
  canvasElement: HTMLElement,
  linkId: string,
  quantity: number | string,
  quantityComparator?: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const inputComaparator = questionElement.querySelector(
    'div[data-test="q-item-quantity-comparator"] input'
  );
  const inputWeight = questionElement.querySelector('div[data-test="q-item-quantity-field"] input');

  if (!inputComaparator) {
    throw new Error(`There is no input inside ${linkId}`);
  }
  if (!inputWeight) {
    throw new Error(`There is no input inside ${linkId}`);
  }

  fireEvent.focus(inputComaparator);
  fireEvent.keyDown(inputComaparator, { key: 'ArrowDown', code: 'ArrowDown' });

  if (quantityComparator) {
    const option = await screen.findByText(quantityComparator);
    fireEvent.click(option);
    fireEvent.change(inputComaparator, { target: { value: quantityComparator } });
  }

  fireEvent.change(inputWeight, { target: { value: quantity } });
  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export async function findByLinkId(canvasElement: HTMLElement, linkId: string) {
  const selector = `[data-linkid="${linkId}"]`;
  return await waitFor(() => {
    const el = canvasElement.querySelector(selector);
    if (!el) {
      throw new Error(`Element ${selector} not found`);
    }
    return el;
  });
}
export async function inputOpenChoiceOtherText(
  canvasElement: HTMLElement,
  linkId: string,
  text: string
) {
  const questionElement = await findByLinkId(canvasElement, linkId);

  const textarea = questionElement?.querySelector(
    'div[data-test="q-item-radio-open-label-box"] textarea'
  );

  if (!textarea) {
    throw new Error(`Input or textarea was not found inside ${`[data-test=${linkId}] block`}`);
  }

  fireEvent.change(textarea, { target: { value: text } });

  // Here we await for debounced store update
  await new Promise((resolve) => setTimeout(resolve, 500));
}
