/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { memo } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { getMarkdownString, getXHtmlString } from '../../../utils/itemControl';
import { default as htmlParse } from 'html-react-parser';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import Typography from '@mui/material/Typography';
import useDisplayCqfAndCalculatedExpression from '../../../hooks/useDisplayCqfAndCalculatedExpression';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { default as styleParse } from 'style-to-js';
import { useRendererStylingStore } from '../../../stores/rendererStylingStore';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import FlyoverItem from './FlyoverItem';

interface ItemLabelTextProps {
  qItem: QuestionnaireItem;
  readOnly?: boolean;
}

const ItemLabelText = memo(function ItemLabelText(props: ItemLabelTextProps) {
  const { qItem, readOnly } = props;

  const itemLabelFontWeight = useRendererStylingStore.use.itemLabelFontWeight();
  const requiredIndicatorPosition = useRendererStylingStore.use.requiredIndicatorPosition();

  const { required, displayFlyover } = useRenderingExtensions(qItem);

  let labelText = qItem.text ?? '';

  // Use calculatedExpressionString if available
  const calculatedExpressionString = useDisplayCqfAndCalculatedExpression(qItem) ?? '';
  if (calculatedExpressionString) {
    labelText = calculatedExpressionString;
  }

  // parse xHTML if found
  const xHtmlString = getXHtmlString(qItem);
  if (xHtmlString) {
    return (
      <Box display="flex">
        {htmlParse(xHtmlString)}
        {required && requiredIndicatorPosition === 'end' ? (
          <Typography color="red">*</Typography>
        ) : null}
        {displayFlyover !== '' ? <FlyoverItem displayFlyover={displayFlyover} /> : null}
      </Box>
    );
  }

  // parse markdown if found
  const markdownString = getMarkdownString(qItem);
  if (markdownString) {
    return (
      <Box display="flex">
        <ReactMarkdown>{markdownString}</ReactMarkdown>
        {required && requiredIndicatorPosition === 'end' ? (
          <Typography color="red">*</Typography>
        ) : null}
        <FlyoverItem displayFlyover={displayFlyover} />
        {displayFlyover !== '' ? <FlyoverItem displayFlyover={displayFlyover} /> : null}
      </Box>
    );
  }

  // labelText is empty, return null
  if (!labelText) {
    return null;
  }

  // parse styles if found
  const stylesString = structuredDataCapture.getStyle(qItem._text);
  if (stylesString) {
    const styles = styleParse(stylesString);
    return (
      <Box display="flex">
        <div style={styles}>{labelText}</div>
        {required && requiredIndicatorPosition === 'end' ? (
          <Typography color="red">*</Typography>
        ) : null}
        {displayFlyover !== '' ? <FlyoverItem displayFlyover={displayFlyover} /> : null}
      </Box>
    );
  }

  const textFontWeight = itemLabelFontWeight != 'default' ? itemLabelFontWeight : 'normal';

  // parse regular text
  return (
    <Typography
      color={readOnly ? 'text.disabled' : 'text.primary'}
      fontWeight={itemLabelFontWeight ? itemLabelFontWeight : 'normal'}
      sx={{ mt: 0.25 }}>
      {labelText}
      {required && requiredIndicatorPosition === 'end' ? (
        <Typography
          component="span"
          color="red"
          fontWeight={itemLabelFontWeight ? itemLabelFontWeight : 'normal'}
          sx={{ verticalAlign: 'middle' }}>
          *
        </Typography>
      ) : null}
      <Typography component="span" sx={{ mr: 0.75 }} />
      {displayFlyover !== '' ? (
        <Typography component="span">
          <FlyoverItem displayFlyover={displayFlyover} />
        </Typography>
      ) : null}
    </Typography>
  );
});

export default ItemLabelText;
