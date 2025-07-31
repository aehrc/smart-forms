/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { Link, Stack, Typography } from '@mui/material';

function RendererInfoFooter() {
  return (
    <Stack
      component="footer"
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        color: 'text.secondary',
        py: 1,
        mt: 2,
        gap: 1
      }}>
      <Stack direction="row" gap={1.5} alignItems="center">
        <Typography variant="body2">
          Powered by{' '}
          <Link
            href="https://www.npmjs.com/package/@aehrc/smart-forms-renderer"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary">
            CSIRO Smart Forms Questionnaire Renderer {stripCaretFromVersion(RENDERER_VERSION)}
          </Link>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          •
        </Typography>

        <Typography variant="body2">
          <Link
            href="https://github.com/aehrc/smart-forms/issues"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ color: 'text.secondary' }}>
            Report a bug
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
}

function stripCaretFromVersion(version: string): string {
  return version.startsWith('^') ? version.slice(1) : version;
}

export default RendererInfoFooter;
