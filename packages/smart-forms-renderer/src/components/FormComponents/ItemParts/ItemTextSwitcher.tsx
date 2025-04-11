import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getMarkdownString } from '../../../utils/itemControl';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { default as parseStyleToJs } from 'style-to-js';
import { useParseXhtml } from '../../../hooks/useParseXhtml';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import type { QuestionnaireItem } from 'fhir/r4';

interface ItemTextSwitcherProps {
  qItem: QuestionnaireItem;
  onStylesExtracted?: (styles: Record<string, any>) => void;
}

const ItemTextSwitcher = memo(function ItemTextSwitcher({
  qItem,
  onStylesExtracted
}: ItemTextSwitcherProps) {
  let itemText = qItem.text ?? '';

  // Use calculatedExpressionString if available
  const calculatedExpressionString = useDisplayCqfAndCalculatedExpression(qItem) ?? '';
  if (calculatedExpressionString) {
    itemText = calculatedExpressionString;
  }

  // parse XHTML if found
  const parsedXhtml = useParseXhtml(qItem);
  if (parsedXhtml) {
    // If we have styles and a callback, pass the styles to the parent
    if (parsedXhtml.styles && onStylesExtracted) {
      onStylesExtracted(parsedXhtml.styles);
    }

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

  // parse styles if found
  const stylesString = structuredDataCapture.getStyle(qItem._text);
  if (stylesString) {
    const styles = parseStyleToJs(stylesString);
    return <span style={styles}>{itemText}</span>;
  }

  // parse regular text
  return <span>{itemText}</span>;
});

export default ItemTextSwitcher;
