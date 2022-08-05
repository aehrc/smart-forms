import { Injectable } from "@angular/core";

import * as FHIR from "fhirclient";
import Client from "fhirclient/lib/Client";
import { from, Observable } from "rxjs";
import { ValueSet } from "./value-set.model";
import { environment } from "../../environments/environment";

interface ValueSetCache {
  [key: string]: Observable<ValueSet>;
}

@Injectable({
  providedIn: "root",
})
export class ValueSetFactory {
  private cache: ValueSetCache[] = [];

  expand(url: string): Observable<ValueSet> {
    let valueSet$: Observable<ValueSet> = this.cache[url];

    if (!valueSet$) {
      console.log("Getting ", url);

      const service = new ValueSetService();
      valueSet$ = service.expand(url);

      this.cache[url] = valueSet$;
    } else {
      console.log("Returning cached ", url);
    }

    return valueSet$;
  }
}

@Injectable({
  providedIn: "root",
})
export class ValueSetService {
  constructor() {
    this.fhirClient = FHIR.client({
      serverUrl: environment.ontoserverUrl,
    });
  }

  private fhirClient: Client;

  static expand(url: string): Observable<ValueSet> {
    console.log("Getting ", url);
    const service = new ValueSetService();
    const valueSet$ = service.expand(url);

    return valueSet$;
  }

  read(id): Observable<ValueSet> {
    const headers = { "Cache-Control": "no-cache" };

    const result = this.fhirClient.request({
      url: "ValueSet/" + id,
      headers: headers,
    });

    return from(result);
  }

  expand(params: string): Observable<ValueSet> {
    const result = this.fhirClient.request({
      url: "ValueSet/$expand?url=" + params,
    });

    return from(result);
  }
}
