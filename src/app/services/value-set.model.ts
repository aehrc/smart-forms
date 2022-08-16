import { fhirclient } from "fhirclient/lib/types";

export interface ValueSet extends fhirclient.FHIR.Resource {
  name: string;
  url: fhirclient.FHIR.uri;
  resourceType: "ValueSet";
  expansion?: ValueSetExpansion;
}

export interface ValueSetExpansion extends fhirclient.FHIR.BackboneElement {
  identifier: fhirclient.FHIR.uri;
  contains: ValueSetCoding[];
}

export interface ValueSetCoding extends fhirclient.FHIR.BackboneElement {
  system: fhirclient.FHIR.uri;
  code: fhirclient.FHIR.code;
  display: string;
}
