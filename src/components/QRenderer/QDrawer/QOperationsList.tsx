import React, { useContext } from 'react';
import ListItemText from '@mui/material/ListItemText';
import { Save, Publish, Visibility, ChangeCircle } from '@mui/icons-material';
import {
  DrawerOperationList,
  DrawerOperationTypography,
  DrawerSubTitleTypography
} from './QDrawerList.styles';
import { Box, ListItemButton } from '@mui/material';
import { QuestionnaireActiveContext } from '../../../custom-contexts/QuestionnaireActiveContext';
import { PreviewModeContext } from '../../../custom-contexts/PreviewModeContext';

function QOperationList() {
  const questionnaireActiveContext = useContext(QuestionnaireActiveContext);
  const previewModeContext = useContext(PreviewModeContext);

  return (
    <Box sx={{ my: 1 }}>
      <DrawerSubTitleTypography variant="overline">Operations</DrawerSubTitleTypography>
      <DrawerOperationList dense disablePadding>
        <ListItemButton onClick={() => questionnaireActiveContext.setQuestionnaireActive(false)}>
          <ChangeCircle sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <DrawerOperationTypography variant={'h6'}>
                Change Questionnaire
              </DrawerOperationTypography>
            }
          />
        </ListItemButton>

        <ListItemButton onClick={() => previewModeContext.setIsPreviewMode(true)}>
          <Visibility sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <DrawerOperationTypography variant={'h6'}>View Preview</DrawerOperationTypography>
            }
          />
        </ListItemButton>

        <ListItemButton>
          <Save sx={{ mr: 2 }} />
          <ListItemText
            primary={<DrawerOperationTypography variant={'h6'}>Save</DrawerOperationTypography>}
          />
        </ListItemButton>

        <ListItemButton>
          <Publish sx={{ mr: 2 }} />
          <ListItemText
            primary={<DrawerOperationTypography variant={'h6'}>Submit</DrawerOperationTypography>}
          />
        </ListItemButton>
      </DrawerOperationList>
    </Box>
  );
}

export default QOperationList;
