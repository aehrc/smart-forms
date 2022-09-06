import * as FHIR from 'fhirclient';
import { ValueSet, ValueSetExpansionContains } from 'fhir/r5';
import { fhirclient } from 'fhirclient/lib/types';

export class AnswerValueSet {
  static cache: Record<string, fhirclient.FHIR.Coding[]> = {};

  static expand(
    valueSetUrl: string,
    callback: { (newOptions: ValueSet): void; (arg0: ValueSet): void }
  ) {
    const ontoserver = 'https://r4.ontoserver.csiro.au/fhir';

    FHIR.client({ serverUrl: ontoserver })
      .request({ url: 'ValueSet/$expand?url=' + valueSetUrl })
      .then((res) => {
        callback(res);
      })
      .catch((error) => console.log(error));
  }

  static getValueCodings(valueSetExpansionContains: ValueSetExpansionContains[]) {
    const valueCodings: fhirclient.FHIR.Coding[] = [];
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
