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

import { jsonTreeTheme } from '../../utils/jsonTreeTheme.ts';
import { JSONTree } from 'react-json-tree';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

interface DebugResponseViewProps {
  displayObject: Questionnaire | QuestionnaireResponse | Record<string, any> | null;
  showJsonTree: boolean;
}

function DebugResponseView(props: DebugResponseViewProps) {
  const { displayObject, showJsonTree } = props;

  return showJsonTree ? (
    <JSONTree
      data={displayObject}
      shouldExpandNodeInitially={() => true}
      theme={jsonTreeTheme}
      invertTheme
    />
  ) : (
    <pre
      style={{
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        fontSize: 9.5,
        backgroundColor: 'white'
      }}>
      {JSON.stringify(displayObject, null, 2)}
    </pre>
  );
}

export default DebugResponseView;
