# Local Development

This is a technical guide for setting up a local development workflow for the Smart Forms app and the renderer component.
More information will be added as necessary, i.e. more debugging tips, common issues, or even guides for the other packages in the monorepo.

## smart-forms NPM workspace

`smart-forms` is a monorepo that contains the following:

**Apps**

- `apps/smart-forms-app` - The main Smart Forms web React app https://smartforms.csiro.au
- `apps/demo-renderer-app` - A demo React app to validate if the renderer component runs properly outside the NPM workspace.

**Packages**

- `packages/smart-forms-renderer` - A TypeScript implementation of the SDC questionnaire renderer library https://www.npmjs.com/package/@aehrc/smart-forms-renderer
- `packages/sdc-populate` - A TypeScript implementation of SDC populate https://www.npmjs.com/package/@aehrc/sdc-populate
- `packages/sdc-assemble` - A TypeScript implementation of SDC assemble https://www.npmjs.com/package/@aehrc/sdc-assemble
- `packages/sdc-template-extract` - A TypeScript implementation of SDC extract https://www.npmjs.com/package/@aehrc/sdc-template-extract

**Services**

- `services/populate-express` - A ExpressJS service to hold the `packages/sdc-populate` implementation that can be deployed.
- `services/assemble-express` - A ExpressJS service to hold the `packages/sdc-assemble` implementation that can be deployed.
- `services/extract-express` - A ExpressJS service to hold [a .NET implementation](https://github.com/brianpos/fhir-net-mappinglanguage/tree/main/demo-map-server) of the SDC extract operation that can be deployed.

**Deployment**

- `deployment/*` - Directories containing AWS CDK scripts for deploying apps and services.

**Documentation**

- `docs` - Documentation for this project https://smartforms.csiro.au/docs

Except for `apps/demo-renderer-app`, all entities listed above are part of the NPM workspace.

NPM workspace allows working on multiple packages in a single repository. This brings benefits such as shared dependencies and a more streamlined workflow handling linked packages from the local filesystem.

However, it has its own set of complexities to watch out for, such as dependencies working even when they are located in different directories, which causes confusion and can lead to unexpected behaviour.

## Before you begin
Install Node v20 via [https://nodejs.org/en/download]



```bash
# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash\n
# Install v20 of Node
nvm install 20
# Make this as default
nvm alias default node
# Verify installation
node -v
npm -v
```



## Setting up the repository

1. Clone this Git source repository onto your local machine from https://github.com/aehrc/smart-forms.

   ```sh
   git clone https://github.com/aehrc/smart-forms
   ```

2. Navigate to the cloned directory and install dependencies. You can run `npm i` in any folder as long as it is part of the NPM workspace (https://github.com/aehrc/smart-forms/blob/main/package.json#L16-L23).
   ```sh
   cd smart-forms
   npm install
   ```

## Smart Forms App Configuration

Before any local development, it is important to configure the Smart Forms app correctly. If you are happy with the default configuration, you can skip directly to [Running locally](#running-locally).

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

### SMART App Launch Client ID Configuration

If you are using SMART App Launch, you need to ensure that the app can resolve a valid `client_id` during the launch sequence.

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


## Running locally

Once configuration is set up, let's look at running the various apps and packages locally.

This is a monorepo, so you can run multiple packages/apps simultaneously in different terminal windows. Ensure that package versions and dependency versions are the same across the monorepo to prevent unexpected issues.
Example: If you are making changes to the sdc-populate package and it is on 4.6.2, ensure that the Smart Forms app is using the same version (4.6.2) of sdc-populate.

### Running Smart Forms locally

1. Ensure you have run `npm install` in the main folder to install all dependencies.

2. Build all packages in the /packages directory.
   ```sh
   npm run build-all-deps-first-run
   ```

   Or individually:

   ```sh
   npm run build -w packages/sdc-populate
   npm run build -w packages/sdc-assemble
   npm run build -w packages/sdc-template-extract
   npm run build -w packages/smart-forms-renderer
   ```

3. Open a new terminal window and navigate to the Smart Forms app directory.

   ```sh
   cd apps/smart-forms-app
   ```

4. Start the Smart Forms app on localhost. It defaults to port 5173.

   ```sh
   npm start
   ```

5. Code changes in the Smart Forms app will trigger a live reload.

6. If you're using the Smart Forms app as a visual debug tool, the Playground (/playground) is a great way to view changes made to the other packages.

### Running Smart Forms Renderer and SDC packages locally

Most of the time, you will be making changes to the renderer component located in `packages/smart-forms-renderer` instead of the Smart Forms app.

You might also be making changes to the SDC packages such as `sdc-populate`, `sdc-assemble` or `sdc-template-extract`. In some cases, you may need to work on multiple packages simultaneously, which requires running multiple terminal windows.

1. Open a new terminal window and navigate to the package directory.

   ```sh
   cd packages/smart-forms-renderer # or cd packages/sdc-* etc.
   ```

2. Start the renderer in watch mode to watch for live code changes. If there are any errors, your code will not compile properly until you resolve all errors. Errors will be displayed in the terminal. 

   ```sh
   npm run watch
   ```

3. At this stage, the TypeScript complier has complied the renderer's source code, but we need to visualise changes. 
   You can either run **Smart Forms Playground** (more straightforward) or **Storybook** to visualise your changes. 
   
   - If running Smart Forms Playground:
     - Follow the steps in [Running Smart Forms locally](#running-smart-forms-locally) to start the Smart Forms app.
     - Go to [http://localhost:5173/playground](http://localhost:5173/playground) to view renderer changes
     - Renderer changes will force the Smart Forms app to empty its state. Therefore you will see this "Questionnaire does not have any items or something has gone wrong. Try rebuilding the form." message every time the renderer is rebuilt.

   > Every time the renderer is re-built, the Smart Forms app will automatically reload to reflect changes.
   If it is not reloading as expected, the most common issue is that the package's version doesn't match the dependency version in the Smart Forms app.

   - If running Renderer Storybook:
     - Open a new terminal window, navigate to the renderer package directory and run `npm run storybook` to start Storybook. It defaults to port 6006.
     - If using this method, refer to [Create a Questionnaire story test case](#create-a-questionnaire-story-test-case) to create a Storybook test case for your changes.
     - An alternative command is `npm run storybook-watch`, which watches for changes concurrently without needing to run `npm run watch` separately.

   
### Running Smart Forms and Storybook Locally on Docker with Live Code Reload

The above two methods should be sufficient for local development. However, if you prefer to do local development in Docker containers, you can follow the steps below.

1. Install Docker and Docker Compose from https://www.docker.com.

2. In the main folder, build the docker container

   ```sh
   docker-compose --env-file ./apps/smart-forms-app/.env.local build
   ```

3. Once the container is built, you can run both Smart Forms and Storyboard at the same time

   ```sh
   docker-compose --env-file ./apps/smart-forms-app/.env.local up
   ```

4. Go to [http://localhost:5173/](http://localhost:5173/) for Smart Forms app.

5. Go to [http://localhost:6006/](http://localhost:6006/) for Renderer StoryBook.

NOTE: In the Docker setup, the current source code folder is shared as a volume to the Docker container. This allows live code reload to work.


## Creating Test Cases
To ensure your changes are properly tested and do not introduce regressions, it is important to create test cases for your changes and run existing tests to verify everything works as before.

### Unit Tests

Each package contains its own set of unit (and potentially integration) tests located in their respective `src/test` folders.

The Smart Forms app contains unit tests in `src/test` and `src/feature/*/test`.

Our [GitHub CI workflow](https://github.com/aehrc/smart-forms/blob/main/.github/workflows/build_test_lint.yml) is also set up to run unit tests and check coverage on every push.

#### Run existing unit tests

To run unit tests for a specific package or app, navigate to its directory and run:

```sh
npm run test
``` 

#### Adding new unit tests

When adding new features or fixing bugs, it is important to add relevant unit tests.

Jest is used as the unit testing framework. The coverage requirements are as below:

| Metric     | Coverage (%) |
|------------|--------------|
| Statements | 80           |
| Branches   | 75           |
| Functions  | 80           |
| Lines      | 80           |

To add new unit tests, create a new file in the `src/test` folder (or `src/feature/*/test` for Smart Forms app) with the `.test.ts` or `.test.tsx` extension, using the same file name as the source code file you have modified.

If you need make any changes to Jest's config, they are located in the `jest.config.ts` file in the respective package or app directory.

### Storybook Tests

We use Storybook primarily as pseudo-documentation for the FHIR community to view various Questionnaire examples and how they are rendered.

Besides that, the Smart Forms renderer also uses Storybook for questionnaire-based testing.

Coverage for this is fairly minimal and basic at the moment, but it is a good idea to create a Story + test case for any new components or significant changes. Otherwise, creating a Story (without any interactive tests) is sufficient.

Our [GitHub CI workflow](https://github.com/aehrc/smart-forms/blob/main/.github/workflows/build_test_lint.yml) is also set up to run storybook-based tests on every push.

#### Run existing Storybook tests

1. To run existing Storybook tests, navigate to the renderer package directory.

   ```sh
   cd packages/smart-forms-renderer
   ```
   
2. Run Storybook CI tests

   ```sh
   npm run test-storybook-ci
   ```

#### Enable tests in local Storybook runs

Based on this issue https://github.com/storybookjs/storybook/discussions/25011, Storybook tests always have autoplay on, which can result in a jarring experience for users using Storybook as documentation.

We use a `CI=true` flag to [conditionally enable the `play` field in Storybook test cases](https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/createStory.ts#L31) only during CI runs (or when you run `npm run test-storybook-ci`).

This means that running Storybook locally via `npm run storybook` will not trigger Storybook tests from running.

To explicitly enable Storybook tests while running Storybook locally, you can run:
```sh
CI=true npm run storybook
```

#### Adding new stories

Stories are great for visualising Questionnaire rendering scenarios. They serve a similar purpose to rendering a Questionnaire in the Playground, but also act as concrete, reusable examples that can be referred to later.

Below are the steps to create a new Storybook story for a Questionnaire test case.

1. Identify where this new story fits in the existing Storybook structure. The categories are:
   - Item Types - Basic Questionnaire item types such as `string`, `choice`, `group` etc.
   - SDC - Structured Data Capture-specific extensions such as `preferredTerminologyServer`, `initialExpression`, etc.
   - Custom Extensions - CSIRO-specific custom extensions such as `https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton`.
   - Testing - Any test cases that don't fit into the above categories.
   
2. Create a new TypeScript object of `Questionnaire` type in `packages/smart-forms-renderer/src/stories/assets/questionnaires` in a new or existing file depending on the issue you are working on.
   - This object holds a FHIR Questionnaire resource in TypeScript format. You can convert it back to JSON if needed using https://www.convertsimple.com/convert-javascript-to-json/.
   - A good naming convention is to prefix the file name with `q` followed by the story's title.
   - You can refer to existing Questionnaire examples for structure reference. Below is a minimal example:
        ```ts
        export const qDecimalCalculation: Questionnaire = {
          resourceType: 'Questionnaire',
          status: 'draft',
          item: [
            // <snipped for brevity>
          ]
        };
        ```
   - Ensure that the Questionnaire object is exported.

3. Based on the category identified in step 1, open or create a new Storybook story file in `packages/smart-forms-renderer/src/stories/<category>`.
   - A good naming convention is `<Story subcategory>.stories.tsx`, e.g. `Decimal.stories.tsx`.
   - Refer to the below minimal story example:
        ```ts
        const meta = {
          title: 'ItemType/Decimal',
          component: BuildFormWrapperForStorybook,
          tags: []
        } satisfies Meta<typeof BuildFormWrapperForStorybook>;
    
        export default meta;
        type Story = StoryObj<typeof meta>;

        export const DecimalBasic: Story = createStory({
          args: {
            questionnaire: qDecimalBasic
          }
        }) as Story;
        ```
   - `meta.title` defines where this story appears in Storybook's sidebar. Each level is separated by a `/`.
   - `meta.component` should contains a <BaseRenderer/> wrapper and it acts as the entry point into the renderer. `BuildFormWrapperForStorybook` is the standard wrapper used for Questionnaire stories.
   - Supply the component with necessary `args`. At a minimum, you need to provide the `questionnaire` arg with the Questionnaire object created in step 2.
   - The story itself is defined as an exported constant.
   
4. You should see your new story appear in Storybook's sidebar!

5. If you need make any changes to Storybook's config, Storybook holds its config in three files:
   - `packages/smart-forms-renderer/vite.config.ts` - Vite config for Storybook
   - `packages/smart-forms-renderer/.storybook/main.ts` - Main Storybook config
   - `packages/smart-forms-renderer/.storybook/preview.ts` - Storybook preview config


#### Adding new Story test case to your story

Storybook provides you a way to add interactive tests to your story using the `play` field. It has similar syntax to React Testing Library.

There are some testing utils provided in `packages/smart-forms-renderer/src/stories/testUtils.ts` to help with common tasks such as inputting or querying text for Questionnaire items.

This file contains examples of a Storybook tests: https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/itemTypes/Decimal.stories.tsx

After adding a new Story test case, ensure that it runs correctly by running Storybook CI tests as described in [Run existing Storybook tests](#run-existing-storybook-tests).

> If you are make changes to story names, ensure that they don’t break the docs!
> 
> There isn’t a CI process to do this, but you can check if the storyId exists in any documentation, e.g. sdc-9-1-4-rendering-other--read-only

#### Chromatic visual regression testing

We use Chromatic in CI to catch for any UI layout changes on the deployed Storybook instance https://smartforms.csiro.au/storybook/.

If Chromatic detects any layout changes, they have to be approved them in the Chromatic dashboard. Access the dashboard via the "Details" button next to "UI Tests" in GitHub Actions CI or use [this link](https://www.chromatic.com/builds?appId=6642d27eeb21c508b2ab7b9c). You will need to sign in with your GitHub account.

Our [GitHub CI workflow](https://github.com/aehrc/smart-forms/blob/main/.github/workflows/deploy_app.yml) is set up to run Chromatic visual regression on every push to `main`. We are on the free plan, which has a limit of 5000 snapshots per month. When the limit is hit, Chromatic tests will be skipped until the next month.


### Questionnaire-specific tests

Besides unit tests and Storybook tests, we also have questionnaire behaviour tests for specific questionnaires, such as the Aboriginal and Torres Strait Islander Health Check (MBS715).

These tests are located in `apps/smart-forms-app/src/test/questionnaireRenderer.test.tsx` and are run as part of the Smart Forms app's unit test CI workflow. These tests use Vitest instead of Jest.

This work was initiated by Beda Software, and no additional tests are required unless explicitly requested.

### Playwright end-to-end tests

We use Playwright for end-to-end testing of the Smart Forms app. These tests focus on SMART App Launch + QuestionnaireResponse saving back to the FHIR server.

These tests are located in `apps/smart-forms-app/e2e` and are run as part of the Smart Forms app's e2e test CI workflow.

These end-to-end tests use [MBS715](https://smartforms.csiro.au/api/fhir/Questionnaire/AboriginalTorresStraitIslanderHealthCheck) and [BitOfEverything](https://smartforms.csiro.au/api/fhir/Questionnaire/BitOfEverything) as test data.
They can be fairly flaky, so we try to keep them to a minimum. Currently, there are no plans to add more tests unless explicitly requested. If CI e2e tests are failing, try running them again via the "sync" button on GitHub Actions.

A common failure point for these tests is the SMART App Launch sequence, which relies on actual FHIR servers:
- SMART App Launch + Patient Data FHIR API: https://proxy.smartforms.io/v/r4/fhir
- Forms Server: https://smartforms.csiro.au/api/fhir

These servers get cleared out every 60 or 90 days when the AWS instances restarts, which may cause tests to fail if the expected test data is missing.
In that case, follow this guide https://confluence.csiro.au/spaces/eHealth/pages/1952331307/Restoring+Smart+Forms+test+data+on+EHR+and+Forms+HAPI+instances to restore the test data.

## Documentation

The documentation site is located in the `documentation` folder and is built using Docusaurus https://docusaurus.io/. It is deployed automatically to https://smartforms.csiro.au/docs/ via GitHub Actions CI on every push to `main` and `dev`.

If you are running the documentation site locally, you can run:

```sh
cd documentation
npm start
```

It leverages Docusaurus' [MDX](https://docusaurus.io/docs/markdown-features/mdx) feature to embed React components (i.e. Storybook iframe) directly into the documentation pages, and will require Storybook to be running locally on **port 6006** to view the examples.

The search function is powered by Algolia DocSearch. If you are adding new documentation pages, ensure that they are indexed properly by following the steps in https://docsearch.algolia.com/docs/run-your-own/.

While it is optional to contribute to the documentation, it is highly encouraged to add or update relevant documentation pages when making significant changes.

## Code style guides
We use Prettier and ESLint to enforce code style and quality. The most efficient way to enforce them is to install the relevant extensions in your IDE and enable settings that runs them "on save". Our CI workflow is also set up to run linting checks on every push.

One of the most common pitfalls in React is the overuse of `useEffect`. It might be worth reading this great article https://react.dev/learn/you-might-not-need-an-effect to understand when to use `useEffect` and when not to. 

The Airbnb JavaScript style guide at https://github.com/airbnb/javascript is a great reference for writing clean and consistent JavaScript/TypeScript code.


## Branching strategy
We use a simple branching strategy with `main` as the main branch. All feature/bugfix branches should be created from `main` and merged back into `main` via pull requests.

If the branch is long-lived (i.e. more than a week), it is a good idea to regularly sync with `main` to prevent large merge conflicts.

It is good practice to have small and focused pull requests to make code reviews easier.

P.S. We had `alpha` as a pre-release branch before the recent v1.0.0 release. This branch is now deprecated and will be removed in the future. On now onwards, all changes should be merged directly into `main`.

## Contributing workflow - internal contributors
1. Create a new branch from `main` for your feature or bugfix. A good convention is to use `issue/<issue-number>` if it's tied to an issue.
   - If it's not tied to an issue, create an issue first to track the work.
   - If it's not tied to an issue and is a relatively quick fix (< 5 mins), use a descriptive name such as `feature/<feature-name>` or `fix/<bug-description>`.
2. Follow the steps in [Running locally](#running-locally) to setup your local development environment.
3. Make your code changes.
4. Run existing tests to ensure everything is working.
5. Add new tests (unit tests, Storybook tests, etc.). Refer to [Creating Test Cases](#creating-test-cases).
6. If applicable, update documentation. Refer to [Documentation](#documentation).
7. Create a pull request to merge your branch into `main`.
8. Ensure that all CI checks pass (build, tests, linting, etc.).
9. Merge `main` into your branch to ensure you have the latest changes.
10. Update TypeDoc documentation by running `npm run build` in `/documentation`.
11. Request for a code review from a team member. Once approved, you can proceed to the next steps.
12. If you are working on a package (i.e. any package in `/packages`), follow the steps below to publish a new version. Otherwise, merge your branch into `main`.
13. Depending on which package/app you are working on, bump the version number in `package.json` following [semantic versioning](https://semver.org/) principles.
14. Update dependencies in other packages/apps if necessary.
    - `@aehrc/smart-forms-renderer`'s Storybook depends on `@aehrc/sdc-populate` and `@aehrc/sdc-template-extract`. If you update `@aehrc/sdc-populate` or `@aehrc/sdc-template-extract`, make sure to bump their versions and the `@aehrc/smart-forms-renderer` version.
    - For example, if you are making changes to `@aehrc/sdc-populate`, ensure that:
      - Both the Renderer's and Smart Forms app's dependency on `@aehrc/sdc-populate` is updated to the new version.
      - `@aehrc/smart-forms-renderer`'s version is also bumped to reflect the dependency change.
      - Bump `@aehrc/smart-forms-renderer`'s dependency version in Smart Forms app's `package.json`.
15. Run `npm install` to update package-lock.json with the new version.
16. Run `npm run build` in the respective package directory to ensure you get the latest build output.
    - If updating multiple packages, make sure to run the build command in each of the respective folders.
17. Run `npm publish` in the respective package directory to publish new versions to NPM.
    - If updating multiple packages, make sure to run the publish command in each of the respective folders.
    - You might need to go through NPM 2FA when publishing new versions. Ensure you are logged into NPM with the correct account that has publishing rights on the aehrc organisation.
18. Create a new entry in the `CHANGELOG.md` file in the respective package/app directory summarising your changes. 
    - @aehrc/smart-forms-renderer - https://github.com/aehrc/smart-forms/blob/main/CHANGELOG.md
    - @aehrc/sdc-populate - https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/CHANGELOG.md
    - @aehrc/sdc-assemble - https://github.com/aehrc/smart-forms/blob/main/packages/sdc-assemble/CHANGELOG.md
    - @aehrc/sdc-template-extract - https://github.com/aehrc/smart-forms/blob/main/packages/sdc-template-extract/CHANGELOG.md
19. Push a new commit with the version bumps and changelog updates.
20. Ensure that all CI checks pass (build, tests, linting, etc.).
21. Merge your branch into `main`.
22. Ensure the CI passes on `main` after the merge. If you added any Storybook stories or if story layout in Chromatic changes, those have to be reviewed and approved in Chromatic.

> Remember to merge main into your branch regularly throughout the development process.

## Contributing workflow - external contributors
1. Create a fork of the repository.
2. If not already done, create an issue to track the work.
3. Create a new branch from `main` for your feature or bugfix. A good convention is to use `issue/<issue-number>`.
4. Make your code changes.
5. Run existing tests to ensure everything is working.
6. Add new tests (unit tests, Storybook tests, etc.). Refer to [Creating Test Cases](#creating-test-cases).
7. If applicable, update documentation. Refer to [Documentation](#documentation).
8. Create a pull request to merge your branch into `aehrc/main`.
9. Ensure that all CI checks pass (build, tests, linting, etc.).
10. Merge `main` into your branch to ensure you have the latest changes.
11. Update TypeDoc documentation by running `npm run build` in `/documentation`.
12. Request for a code review from an internal team member.
13. For the reviewing internal team member:
    - Review the code changes.
    - Once approved, merge the pull request into `aehrc/main`.
    - If there are package version bumps, create a new PR referencing the issue and follow the steps from step 13 onwards in [Contributing workflow - internal contributors](#contributing-workflow---internal-contributors) to publish new package versions.

## Dependency notes
- `date-fns` with version "^4.1.0" in `apps/smart-forms-app/package.json` is not used in the source code. It is used to prevent CommonJS issues when building the Smart Forms app in docker.
- `html-react-parser` should be kept at version "4.2.10" in `apps/smart-forms-app/package.json`. Version 5.x breaks QuestionnaireResponse -> HTML parsing.
- `react-router-dom` should be kept at version "6.11.2" in `apps/smart-forms-app/package.json`. Version 7.x breaks useBlocker usage when switching from **renderer** to **renderer/preview** routes.

## Common issues

NPM workspaces can be a bit inconsistent at times, so it is a good idea to merge main back to your branch first, then run `npm install` in the directory you are working on to ensure dependencies are installed correctly.
If `npm install` doesn't resolve the issue, try deleting the `node_modules` directory (or `package-lock.json` at times) and running `npm install` again.

Sometimes packages in the monorepo can have different versions of the same dependency, which may cause issues. Ensure that the package/app you are working on have the same dependency versions as the other packages in the monorepo.
Perform a `npm install` in the directory you are working on every time you change package versions.
e.g. Smart Forms app running v1.0.0-alpha.15 of `@aehrc/smart-forms-renderer` while the documentation app is running v0.44.3.

Sometimes dependencies will work even when they are not installed. That is because NPM workspaces allow packages to work even when they are located in different directories.
Ensure that the new dependency you are using is installed in the directory you are working on.

Sometimes your changes aren't reflected due to of compilation errors. Go back to the watching terminal tab and check if there are any errors.

When running the Smart Forms app locally, if you are getting errors like "Uncaught TypeError: undefined is not a function e.g. Grid2.js", it is likely that Vite is caching a previous (failing) build.
Try deleting the `apps/smart-forms-app/node_modules/.vite` directory and run `npm start` again.
