import type { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';

/**
 * Constants for template extraction extensions
 */
export const FHIR_TEMPLATE_EXTRACT_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract';

/**
 * Finds a matching questionnaire item for a given template, with enhanced support for BP templates
 * 
 * @param items - Questionnaire items to search through
 * @param templateId - ID of the template to match
 * @param templateResourceType - Resource type of the template
 * @param templateCoding - Coding array from template.code
 * @returns Matched questionnaire item or null if no match found
 */
export function findMatchingItem(
  items: QuestionnaireItem[] | undefined,
  templateId: string,
  templateResourceType: string,
  templateCoding: any[] | undefined
): QuestionnaireItem | null {
  if (!items) return null;
  
  for (const item of items) {
    // Check for direct template reference first - this is the standard way
    const templateRef = item.extension?.find(ext => 
      ext.url === FHIR_TEMPLATE_EXTRACT_EXTENSION &&
      ext.extension?.some(subExt => 
        subExt.url === 'template' && 
        subExt.valueReference?.reference === `#${templateId}`
      )
    );
    
    if (templateRef) {
      console.log(`Found direct template reference match for ${templateId}: ${item.linkId}`);
      return item;
    }
    
    // Special handling for blood pressure templates
    if (templateResourceType === 'Observation' && templateCoding && templateCoding.length > 0) {
      // Check if this is a BP template
      const isSystolic = templateCoding.some(c => 
        c.code === '8480-6' || 
        (c.display && c.display.toLowerCase().includes('systolic'))
      );
      
      const isDiastolic = templateCoding.some(c => 
        c.code === '8462-4' || 
        (c.display && c.display.toLowerCase().includes('diastolic'))
      );
      
      if (isSystolic || isDiastolic) {
        // Match BP templates to items by text or linkId
        const itemHasSystolicText = item.text && item.text.toLowerCase().includes('systolic');
        const itemHasSystolicLinkId = item.linkId.toLowerCase().includes('systolic');
        const itemHasDiastolicText = item.text && item.text.toLowerCase().includes('diastolic');
        const itemHasDiastolicLinkId = item.linkId.toLowerCase().includes('diastolic');
        
        if ((isSystolic && (itemHasSystolicText || itemHasSystolicLinkId)) ||
            (isDiastolic && (itemHasDiastolicText || itemHasDiastolicLinkId))) {
          console.log(`Found match for BP template ${templateId} with item ${item.linkId}`);
          return item;
        }
      }
    }
    
    // Recursively check child items
    if (item.item) {
      const found = findMatchingItem(item.item, templateId, templateResourceType, templateCoding);
      if (found) return found;
    }
  }
  
  return null;
} 