/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { Button } from '@mui/material';
import React, { useContext } from 'react';
import Iconify from '../../../Misc/Iconify';
import { SelectedQuestionnaireContext } from '../../../../custom-contexts/SelectedQuestionnaireContext';
import { useNavigate } from 'react-router-dom';

function BackToQuestionnairesButton() {
  const { existingResponses } = useContext(SelectedQuestionnaireContext);
  const navigate = useNavigate();

  return existingResponses.length > 0 ? (
    <Button
      variant="contained"
      endIcon={<Iconify icon="material-symbols:arrow-back" />}
      data-test="button-responses-go-back"
      sx={{
        px: 2.5,
        backgroundColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.dark'
        }
      }}
      onClick={() => {
        navigate('/questionnaires');
      }}>
      Go back
    </Button>
  ) : null;
}

export default BackToQuestionnairesButton;
