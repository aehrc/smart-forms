import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Container, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FemaleIcon from '@mui/icons-material/Female';
import EventIcon from '@mui/icons-material/Event';

function NavBar() {
  const patientName = 'María del Carmen';
  const gender = 'Female';
  const dateOfBirth = '01 Jan 1986 (36 yrs)';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6">Smart Health Checks</Typography>

            <Box sx={{ flexGrow: 0 }}>
              <Stack direction={'row'} spacing={4}>
                <Stack direction={'row'} spacing={1}>
                  <AccountCircleIcon />
                  <Typography>{patientName}</Typography>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                  <FemaleIcon />
                  <Typography>{gender}</Typography>
                </Stack>
                <Stack direction={'row'} spacing={1}>
                  <EventIcon />
                  <Typography>{dateOfBirth}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default NavBar;
