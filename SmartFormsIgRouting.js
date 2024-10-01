/*
    * This function is used to handle routing for the Smart Forms IG in Cloudfront.
    * The base IG url should be https://smartforms.csiro.au/ig
    *
    * When updating the IG, the "latestVersion" variable (line 10) should be updated.
    * It triggers a workflow in GitHub Actions to update the deployed function in Cloudfront.
 */

// Latest IG version, update this every time the IG is updated
const latestVersion = "0.2.0-draft";

const basePathIg = "ig"
const implementationGuideCanonical = `/${basePathIg}/ImplementationGuide/csiro.fhir.au.smartforms`

const validCanonicalResourceTypes = [
    "ActivityDefinition",
    "CapabilityStatement",
    "ChargeItemDefinition",
    "CodeSystem",
    "CompartmentDefinition",
    "ConceptMap",
    "EffectEvidenceSynthesis",
    "EventDefinition",
    "Evidence",
    "EvidenceVariable",
    "ExampleScenario",
    "GraphDefinition",
    "ImplementationGuide",
    "Library",
    "Measure",
    "MessageDefinition",
    "NamingSystem",
    "OperationDefinition",
    "PlanDefinition",
    "Questionnaire",
    "ResearchDefinition",
    "ResearchElementDefinition",
    "RiskEvidenceSynthesis",
    "SearchParameter",
    "StructureDefinition",
    "StructureMap",
    "TerminologyCapabilities",
    "TestScript",
    "ValueSet"
];

function handler(event) {
    let request = event.request;

    // Add headers to control caching
    request.headers['cache-control'] = {
        'value': 'no-store, no-cache, must-revalidate'
    }

    // Ignore double slashes
    request.uri = request.uri.replace(/\/\//g, '/');

    let uri = request.uri;

    // Handle IG routes
    if (uri.startsWith(`/${basePathIg}`)) {
        // If the URI is /test-ig or /test-ig/ redirect to the index.html
        if (uri === `/${basePathIg}` || uri === `/${basePathIg}/` || uri === implementationGuideCanonical) {
            return {
                statusCode: 301,
                statusDescription: 'Moved Permanently',
                headers: {
                    "location": {"value": `/${basePathIg}/index.html`},
                    "cache-control": {"value": "no-store, no-cache, must-revalidate"}
                }
            };
        }

        // Handle URI with a version
        if (uri.includes(".")) {
            const parts = uri.split(".");
            // if the last part is the version, redirect to the version's index.html
            if (parts[parts.length - 1].match(/[0-9]/)) {
                const pathRegex = new RegExp(`/${basePathIg}/[a-z0-9]+`, 'i'); // Create regex with basePath
                const version = getVersionFromURI(uri, `/${basePathIg}`)
                const versionIsLast = versionIsLastPart(uri, version)
                if (uri.match(pathRegex) && version && versionIsLast) {
                    return {
                        statusCode: 301,
                        statusDescription: 'Moved Permanently',
                        headers: {
                            "location": {"value": `/${basePathIg}/${version}/index.html`},
                            "cache-control": {"value": "no-store, no-cache, must-revalidate"}
                        }
                    };
                }
            }
        }


        // Add latest version to URIs without a version
        const subRoutes = uri
          .split("/")
          .filter((part) => part !== "")
          .slice(1);
        if (subRoutes.length > 0) {
            const firstSubRoute = subRoutes[0];

            // Check if the first sub route is a version, otherwise add the latest version to the URI
            if (!/^[0-9]/.test(firstSubRoute)) {
                request.uri = `/${basePathIg}/${latestVersion}/${subRoutes.join("/")}`;
            }

            // Check if uri is canonical. if so, redirect to the resolvable link
            if (isCanonicalUrl(uri, subRoutes)) {
                return {
                    statusCode: 301,
                    headers: {
                        "location": {"value": transformCanonicalUrl(uri, basePathIg, latestVersion)},
                        "cache-control": {"value": "no-store, no-cache, must-revalidate"}
                    }
                };
            }
        }

        // Add .html to URIs without an extension
        let uriChunks = uri.split('/');
        let lastUriChunk = uriChunks[uriChunks.length - 1];
        if (!lastUriChunk.includes('.')) {
            request.uri += '.html';
            return request;
        }
    }


    return request;
}


function getVersionFromURI(uri, prefix) {
    // Check if the uri starts with the prefix
    if (uri.startsWith(prefix)) {
        // Extract the part after the prefix
        const afterPrefix = uri.substring(prefix.length + 1);

        // Split by the slash to isolate the version, i.e. 0.1.0-draft
        return afterPrefix.split('/')[0];
    }

    return null; // Return null if the prefix is not found
}

function versionIsLastPart(uri, version) {
    // Split the uri by the slash
    const parts = uri.split('/').filter(part => part !== '');

    // Check if the last part is the version
    return parts[parts.length - 1] === version;
}

function isCanonicalUrl(uri, subRoutes) {
    // Not a valid canonical URL if uri contains ".html"
    if (uri.includes(".html")) {
        return false;
    }

    // Not a valid canonical URL if the first part has a version
    if (subRoutes[0].match(/[0-9]/)) {
        return false;
    }

    const indexValidCanonicalResourceType = subRoutes.findIndex((subRoute) =>
      validCanonicalResourceTypes.includes(subRoute)
    );

    if (indexValidCanonicalResourceType === -1) {
        return false;
    }

    // Not a valid canonical URL if the last part is the index
    if (indexValidCanonicalResourceType === subRoutes.length - 1) {
        return false;
    }

    return true;
}

function transformCanonicalUrl(uri, basePathIg, latestVersion) {
    const lastSlashIndex = uri.lastIndexOf("/");

    const front = uri.substring(0, lastSlashIndex);
    const back = uri.substring(lastSlashIndex + 1);

    const resolvableUrl = `${front}-${back}.html`;

    // Add latest version to the resolvable URL
    return resolvableUrl.replace(basePathIg, `${basePathIg}/${latestVersion}`);
}
