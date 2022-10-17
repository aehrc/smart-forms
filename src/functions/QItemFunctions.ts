import { QuestionnaireItem } from 'fhir/r5';
import { isSpecificItemControl } from './ItemControlFunctions';

/**
 * Get string text display prompt for items with itemControlCode prompt and has a prompt childItem
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
