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

import type { QuestionnaireItem } from 'fhir/r4';

export interface GroupPrepopWarning {
  /** Names of the immediate child items (or child groups) that are affected. */
  fieldNames: string[];
  /** Human-readable reason sourced from the warning messages map. */
  reason: string;
}

/**
 * Returns true when the item itself or any of its descendants has a warning.
 */
function hasAffectedDescendant(
  item: QuestionnaireItem,
  warningMessages: Map<string, string>
): boolean {
  if (warningMessages.has(item.linkId)) return true;
  return (item.item ?? []).some((child) => hasAffectedDescendant(child, warningMessages));
}

/**
 * Collects all unique warning message strings from the item and all its descendants.
 */
function collectReasons(
  item: QuestionnaireItem,
  warningMessages: Map<string, string>,
  reasons: Set<string>
): void {
  const msg = warningMessages.get(item.linkId);
  if (msg) reasons.add(msg);
  item.item?.forEach((child) => collectReasons(child, warningMessages, reasons));
}

/**
 * Builds a {@link GroupPrepopWarning} for a group QuestionnaireItem.
 *
 * Instead of recursing all the way down to leaf items (which produces unhelpful repeated
 * labels like "Value, Date performed, Value, Date performed …"), this function stops at the
 * **nearest named ancestor** within the group.  The algorithm works as follows at each level:
 *
 * - If a child has its own text label and is directly affected (or contains affected
 *   descendants), its label is added to the list.
 * - If a child has **no text** (e.g. a layout-only `grid` container) but still has affected
 *   descendants, the function recurses transparently into that child's children so the first
 *   level of named items is collected instead.
 *
 * This handles the common case in Dev-715 where an "Examination" tab contains an unlabelled
 * grid group whose ROW items ("Body height", "Body weight" …) are the items we want to name.
 *
 * The `reason` field is taken directly from the warning messages already stored in the map
 * (e.g. "the required clinical data was not returned by the server"), so the tooltip shows
 * both *what* failed and *why*.
 *
 * Returns `null` when no descendant of the group has a warning.
 */
export function getGroupPrepopWarning(
  qItem: QuestionnaireItem,
  warningMessages: Map<string, string>
): GroupPrepopWarning | null {
  const fieldNames: string[] = [];
  const reasons = new Set<string>();

  function collectNearestNamed(items: QuestionnaireItem[]): void {
    for (const child of items) {
      const isDirectlyAffected = warningMessages.has(child.linkId);
      const hasAffectedChild = !isDirectlyAffected && hasAffectedDescendant(child, warningMessages);

      if (!isDirectlyAffected && !hasAffectedChild) continue;

      if (child.text) {
        // Named item — add it and stop descending
        fieldNames.push(child.text);
        collectReasons(child, warningMessages, reasons);
      } else {
        // Unnamed layout container (e.g. a grid group with no label) — skip it and
        // look at its children for the nearest named items instead
        collectNearestNamed(child.item ?? []);
        collectReasons(child, warningMessages, reasons);
      }
    }
  }

  collectNearestNamed(qItem.item ?? []);

  if (fieldNames.length === 0) return null;

  // Strip the leading "Could not be pre-filled: " prefix from stored messages to get a
  // clean reason clause, then use the first unique reason (they are almost always identical).
  const rawReason = reasons.size > 0 ? [...reasons][0] : '';
  const reasonClause = rawReason
    .replace(/^Could not be pre-(?:populated|filled):\s*/i, '')
    .replace(/\.$/, ''); // trim trailing full stop — we add our own below

  const reason =
    reasonClause.length > 0
      ? reasonClause.charAt(0).toUpperCase() + reasonClause.slice(1) + '.'
      : 'Pre-population failed.';

  return { fieldNames, reason };
}
