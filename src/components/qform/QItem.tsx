import React from 'react';
import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';

export class QItem {
  item: QuestionnaireItem;

  constructor(item: QuestionnaireItem) {
    this.item = item;
  }

  getInstruction(): string | null {
    const extension = this.item.extension?.find(
      (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-instruction'
    );
    if (extension) {
      return extension.valueString;
    }
    return null;
  }
}
