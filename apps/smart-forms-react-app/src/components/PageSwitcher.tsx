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

import React, { useContext, useEffect } from 'react';
import { PageSwitcherContext } from '../custom-contexts/PageSwitcherContext';
import { PageType } from '../interfaces/Enums';
import Picker from './Picker/Picker';
import { QuestionnaireProviderContext } from '../App';
import ResponsePreview from './Preview/ResponsePreview';
import { Box } from '@mui/material';

function PageSwitcher() {
  const { currentPage, goToPage } = useContext(PageSwitcherContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);

  useEffect(() => {
    if (!questionnaireProvider.questionnaire.item) {
      goToPage(PageType.Picker);
    }
  }, []);

  function RenderPage() {
    switch (currentPage) {
      case PageType.ResponsePreview:
        return <ResponsePreview />;
      case PageType.Picker:
        return <Picker />;
      default:
        return <Box />;
    }
  }

  return <RenderPage />;
}

export default PageSwitcher;
