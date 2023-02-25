import { styled } from '@mui/material/styles';
import { bgBlur } from '../StyledComponents/Utils.styles';
import { Paper } from '@mui/material';

const FOOTER_MOBILE = 20;

const FOOTER_DESKTOP = 20;

export const StyledRoot = styled(Paper)(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  minHeight: FOOTER_MOBILE,
  width: '100%',
  [theme.breakpoints.up('lg')]: {
    minHeight: FOOTER_DESKTOP
  },
  position: 'fixed',
  bottom: 0,
  right: 0
}));
