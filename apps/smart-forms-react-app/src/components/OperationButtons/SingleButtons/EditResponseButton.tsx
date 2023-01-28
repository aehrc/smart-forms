import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';

interface Props {
  isChip?: boolean;
}

function EditResponseButton(props: Props) {
  const { isChip } = props;
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const sideBar = React.useContext(SideBarContext);

  function handleClick() {
    pageSwitcher.goToPage(PageType.Renderer);
  }

  const buttonTitle = 'Edit Response';

  const renderButton = (
    <ListItemButton onClick={handleClick}>
      <Edit sx={{ mr: 2 }} />
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
      icon={<Edit fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={handleClick}>
            <Edit fontSize="small" />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default EditResponseButton;
