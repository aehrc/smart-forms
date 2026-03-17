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

import type { CodeSystemLookupPromise } from '../interfaces/expressions.interface';
import type { QuestionnaireResponseItem } from 'fhir/r4';
import { getCodeSystemLookupPromise } from '../api/lookupCodeSystem';
import type { FetchTerminologyCallback, FetchTerminologyRequestConfig } from '../interfaces';
import { resolveLookupPromises } from './resolveLookupPromises';

/**
 * Adds display values to valueCoding answers in a QuestionnaireResponse by performing CodeSystem $lookup if needed.
 */
export async function addDisplayToQuestionnaireResponseCodings(
  qrItems: QuestionnaireResponseItem[],
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<void> {
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  collectCodingsForLookup(
    qrItems,
    codeSystemLookupPromises,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  );

  const resolvedCodeSystemLookupPromises = await resolveLookupPromises(codeSystemLookupPromises);
  applyResolvedDisplays(qrItems, resolvedCodeSystemLookupPromises);
}

function collectCodingsForLookup(
  qrItems: QuestionnaireResponseItem[],
  codeSystemLookupPromises: Record<string, CodeSystemLookupPromise>,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): void {
  for (const item of qrItems) {
    for (const answer of item.answer ?? []) {
      if (answer.valueCoding && !answer.valueCoding.display) {
        getCodeSystemLookupPromise(
          answer.valueCoding,
          codeSystemLookupPromises,
          fetchTerminologyCallback,
          fetchTerminologyRequestConfig
        );
      }
      collectCodingsForLookup(
        answer.item ?? [],
        codeSystemLookupPromises,
        fetchTerminologyCallback,
        fetchTerminologyRequestConfig
      );
    }
    collectCodingsForLookup(
      item.item ?? [],
      codeSystemLookupPromises,
      fetchTerminologyCallback,
      fetchTerminologyRequestConfig
    );
  }
}

function applyResolvedDisplays(
  qrItems: QuestionnaireResponseItem[],
  resolved: Record<string, CodeSystemLookupPromise>
): void {
  for (const item of qrItems) {
    for (const answer of item.answer ?? []) {
      if (answer.valueCoding?.system && answer.valueCoding?.code) {
        const key = `system=${answer.valueCoding.system}&code=${answer.valueCoding.code}`;
        const resolvedLookup = resolved[key];
        if (resolvedLookup?.newCoding?.display) {
          answer.valueCoding.display = resolvedLookup.newCoding.display;
        }
      }
      applyResolvedDisplays(answer.item ?? [], resolved);
    }
    applyResolvedDisplays(item.item ?? [], resolved);
  }
}
