import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  isChip: boolean;
}

function BackToPickerButton(props: Props) {
  const { isChip } = props;
  const pageSwitcher = React.useContext(PageSwitcherContext);

  function handleClick() {
    pageSwitcher.goToPage(PageType.Picker);
  }

  const renderButtonOrChip = !isChip ? (
    <ListItemButton onClick={handleClick}>
      <ArrowBack sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Back to Questionnaires
          </Typography>
        }
      />
    </ListItemButton>
  ) : (
    <OperationChip
      icon={<ArrowBack fontSize="small" />}
      label="Back to Questionnaires"
      clickable
      onClick={handleClick}
    />
  );

  return <>{renderButtonOrChip}</>;
}

export default BackToPickerButton;
