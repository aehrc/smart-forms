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

import { List } from '@mui/material';
import { useContext } from 'react';
import ViewerSaveAsFinal from './SaveAsFinal/ViewerSaveAsFinal.tsx';
import EditIcon from '@mui/icons-material/Edit';
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

function ViewerOperationSection() {
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();

  const navigate = useNavigate();

  const { componentRef } = useContext(PrintComponentRefContext);
  const handlePrint = useReactToPrint({
    content: () => (componentRef ? componentRef.current : null)
  });

  return (
    <NavSectionWrapper>
      <NavSectionHeadingWrapper>
        <NavSectionHeading>Operations</NavSectionHeading>
      </NavSectionHeadingWrapper>
      <List disablePadding sx={{ px: 1 }}>
        {sourceResponse.status !== 'completed' ? (
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
        ) : null}
        <ViewerOperationItem title={'Print Preview'} icon={<PrintIcon />} onClick={handlePrint} />
      </List>
    </NavSectionWrapper>
  );
}

export default ViewerOperationSection;
