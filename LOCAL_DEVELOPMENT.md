# Local Development

This is a technical guide for setting up a local development workflow for the Smart Forms app and the renderer component.
More information will be added as necessary, i.e. more debugging tips, common issues, or even guides for the other packages in the monorepo.

## aehrc/smart-forms NPM workspace

`aehrc/smart-forms` is a monorepo that contains the following:

#### Apps

- `apps/smart-forms-app` - The main Smart Forms web React app https://smartforms.csiro.au
- `apps/demo-renderer-app` - A demo React app to validate if the renderer component runs properly outside the NPM workspace.

#### Packages

- `packages/smart-forms-renderer` - A TypeScript implementation of the SDC questionnaire renderer library https://www.npmjs.com/package/@aehrc/smart-forms-renderer
- `packages/sdc-populate` - A TypeScript implementation of SDC populate https://www.npmjs.com/package/@aehrc/sdc-populate
- `packages/sdc-assemble` - A TypeScript implementation of SDC assemble https://www.npmjs.com/package/@aehrc/sdc-assemble
- `packages/sdc-template-extract` - A TypeScript implementation of SDC extract https://www.npmjs.com/package/@aehrc/sdc-template-extract

#### Services

- `services/populate-express` - A ExpressJS service to hold the `packages/sdc-populate` implementation that can be deployed.
- `services/assemble-express` - A ExpressJS service to hold the `packages/sdc-assemble` implementation that can be deployed.
- `services/extract-express` - A ExpressJS service to hold [a .NET implementation](https://github.com/brianpos/fhir-net-mappinglanguage/tree/main/demo-map-server) of the SDC extract operation that can be deployed.

#### Deployment

- `deployment/*` - Directories containing AWS CDK scripts for deploying apps and services.

#### Documentation

- `docs` - Documentation for this project https://smartforms.csiro.au/docs

Except for `apps/demo-renderer-app`, all entities listed above are part of the NPM workspace.

NPM workspace allows working on multiple packages in a single repository. This brings benefits such as shared dependencies and a more streamlined workflow handling linked packages from the local filesystem.

However, it has its own set of complexities to watch out for, such as dependencies working even when they are located in different directories, which causes confusion and can lead to unexpected behaviour.

## Setting up the repository

1. Clone this Git source repository onto your local machine from https://github.com/aehrc/smart-forms.

   ```sh
   git clone https://github.com/aehrc/smart-forms
   ```

2. Navigate to the cloned directory and install dependencies. You can do it anywhere in the repository as it uses npm workspaces.
   ```sh
   cd smart-forms
   npm install
   ```

## Smart Forms App Configuration

The Smart Forms app uses a `config.json` file for configuration, fetched at runtime. This allows configuration to be modified without rebuilding the app, which is particularly useful for containers.

### Configuring the application

1. Navigate to the directory containing the Smart Forms app.

   ```sh
   cd apps/smart-forms-app
   ```

2. The configuration is stored in `/public/config.json`. Adjust the configuration based on your setup. Below is the TypeScript interface for the configuration:

   ```ts
   export interface ConfigFile {
     // FHIR Terminology Server for ValueSet expansion and terminology validation
     terminologyServerUrl: string;
   
     // Questionnaire-hosting FHIR server
     formsServerUrl: string;
   
     // Default/fallback SMART App Launch client ID, preferably client IDs should be assigned by the server and stored in a separate JSON file to be fetched at runtime (because there is no persistent backend on this SPA)
     defaultClientId: string;         
     
     // SMART App Launch scopes, space-separated
     launchScopes: string;
   
     // URL link to a JS object of a key-value map of issuers to registered client IDs <issuer, client_id>. See https://hl7.org/fhir/smart-app-launch/app-launch.html#step-1-register on SMART registration recommended practices.
     // If this URL doesn't exist, the app will fallback to using `defaultClientId`.
     // Example URL: https://smartforms.csiro.au/smart-config/config.json
     // Example JSON response (`RegisteredClientIdsConfig`):
     // {
     //  "https://proxy.smartforms.io/v/r4/fhir": "a57d90e3-5f69-4b92-aa2e-2992180863c1",
     //  "https://example.com/fhir": "6cc9bccb-3ae2-40d7-9660-22c99534520b"
     // }
     registeredClientIdsUrl: string | null;
   }
   ```

   Example `config.json` structure:

   ```json
   {
    "terminologyServerUrl": "https://tx.ontoserver.csiro.au/fhir",
    "formsServerUrl": "https://smartforms.csiro.au/api/fhir",
    "defaultClientId": "a57d90e3-5f69-4b92-aa2e-2992180863c1",
    "launchScopes": "launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/QuestionnaireResponse.crus user/Practitioner.r launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new",
    "registeredClientIdsUrl": "https://smartforms.csiro.au/smart-config/config.json"
   }
   ```


3. The app includes a configuration checker that validates your `config.json` file before the app fully loads.

### Client ID Configuration

The app supports three different methods for resolving a SMART App Launch client_id. This ensures client_id registration flexibility. 

#### 1. Include client_id in Launch URL
You can embed the client_id directly in the launch URL.

Format: `https://smartforms.csiro.au/<client_id>/launch?iss=<fhir_server_url>&launch=<launch>`

Example URL: `https://smartforms.csiro.au/a57d90e3-5f69-4b92-aa2e-2992180863c1/launch?iss=https://proxy.smartforms.io/v/r4/fhir`

#### 2. Registered Clients JSON (runtime lookup)
Based on guidance from the [SMART App Launch spec](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#register-app-with-ehr), servers should assign a client_id to the client app during app registration.
Because Smart Forms is a static SPA without a persistent backend, it stores this information in a JSON file hosted elsewhere, and is fetched at runtime.

Based on the issuer (`iss` parameter in the launch URL), the app will look up the corresponding client_id from this JSON file and use during the launch sequence.

This file's location can be configured in `registeredClientIdsUrl` in `config.json`.

Example URL: `https://smartforms.csiro.au/smart-config/config.json`

Example JSON response (`RegisteredClientIdsConfig`):
```json
{
   "https://proxy.smartforms.io/v/r4/fhir": "a57d90e3-5f69-4b92-aa2e-2992180863c1",
   "https://example.com/fhir": "6cc9bccb-3ae2-40d7-9660-22c99534520b"
}
```

#### 3. Default Client ID (fallback)
If neither the launch URL nor the registered clients JSON provide a client_id, the app will fall back to a predefined default client_id.

This default client_id can be configured in `defaultClientId` in `config.json`.


## Running the Smart Forms and Storybook Locally on Docker with Live Code Reload

1. Install Docker and Docker Compose from [text](https://www.docker.com/). You need to have license if you are planning to use DockerHub. Please refer to the terms and conditions of Docker

2. In the main folder, build the docker container

```sh
docker-compose --env-file ./apps/smart-forms-app/.env.local build
```

3. Once the container is built, you can run both Smart Forms and Storyboard at the same time

```sh
docker-compose --env-file ./apps/smart-forms-app/.env.local up
```

4. Go to [http://localhost:5173/](http://localhost:5173/) for Smart Forms App

5. Go to [http://localhost:6006/](http://localhost:6006/) for Story Book

NOTE: In the Docker setup, the current source code folder is shared as a volume to the Docker container. This allows the live code reload to work.

## Running the Smart Forms app locally

1. In order to prepare all packages for use, you need to run the build script in each package located in the /packages directory.

cd packages/<package-name>
npm run build

Repeat this for each package in /packages

2. Ensure you are in the directory containing the Smart Forms app.

cd apps/smart-forms-app

3. Start the app on localhost. It defaults to port 5173.
   ```sh
   npm start
   ```

#### Visualising live renderer changes

If you are making changes to the renderer (`packages/smart-forms-renderer`) and want to see the changes reflected in the Smart Forms app, it is recommended to use Playground - localhost:5173/playground.
Ensure that `npm run watch` is running in the `packages/smart-forms-renderer` directory to watch for changes.

> Every time the renderer is built, the Smart Forms app will automatically reload to reflect the changes.
If it is not reloading as expected, the most common issue is that the renderer's version doesn't match the dependency version in the Smart Forms app.

Another potential issue why your changes aren't reflected is because of compilation errors. Go back to the watching terminal tab and check if there are any errors.

#### Visualising sdc-populate, sdc-assemble and sdc-template-extract changes

If you are making changes to `sdc-populate`, `sdc-assemble` or `sdc-template-extract`, ensure that `npm run watch` is running in their respective directory to watch for changes.



## Running the renderer component locally on Storybook

1. Navigate to the directory containing the renderer. Run npm install to ensure renderer dependencies are installed (in case npm workspace does something inconsistent).

```sh
cd packages/smart-forms-renderer
npm install
```

2. Start Storybook on localhost. It defaults to port 6006. Alternatively, you can run `npm run storybook-watch` to watch for changes concurrently.

```sh
npm run storybook
```

or

```sh
npm run storybook-watch
```

## Code style guides
1. We use Prettier and ESLint to enforce code style and quality. The most efficient way to enforce them is to install the relevant extensions in your IDE and enable settings that runs them "on save".
2. One of the most common pitfalls in React is the overuse of `useEffect`. It might be worth reading this great article https://react.dev/learn/you-might-not-need-an-effect to understand when to use `useEffect` and when not to.

## Dependency notes

- `date-fns` with version "^4.1.0" in `apps/smart-forms-app/package.json` is not used in the source code. It is used to prevent CommonJS issues when building the Smart Forms app in docker.

## Common issues

NPM workspaces can be a bit inconsistent at times, so it is a good idea to run `npm install` in the directory you are working on to ensure dependencies are installed correctly.
If `npm install` doesn't resolve the issue, try deleting the `node_modules` directory (or `package-lock.json` at times) and running `npm install` again.

Sometimes packages in the monorepo can have different versions of the same dependency, which may cause issues. Ensure that the package/app you are working on have the same dependency versions as the other packages in the monorepo.
Perform a `npm install` in the directory you are working on every time you change package versions.
e.g. Smart Forms app running v1.0.0-alpha.15 of `@aehrc/smart-forms-renderer` while the documentation app is running v0.44.3.

Sometimes dependencies will work even when they are not installed. That is because NPM workspaces allow packages to work even when they are located in different directories.
Ensure that the new dependency you are using is installed in the directory you are working on.

When running the Smart Forms app locally, if you are getting errors like "Uncaught TypeError: undefined is not a function e.g. Grid2.js", it is likely that Vite is caching a previous (failing) build.
Try deleting the `apps/smart-forms-app/node_modules/.vite` directory and run `npm start` again.
