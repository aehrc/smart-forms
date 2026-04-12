import React, { memo } from 'react';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import type { QuestionnaireItem } from 'fhir/r4';
import StyledText from './StyledText';

interface ItemPrefixSwitcherProps {
  qItem: QuestionnaireItem;
}

const ItemPrefixSwitcher = memo(function ItemPrefixSwitcher({ qItem }: ItemPrefixSwitcherProps) {
  let prefixToDisplay: string | null = qItem.prefix ?? null;

  const calculatedExpressionString =
    useDisplayCqfAndCalculatedExpression(qItem, 'item._prefix') ?? '';
  if (calculatedExpressionString) {
    prefixToDisplay = calculatedExpressionString;
  }

  const content = <StyledText textToDisplay={prefixToDisplay} element={qItem._prefix} />;

  return content ? <span>{content}</span> : null;
});

export default ItemPrefixSwitcher;
