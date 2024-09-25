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

import useQuestionnaireUrl from '@/hooks/useQuestionnaireUrl.ts';
import useBearerToken from '@/hooks/useBearerToken.ts';
import InputQuestionnaire from '@/components/InputQuestionnaire.tsx';
import Home from '@/components/Home.tsx';

function Router() {
  const questionnaireUrl = useQuestionnaireUrl();
  const bearerToken = useBearerToken();

  if (questionnaireUrl === '' || questionnaireUrl === null) {
    return <InputQuestionnaire bearerToken={bearerToken} />;
  }

  return <Home questionnaireUrl={questionnaireUrl} bearerToken={bearerToken} />;
}

export default Router;
