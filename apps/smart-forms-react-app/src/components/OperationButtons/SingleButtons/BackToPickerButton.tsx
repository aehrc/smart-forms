import React, { useContext } from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
}

function BackToPickerButton(props: Props) {
  const { isChip } = props;
  const pageSwitcher = useContext(PageSwitcherContext);
  const sideBar = useContext(SideBarContext);

  function handleClick() {
    pageSwitcher.goToPage(PageType.Picker);
  }

  const buttonTitle = 'Back to Questionnaires';

  const renderButton = (
    <ListItemButton onClick={handleClick}>
      <AssignmentReturnIcon sx={{ mr: 2 }} />
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
      icon={<AssignmentReturnIcon fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={handleClick}>
            <AssignmentReturnIcon />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default BackToPickerButton;
