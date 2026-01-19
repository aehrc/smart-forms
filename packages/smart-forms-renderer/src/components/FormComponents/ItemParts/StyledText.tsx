import React from 'react';
import ReactMarkdown from 'react-markdown';
import { getMarkdownString } from '../../../utils/extensions';
import { useParseXhtml } from '../../../hooks/useParseXhtml';
import type { Element } from 'fhir/r4';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { default as parseStyleToJs } from 'style-to-js';

interface StyledTextProps {
  textToDisplay: string | null;
  element: Element | undefined;
}

function StyledText({ textToDisplay, element }: StyledTextProps) {
  // parse XHTML if found
  const parsedXhtml = useParseXhtml(element, textToDisplay);
  if (parsedXhtml) {
    return parsedXhtml.content;
  }

  // parse markdown if found
  const markdownString = getMarkdownString(element);
  if (markdownString) {
    return (
      <ReactMarkdown
        components={{
          p: (props) => <span {...props} />
        }}>
        {markdownString}
      </ReactMarkdown>
    );
  }

  // labelText is empty, return null
  if (!textToDisplay) {
    return null;
  }

  const stylesString = structuredDataCapture.getStyle(element);
  const itemStyles = stylesString ? parseStyleToJs(stylesString) : {};

  // parse regular text
  return <span style={itemStyles}>{textToDisplay}</span>;
}

export default StyledText;
