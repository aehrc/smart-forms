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

/**
 * Separator used to build instance-scoped validation error keys.
 * The triple-slash is chosen to be extremely unlikely to appear in a Questionnaire linkId.
 */
const REPEAT_INSTANCE_SEPARATOR = '///';

/**
 * Builds the key used to store/look up a validation OperationOutcome in `invalidItems`.
 *
 * For non-repeating items (empty path) the key is simply the `linkId`, so behaviour is unchanged.
 * For items inside one or more repeating group instances, the key is suffixed with the path of
 * enclosing instance indices (e.g. `myField///1` or `myField///0.2` when nested). This lets each
 * repeat instance track its own validation errors instead of all instances sharing a single key.
 *
 * @author Clinton Gillespie
 */
export function getValidationErrorKey(linkId: string, repeatInstancePath?: number[]): string {
  if (!repeatInstancePath || repeatInstancePath.length === 0) {
    return linkId;
  }

  return `${linkId}${REPEAT_INSTANCE_SEPARATOR}${repeatInstancePath.join('.')}`;
}

/**
 * Recovers the base `linkId` from an instance-scoped validation error key produced by
 * {@link getValidationErrorKey}. Useful for consumers that need to map error keys back to
 * Questionnaire items (e.g. finding which tab contains the first error).
 *
 * @author Clinton Gillespie
 */
export function getBaseLinkIdFromErrorKey(errorKey: string): string {
  const separatorIndex = errorKey.indexOf(REPEAT_INSTANCE_SEPARATOR);
  return separatorIndex === -1 ? errorKey : errorKey.slice(0, separatorIndex);
}
