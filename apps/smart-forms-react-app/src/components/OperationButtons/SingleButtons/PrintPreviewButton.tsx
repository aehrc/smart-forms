import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';

interface Props {
  handlePrint: () => unknown;
  isChip?: boolean;
}

function PrintPreviewButton(props: Props) {
  const { handlePrint, isChip } = props;
  const sideBar = React.useContext(SideBarContext);

  const buttonTitle = 'Print Preview';

  const renderButton = (
    <ListItemButton onClick={handlePrint}>
      <Print sx={{ mr: 2 }} />
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
      icon={<Print fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={handlePrint}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={handlePrint}>
            <Print />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default PrintPreviewButton;
