import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
  togglePreviewMode: () => unknown;
}

function ContinueEditingButton(props: Props) {
  const { isChip, togglePreviewMode } = props;
  const sideBar = React.useContext(SideBarContext);

  function handleClick() {
    togglePreviewMode();
  }

  const buttonTitle = 'Continue Editing';

  const renderButton = (
    <ListItemButton onClick={handleClick}>
      <ArrowBack sx={{ mr: 2 }} />
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
      icon={<ArrowBack fontSize="small" />}
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
            <ArrowBack fontSize="small" />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default ContinueEditingButton;
