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

## Configuration

The Smart Forms app uses a `config.json` file for configuration instead of environment variables. This approach provides better flexibility and easier deployment.

### Configuring the application

1. Navigate to the directory containing the Smart Forms app.

   ```sh
   cd apps/smart-forms-app
   ```

2. The configuration is stored in `public/config.json`. This file contains:
   - **Client ID mappings**: Maps EHR issuer URLs to their corresponding OAuth client IDs
   - **App configuration**: Server URLs, scopes, and other application settings

3. Example `config.json` structure:

   ```json
   {
     "clientIds": {
       "https://smartonfhir.aidbox.beda.software": "6cc9bccb-3ae2-40d7-9660-22c99534520b"
     },
     "appConfig": {
       "terminologyServerUrl": "https://tx.ontoserver.csiro.au/fhir",
       "formsServerUrl": "https://smartforms.csiro.au/api/fhir",
       "launchScope": "fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs",
       "launchClientId": "smart-forms-client-id",
       "inAppPopulate": true,
       "enableDynamicClientRegistration": true,
       "dynamicRegistrationFallbackEnabled": true,
       "additionalRedirectUris": ""
     }
   }
   ```

4. **Configuration Validation**: The app includes a built-in configuration checker that validates your `config.json` file. If there are configuration errors, you'll be redirected to `/config-check` to see detailed error messages and fix them.

5. **Note**: The `config.json` file is not tracked by git to allow for local customization. Make sure to create your own copy for local development.

### Legacy Environment Variables (Deprecated)

If you need to use environment variables for backward compatibility, you can still create a `.env.local` file:

1. Duplicate `.env` and rename it to `.env.local`
2. Change `VITE_PRESERVE_SYM_LINKS=true` to `VITE_PRESERVE_SYM_LINKS=false` in `.env.local` or add it if it does not exist. This will allow `tsc -w` to watch for changes properly in the smart-forms-renderer component.

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

5. Go to [http://localhost:6006/](http://localhost:6006/) for Story Book App

NOTE: In the Docker setup, the current source code folder is shared as a volume to the Docker container. This allows the live code reload to work.

TODO: We have experienced some issues with "Type Error: styled_default is not defined" errors in Docker. This can be fixed by upgrading MUI library. Watch this space for future update! As a workaround, restart the Step 3.

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

#### Environment

The Smart Forms app uses environment variables to configure the app. You can find these in `apps/smart-forms-app/.env` and `apps/smart-forms-app/.env.production`.
See https://vite.dev/guide/env-and-mode for more information on how to configure environment variables in Vite.

The default configuration is set to:

```
# Ontoserver endpoint for $expand operations
# To run your own Ontoserver instance, contact us at https://ontoserver.csiro.au/site/contact-us/ontoserver-contact-form/
VITE_ONTOSERVER_URL=https://tx.ontoserver.csiro.au/fhir

# Questionnaire-hosting FHIR server
VITE_FORMS_SERVER_URL=https://smartforms.csiro.au/api/fhir

# Debug mode - set to true in dev mode
VITE_SHOW_DEBUG_MODE=false

# SMART App Launch scopes and launch contexts
# It will be necessary to tweak these variables if you are connecting the app to your own SMART on FHIR enabled CMS/EHR
VITE_LAUNCH_SCOPE=launch/patient patient/*.read offline_access openid fhirUser
VITE_LAUNCH_CLIENT_ID=smart-forms

# This is for setting preserveSymlinks in Vite, ensuring Vite build plays nice with CJS modules (@aehrc/sdc-assemble and @aehrc/sdc-populate) when building for production
# If running locally, set VITE_PRESERVE_SYM_LINKS=false
# In all other occasions, VITE_PRESERVE_SYM_LINKS should be true
VITE_PRESERVE_SYM_LINKS=true
```

In development mode, create a `.env.local` file in the `apps/smart-forms-app` directory and tweak the environment variables as needed.

> Note: In local development mode, set
> VITE_PRESERVE_SYM_LINKS=false so that it allows `tsc -w` to watch the latest changes. If preserveSymLink: true local changes will be ignored.

#### Visualising live renderer changes

If you are making changes to the renderer (`packages/smart-forms-renderer`) and want to see the changes reflected in the Smart Forms app, it is recommended to use Playground - localhost:5173/playground.
Ensure that `tsc -w` is running in the `packages/smart-forms-renderer` directory to watch for changes.

> Every time the renderer is built, the Smart Forms app will automatically reload to reflect the changes.
> If it is not reloading as expected, the most common issue is that the renderer's version doesn't match the dependency version in the Smart Forms app.

> You might also want to ensure if `resolve: { preserveSymlinks: preserveSymlinks }` in vite.config.ts is set to true via env.

> Another potential issue why your changes aren't reflected is because of compilation errors. Go back to the watching terminal tab and check if there are any errors.

#### Visualising sdc-populate or sdc-assemble changes

If you are making changes to `sdc-populate` or `sdc-assemble`, ensure that `tsc -w` is running in their respective directory to watch for changes.

`sdc-populate` and `sdc-assemble` are developed as CommonJS modules. Vite can transpile them into ES6 modules, but this doesn't work with live changes.
The vite.config.ts in `apps/smart-forms-app` by default is set to transpile CommonJS modules into ES6 modules, which means `sdc-populate` or `sdc-assemble` changes won't be reflected in the Smart Forms app.
To ensure changes are reflected, you will need to temporarily set the `module` value as `ES6` in their respective tsconfig.json files.

You will also need to temporarily omit their package name from the `optimizeDeps.include` and `build.commonjsOptions.include` arrays in the Smart Forms app's vite.config.ts.
e.g. When working on `sdc-populate` locally:

```
optimizeDeps: {
    include: ['@aehrc/sdc-assemble'] // omit @aehrc/sdc-populate
},
build: {
  commonjsOptions: {
    include: [/node_modules/, '@aehrc/sdc-assemble'] // omit @aehrc/sdc-populate
  }
}
```

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

#### Visualising live renderer changes

If you are making changes to the renderer (`packages/smart-forms-renderer`) and want to see the changes reflected in Storybook, run `npm run storybook-watch`.
Alternatively, you can run `tsc -w` in one terminal tab and run `npm run storybook` in another terminal tab.

> Sometimes your changes aren't reflected due to compilation errors. Check the watching terminal tab for any errors.

#### Visualising sdc-populate changes

If you are making changes to `sdc-populate`, ensure that `tsc -w` is running in their respective directory to watch for changes.

`sdc-populate` is developed as a CommonJS module. Vite can transpile it into an ES6 module, but this doesn't work with live changes.
The vite.config.ts in `packages/smart-forms-renderer` by default is set to transpile CommonJS modules into ES6 modules, which means `sdc-populate` changes won't be reflected in the Storybook.
To ensure changes are reflected, you will need to temporarily set the `module` value as `ES6` in `packages/sdc-populate/tsconfig.json`.

You will also need to temporarily do the following in `packages/smart-forms-renderer/vite.config.ts`:

1. Omit the package name from the `optimizeDeps.include` and `build.commonjsOptions.include` arrays.
2. Set `resolve.preserveSymlinks` to `false` in vite.config.ts.

e.g. When working on `sdc-populate` locally:

```
optimizeDeps: {
    include: [] // omit @aehrc/sdc-populate
},
build: {
  commonjsOptions: {
    include: [/node_modules/] // omit @aehrc/sdc-populate
  }
}
resolve: { preserveSymlinks: false }
```

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
