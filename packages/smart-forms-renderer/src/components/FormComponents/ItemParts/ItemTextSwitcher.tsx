import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getMarkdownString } from '../../../utils/itemControl';
import { useParseXhtml } from '../../../hooks/useParseXhtml';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import type { QuestionnaireItem } from 'fhir/r4';

interface ItemTextSwitcherProps {
  qItem: QuestionnaireItem;
}

const ItemTextSwitcher = memo(function ItemTextSwitcher({ qItem }: ItemTextSwitcherProps) {
  let itemText = qItem.text ?? '';

  // Use calculatedExpressionString if available
  const calculatedExpressionString = useDisplayCqfAndCalculatedExpression(qItem) ?? '';
  if (calculatedExpressionString) {
    itemText = calculatedExpressionString;
  }

  // parse XHTML if found
  const parsedXhtml = useParseXhtml(qItem);
  if (parsedXhtml) {
    return <span>{parsedXhtml.content}</span>;
  }

  // parse markdown if found
  const markdownString = getMarkdownString(qItem);
  if (markdownString) {
    return (
      <span>
        <ReactMarkdown>{markdownString}</ReactMarkdown>
      </span>
    );
  }

  // labelText is empty, return null
  if (!itemText) {
    return null;
  }

  // parse regular text
  return <span>{itemText}</span>;
});

export default ItemTextSwitcher;
