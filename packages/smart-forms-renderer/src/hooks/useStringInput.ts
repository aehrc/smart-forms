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

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

// The purpose of this hook to sync the string state from external changes i.e. re-population changes etc.
function useStringInput(valueFromProps: string): [string, Dispatch<SetStateAction<string>>] {
  const [input, setInput] = useState(valueFromProps);

  useEffect(
    () => {
      if (input !== valueFromProps) {
        setInput(valueFromProps);
      }
    },
    // Only trigger this effect if prop value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valueFromProps]
  );

  return [input, setInput];
}

export default useStringInput;
