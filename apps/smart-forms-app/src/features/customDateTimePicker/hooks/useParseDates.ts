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

import { parseInputToDateOptions } from '../lib/parseDates.ts';

function useParseDates(input: string): {
  dateOptions: string[];
  seperator: string;
} {
  // No options displayed when input is empty or search term is less than 2 characters
  if (input.length === 0 || (input.length < 2 && input.length > 0)) {
    return { dateOptions: [], seperator: '' };
  }

  const { dateOptions, seperator } = parseInputToDateOptions(input);

  return { dateOptions, seperator };
}

export default useParseDates;
