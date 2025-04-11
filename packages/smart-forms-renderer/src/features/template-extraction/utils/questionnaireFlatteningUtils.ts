import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

/**
 * Flattens a nested questionnaire structure into a flat structure
 * This is useful for template extraction when dealing with nested items
 * @param questionnaire The questionnaire to flatten
 * @returns A new questionnaire with flattened structure
 */
export function flattenQuestionnaire(questionnaire: Questionnaire): Questionnaire {
  const flattenedQuestionnaire: Questionnaire = {
    ...questionnaire,
    item: []
  };

  // Process each item recursively
  questionnaire.item?.forEach(item => {
    if (item.type === 'group') {
      // For group items, process their nested items
      processNestedItems(item, flattenedQuestionnaire.item!);
    } else {
      // For non-group items, add them directly
      flattenedQuestionnaire.item!.push(item);
    }
  });

  return flattenedQuestionnaire;
}

/**
 * Processes nested items and adds them to the flattened structure
 * @param groupItem The group item containing nested items
 * @param flattenedItems The array to add flattened items to
 */
function processNestedItems(groupItem: QuestionnaireItem, flattenedItems: QuestionnaireItem[]): void {
  groupItem.item?.forEach(item => {
    if (item.type === 'group') {
      // Recursively process nested groups
      processNestedItems(item, flattenedItems);
    } else {
      // For non-group items, create a new item with the group's linkId prefix
      const newItem: QuestionnaireItem = {
        ...item,
        linkId: `${groupItem.linkId}-${item.linkId}`
      };
      flattenedItems.push(newItem);
    }
  });
}

/**
 * Updates FHIRPath expressions in observation templates to handle flattened structure
 * @param questionnaire The questionnaire with observation templates
 * @returns A new questionnaire with updated FHIRPath expressions
 */
export function updateTemplateExpressions(questionnaire: Questionnaire): Questionnaire {
  const updatedQuestionnaire: Questionnaire = {
    ...questionnaire,
    contained: questionnaire.contained?.map(template => {
      if (template.resourceType === 'Observation') {
        // Update component expressions
        if (template.component) {
          template.component = template.component.map(component => ({
            ...component,
            extension: component.extension?.map(ext => {
              if (ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath') {
                // Update the FHIRPath expression to handle flattened structure
                const updatedExpression = ext.valueString?.replace(
                  /item\.where\(linkId='([^']+)'\)\.item\.where\(linkId='([^']+)'\)/g,
                  "item.where(linkId='$1-$2')"
                );
                return {
                  ...ext,
                  valueString: updatedExpression
                };
              }
              return ext;
            })
          }));
        }

        // Update main observation expression
        template.extension = template.extension?.map(ext => {
          if (ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-fhirPath') {
            // Update the FHIRPath expression to handle flattened structure
            const updatedExpression = ext.valueString?.replace(
              /item\.where\(linkId='([^']+)'\)\.item\.where\(linkId='([^']+)'\)/g,
              "item.where(linkId='$1-$2')"
            );
            return {
              ...ext,
              valueString: updatedExpression
            };
          }
          return ext;
        });
      }
      return template;
    })
  };

  return updatedQuestionnaire;
} 