import { Request, Response } from 'express';

const Error = {
  status: {
    SC_CONTINUE: 100,
    SC_SWITCHING_PROTOCOLS: 101,
    SC_OK: 200,
    SC_CREATED: 201,
    SC_ACCEPTED: 202,
    SC_NON_AUTHORITATIVE_INFORMATION: 203,
    SC_NO_CONTENT: 204,
    SC_RESET_CONTENT: 205,
    SC_PARTIAL_CONTENT: 206,
    SC_MULTIPLE_CHOICES: 300,
    SC_MOVED_PERMANENTLY: 301,
    SC_MOVED_TEMPORARILY: 302,
    SC_FOUND: 302,
    SC_SEE_OTHER: 303,
    SC_NOT_MODIFIED: 304,
    SC_USE_PROXY: 305,
    SC_TEMPORARY_REDIRECT: 307,
    SC_BAD_REQUEST: 400,
    SC_UNAUTHORIZED: 401,
    SC_PAYMENT_REQUIRED: 402,
    SC_FORBIDDEN: 403,
    SC_NOT_FOUND: 404,
    SC_METHOD_NOT_ALLOWED: 405,
    SC_NOT_ACCEPTABLE: 406,
    SC_PROXY_AUTHENTICATION_REQUIRED: 407,
    SC_REQUEST_TIMEOUT: 408,
    SC_CONFLICT: 409,
    SC_GONE: 410,
    SC_LENGTH_REQUIRED: 411,
    SC_PRECONDITION_FAILED: 412,
    SC_REQUEST_ENTITY_TOO_LARGE: 413,
    SC_REQUEST_URI_TOO_LONG: 414,
    SC_UNSUPPORTED_MEDIA_TYPE: 415,
    SC_REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    SC_EXPECTATION_FAILED: 417,
    SC_INTERNAL_SERVER_ERROR: 500,
    SC_NOT_IMPLEMENTED: 501,
    SC_BAD_GATEWAY: 502,
    SC_SERVICE_UNAVAILABLE: 503,
    SC_GATEWAY_TIMEOUT: 504,
    SC_HTTP_VERSION_NOT_SUPPORTED: 505
  },
  error : {
    100: 'Continue',                       // SC_CONTINUE
    101: 'Switching protocols',            // SC_SWITCHING_PROTOCOLS
    200: 'Ok',                             // SC_OK
    201: 'Created',                        // SC_CREATED
    202: 'Accepted',                       // SC_ACCEPTED
    203: 'None authoritative information', // SC_NON_AUTHORITATIVE_INFORMATION
    204: 'No content',                     // SC_NO_CONTENT
    205: 'Reset content',                  // SC_RESET_CONTENT
    206: 'Partial content',                // SC_PARTIAL_CONTENT
    300: 'Multiple choices',               // SC_MULTIPLE_CHOICES
    301: 'Moved permanently',              // SC_MOVED_PERMANENTLY
    302: 'Moved temporarily',              // SC_MOVED_TEMPORARILY
    // 302 SC_FOUND
    303: 'See other',                      // SC_SEE_OTHER
    304: 'Not modified',                   // SC_NOT_MODIFIED
    305: 'Use proxy',                      // SC_USE_PROXY
    307: 'Temporary redirect',             // SC_TEMPORARY_REDIRECT
    400: 'Bad request',                    // SC_BAD_REQUEST
    401: 'Unauthorized',                   // SC_UNAUTHORIZED
    402: 'Payment required',               // SC_PAYMENT_REQUIRED
    403: 'Forbidden',                      // SC_FORBIDDEN
    404: 'Not found',                      // SC_NOT_FOUND
    405: 'Method not allowed',             // SC_METHOD_NOT_ALLOWED
    406: 'Not acceptable',                 // SC_NOT_ACCEPTABLE
    407: 'Proxy authentication required',  // SC_PROXY_AUTHENTICATION_REQUIRED
    408: 'Request timeout',                // SC_REQUEST_TIMEOUT:
    409: 'Conflict',                       // SC_CONFLICT
    410: 'Gone',                           // SC_GONE
    411: 'Length required',                // SC_LENGTH_REQUIRED
    412: 'Precondition failed',            // SC_PRECONDITION_FAILED
    413: 'Request entity too large',       // SC_REQUEST_ENTITY_TOO_LARGE
    414: 'Request uri too long',           // SC_REQUEST_URI_TOO_LONG
    415: 'Unsupported media type',         // SC_UNSUPPORTED_MEDIA_TYPE
    416: 'Requested range not satisfiable',// SC_REQUESTED_RANGE_NOT_SATISFIABLE
    417: 'Expectation failed',             // SC_EXPECTATION_FAILED
    500: 'Internal server error',          // SC_INTERNAL_SERVER_ERROR
    501: 'Not implemented',                // SC_NOT_IMPLEMENTED
    502: 'Bad gateway',                    // SC_BAD_GATEWAY
    503: 'Service unavailable',            // SC_SERVICE_UNAVAILABLE
    504: 'Gateway timeout',                // SC_GATEWAY_TIMEOUT
    505: 'Http version not supported'      // SC_HTTP_VERSION_NOT_SUPPORTED
  },
  printError: function (req: Request, res: Response, status: number, message: string) {
    const idx = req.originalUrl.indexOf('?', 0);
    const path = req.originalUrl.substring(0, idx >= 0 ? idx : req.originalUrl.length);
    const now = new Date();
    const month = (now.getMonth()+1) < 10 ? '0' + (now.getMonth()+1) : (now.getMonth()+1).toString();
    const date = now.getDate() < 10 ? '0' + now.getDate() : now.getDate().toString();
    const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours().toString();
    const minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes().toString();
    const seconds = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds().toString();
    const milliseconds =
      now.getMilliseconds() < 10 ?
      '00' + now.getMilliseconds() : 
      (
        now.getMilliseconds() < 100 ?
        '0' + now.getMilliseconds() : 
        now.getMilliseconds().toString()
      );
    const timestamp = `${now.getFullYear()}-${month}-${date}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;
    res.status(status).json({
      timestamp,
      status,
      error: (Error as any).error[status],
      message,
      path
    });
  }
};

export default Error;