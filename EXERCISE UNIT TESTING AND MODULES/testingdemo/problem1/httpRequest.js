function httpRequest (request) {
    let methods = ['POST', 'GET', 'DELETE', 'CONNECT'];
    let uriReg = /^([A-Za-z0-9.]+)$|\*/g;
    let versions = ['HTTP/0.9', 'HTTP/1.0', 'HTTP/1.1', 'HTTP/2.0'];
    let messageReg = /^([^<>\\&'"]*)$/g;

    if (!request.hasOwnProperty('method') || !methods.includes(request.method)) {
        throw new Error ('Invalid request header: Invalid Method!')
    }

    if (!request.hasOwnProperty('method') || !request.uri.match(uriReg)) {
        throw new Error ('Invalid request header: Invalid URI!');
    }

    if (!request.hasOwnProperty('method') || !versions.includes(request.version)) {
        throw new Error ('Invalid request header: Invalid Version!');
    }

    if (!request.hasOwnProperty('method') || !request.message.match(messageReg)) {
        throw new Error ('Invalid request header: Invalid Message!');
    }

    return request
}

httpRequest ({
    method: 'GET',
    uri: 'svn.public.catalog',
    version: 'HTTP/1.1',
    message: ''

  }
)