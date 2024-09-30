const {chromium} = require('playwright');


(async () => {
    const basePathIg = "test-ig"

    const pageUrls = [
        // Index page
        `https://smartforms.csiro.au/${basePathIg}`,
        `https://smartforms.csiro.au/${basePathIg}/`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft`,
        `https://smartforms.csiro.au/${basePathIg}/ImplementationGuide/csiro.fhir.au.smartforms`,

        // Versioned pages
        `https://smartforms.csiro.au/test-ig/0.2.0-draft/artifacts`,
        `https://smartforms.csiro.au/test-ig/0.2.0-draft/artifacts.html`,
        `https://smartforms.csiro.au/test-ig/0.2.0-draft/CapabilityStatement-SmartFormsApplication`,

        // Canonical URLs
        `https://smartforms.csiro.au/${basePathIg}/CapabilityStatement/SmartFormsApplication`,
        `https://smartforms.csiro.au/ig/0.2.0-draft/CapabilityStatement/SmartFormsApplication`,
    ];

    const jsonUrls = [
        `https://smartforms.csiro.au/${basePathIg}/SmartFormsApplication.openapi.json`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft/SmartFormsApplication.openapi.json`]

    const cssUrls = [
        `https://smartforms.csiro.au/${basePathIg}/fhir.css`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft/fhir.css`]

    const downloadUrls = [
        `https://smartforms.csiro.au/${basePathIg}/examples.json.zip`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft/package.tgz`]


    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();


    // Page URLs
    for (const pageUrl of pageUrls) {
        try {
            const response = await page.goto(pageUrl);
            if (response.ok()) {
                const body = await response.text();
                if (body.includes('csiro.fhir.au.smartforms')) {
                    console.log(`✅ ${pageUrl} is accessible and return a page on the IG`);
                } else {
                    console.error(`❌ ${pageUrl} is accessible but does not return a page on the IG`);
                }

            } else {
                console.error(`❌ ${pageUrl} returned status code: ${response.status()}`);
            }
        } catch (error) {
            console.error(`❌ Error! Failed to access ${pageUrl}: ${error.message}`);
        }
    }

    // JSON URLs
    for (const jsonUrl of jsonUrls) {
        try {
            const response = await page.goto(jsonUrl);
            if (response.ok()) {
                const json = await response.json();
                if (json.externalDocs && json.externalDocs.url.includes('CapabilityStatement/SmartFormsApplication')) {
                    console.log(`✅ ${jsonUrl} is accessible and JSON is valid`);
                } else {
                    console.error(`❌ ${jsonUrl} is accessible but does not return a page on the IG`);
                }

            } else {
                console.error(`❌ ${jsonUrl} returned status code: ${response.status()}`);
            }
        } catch (error) {
            console.error(`❌ Error! Failed to access ${jsonUrl}: ${error.message}`);
        }
    }

    await browser.close();
})();
