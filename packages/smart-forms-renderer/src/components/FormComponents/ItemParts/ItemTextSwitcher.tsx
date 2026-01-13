import React, { memo } from 'react';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import type { QuestionnaireItem } from 'fhir/r4';
import { getItemTextToDisplay } from '../../../utils/itemTextToDisplay';
import StyledText from './StyledText';

interface ItemTextSwitcherProps {
  qItem: QuestionnaireItem;
}

const ItemTextSwitcher = memo(function ItemTextSwitcher({ qItem }: ItemTextSwitcherProps) {
  let itemTextToDisplay = getItemTextToDisplay(qItem);

  // Use calculatedExpressionString if available
  const calculatedExpressionString =
    useDisplayCqfAndCalculatedExpression(qItem, 'item._text') ?? '';
  if (calculatedExpressionString) {
    itemTextToDisplay = calculatedExpressionString;
  }

  // Get aria-label text if available
  const itemTextAriaLabel =
    useDisplayCqfAndCalculatedExpression(qItem, 'item._text.aria-label') ?? undefined;

  const content = <StyledText textToDisplay={itemTextToDisplay} element={qItem._text} />;

  return content ? <span aria-label={itemTextAriaLabel}>{content}</span> : null;
});

export default ItemTextSwitcher;
