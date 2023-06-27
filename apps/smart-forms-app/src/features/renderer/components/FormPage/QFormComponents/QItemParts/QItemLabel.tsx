/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { memo } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { getMarkdownString, getXHtmlString } from '../../../../utils/itemControl.ts';
import { QItemTypography } from '../Item.styles.tsx';
import parse from 'html-react-parser';
import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemLabel(props: Props) {
  const { qItem } = props;

  // parse xHTML if found
  const xHtmlString = getXHtmlString(qItem);
  if (xHtmlString) {
    return <Box sx={{ mt: 0.5 }}>{parse(xHtmlString)}</Box>;
  }

  // parse xHTML if found
  const markdownString = getMarkdownString(qItem);
  if (markdownString) {
    return (
      <Box sx={{ mt: 0.5 }}>
        <ReactMarkdown>{markdownString}</ReactMarkdown>
      </Box>
    );
  }

  // parse regular text
  if (qItem.type === 'group') {
    return <>{qItem.text}</>;
  } else {
    return <QItemTypography>{qItem.text}</QItemTypography>;
  }
}

export default memo(QItemLabel);
