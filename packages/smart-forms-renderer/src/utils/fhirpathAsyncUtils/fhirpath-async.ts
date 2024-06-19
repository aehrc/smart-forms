import type {
  CodeableConcept,
  Coding,
  DomainResource,
  OperationOutcome,
  Parameters,
  Reference,
  Resource,
  ValueSet
} from 'fhir/r4b';
// import type { Model, Path, UserInvocationTable } from 'fhirpath';
import fhirpath from 'fhirpath';
import { CreateOperationOutcome, logMessage } from './outcome-utils';

// --------------------------------------------------------------------------
// From: https://github.com/brianpos/fhirpathjs-async-poc/commit/950475900d09bf399574c24f142f3eeae1552fe6
// Forked from: https://github.com/brianpos/fhirpathjs-async-poc
// --------------------------------------------------------------------------
// The concept of this POC is to demonstrate an approach to perform some
// async based methods as functions inside the fhirpath engine without
// converting the entire engine to process things asynchronously.
// e.g. Terminology functions such as memberOf, subsumes, or resolve()
//
// The basic gist is:
// * Perform an initial evaluation in sync mode
// * when encountering any method that requires async execution
//    - queue the required call
//    - return a null result
//    - continue processing the rest of the expression.
// * If no async calls where encountered the result is returned immediately.
// * Process all the encountered async calls and stash the results.
// * Re-evaluate the expression from the start
//    - when encountering the async methods again, inject the resolved results and continue processing.
// If there were no additional async methods encountered, return the result.
// otherwise, repeat the process until all async calls are resolved.
// --------------------------------------------------------------------------
// Open question: Should the async requests have access to the other potential results?
// Reason: That would enable the result from one function to be accessed in another function.
// --------------------------------------------------------------------------

/** Global debug variable to permit the logger to write information messages
 to the OperationOutcome and console
 */
export const debugAsyncFhirpath: boolean = true;

/**
 * Evaluate a FHIRPath expression asynchronously
 * @param fhirData FHIR resource to run the FHIRPath expression against
 * @param path FHIRPath expression to evaluate (string or Path object)
 * @param context Environment to evaluate the expression in, mostly variables
 * @param model which fhir version to use (r4/r4b/r5)
 * @returns the result of the evaluation
 */
