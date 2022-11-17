import React from 'react';
import { Grid, Typography } from '@mui/material';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import InvalidQuestionnaireOperationButtons from '../OperationButtons/InvalidQuestionnaireOperationButtons';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import ChipBar from '../ChipBar/ChipBar';

function FormBodyInvalid() {
  return (
    <Grid container>
      <SideBarGrid item lg={1.75}>
        <SideBar>
          <InvalidQuestionnaireOperationButtons />
        </SideBar>
      </SideBarGrid>
      <MainGrid item lg={10.25}>
        <MainGridContainerBox gap={2}>
          <Typography fontSize={24}>Questionnaire does not have a form item.</Typography>
          <ChipBar>
            <InvalidQuestionnaireOperationButtons isChip={true} />
          </ChipBar>
        </MainGridContainerBox>
      </MainGrid>
    </Grid>
  );
}

export default FormBodyInvalid;
