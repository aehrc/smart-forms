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

import type { Theme } from '@mui/material/styles';
import { alpha, styled } from '@mui/material/styles';
import { OutlinedInput, Toolbar } from '@mui/material';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const StyledRoot = styled(Toolbar)(({ theme }) => ({
  height: 80,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5, 1, 0, 3),
  gap: theme.spacing(2)
}));

export const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 320,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': {
    width: '100%',
    boxShadow: theme.shadows[4]
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`
  }
}));

export function getResponseSearchStyles(theme: Theme) {
  return {
    transition: theme.transitions.create(['box-shadow', 'width'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.shorter
    }),
    '&.Mui-focused': {
      boxShadow: theme.shadows[4]
    },
    '& fieldset': {
      borderWidth: `1px !important`,
      borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`
    }
  };
}

export function getResponseToolBarColors(
  selected: QuestionnaireResponse | null,
  selectedQuestionnaire: Questionnaire | null,
  existingResponses: QuestionnaireResponse[]
) {
  if (selected) {
    return {
      color: 'primary.main',
      bgcolor: '#D6EBFC'
    };
  }

  if (selectedQuestionnaire && existingResponses.length > 0) {
    return {
      color: 'secondary.main',
      bgcolor: '#D3EBDD'
    };
  }

  return {};
}

export function getQuestionnaireToolBarColors(selected: Questionnaire | null) {
  return {
    ...(selected && {
      color: 'primary.main',
      bgcolor: '#D6EBFC'
    })
  };
}

export function getExistingResponsesToolBarColors(selected: QuestionnaireResponse | null) {
  return {
    ...(selected
      ? {
          color: 'primary.main',
          bgcolor: '#D6EBFC'
        }
      : {
          color: 'secondary.main',
          bgcolor: '#D3EBDD'
        })
  };
}