export async function evaluateFhirpathAsync(
  fhirData: DomainResource,
  path: string | Path,
  context?: Record<string, any>,
  model?: Model
): Promise<any[]> {
  let results = [];
  const outcome: OperationOutcome = {
    resourceType: 'OperationOutcome',
    issue: []
  };

  const asyncCallsRequired: Map<string, AsyncFunctionUserData> = new Map<
    string,
    AsyncFunctionUserData
  >();
  let requiresAsyncProcessing = false;
  // introduce a custom function for resolve into the options
  // https://github.com/HL7/fhirpath.js/?tab=readme-ov-file#user-defined-functions
  // https://github.com/HL7/fhirpath.js/blob/5428ef8be766301658215ef7ed241c8a1666a980/index.d.ts#L86
  const userInvocationTable: UserInvocationTable = {
    expand: {
      fn: (inputs: any[], valueSet: string | ValueSet | Resource[], params?: string) =>
        inputs
          .map((value: any) => {
            if (Array.isArray(valueSet)) {
              valueSet = valueSet[0] as ValueSet;
            }

            let key = createIndexKeyExpand(valueSet, params);
            if (key) {
              key = 'Expand:' + key;
              if (asyncCallsRequired.get(key)?.evaluationCompleted) {
                logMessage(debugAsyncFhirpath, outcome, '  using cached result for: ', key);
                return asyncCallsRequired.get(key)?.result;
              }

              const details: ExpandUserData = {
                evaluationCompleted: false,
                asyncFunction: expandAsync,
                value: value,
                valueSet: valueSet,
                params: params
              };
              asyncCallsRequired.set(key, details);
              logMessage(debugAsyncFhirpath, outcome, '  requires async evaluation for: ', key);
              requiresAsyncProcessing = true;

              return undefined;
            }
          })
          .filter((v) => v !== undefined),
      arity: { 1: ['Any'], 2: ['Any', 'String'] }
    },
    resolve: {
      fn: (inputs: any[]) =>
        inputs
          .map((reference: string | Reference) => {
            let key = createIndexKeyResolve(reference);
            if (key) {
              key = 'Resolve:' + key;
              if (asyncCallsRequired.get(key)?.evaluationCompleted) {
                logMessage(debugAsyncFhirpath, outcome, '  using cached result for: ', key);
                return asyncCallsRequired.get(key)?.result;
              }
              const details: ResolveUserData = {
                evaluationCompleted: false,
                asyncFunction: resolveAsync,
                value: reference
              };
              asyncCallsRequired.set(key, details);
              logMessage(debugAsyncFhirpath, outcome, '  requires async evaluation for: ', key);
              requiresAsyncProcessing = true;
            }
            return undefined;
          })
          .filter((v) => v !== undefined),
      arity: { 0: [] }
    },
    memberOf: {
      fn: (inputs: any[], valueSet: string) => {
        const output = inputs
          .map((codeData: string | Coding | CodeableConcept) => {
            let key = createIndexKeyMemberOf(codeData, valueSet);
            if (key) {
              key = 'MemberOf:' + key;
              if (asyncCallsRequired.get(key)?.evaluationCompleted) {
                logMessage(debugAsyncFhirpath, outcome, '  using cached result for: ', key);
                return asyncCallsRequired.get(key)?.result;
              }
              const details: MemberOfUserData = {
                evaluationCompleted: false,
                asyncFunction: memberOfAsync,
                value: codeData,
                valueSet: valueSet
              };
              asyncCallsRequired.set(key, details);
              logMessage(debugAsyncFhirpath, outcome, '  requires async evaluation for: ', key);
              requiresAsyncProcessing = true;
            }
            return undefined;
          })
          .filter((v) => v !== undefined);
        return output;
      },
      arity: { 1: ['String'] }
    }
  };

  const options = {
    userInvocationTable: userInvocationTable
  };

  let iterations = 0;
  do {
    context = { ...context, resource: fhirData, rootResource: fhirData, terminologies: {} };
    iterations++;
    // Perform the async calls required (none first time in)
    if (asyncCallsRequired.size > 0) {
      // resolve the async calls
      const asyncPromises: Promise<void>[] = [];
      for (const key of asyncCallsRequired.keys()) {
        const details = asyncCallsRequired.get(key);
        if (details && !details.evaluationCompleted) {
          // perform the async call to check for the memberOf status
          logMessage(debugAsyncFhirpath, outcome, '  performing async request for: ', key);
          asyncPromises.push(details.asyncFunction(outcome, details));
        }
      }
      if (asyncPromises.length > 0) await Promise.all(asyncPromises);
      requiresAsyncProcessing = false;
    }

    // Evaluate the expression
    try {
      results = fhirpath.evaluate(fhirData, path, context, model, options);
    } catch (err: any) {
      console.log(err);
      if (err.message) {
        throw CreateOperationOutcome('fatal', 'exception', err.message);
      }
    }
  } while (requiresAsyncProcessing && iterations < 10); // bound the number of iterations
  if (iterations > 1) {
    logMessage(debugAsyncFhirpath, outcome, 'total iterations', iterations);
  }
  return results;
}

interface AsyncFunctionUserData {
  evaluationCompleted: boolean;
  asyncFunction: (outcome: OperationOutcome, details: AsyncFunctionUserData) => Promise<void>;
  result?: any;
}

// --------------------------------------------------------------------------
// The following section is the custom function for expand()
// --------------------------------------------------------------------------
interface ExpandUserData extends AsyncFunctionUserData {
  value: any;
  valueSet: string | ValueSet;
  params?: string;
}

/**
 * Create an Index Key for the expand function
 * @param valueSet
 * @param params
 * @returns
 */
