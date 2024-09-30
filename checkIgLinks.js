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
    ];

    const jsonUrls = [
        `https://smartforms.csiro.au/${basePathIg}/SmartFormsApplication.openapi.json`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft/SmartFormsApplication.openapi.json`]

    const cssUrls = [
        `https://smartforms.csiro.au/${basePathIg}/fhir.css`,
        `https://smartforms.csiro.au/${basePathIg}/0.2.0-draft/fhir.css`]

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const barrier = '='.repeat(30);


    // Page URLs
    console.log(`${barrier}`);
    console.log('           Page URLs           ');
    console.log(`${barrier}`);
    for (const pageUrl of pageUrls) {
        try {
            const response = await page.goto(pageUrl);
            if (response.ok()) {
                const body = await response.text();
                if (body.includes('csiro.fhir.au.smartforms')) {
                    console.log(`✅ ${pageUrl} is accessible and returned a page on the IG`);
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
    console.log(`\n\n${barrier}`);
    console.log('           JSON URLs           ');
    console.log(`${barrier}`);
    for (const jsonUrl of jsonUrls) {
        try {
            const response = await page.goto(jsonUrl);
            if (response.ok()) {
                const json = await response.json();
                if (json.externalDocs && json.externalDocs.url.includes('CapabilityStatement/SmartFormsApplication')) {
                    console.log(`✅ ${jsonUrl} is accessible and JSON is valid`);
                } else {
                    console.error(`❌ ${jsonUrl} is accessible but JSON is invalid`);
                }

            } else {
                console.error(`❌ ${jsonUrl} returned status code: ${response.status()}`);
            }
        } catch (error) {
            console.error(`❌ Error! Failed to access ${jsonUrl}: ${error.message}`);
        }
    }


    // CSS URLs
    console.log(`\n\n${barrier}`);
    console.log('           CSS URLs           ');
    console.log(`${barrier}`);
    for (const cssUrl of cssUrls) {
        try {
            const response = await page.goto(cssUrl);
            if (response.ok()) {
                const cssText = await response.text();
                if (response.url().endsWith('.css') && cssText.includes('body {')) {
                    console.log(`✅ ${cssUrl} is accessible and CSS is valid`);
                } else {
                    console.error(`❌ ${cssUrl} is accessible but CSS is invalid, IG pages may not render correctly`);
                }

            } else {
                console.error(`❌ ${cssUrl} returned status code: ${response.status()}`);
            }
        } catch (error) {
            console.error(`❌ Error! Failed to access ${cssUrl}: ${error.message}`);
        }
    }

    await browser.close();
})();
