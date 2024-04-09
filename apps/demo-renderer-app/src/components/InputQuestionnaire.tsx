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
      <p>If you are planning to perform pre-population, get a bearer token first.</p>
      <div style={{ fontSize: '0.875em' }}>
        Bearer Token: {bearerToken ?? 'null'}
        <LaunchButton />
      </div>
      <hr />
      <p>
        Append a <b>{'?url={url_of_questionnaire_resource}'}</b> to the base url when you access
        this site.
      </p>
      <p>
        For example: <a href={sampleQuestionnaire}>{sampleQuestionnaire}</a>
      </p>
      <p>Alternatively, enter questionnaire url:</p>
      <textarea
        value={input}
        style={{ width: '600px' }}
        onChange={(e) => setInput(e.target.value)}></textarea>
      <br />
      <a href={inputUrl}>
        <button className="increase-button-hitbox">Go to {inputUrl}</button>
      </a>
    </>
  );
}

export default InputQuestionnaire;
