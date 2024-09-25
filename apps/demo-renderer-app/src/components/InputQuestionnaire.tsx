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

import LaunchButton from './LaunchButton.tsx';
import { useLocalStorage } from 'usehooks-ts';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { MoveRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';

interface InputPageProps {
  bearerToken: string | null;
}

function InputQuestionnaire(props: InputPageProps) {
  const { bearerToken } = props;

  const [input, setInput] = useLocalStorage('inputQuestionnaire', '');

  const sampleQuestionnaire =
    window.location.origin + '?url=https://smartforms.csiro.au/api/fhir/Questionnaire/Dev715';

  const inputUrl = window.location.origin + '?url=' + input;

  return (
    <>
      <div className="font-semibold">
        If you are planning to perform pre-population, get a bearer token first.
      </div>
      <div className="font-semibold">Bearer Token:</div>
      <div className="overflow-auto rounded-md border p-3 bg-white">{bearerToken ?? 'null'}</div>

      <LaunchButton />
      <hr />
      <div>
        Append a <b>{'?url={url_of_questionnaire_resource}'}</b> to the base url when you access
        this site.
      </div>
      <div>
        For example:{' '}
        <a href={sampleQuestionnaire} className="hover:underline">
          {sampleQuestionnaire}
        </a>
      </div>
      <div className="mt-2" />
      <div className="font-semibold">Alternatively, enter questionnaire url:</div>
      <div className="flex gap-1.5">
        Sample Questionnaires:
        <Badge
          className="cursor-pointer"
          onClick={() => {
            setInput(
              'https://smartforms.csiro.au/api/fhir/Questionnaire/CalculatedExpressionBMICalculatorPrepop'
            );
          }}>
          BMI Calculator
        </Badge>
        <Badge
          className="cursor-pointer"
          onClick={() => {
            setInput(
              'https://smartforms.csiro.au/api/fhir/Questionnaire/CalculatedExpressionCvdRiskCalculatorPrepop'
            );
          }}>
          Demo CVD Risk Calculator
        </Badge>
        <Badge
          className="cursor-pointer"
          onClick={() => {
            setInput('https://smartforms.csiro.au/api/fhir/Questionnaire/PatientDetailsTest');
          }}>
          Patient Details - From MBS715
        </Badge>
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)}></Textarea>
      <br />

      <a href={inputUrl}>
        <Button>
          Go to {inputUrl}
          <MoveRight className="ml-2 h-4 w-4" />
        </Button>
      </a>
    </>
  );
}

export default InputQuestionnaire;
