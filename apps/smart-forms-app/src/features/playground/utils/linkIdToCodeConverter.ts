// Utility to map custom linkIds to template ids in a QuestionnaireResponse
// Example mapping: { height: 'obsTemplateHeight', weight: 'obsTemplateWeight' }

const linkIdToTemplateId: Record<string, string> = {
  height: 'obsTemplateHeight',
  weight: 'obsTemplateWeight',
  complication: 'obsTemplate',
  // Add more mappings as needed
};

// Recursively convert linkIds in QuestionnaireResponse items
function convertLinkIdsToTemplateIds(items: any[]): any[] {
  return items.map(item => {
    const newItem = { ...item };
    if (linkIdToTemplateId[newItem.linkId]) {
      newItem.linkId = linkIdToTemplateId[newItem.linkId];
    }
    if (newItem.item) {
      newItem.item = convertLinkIdsToTemplateIds(newItem.item);
    }
    return newItem;
  });
}

// Main function to convert a QuestionnaireResponse
export function convertQuestionnaireResponseLinkIds(qr: any): any {
  if (!qr.item) return qr;
  return {
    ...qr,
    item: convertLinkIdsToTemplateIds(qr.item)
  };
} 