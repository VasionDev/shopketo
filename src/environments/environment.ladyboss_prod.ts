// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  tenant: 'ladyboss',
  isStaging: false,
  userURL: 'https://cloud.ladyboss.io/',
  checkoutDomain: 'https://checkout.ladyboss.io/',
  apiDomain: 'https://backend.ladyboss.io',
  shareCartDomain: 'https://{code}.ladyboss.com/{country}/cart',
  redirectDomain: 'https://cloud.ladyboss.io',
  clientID: 'ladybossinvitesdemoclient',
  inviteClientId: 'ladybossdashboardccclient',
  inviteClientSecret: 'XRgoMFM42THwBnDtRZwC',
  inviteScopes: 'identity_manager invites',
  returningDomain: 'https://account.ladyboss.io/',
  clientDomain: 'https://ladyboss.io',
  phraseBase: 'https://api.phraseapp.com/api/v2/projects/',
  phraseAppId: 'dec2efdab93d62d55da009cb683a438a',
  phraseAppToken:
    'token 0864c626e7cd21f38c5ecc958c9ab0998fe0a586647f61b2febedfa08ea2808f',
  shaSalt: 'QM=5LGFkAczk',
  foodCheckoutUrl: 'https://checkout.justpruvit.com/',
  contactHost: 'https://contacts.marketvision.com',
  contactTokenHost: 'https://account.marketvision.com',
  accountHost: 'https://account.ladyboss.io',
  vaptHost: 'https://api-pruvit.onebigsplash.com',
  accountClientId: 'ladybossdashboardroclient',
  accountClientsecret: 'KMQ6XMCRw9RNRMkHqcTH',
  iaaConfig: {
    stsServer: 'https://account.ladyboss.io',
    redirectUrl: 'https://ladyboss.io/implicit',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
    // identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
    // or if it contains additional audiences not trusted by the Client.
    clientId: 'ladybossdashboardcodeclient',
    responseType: 'code',
    scope: 'openid newgen email phone profile offline_access',
    postLogoutRedirectUri: 'https://ladyboss.io',
    startCheckSession: false,
    silentRenew: true,
    silentRenewUrl: 'https://ladyboss.io/silent.html',
    postLoginRoute: '',
    client_secret: 'zW9tm9HFcjQRjNqgWEgV',
    // HTTP 403
    forbiddenRoute: '/unauthorized',
    // HTTP 401
    unauthorizedRoute: '/unauthorized',
    // log_console_warning_active: true,
    // log_console_debug_active: true,
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    maxIdTokenIatOffsetAllowedInSeconds: 1000,
    triggerAuthorizationResultEvent: true,
  },
  newgenUrl: 'https://cloud.ladyboss.io/',
  bonusServiceIrl: 'https://api-bonusgw.onebigsplash.com',
  //inviteApiUrl: 'https://invites.integration.onebigsplash.com',
  inviteApiUrl: 'https://api-invites.onebigsplash.com',
  facebookAppId: '571612621520381',
  unicomShortenUrlEndPoint: 'https://pvt.ai/links/shorten',
  unicomAuthUserName: 'pruvit',
  unicomAuthPassword: 'viOBl4gM',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