function createIndexKeyExpand(valueSet: string | ValueSet, params?: string): string | undefined {
  // input value is ignored since expand() is supposed to be called with a %terminologies fhirpath object
  const vs = valueSet as ValueSet;
  if (vs.resourceType === 'ValueSet') {
    const valueSetId = vs.id ?? vs.url ?? '';
    return params
      ? ' terminologies - ' + valueSetId + ' - ' + params
      : 'terminologies - ' + valueSetId;
  }

  if (typeof valueSet === 'string') {
    return params ? ' terminologies - ' + valueSet + ' - ' + params : 'terminologies - ' + valueSet;
  }

  return undefined;
}

/**
 * Perform the actual async expand evaluation
 * @param details parameters which is actually a ExpandUserData structure
 */
async function expandAsync(
  outcome: OperationOutcome,
  details: AsyncFunctionUserData
): Promise<void> {
  // perform the async call to check for the memberOf status
  const typedData = details as ExpandUserData;

  try {
    const httpHeaders = {
      Accept: 'application/fhir+json; charset=utf-8'
    };
    const httpPostHeaders = {
      Accept: 'application/fhir+json; charset=utf-8',
      'Content-Type': 'application/fhir+json; charset=utf-8'
    };
    let myHeaders = new Headers(httpHeaders);

    const requestUrl = 'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand';

    let response;
    const valueSet = typedData.valueSet as ValueSet;
    if (valueSet.resourceType === 'ValueSet') {
      const parameters: Parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'valueSet',
            resource: valueSet
          }
        ]
      };

      // TODO turn typedData.params into a URLSearchParams object and into $expand params

      myHeaders = new Headers(httpPostHeaders);
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(parameters)
      });
    } else if (typeof typedData.valueSet === 'string') {
      const additionalParams = typedData.params ?? '';
      response = await fetch(`${requestUrl}?url=${typedData.valueSet}&${additionalParams}`, {
        headers: myHeaders
      });
    }

    if (response) {
      const resultJson = await response.json();
      const valueSet = resultJson as ValueSet;
      if (valueSet.resourceType === 'ValueSet') {
        details.evaluationCompleted = true;
        details.result = valueSet;
      }

      const outcomeResult = resultJson as OperationOutcome;
      if (outcomeResult && outcomeResult.issue) {
        details.evaluationCompleted = true;
        throw outcomeResult; // should we be throwing here?
      }
    }
  } catch (err) {
    console.log(err);
    if (err.resourceType === 'OperationOutcome') {
      throw err;
    }

    details.evaluationCompleted = true;
    const key = createIndexKeyExpand(typedData.valueSet, typedData.params);
    throw CreateOperationOutcome(
      'error',
      'exception',
      'Failed to check membership: ' + key,
      undefined,
      err.message
    );
  }
}

// --------------------------------------------------------------------------
// The following section is the custom function for resolve()
// --------------------------------------------------------------------------
interface ResolveUserData extends AsyncFunctionUserData {
  value: string | Reference;
}

/**
 * Create an Index Key for the memberOf function
 * @param value
 * @returns
 */
function createIndexKeyResolve(value: string | Reference) {
  if (typeof value === 'string') return value;

  if (valueIsReference(value)) return (value as Reference).reference;
  return value;
}

function valueIsReference(value: any): value is Reference {
  return !!value.reference;
}

/**
 * Perform the actual async member of evaluation
 * @param details parameters which is actually a MemberOfUserData structure
 */
