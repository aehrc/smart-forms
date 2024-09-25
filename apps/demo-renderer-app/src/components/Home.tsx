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

import { useQuery } from '@tanstack/react-query';
import type { Questionnaire } from 'fhir/r4';
import { fetchResource, questionnaireIsValid } from '../utils/fetchResource.ts';
import FormViewer from './FormViewer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { MoveLeft } from 'lucide-react';

interface HomeProps {
  questionnaireUrl: string;
  bearerToken: string | null;
}
function Home(props: HomeProps) {
  const { questionnaireUrl, bearerToken } = props;

  const { data: questionnaire, isFetching } = useQuery<Questionnaire>(
    ['questionnaire', questionnaireUrl],
    () => fetchResource(questionnaireUrl, bearerToken, true)
  );

  if (isFetching) {
    return <div>Loading questionnaire...</div>;
  }

  if (!questionnaire) {
    return (
      <>
        <div>
          Questionnaire <span className="font-semibold">{questionnaireUrl}</span> not found.{' '}
        </div>
        <a href={window.location.origin}>
          <Button>
            <MoveLeft className="mr-2 h-4 w-4" />
            Go back to {window.location.origin}
          </Button>
        </a>
      </>
    );
  }

  if (!questionnaireIsValid(questionnaire)) {
    return (
      <>
        <div>
          Questionnaire <span className="font-semibold">{questionnaireUrl}</span> is not valid.
        </div>
        <a href={window.location.origin}>
          <Button>
            <MoveLeft className="mr-2 h-4 w-4" />
            Go back to {window.location.origin}
          </Button>
        </a>
      </>
    );
  }

  return <FormViewer questionnaire={questionnaire} bearerToken={bearerToken} />;
}

export default Home;
