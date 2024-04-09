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

import type { QuestionnaireResponseItem } from 'fhir/r4';
import { nanoid } from 'nanoid';
import type { GroupTableRowModel } from '../interfaces/groupTable.interface';

function useInitialiseGroupTable(qrItems: QuestionnaireResponseItem[]): GroupTableRowModel[] {
  let initialGroupTableRows: GroupTableRowModel[] = [
    {
      nanoId: nanoid(),
      qrItem: null
    }
  ];

  if (qrItems.length > 0) {
    initialGroupTableRows = qrItems.map((qrItem) => {
      return {
        nanoId: nanoid(),
        qrItem
      };
    });
  }

  return initialGroupTableRows;
}

export default useInitialiseGroupTable;
