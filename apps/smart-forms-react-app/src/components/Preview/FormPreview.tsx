import React from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
import Preview from './Preview';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';

import ChipBar from '../ChipBar/ChipBar';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import SideBar from '../SideBar/SideBar';
import { QuestionnaireResponse } from 'fhir/r5';
import { QuestionnaireProviderContext } from '../../App';
import FormPreviewOperationButtons from '../OperationButtons/FormPreviewOperationButtons';

interface Props {
  questionnaireResponse: QuestionnaireResponse;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
}
function FormPreview(props: Props) {
  const { questionnaireResponse, qrHasChanges, removeQrHasChanges, togglePreviewMode } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  if (qForm.item && qrForm.item) {
    return (
      <Grid container>
        <SideBarGrid item lg={1.75}>
          <SideBar>
            <FormPreviewOperationButtons
              isChip={false}
              togglePreviewMode={togglePreviewMode}
              qrHasChanges={qrHasChanges}
              removeQrHasChanges={removeQrHasChanges}
              questionnaireResponse={questionnaireResponse}
            />
          </SideBar>
        </SideBarGrid>
        <MainGrid item lg={10.25}>
          <MainGridContainerBox gap={2}>
            <Typography fontWeight="bold" fontSize={36}>
              {questionnaire.title}
            </Typography>
            <Box displayPrint="none">
              <ChipBar>
                <FormPreviewOperationButtons
                  isChip={true}
                  togglePreviewMode={togglePreviewMode}
                  qrHasChanges={qrHasChanges}
                  removeQrHasChanges={() => removeQrHasChanges}
                  questionnaireResponse={questionnaireResponse}
                />
              </ChipBar>
            </Box>
            <Divider light />
            <Preview />
          </MainGridContainerBox>
        </MainGrid>
      </Grid>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default FormPreview;
