import type { QuestionnaireItem, QuestionnaireItemEnableWhen } from 'fhir/r5';

export function resolveDuplicateEnableWhenQuestions(
  qItem: QuestionnaireItem,
  duplicateLinkIds: Record<string, string>
) {
  const items = qItem.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    const resolvedItems: QuestionnaireItem[] = [];

    items.forEach((item) => {
      const resolvedItem = resolveDuplicateEnableWhenQuestions(item, duplicateLinkIds);
      if (resolvedItem) {
        resolvedItems.push(resolvedItem);
      } else {
        resolvedItems.push(item);
      }
    });
    qItem.item = resolvedItems;

    return resolveSingleItemEnableWhen(qItem, duplicateLinkIds);
  }

  return resolveSingleItemEnableWhen(qItem, duplicateLinkIds);
}

function resolveSingleItemEnableWhen(
  qItem: QuestionnaireItem,
  duplicateLinkIds: Record<string, string>
): QuestionnaireItem {
  if (qItem.enableWhen && qItem.enableWhen.length > 0) {
    const resolvedEnableWhen: QuestionnaireItemEnableWhen[] = [];
    for (const entry of qItem.enableWhen) {
      const duplicateLinkedItemId = duplicateLinkIds[entry.question];
      if (duplicateLinkedItemId) {
        entry.question = duplicateLinkedItemId;
      }
      resolvedEnableWhen.push(entry);
    }
    qItem.enableWhen = resolvedEnableWhen;
  }
  return qItem;
}
