import React, { useContext } from 'react';
import ListItemText from '@mui/material/ListItemText';
import { Save, Publish, Visibility, ChangeCircle } from '@mui/icons-material';
import { Box, ListItemButton, Typography } from '@mui/material';
import { QuestionnaireActiveContext } from '../../../custom-contexts/QuestionnaireActiveContext';
import { PreviewModeContext } from '../../../custom-contexts/PreviewModeContext';
import { CardOverlineTypography } from '../../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../../StyledComponents/Lists.styles';

function SideBarOperationList() {
  const questionnaireActiveContext = useContext(QuestionnaireActiveContext);
  const previewModeContext = useContext(PreviewModeContext);

  return (
    <Box sx={{ my: 1 }}>
      <CardOverlineTypography variant="overline">Operations</CardOverlineTypography>
      <SecondaryNonSelectableList disablePadding>
        <ListItemButton onClick={() => questionnaireActiveContext.setQuestionnaireActive(false)}>
          <ChangeCircle sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <Typography fontSize={12} variant="h6">
                Change Questionnaire
              </Typography>
            }
          />
        </ListItemButton>

        <ListItemButton onClick={() => previewModeContext.setIsPreviewMode(true)}>
          <Visibility sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <Typography fontSize={12} variant="h6">
                View Preview
              </Typography>
            }
          />
        </ListItemButton>

        <ListItemButton>
          <Save sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <Typography fontSize={12} variant="h6">
                Save
              </Typography>
            }
          />
        </ListItemButton>

        <ListItemButton>
          <Publish sx={{ mr: 2 }} />
          <ListItemText
            primary={
              <Typography fontSize={12} variant="h6">
                Submit
              </Typography>
            }
          />
        </ListItemButton>
      </SecondaryNonSelectableList>
    </Box>
  );
}

export default SideBarOperationList;
