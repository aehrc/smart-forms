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

import type { Identifier } from 'fhir/r4';

/**
 * Represents a contextual FHIR resource reference passed during app launch.
 *
 * Used in the `fhirContext` array to describe resources relevant to the launch,
 * excluding `Patient` and `Encounter` which remain top-level parameters unless a custom role is specified.
 *
 * At least one of `reference`, `canonical`, or `identifier` must be present.
 *
 * Properties:
 * - `reference`: A relative reference to a FHIR resource (e.g. "Observation/123").
 * - `canonical`: A canonical URL referencing the resource (optionally with version).
 * - `identifier`: A FHIR `Identifier` object used to locate the resource.
 * - `type`: The resource type (e.g. "Observation"). Recommended when using `canonical` or `identifier`.
 * - `role`: URI describing the role of the context resource. If omitted, defaults to `"launch"`.
 *           Use an absolute URI unless using a predefined role from the fhirContext Role Registry.
 *
 * Notes:
 * - Multiple `fhirContext` items may reference the same resource type.
 * - When `role` is `"launch"`, it indicates the app was launched in context of that resource.
 * - `Patient` and `Encounter` are only allowed in `fhirContext` if a non-launch role is specified.
 */
export interface FhirContext {
  role?: string;
  type?: string;
  canonical?: string;
  reference?: string;
  identifier?: Identifier;
  [key: string]: unknown;
}
