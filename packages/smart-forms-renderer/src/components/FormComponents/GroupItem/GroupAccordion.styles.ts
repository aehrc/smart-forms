import { styled } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';

export const GroupAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== 'elevation' && prop !== 'isRepeated'
})<{ elevation: number; isRepeated: boolean }>(({ elevation, isRepeated }) => ({
  paddingTop: '4px',
  paddingBottom: '4px',
  paddingLeft: elevation === 1 ? '10px' : '18px',
  paddingRight: elevation === 1 ? '10px' : '18px',
  marginBottom: isRepeated ? 0 : '28px'
}));
