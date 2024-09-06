# SDC-Populate

A Typescript reference implementation of the [$populate](http://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc) designed for [Form Population](http://hl7.org/fhir/uv/sdc/populate.html).

Check out the [API Reference](https://smartforms.csiro.au/docs/api/sdc-populate) for technical specifications. 

### Note for Vite users (or if you facing CommonJS/ESM issues)
If you are using Vite, you might need to add the following to your ```vite.config.ts``` file:
This package is a CommonJS module for backwards compatibility with Node.js, so this configuration is required so that Vite can correctly bundle the module.
```ts
export default defineConfig({
  // ...
  optimizeDeps: {
    include: [
      '@aehrc/sdc-populate',
      // other modules as required...
    ],
  },
  build: {
    commonjsOptions: {
      include: [
        /node_modules/, 
        '@aehrc/sdc-populate',
        // other modules as required...
      ]
    }
  },
  resolve: { preserveSymlinks: true }
});
```

During development, please change the `module` element in `tsconfig.json` to `"ES6"` and comment out the above changes. Otherwise `tsc -w` will not work properly.



