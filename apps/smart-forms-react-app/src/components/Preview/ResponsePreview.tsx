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

import React, { useContext, useRef } from 'react';
import { Box, Divider, Grid, Paper } from '@mui/material';
import Preview from './Preview';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import ChipBar from '../ChipBar/ChipBar';
import ResponsePreviewOperationButtons from '../OperationButtons/ResponsePreviewOperationButtons';
import { useReactToPrint } from 'react-to-print';
import PrintPreviewButton from '../OperationButtons/SingleButtons/PrintPreviewButton';
import { MainGridHeadingTypography } from '../StyledComponents/Typographys.styles';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

function ResponsePreview() {
  const sideBar = useContext(SideBarContext);

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  return (
    <Grid container>
      <SideBarGrid item xs={12} lg={sideBar.isExpanded ? 1.75 : 0.5}>
        <SideBar>
          <ResponsePreviewOperationButtons />
          <PrintPreviewButton handlePrint={handlePrint} />
        </SideBar>
      </SideBarGrid>
      <MainGrid item xs={12} lg={sideBar.isExpanded ? 10.25 : 11.5}>
        <MainGridContainerBox>
          <MainGridHeadingTypography variant="h1">Response Preview</MainGridHeadingTypography>
          <ChipBar>
            <ResponsePreviewOperationButtons isChip={true} />
            <PrintPreviewButton handlePrint={handlePrint} isChip={true} />
          </ChipBar>
          <Divider light />

          <Paper>
            <Box sx={{ p: 4 }} ref={componentRef}>
              <Preview />
            </Box>
          </Paper>
        </MainGridContainerBox>
      </MainGrid>
    </Grid>
  );
}

export default ResponsePreview;
