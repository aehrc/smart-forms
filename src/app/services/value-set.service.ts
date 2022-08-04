import { Injectable } from "@angular/core";

import * as FHIR from "fhirclient";
import Client from "fhirclient/lib/Client";
import { from, Observable, of } from "rxjs";
import { ValueSet } from "./value-set.model";
import * as urlParse from "url-parse";

interface ValueSetCache {
  [key: string]: Observable<ValueSet>;
}

@Injectable({
  providedIn: "root",
})
export class ValueSetFactory {
  private cache: ValueSetCache[] = [];

  expand(fullUrl: string): Observable<ValueSet> {
    let valueSet$: Observable<ValueSet> = this.cache[fullUrl];

    if (!valueSet$) {
      console.log("Getting ", fullUrl);
      var parsed = urlParse(fullUrl, false);

      var pathParts = parsed.pathname?.split("/");
      pathParts.splice(pathParts.length - 2, 2);
      var path = pathParts.join("/");

      let serverUrl: string = parsed.origin + path;

      //console.log("Server root", serverUrl, parsed.query['url']);
      const service = new ValueSetService(serverUrl);
      valueSet$ = service.expand(parsed.query);

      this.cache[fullUrl] = valueSet$;
    } else {
      console.log("Returning cached ", fullUrl);
    }

    return valueSet$;
  }
}

@Injectable({
  providedIn: "root",
})
export class ValueSetService {
  static readonly OntoserverURL: string = "https://r4.ontoserver.csiro.au/fhir";

  private fhirClient: Client;

  constructor(rootUrl: string) {
    this.fhirClient = FHIR.client({
      serverUrl: rootUrl,
    });
  }

  read(id): Observable<ValueSet> {
    var headers = { "Cache-Control": "no-cache" };

    let result = this.fhirClient.request({
      url: "ValueSet/" + id,
      headers: headers,
    });

    return from(result);
  }

  expand(params: string): Observable<ValueSet> {
    let result = this.fhirClient.request({
      url: "ValueSet/$expand" + params,
    });

    return from(result);
  }

  static expand(fullUrl: string): Observable<ValueSet> {
    console.log("Getting ", fullUrl);
    var parsed = urlParse(fullUrl, false);

    var pathParts = parsed.pathname?.split("/");
    pathParts.splice(pathParts.length - 2, 2);
    var path = pathParts.join("/");

    let serverUrl: string = parsed.origin + path;

    const service = new ValueSetService(serverUrl);
    var valueSet$ = service.expand(parsed.query);

    return valueSet$;
  }
}
