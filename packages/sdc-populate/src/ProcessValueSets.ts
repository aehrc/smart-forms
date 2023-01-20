import type { QuestionnaireItem } from 'fhir/r5';
import type { ValueSetPromise } from './Interfaces';
import * as FHIR from 'fhirclient';

export function getValueSetPromise(
  qItem: QuestionnaireItem,
  fullUrl: string,
  value: string,
  valueSetPromiseMap: Record<string, ValueSetPromise>
) {
  const ontoserver = process.env.REACT_APP_ONTOSERVER_URL ?? 'https://r4.ontoserver.csiro.au/fhir/';

  const valueSetUrl = fullUrl.includes('ValueSet/$expand?url=')
    ? fullUrl.split('ValueSet/$expand?url=')[1]
    : fullUrl;

  valueSetPromiseMap[qItem.linkId] = {
    promise: FHIR.client({ serverUrl: ontoserver }).request({
      url: 'ValueSet/$expand?url=' + valueSetUrl
    }),
    value: value
  };
}

export async function resolvePromises(
  valueSetPromises: Record<string, ValueSetPromise>
): Promise<Record<string, ValueSetPromise>> {
  const newValueSetPromises: Record<string, ValueSetPromise> = {};

  const valueSetPromiseKeys = Object.keys(valueSetPromises);
  const valueSetPromiseValues = Object.values(valueSetPromises);
  const promises = valueSetPromiseValues.map((valueSetPromise) => valueSetPromise.promise);
  const valueSets = await Promise.all(promises);

  for (const [i, valueSet] of valueSets.entries()) {
    const key = valueSetPromiseKeys[i];
    const valueSetPromise = valueSetPromiseValues[i];
    if (key && valueSetPromise) {
      valueSetPromise.valueSet = valueSet;
      newValueSetPromises[key] = valueSetPromise;
    }
  }
  return newValueSetPromises;
}
