import { FormGroup, RadioGroup, styled } from '@mui/material';
import MuiMarkdown from 'mui-markdown';

export const QFormGroup = styled(FormGroup)(() => ({
  marginBottom: '4px'
}));

export const QRadioGroup = styled(RadioGroup)(() => ({
  marginBottom: '4px'
}));

export const QItemLabelMarkdown = styled(MuiMarkdown)(() => ({
  marginTop: '4px'
}));
