import { QuestionnaireItem } from 'fhir/r5';
import {
  hasHiddenExtension,
  isSpecificDisplayCategory,
  isSpecificItemControl
} from './ItemControlFunctions';
import { getChoiceControlType } from './ChoiceFunctions';
import { QItemChoiceControl, QItemOpenChoiceControl } from '../interfaces/Enums';
import { getOpenChoiceControlType } from './OpenChoiceFunctions';
import { EnableWhenContextType } from '../interfaces/ContextTypes';

/**
 * Get text display prompt for items with itemControlCode prompt and has a prompt childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayPrompt(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    const childItem = qItem.item[0];
    if (childItem.type === 'display' && isSpecificItemControl(childItem, 'prompt')) {
      const promptText = `${childItem.text}`;
      return promptText[0].toUpperCase() + promptText.substring(1);
    }
  }
  return '';
}

/**
 * Get decimal text display unit for items with itemControlCode unit and has a unit childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayUnit(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    const childItem = qItem.item[0];
    if (childItem.type === 'display' && isSpecificItemControl(childItem, 'unit')) {
      return `${childItem.text}`;
    }
  }
  return '';
}

/**
 * Get text display instructions for items with itemControlCode instructions and has an instructions childItem
 *
 * @author Sean Fong
 */
export function getTextDisplayInstructions(qItem: QuestionnaireItem): string {
  if (qItem.item) {
    const childItem = qItem.item[0];
    if (childItem.type === 'display' && isSpecificDisplayCategory(childItem, 'instructions')) {
      return `${childItem.text}`;
    }
  }
  return '';
}

/**
 * Test the given QItem on a series of checks to verify if the item should be displayed
 * Check if qItem has hidden attribute
 * Check if qItem fufilled its enableWhen criteria
 *
 * @author Sean Fong
 */
export function isHidden(
  qItem: QuestionnaireItem,
  enableWhenContext: EnableWhenContextType,
  enableWhenChecksEnabled: boolean
): boolean {
  if (hasHiddenExtension(qItem)) return true;

  // only for testing
  if (enableWhenChecksEnabled) {
    if (!enableWhenContext.checkItemIsEnabled(qItem.linkId)) return true; // preserve this line in final build
  }

  return false;
}

/**
 * Check if qItem is a repeat item AND if it isnt a checkbox item
 * Note: repeat checkbox items are rendered as multi-select checkbox instead of being rendered as a traditional repeat item
 *
 * @author Sean Fong
 */
export function isRepeatItemAndNotCheckbox(qItem: QuestionnaireItem): boolean {
  const isCheckbox =
    getChoiceControlType(qItem) === QItemChoiceControl.Checkbox ||
    getOpenChoiceControlType(qItem) === QItemOpenChoiceControl.Checkbox;

  return !!qItem['repeats'] && !isCheckbox;
}
