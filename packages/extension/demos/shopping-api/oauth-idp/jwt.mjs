// Sync with access-demo/oauth-idp/jwt.mjs (db2ai) — re-exports shopping-api JWT + demo token minting.
export { jwtSecret, signJwt, verifyJwt } from '../jwt.mjs';
export { getJwksDocument, mintCustomerToken, signJwtRs256 } from './signing.mjs';
