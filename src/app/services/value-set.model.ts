import { fhirclient } from "fhirclient/lib/types";

export interface ValueSet extends fhirclient.FHIR.Resource {
  resourceType: "ValueSet";
}
