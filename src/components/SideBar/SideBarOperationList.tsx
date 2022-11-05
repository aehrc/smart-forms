import React from 'react';
import { Box } from '@mui/material';
import { CardOverlineTypography } from '../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../StyledComponents/Lists.styles';
import ChangeQuestionnaireButton from './OperationButtons/ChangeQuestionnaireButton';
import ViewFormPreviewButton from './OperationButtons/ViewFormPreviewButton';
import SaveAsDraftButton from './OperationButtons/SaveAsDraftButton';
import SaveAsFinalButton from './OperationButtons/SaveAsFinalButton';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import RefreshQuestionnaireListButton from './OperationButtons/RefreshQuestionnaireListButton';
import BackToFormButton from './OperationButtons/BackToFormButton';
import { PageType } from '../../interfaces/Enums';
import BackToPickerButton from './OperationButtons/BackToPickerButton';
import EditResponseButton from './OperationButtons/EditResponseButton';

function SideBarOperationList() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  function RenderButtons() {
    switch (pageSwitcher.currentPage) {
      case PageType.Picker:
        return <RefreshQuestionnaireListButton />;
      case PageType.Renderer:
        return (
          <>
            <ChangeQuestionnaireButton />
            <ViewFormPreviewButton />
            <SaveAsDraftButton />
            <SaveAsFinalButton />
          </>
        );
      case PageType.FormPreview:
        return (
          <>
            <BackToFormButton />
            <SaveAsDraftButton />
            <SaveAsFinalButton />
          </>
        );
      case PageType.ResponsePreview:
        return (
          <>
            <BackToPickerButton />
            <EditResponseButton />
          </>
        );
      default:
        return <>Invalid current page</>;
    }
  }
  return (
    <Box sx={{ my: 1 }}>
      <CardOverlineTypography variant="overline">Operations</CardOverlineTypography>
      <SecondaryNonSelectableList disablePadding>
        <RenderButtons />
      </SecondaryNonSelectableList>
    </Box>
  );
}

export default SideBarOperationList;
