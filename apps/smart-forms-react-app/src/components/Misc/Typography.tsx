import { Typography } from '@mui/material';
import React from 'react';

export function AccountNameTypography(props: { name: string }) {
  const { name } = props;

  return (
    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
      {name}
    </Typography>
  );
}

export function AccountNameTypographyNoWrap(props: { name: string }) {
  const { name } = props;

  return (
    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }} noWrap>
      {name}
    </Typography>
  );
}

export function AccountDetailsTypography(props: { details: string }) {
  const { details } = props;

  return (
    <Typography
      variant="body2"
      sx={{ color: 'text.secondary', fontSize: 12, textTransform: 'capitalize' }}
      noWrap>
      {details}
    </Typography>
  );
}

export function AccountDetailsTypographyNoCaps(props: { details: string }) {
  const { details } = props;

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }} noWrap>
      {details}
    </Typography>
  );
}
