/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { List } from '@mui/material';
import { useContext } from 'react';
import ViewerSaveAsFinal from './SaveAsFinal/ViewerSaveAsFinal.tsx';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import { PrintComponentRefContext } from '../ViewerLayout.tsx';
import { useReactToPrint } from 'react-to-print';
import ViewerOperationItem from './ViewerOperationItem.tsx';
import {
  NavSectionHeading,
  NavSectionHeadingWrapper,
  NavSectionWrapper
} from '../../../components/Nav/Nav.styles.ts';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import { getQuestionnaireNameFromResponse } from '../../../utils/questionnaireName.ts';

/*
  Prevent content from breaking inside these section containers.

  These classes should wrap content grouped by heading level
  (e.g., each <h2> and its related content inside a .h2-section).

  - For h4 headings: avoid page breaks immediately after.
  - For h3 headings: avoid breaks immediately after, but allow them to start on a new page if needed.
  - For h2 headings: apply the same logic as h3 — avoid breaking right after, but allow a break before.
*/
const pageStyle: string = `
  @media print {
    .h2-section, .h3-section, .h4-section {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h4 { break-after: avoid; }
    h3 { break-after: avoid; break-before: auto; }
    h2 { break-after: avoid; break-before: auto; }
  }
`;

function ViewerOperationSection() {
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const navigate = useNavigate();

  const { componentRef } = useContext(PrintComponentRefContext);

  const handlePrint = useReactToPrint({
    contentRef: componentRef ?? undefined,
    pageStyle: pageStyle,
    documentTitle: getQuestionnaireNameFromResponse(sourceResponse)
  });

  return (
    <NavSectionWrapper>
      <NavSectionHeadingWrapper>
        <NavSectionHeading>Operations</NavSectionHeading>
      </NavSectionHeadingWrapper>
      <List disablePadding sx={{ px: 1 }}>
        {sourceResponse.status === 'in-progress' ? (
          <>
            <ViewerOperationItem
              title={'Edit Response'}
              icon={<EditIcon />}
              onClick={() => {
                navigate('/renderer');
              }}
            />
            <ViewerSaveAsFinal />
          </>
        ) : sourceResponse.status === 'completed' || sourceResponse.status === 'amended' ? (
          <ViewerOperationItem
            title={'Amend Response'}
            icon={<EditNoteIcon />}
            onClick={() => {
              navigate('/renderer');
            }}
          />
        ) : null}
        <ViewerOperationItem title={'Print Preview'} icon={<PrintIcon />} onClick={handlePrint} />
      </List>
    </NavSectionWrapper>
  );
}

export default ViewerOperationSection;