async function resolveAsync(
  outcome: OperationOutcome,
  details: AsyncFunctionUserData
): Promise<void> {
  // perform the async call to check for the memberOf status
  const typedData = details as ResolveUserData;

  const URL = createIndexKeyResolve(typedData.value);
  if (URL) {
    try {
      const httpHeaders = {
        Accept: 'application/fhir+json; charset=utf-8'
      };
      const myHeaders = new Headers(httpHeaders);
      const response = await fetch(URL, { headers: myHeaders });
      const resultJson = await response.json();
      console.log(resultJson);
      details.result = resultJson;
      details.evaluationCompleted = true;
    } catch (err) {
      console.log(err);
      details.result = undefined; // not found!
      details.evaluationCompleted = true;
      const newOutcome = CreateOperationOutcome(
        'error',
        'exception',
        'Failed to resolve reference: ' + URL,
        undefined,
        err.message
      );
      throw newOutcome;
    }
  }
}

// --------------------------------------------------------------------------
// The following section is the custom function for memberOf()
// --------------------------------------------------------------------------
interface MemberOfUserData extends AsyncFunctionUserData {
  value: string | Coding | CodeableConcept;
  valueSet: string;
}

/**
 * Create an Index Key for the memberOf function
 * @param value
 * @param valueset
 * @returns
 */
function createIndexKeyMemberOf(
  value: string | Coding | CodeableConcept,
  valueset: string
): string | undefined {
  if (typeof value === 'string') {
    return value + ' - ' + valueset;
  }
  const coding = value as Coding;
  if (coding.code) {
    return coding.system + '|' + coding.code + ' - ' + valueset;
  }
  const cc = value as CodeableConcept;
  if (cc.coding) {
    // return the same as for coding by joining each of the codings with a comma
    return cc.coding.map((c) => c.system + '|' + c.code).join(',') + ' - ' + valueset;
  }
  return undefined;
}

/**
 * Perform the actual async member of evaluation
 * @param details parameters which is actually a MemberOfUserData structure
 */
async function memberOfAsync(
  outcome: OperationOutcome,
  details: AsyncFunctionUserData
): Promise<void> {
  // perform the async call to check for the memberOf status
  const typedData = details as MemberOfUserData;

  try {
    const httpHeaders = {
      Accept: 'application/fhir+json; charset=utf-8'
    };
    const httpPostHeaders = {
      Accept: 'application/fhir+json; charset=utf-8',
      'Content-Type': 'application/fhir+json; charset=utf-8'
    };
    let myHeaders = new Headers(httpHeaders);

    const requestUrl = 'https://r4.ontoserver.csiro.au/fhir/ValueSet/$validate-code';

    let response;
    let cc = typedData.value as CodeableConcept;
    if (cc.coding) {
      const parameters: Parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'url',
            valueUri: typedData.valueSet
          },
          {
            name: 'codeableConcept',
            valueCodeableConcept: cc
          }
        ]
      };
      myHeaders = new Headers(httpPostHeaders);
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(parameters)
      });
    } else if (typeof typedData.value === 'string') {
      const queryParams = new URLSearchParams({
        url: typedData.valueSet,
        code: typedData.value
      });
      response = await fetch(`${requestUrl}?${queryParams.toString()}`, { headers: myHeaders });
    } else {
      const coding = typedData.value as Coding;
      if (coding.code) {
        const queryParams = new URLSearchParams({
          url: typedData.valueSet ?? '',
          system: coding.system ?? '',
          code: coding.code
        });
        response = await fetch(`${requestUrl}?${queryParams.toString()}`, { headers: myHeaders });
      }
    }

    if (response) {
      const resultJson = await response.json();
      const params = resultJson as Parameters;
      if (params && params.parameter) {
        const param = params.parameter.find((p) => p.name === 'result');
        if (param) {
          details.evaluationCompleted = true;
          details.result = param.valueBoolean;
        }
      }
      const outcomeResult = resultJson as OperationOutcome;
      if (outcomeResult && outcomeResult.issue) {
        details.evaluationCompleted = true;
        throw outcomeResult; // should we be throwing here?
      }
    }
  } catch (err) {
    console.log(err);
    details.evaluationCompleted = true;
    const key = createIndexKeyMemberOf(typedData.value, typedData.valueSet);
    throw CreateOperationOutcome(
      'error',
      'exception',
      'Failed to check membership: ' + key,
      undefined,
      err.message
    );
  }
}
