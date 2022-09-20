import * as FHIR from 'fhirclient';
import { Coding, ValueSet, ValueSetExpansionContains } from 'fhir/r5';

export class AnswerValueSet {
  static cache: Record<string, Coding[]> = {};

  static expand(valueSetUrl: string, setAnswerOptions: { (newOptions: ValueSet): void }) {
    const ontoserver = 'https://r4.ontoserver.csiro.au/fhir';

    FHIR.client({ serverUrl: ontoserver })
      .request({ url: 'ValueSet/$expand?url=' + valueSetUrl })
      .then((response) => {
        setAnswerOptions(response);
      })
      .catch((error) => console.log(error));
  }

  static getValueCodings(valueSetExpansionContains: ValueSetExpansionContains[]) {
    const valueCodings: Coding[] = [];
    valueSetExpansionContains.forEach((item) => {
      valueCodings.push({
        system: item.system,
        code: item.code,
        display: item.display
      });
    });
    return valueCodings;
  }
}
