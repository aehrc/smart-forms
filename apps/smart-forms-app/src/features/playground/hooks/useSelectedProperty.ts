/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

function useSelectedProperty<T extends Record<string, () => any>>(
  selectedPropKey: keyof T | string,
  storeHooks: T
): {
  selectedPropVal: any;
  allPropKeys: string[];
} {
  const valueMap = Object.fromEntries(
    Object.keys(storeHooks).map((name) => [name, storeHooks[name as keyof T]()])
  );

  // Filter out keys whose values are functions
  const allPropKeys = Object.keys(valueMap).filter((key) => typeof valueMap[key] !== 'function');

  return {
    selectedPropVal:
      selectedPropKey in valueMap ? valueMap[selectedPropKey as keyof typeof valueMap] : null,
    allPropKeys: allPropKeys
  };
}

export default useSelectedProperty;
