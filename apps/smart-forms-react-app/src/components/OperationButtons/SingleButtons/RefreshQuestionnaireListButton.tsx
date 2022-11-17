import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Sync } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation } from '../../../interfaces/Enums';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

interface Props {
  buttonOrChip: Operation;
  refreshQuestionnaireList: () => unknown;
}
function RefreshQuestionnaireListButton(props: Props) {
  const { buttonOrChip, refreshQuestionnaireList } = props;

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
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
