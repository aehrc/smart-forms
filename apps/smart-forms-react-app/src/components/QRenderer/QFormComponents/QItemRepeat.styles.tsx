import { Stack, styled, Tooltip } from '@mui/material';

export const RepeatDeleteTooltip = styled(Tooltip)(() => ({
  marginLeft: 8
}));

export const RepeatItemContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: 4
}));

export const RepeatGroupContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: 16
}));
