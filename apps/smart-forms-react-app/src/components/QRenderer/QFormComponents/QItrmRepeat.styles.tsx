import { Stack, styled, Tooltip } from '@mui/material';

export const RepeatDeleteTooltip = styled(Tooltip)(() => ({
  marginLeft: '8px',
  display: 'none'
}));

export const RepeatItemContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: '16px',
  '&:hover': { '& .repeat-item-delete': { display: 'flex' } }
}));

export const RepeatGroupContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: '16px',
  '&:hover': { '& .repeat-group-delete': { display: 'flex' } }
}));
