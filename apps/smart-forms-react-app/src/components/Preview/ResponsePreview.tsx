import React, { useContext } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
import Preview from './Preview';
import { QuestionnaireProviderContext } from '../../App';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import ChipBar from '../ChipBar/ChipBar';
import ResponsePreviewOperationButtons from '../OperationButtons/ResponsePreviewOperationButtons';

function ResponsePreview() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  return (
    <Grid container>
      <SideBarGrid item lg={1.75}>
        <SideBar>
          <ResponsePreviewOperationButtons isChip={false} />
        </SideBar>
      </SideBarGrid>
      <MainGrid item lg={10.25}>
        <MainGridContainerBox gap={2.5}>
          <Typography fontWeight="bold" fontSize={36}>
            {questionnaireProvider.questionnaire.title}
          </Typography>
          <Box displayPrint="none">
            <ChipBar>
              <ResponsePreviewOperationButtons isChip={true} />
            </ChipBar>
          </Box>
          <Divider light />

          <Preview />
        </MainGridContainerBox>
      </MainGrid>
    </Grid>
  );
}

export default ResponsePreview;
