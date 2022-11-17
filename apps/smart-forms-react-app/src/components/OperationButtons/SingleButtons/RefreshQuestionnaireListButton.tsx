import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Sync } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  isChip: boolean;
  refreshQuestionnaireList: () => unknown;
}
function RefreshQuestionnaireListButton(props: Props) {
  const { isChip, refreshQuestionnaireList } = props;

  const renderButtonOrChip = !isChip ? (
    <ListItemButton onClick={refreshQuestionnaireList}>
      <Sync sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Refresh Questionnaires
          </Typography>
        }
      />
    </ListItemButton>
  ) : (
    <OperationChip
      icon={<Sync fontSize="small" />}
      label="Refresh Questionnaires"
      clickable
      onClick={refreshQuestionnaireList}
    />
  );
  return <>{renderButtonOrChip}</>;
}

export default RefreshQuestionnaireListButton;
