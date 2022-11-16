import { QuestionnaireItem } from 'fhir/r5';
import { isHidden, isSpecificItemControl } from './ItemControlFunctions';
import React from 'react';
import { EnableWhenContext } from '../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../components/QRenderer/Form';

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

/**
 * Test the given QItem on a series of checks to verify if the item should be displayed
 * Check if qItem has hidden attribute
 * Check if qItem fufilled its enableWhen criteria
 *
 * @author Sean Fong
 */
export function hideQItem(qItem: QuestionnaireItem): boolean {
  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  if (isHidden(qItem)) return true;

  // only for testing
  if (enableWhenChecksContext) {
    if (!enableWhenContext.checkItemIsEnabled(qItem.linkId)) return true; // preserve this line in final build
  }

  return false;
}
