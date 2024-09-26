function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Handle ACDC Pilot routes
  if (uri.includes('/acdcpilot')) {
    if (uri.startsWith('/acdcpilot/fhir/Questionnaire')) {
      // Rewrite the URI to the specific S3 object path
      request.uri = '/acdcpilot/fhir/Questionnaire.json';
    }

    return request;
  }

  // Handle IG routes
  if (uri.includes('/ig')) {
    // Reroute to smartforms.csiro.au/ig/index.html
    if (uri === '/ig/') {
      request.uri += 'index.html';
      return request;
    }

    if (uri === '/ig') {
      request.uri += '/index.html';
      return request;
    }

    // Append ".html to IG subroutes"
    // if(uri.endsWith('.')) {
    //     request.uri += 'html';
    //     return request;
    // }

    // Replace http://example.com/ig/* into http://example.com/ig/*/index.html
    if (uri.includes('.')) {
      var parts = uri.split('.');
      if (parts[parts.length - 1].match(/[0-9]/)) {
        if (uri.match(/\/ig\/[a-z0-9]+/i)) {
          if (uri.endsWith('/')) {
            request.uri += 'redirect.html';
            return request;
          }

          // if uri is /ig/* without a trailing slash
          request.uri += '/redirect.html';
          return request;
        }
      }
    }


    // Replace http://example.com/ig/* into http://example.com/ig/*/index.html
    // if (uri.match(/\/ig\/[a-z0-9]+\//i)) {
    //     request.uri += "index.html";
    //     return request;
    // }


    var uriChunks = uri.split('/');
    var lastUriChunk = uriChunks[uriChunks.length - 1];
    if (!lastUriChunk.includes('.')) {
      request.uri += '.html';
      return request;
    }

  }

  // Handle Storybook routes
  if (uri.includes('/storybook')) {
    // Reroute to smartforms.csiro.au/storybook/index.html
    if (uri === '/storybook/') {
      request.uri += 'index.html';
      return request;
    }

    if (uri === '/storybook') {
      request.uri = '/redirect.html';
      return request;
    }

    return request;
  }


  // Handle Docs routes
  if (uri.includes('/docs')) {
    // Reroute to smartforms.csiro.au/docs/index.html
    if (uri === '/docs/') {
      request.uri += 'index.html';
      return request;
    }

    if (uri === '/docs') {
      request.uri = '/redirect.html';
      return request;
    }

    if (!uri.includes('.')) {
      // For https://smartforms.csiro.au/docs/sdc/population/ cases
      if (uri.endsWith('/')) {
        request.uri = uri.slice(0, -1) + ".html";
      }
      // For https://smartforms.csiro.au/docs/sdc/population cases
      else {
        request.uri += '.html';
      }
      return request;
    }

    return request;
  }

  // Handle Forms Server API routes
  if (uri.includes('/api')) {
    // Remove the /api prefix
    if (uri.startsWith('/api/')) {
      request.uri = uri.replace('/api', '');
      return request;
    }

    if (uri === '/api') {
      request.uri = '/';
      return request;
    }
  }

  // Handle EHR Launcher routes
  if (uri.includes('/ehr')) {
    // Remove the /ehr prefix
    if (uri.startsWith('/ehr/')) {
      request.uri = uri.replace('/ehr', '');
      return request;
    }

    if (uri === '/ehr') {
      request.uri = '/';
      return request;
    }
  }

  return request;
}
