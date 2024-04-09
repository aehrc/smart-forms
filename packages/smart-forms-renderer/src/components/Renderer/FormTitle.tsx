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

import React, { memo } from 'react';
import type { Questionnaire } from 'fhir/r4';
import parse from 'html-react-parser';
import { getXHtmlStringFromQuestionnaire } from '../../utils/qItem';
import { FormTitleWrapper } from '../Box.styles';
import Typography from '@mui/material/Typography';

interface FormTitleProps {
  questionnaire: Questionnaire;
}

const FormTitle = memo(function FormTitle(props: FormTitleProps) {
  const { questionnaire } = props;

  const xHtmlString = getXHtmlStringFromQuestionnaire(questionnaire);
  const formTitle = xHtmlString ? parse(xHtmlString) : questionnaire.title;

  return (
    <FormTitleWrapper>
      <Typography variant="h3" data-test="form-heading">
        {formTitle}
      </Typography>
    </FormTitleWrapper>
  );
});

export default FormTitle;
