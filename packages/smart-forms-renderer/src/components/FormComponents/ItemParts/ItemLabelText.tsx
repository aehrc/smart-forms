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
import parse from 'html-react-parser';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import Typography from '@mui/material/Typography';
import useDisplayCalculatedExpression from '../../../hooks/useDisplayCalculatedExpression';

interface ItemLabelTextProps {
  qItem: QuestionnaireItem;
  readOnly?: boolean;
}

const ItemLabelText = memo(function ItemLabelText(props: ItemLabelTextProps) {
  const { qItem, readOnly } = props;

  // Use calculatedExpressionString if available
  const calculatedExpressionString = useDisplayCalculatedExpression(qItem);
  if (calculatedExpressionString) {
    return (
      <Typography color={readOnly ? 'text.disabled' : 'text.primary'} sx={{ mt: 0.25 }}>
        {calculatedExpressionString}
      </Typography>
    );
  }

  // parse xHTML if found
  const xHtmlString = getXHtmlString(qItem);

  if (xHtmlString) {
    return <Box>{parse(xHtmlString)}</Box>;
  }

  // parse markdown if found
  const markdownString = getMarkdownString(qItem);
  if (markdownString) {
    return (
      <Box>
        <ReactMarkdown>{markdownString}</ReactMarkdown>
      </Box>
    );
  }

  if (qItem.type === 'group') {
    return <>{qItem.text}</>;
  }

  // parse regular text
  return (
    <Typography color={readOnly ? 'text.disabled' : 'text.primary'} sx={{ mt: 0.25 }}>
      {qItem.text}
    </Typography>
  );
});

export default ItemLabelText;
