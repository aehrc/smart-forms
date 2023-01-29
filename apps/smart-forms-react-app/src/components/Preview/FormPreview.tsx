import React, { useContext } from 'react';
import { Divider, Grid, Paper } from '@mui/material';
import Preview from './Preview';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import SideBar from '../SideBar/SideBar';
import { QuestionnaireResponse } from 'fhir/r5';
import { QuestionnaireProviderContext } from '../../App';
import FormPreviewOperationButtons from '../OperationButtons/FormPreviewOperationButtons';
import ChipBar from '../ChipBar/ChipBar';
import { MainGridHeadingTypography } from '../StyledComponents/Typographys.styles';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

interface Props {
  questionnaireResponse: QuestionnaireResponse;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
}
function FormPreview(props: Props) {
  const { questionnaireResponse, qrHasChanges, removeQrHasChanges, togglePreviewMode } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const sideBar = useContext(SideBarContext);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item || !questionnaireResponse.item) return null;

  const qForm = questionnaire.item[0];
  const qrForm = questionnaireResponse.item[0];

  if (qForm.item && qrForm.item) {
    return (
      <Grid container>
        <SideBarGrid item xs={12} lg={sideBar.isExpanded ? 1.75 : 0.5}>
          <SideBar>
            <FormPreviewOperationButtons
              togglePreviewMode={togglePreviewMode}
              qrHasChanges={qrHasChanges}
              removeQrHasChanges={removeQrHasChanges}
              questionnaireResponse={questionnaireResponse}
            />
          </SideBar>
        </SideBarGrid>
        <MainGrid item xs={12} lg={sideBar.isExpanded ? 10.25 : 11.5}>
          <MainGridContainerBox>
            <MainGridHeadingTypography>Preview</MainGridHeadingTypography>
            <ChipBar>
              <FormPreviewOperationButtons
                isChip={true}
                togglePreviewMode={togglePreviewMode}
                qrHasChanges={qrHasChanges}
                removeQrHasChanges={() => removeQrHasChanges}
                questionnaireResponse={questionnaireResponse}
              />
            </ChipBar>
            <Divider light />
            <Paper sx={{ p: 4 }}>
              <Preview />
            </Paper>
          </MainGridContainerBox>
        </MainGrid>
      </Grid>
    );
  } else {
    return <div>Questionnaire is invalid.</div>;
  }
}

export default FormPreview;
