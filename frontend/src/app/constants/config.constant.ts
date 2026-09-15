// export const DEV = process.env.NODE_ENV === 'development';
export const ENV_PROD = false;
export const ENV_DEV = true;
export const ENV_TEST = false;
export const LOG_ENABLED = true;

// Same-origin, on purpose: the installer lets the operator pick any web admin port, and the
// counter PC's install always serves the SPA and the API off the same Apache/port. A hardcoded
// absolute host:port here breaks the moment that port isn't 8000, or the browser is pointed at
// "localhost" while this was baked in as "127.0.0.1" (or vice versa) - two different origins as
// far as the browser is concerned, even though both reach the same server. Relative URLs can't
// diverge from wherever the page was actually loaded from.
export const BASE_URL = '';
export const API_SERVER_URL = '/';
export const MEDIA_SOURCE = '/api/file/';

// Production Server
// export const BASE_URL = 'http://localhost:3000';
// export const API_SERVER_URL = 'https://inventoryapi.naxovisoft.com/';
// export const MEDIA_SOURCE = 'https://inventoryapi.naxovisoft.com/api/file/view/';

export const SERVER_PREFIX = "api";
