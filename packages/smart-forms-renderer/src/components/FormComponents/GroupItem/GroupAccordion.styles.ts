import { styled } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';

export const StyledGroupAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== 'elevation'
})<{ elevation: number }>(({ elevation }) => ({
  paddingTop: '8px',
  paddingBottom: '4px',
  paddingLeft: elevation === 1 ? '10px' : '8px',
  paddingRight: elevation === 1 ? '10px' : '8px',
  marginBottom: '28px'
}));
