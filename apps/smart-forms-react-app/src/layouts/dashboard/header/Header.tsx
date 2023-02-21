// @mui
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
// utils
// components
import Iconify from '../../../components/Iconify';
//
import Searchbar from './SearchBar';
import { StyledRoot, StyledToolbar } from './Header.styles';
import React from 'react';
import FaceIcon from '@mui/icons-material/Face';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

interface Props {
  onOpenNav: () => void;
}

function Header(props: Props) {
  const { onOpenNav } = props;

  return (
    <StyledRoot>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            display: { lg: 'none' }
          }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        <Searchbar />
        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1
          }}>
          <Box display="flex" alignItems="center" gap={1.75} sx={{ my: 1.5, px: 2.5 }}>
            <Tooltip title={'Patient'}>
              <FaceIcon fontSize="large" sx={{ color: 'text.primary' }} />
            </Tooltip>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {'Mr. Benito Lucio'}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {'Male'}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {'86 years'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1.75} sx={{ my: 1.5, px: 2.5 }}>
            <Tooltip title={'User'}>
              <MedicalServicesIcon fontSize="large" sx={{ color: 'text.primary' }} />
            </Tooltip>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }} noWrap>
                {'Dr. Sara Angulo'}
              </Typography>
            </Box>
          </Box>

          {/*<AccountPopover*/}
          {/*  patientName={'Mr. Benito Lucio'}*/}
          {/*  patientGender={'Male'}*/}
          {/*  patientAge={'86 years'}*/}
          {/*  patientDOB={'August 18, 1936'}*/}
          {/*  displayIcon={<FaceIcon fontSize="large" />}*/}
          {/*/>*/}
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}

export default Header;
