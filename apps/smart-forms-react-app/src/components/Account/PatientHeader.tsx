import { Avatar, Box, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { AccountDetailsTypography, AccountNameTypography } from '../Misc/Typography';
import FaceIcon from '@mui/icons-material/Face';
import { constructName } from '../../functions/LaunchContextFunctions';
import dayjs from 'dayjs';

function PatientHeader() {
  const theme = useTheme();
  const { patient } = useContext(LaunchContext);

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
        <FaceIcon sx={{ color: theme.palette.common.white }} />
      </Avatar>
      <Box>
        <AccountNameTypography name={patient ? constructName(patient.name) : 'No Patient'} />
        {patient ? (
          <>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccountDetailsTypography details={`${patient.gender}`} />
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title={dayjs(patient.birthDate).format('LL')}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }} noWrap>
                  {`${dayjs().diff(dayjs(patient.birthDate), 'year').toString()} years`}
                </Typography>
              </Tooltip>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}

export default PatientHeader;
