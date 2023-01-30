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

import React, { useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import InvalidQuestionnaireOperationButtons from '../OperationButtons/InvalidQuestionnaireOperationButtons';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import ChipBar from '../ChipBar/ChipBar';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

function FormBodyInvalid() {
  const sideBar = useContext(SideBarContext);

  return (
    <Grid container>
      <SideBarGrid item xs={12} lg={sideBar.isExpanded ? 1.75 : 0.5}>
        <SideBar>
          <InvalidQuestionnaireOperationButtons />
        </SideBar>
      </SideBarGrid>
      <MainGrid item xs={12} lg={sideBar.isExpanded ? 10.25 : 11.5}>
        <MainGridContainerBox>
          <Typography fontSize={16} variant="h6">
            Oops, the form renderer is unable to render this questionnaire.
          </Typography>
          <Typography fontSize={14}>
            {
              "This questionnaire either lacks a top-level group item, or the group item doesn't have any items."
            }
          </Typography>
          <ChipBar>
            <InvalidQuestionnaireOperationButtons isChip={true} />
          </ChipBar>
        </MainGridContainerBox>
      </MainGrid>
    </Grid>
  );
}

export default FormBodyInvalid;
