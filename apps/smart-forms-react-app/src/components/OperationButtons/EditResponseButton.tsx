import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation, PageType } from '../../interfaces/Enums';
import { OperationChip } from '../ChipBar/ChipBar.styles';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';

interface Props {
  buttonOrChip: Operation;
}

function EditResponseButton(props: Props) {
  const { buttonOrChip } = props;
  const pageSwitcher = React.useContext(PageSwitcherContext);

  function handleClick() {
    pageSwitcher.goToPage(PageType.Renderer);
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
      <ListItemButton onClick={handleClick}>
        <Edit sx={{ mr: 2 }} />
        <ListItemText
          primary={
            <Typography fontSize={12} variant="h6">
              Edit Response
            </Typography>
          }
        />
      </ListItemButton>
    ) : (
      <OperationChip
        icon={<Edit fontSize="small" />}
        label="Edit Response"
        clickable
        onClick={handleClick}
      />
    );

  return <>{renderButtonOrChip}</>;
}

export default EditResponseButton;
