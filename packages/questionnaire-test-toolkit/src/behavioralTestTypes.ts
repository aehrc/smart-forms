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

import type { Patient, Practitioner, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type { InAppExtractOutput } from '@aehrc/sdc-template-extract';
import type { FhirContext } from '@aehrc/sdc-populate';

export type RequestDefinition = {
  urlPrefix: string;
  params?: Record<string, string>;
  responseBody: unknown;
};

export interface BehavioralTestWrapperProps {
  patient?: Patient;
  user?: Practitioner;
  fhirContext?: FhirContext[];
  requestDefinitions?: RequestDefinition[];
  /**
   * An optional saved response to load, e.g. to resume an in-progress form or amend a completed
   * one. When supplied together with a patient, its answers take precedence over newly generated
   * population answers while population still runs to resolve patient/user/FHIR launch context.
   * When supplied without a patient, no population runs. Changing this prop rebuilds the form
   * from the new response.
   */
  questionnaireResponse?: QuestionnaireResponse;
  /**
   * An optional baseline for modified-only extraction. When supplied, the Save button extracts
   * only changes relative to this response instead of extracting everything. It is independent
   * of the loaded response: the test supplies the baseline explicitly and the wrapper never
   * refreshes it. Changing this prop updates the next extraction without rebuilding the form or
   * losing unsaved edits.
   */
  comparisonSourceResponse?: QuestionnaireResponse;
  onExtractResult?: (extractResult: InAppExtractOutput) => void;
  questionnaire: Questionnaire;
  /**
   * Terminology server passed to `buildForm`. Defaults to the exported `terminologyServerUrl`
   * constant (CSIRO's public Ontoserver). Override it when a suite cannot mock `fhirclient` and
   * must not reach that server.
   */
  terminologyServerUrl?: string;
}

/**
 * The minimal shape `invokeExtract` needs from the spy passed as `onExtractResult`: the arguments
 * of its most recent call. Declared structurally rather than as vitest's `Mock<...>` so that the
 * package's public types do not require a test runner to be resolvable in a consumer's project.
 * An untyped `vi.fn()` and an untyped `jest.fn()` both satisfy it.
 *
 * `lastCall` is deliberately `unknown[]` rather than a tuple of the extract output: an untyped
 * `vi.fn()` reports its arguments as `any[]`, which does not satisfy a tuple, and untyped spies are
 * what call sites actually pass.
 */
export interface ExtractResultSpy {
  readonly mock: {
    readonly lastCall?: readonly unknown[] | undefined;
    /**
     * All recorded calls, newest last. Optional so that hand-rolled structural spies without a
     * call log keep working; `invokeExtract` uses it when present to wait for the callback of the
     * click it just dispatched rather than accepting an earlier call.
     */
    readonly calls?: readonly unknown[][] | undefined;
  };
}
