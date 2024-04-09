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

import { useState } from 'react';
import useInitialiseGroupTable from './useInitialiseGroupTable';
import type { QuestionnaireResponseItem } from 'fhir/r4';

function useGroupTableRows(qrItems: QuestionnaireResponseItem[]) {
  const initialisedGroupTableRows = useInitialiseGroupTable(qrItems);

  const [tableRows, setTableRows] = useState(initialisedGroupTableRows);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialisedGroupTableRows.map((row) => row.nanoId)
  );

  return { tableRows, selectedIds, setTableRows, setSelectedIds };
}

export default useGroupTableRows;
