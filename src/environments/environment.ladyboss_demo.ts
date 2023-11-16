// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  tenant: 'ladyboss',
  isStaging: true,
  userURL: 'https://demo.ladyboss.io/',
  checkoutDomain: 'https://demo-opc.ladyboss.io/',
  apiDomain: 'https://demodashboard.ladyboss.io',
  shareCartDomain: `https://demofrontend.ladyboss.io/{country}/cart?ref={code}`,
  redirectDomain: 'https://demo.ladyboss.io',
  clientID: 'ladybossinvitesdemoclient',
  inviteClientId: 'ladybossdemodashboardccclient',
  inviteClientSecret: 'demosecret',
  inviteScopes: 'identity_manager invites',
  returningDomain: 'https://account-demo.ladyboss.io/',
  clientDomain: 'https://demofrontend.ladyboss.io',
  phraseBase: 'https://api.phraseapp.com/api/v2/projects/',
  phraseAppId: 'dec2efdab93d62d55da009cb683a438a',
  phraseAppToken:
    'token 0864c626e7cd21f38c5ecc958c9ab0998fe0a586647f61b2febedfa08ea2808f',
  shaSalt: 'QM=5LGFkAczk',
  foodCheckoutUrl: 'https://demo-opc.justpruvit.com/',
  contactHost: 'https://contacts-demo.marketvision.com',
  contactTokenHost: 'https://account-demo.marketvision.com',
  accountHost: 'https://account-demo-v5.ladyboss.io', //'https://account-demo.marketvision.com',
  vaptHost: 'https://api-vapt-int.onebigsplash.com',
  accountClientId: 'ladybossdemodashboardroclient',
  accountClientsecret: 'demosecret',
  iaaConfig: {
    stsServer: 'https://account-demo-v5.ladyboss.io',
    redirectUrl: 'https://demofrontend.ladyboss.io/implicit',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
    // identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
    // or if it contains additional audiences not trusted by the Client.
    clientId: 'ladybossdemodashboardcodeclient',
    responseType: 'code',
    scope: 'openid newgen email phone profile offline_access',
    postLogoutRedirectUri: 'https://demofrontend.ladyboss.io',
    startCheckSession: false,
    silentRenew: true,
    silentRenewUrl: 'https://demofrontend.ladyboss.io/silent.html',
    postLoginRoute: '',
    client_secret: 'demosecret',
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
  newgenUrl: 'https://demo.ladyboss.io/',
  bonusServiceIrl: 'https://bonus-gateway.integration.onebigsplash.com',
  inviteApiUrl: 'https://invites.integration.onebigsplash.com',
  facebookAppId: '571612621520381',
  unicomShortenUrlEndPoint: 'https://u.elde.rs/links/shorten',
  unicomAuthUserName: 'pruvit',
  unicomAuthPassword: 'pruvitdemo',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
