import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getMarkdownString } from '../../../utils/extensions';
import { useParseXhtml } from '../../../hooks/useParseXhtml';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import type { QuestionnaireItem } from 'fhir/r4';
import { getItemTextToDisplay } from '../../../utils/itemTextToDisplay';

interface ItemTextSwitcherProps {
  qItem: QuestionnaireItem;
}

const ItemTextSwitcher = memo(function ItemTextSwitcher({ qItem }: ItemTextSwitcherProps) {
  let itemTextToDisplay = getItemTextToDisplay(qItem);

  // Use calculatedExpressionString if available
  const calculatedExpressionString = useDisplayCqfAndCalculatedExpression(qItem) ?? '';
  if (calculatedExpressionString) {
    itemTextToDisplay = calculatedExpressionString;
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
  if (!itemTextToDisplay) {
    return null;
  }

  // parse regular text
  return <span>{itemTextToDisplay}</span>;
});

export default ItemTextSwitcher;
