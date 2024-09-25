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

import { QueryClientProvider } from '@tanstack/react-query';
import type { SmartFormsRendererProps } from '@aehrc/smart-forms-renderer';
import {
  BaseRenderer,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient
} from '@aehrc/smart-forms-renderer';

function CsiroRenderer(props: SmartFormsRendererProps) {
  const {
    questionnaire,
    questionnaireResponse,
    additionalVariables,
    terminologyServerUrl,
    readOnly
  } = props;

  const isLoading = useBuildForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables
  );
  const queryClient = useRendererQueryClient();

  if (isLoading) {
    return <div>Loading questionnaire...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default CsiroRenderer;
