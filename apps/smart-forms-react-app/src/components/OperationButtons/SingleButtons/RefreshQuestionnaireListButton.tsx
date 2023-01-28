import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { Sync } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
  refreshQuestionnaireList: () => unknown;
}
function RefreshQuestionnaireListButton(props: Props) {
  const { isChip, refreshQuestionnaireList } = props;
  const sideBar = React.useContext(SideBarContext);

  const buttonTitle = 'Refresh Questionnaires';

  const renderButton = (
    <ListItemButton onClick={refreshQuestionnaireList}>
      <Sync sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            {buttonTitle}
          </Typography>
        }
      />
    </ListItemButton>
  );

  const renderChip = (
    <OperationChip
      icon={<Sync fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={refreshQuestionnaireList}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={refreshQuestionnaireList}>
            <Sync />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default RefreshQuestionnaireListButton;
