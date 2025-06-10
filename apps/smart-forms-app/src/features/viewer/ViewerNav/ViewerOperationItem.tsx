import { ListItemText } from '@mui/material';
import type { OperationItem } from '../../../types/Nav.interface.ts';
import { NavListItemButton, StyledNavItemIcon } from '../../../components/Nav/Nav.styles.ts';

function ViewerOperationItem(props: OperationItem) {
  const { title, icon, disabled, onClick } = props;

  return (
    <NavListItemButton
      role="button"
      disableGutters
      onClick={onClick}
      disabled={disabled}
      data-test="renderer-operation-item">
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </NavListItemButton>
  );
}

export default ViewerOperationItem;
