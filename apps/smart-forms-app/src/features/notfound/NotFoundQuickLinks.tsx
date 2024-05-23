/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ReactNode } from 'react';
import { Box, Card, Grid, IconButton, Stack, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StorageIcon from '@mui/icons-material/Storage';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';

interface QuickLinkCardProps {
  title: string;
  description: string;
  link: string;
  icon: ReactNode;
}

const quickLinkCards: QuickLinkCardProps[] = [
  {
    title: 'App Dashboard',
    description: 'View, create and edit responses from FHIR questionnaires.',
    link: 'https://smartforms.csiro.au',
    icon: <GridViewIcon fontSize="large" color="primary" />
  },
  {
    title: 'FHIR Implementation Guide',
    description: 'A FHIR Implementation Guide to support the use of Smart Forms.',
    link: 'https://smartforms.csiro.au/ig',
    icon: <LocalFireDepartmentIcon fontSize="large" color="primary" />
  },
  {
    title: 'Forms Server FHIR API',
    description: 'A Questionnaire-hosting FHIR API which supports the $assemble operation.',
    link: 'https://smartforms.csiro.au/api/fhir/Questionnaire',
    icon: <StorageIcon fontSize="large" color="primary" />
  },
  {
    title: 'EHR Launch Simulator',
    description: 'A minimal EHR testbed (SMART Launcher fork) for launching SMART apps.',
    link: 'https://ehr.smartforms.io',
    icon: <DataSaverOnIcon fontSize="large" color="primary" />
  },
  {
    title: 'GitHub',
    description: 'View the GitHub page for this open-source project.',
    link: 'https://github.com/aehrc/smart-forms',
    icon: <GitHubIcon fontSize="large" color="primary" />
  },
  {
    title: 'Documentation',
    description: 'Showcases Questionnaire components, SDC extensions and developer usage.',
    link: 'https://smartforms.csiro.au/docs',
    icon: <MenuBookIcon fontSize="large" color="primary" />
  }
];

function NotFoundQuickLinks() {
  return (
    <Grid container spacing={2}>
      {quickLinkCards.map((card) => (
        <Grid key={card.link} item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, pb: 2.5, height: '100%' }}>
            <Stack justifyContent="space-between" height="inherit">
              <Grid container spacing={1}>
                <Grid item xs={2}>
                  {card.icon}
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="h5" mb={1}>
                    {card.title}
                  </Typography>
                  <Typography>{card.description}</Typography>
                </Grid>
              </Grid>
              <Box display="flex" flexDirection="row-reverse">
                <IconButton color="primary" href={card.link}>
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default NotFoundQuickLinks;
