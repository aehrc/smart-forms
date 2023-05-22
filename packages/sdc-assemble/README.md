# SDC-Assemble

A Typescript reference implementation of the [$assemble](http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc) and is designed for [Modular Questionnaires](http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires).

## Usage
You would need to implement the following interfaces:

```InputParameters``` - Input parameters for the $assemble operation

```ts
{
    resourceType: 'Parameters'
    parameter: [ 
      {
        name: 'questionnaire',
        resource: YOUR_QUESTIONNAIRE_RESOURCE
      }
    ]
} 
```
<br/>

```FetchQuestionnaireCallback``` - A callback to fetch resources from your FHIR server

```ts
function fetchQuestionnaireCallback (canonicalUrl: string, requestConfig: any) {
  const { endpoint, token } = requestConfig;
  return axios.get(`${endpoint}/Questionnaire?url=${canonicalUrl}`, {
    method: 'GET',
    headers: { Accept: 'application/json+fhir; charset=utf-8', Authorization: `Bearer ${token}`, }
  });
};
```

Both of these interfaces are required to be implement as arguments to the ```assemble()``` function.


## Sample implementation
We have used this module as a microservice in our forms server https://api.smartforms.io. 

A sample implementation can be found [here](https://github.com/aehrc/smart-forms/blob/main/services/assemble-express/src/index.ts#LL43C4-L46C2)




