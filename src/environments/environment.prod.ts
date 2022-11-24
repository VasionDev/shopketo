export const environment = {
  production: true,
  isStaging: false,
  userURL: 'https://cloud.justpruvit.com/',
  checkoutDomain: 'https://checkout.justpruvit.com/',
  shareCartDomain: 'https://{code}.shopketo.com/{country}/cart',
  apiDomain: 'https://api.shopketo.com',
  redirectDomain: 'https://cloud.justpruvit.com',
  clientID: 'pruvitomicronclientv2',
  returningDomain: 'https://account.justpruvit.com/',
  accountHost: 'https://account.justpruvit.com',
  accountClientId: 'pruvitshopketoroclient',
  accountClientsecret: 'gtNqtcjpks7YisevhLdD',
  clientDomain: 'https://shopketo.com',
  phraseBase: 'https://api.phraseapp.com/api/v2/projects/',
  phraseAppId: 'dec2efdab93d62d55da009cb683a438a',
  phraseAppToken:
    'token 98b16648a3a885dcb8bab72744c3081aa315322dbb8d0a52ddf0110e57e897e8',
  shaSalt: '62MsF98S3KPI',
  foodCheckoutUrl: 'https://checkout.justpruvit.com/',
  contactHost: 'https://contacts.justpruvit.com',
  vaptHost: 'https://api-pruvit.onebigsplash.com',
  iaaConfig: {
    stsServer: 'https://account.justpruvit.com',
    redirectUrl: 'https://shopketo.com/implicit',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
    // identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
    // or if it contains additional audiences not trusted by the Client.
    clientId: 'pruvitshopketocodeclient',
    responseType: 'code',
    scope: 'openid newgen email phone profile offline_access',
    postLogoutRedirectUri: 'https://shopketo.com',
    startCheckSession: false,
    silentRenew: true,
    silentRenewUrl: 'https://shopketo.com/silent.html',
    postLoginRoute: '',
    client_secret: '75px4ErRL4zGaHM2uLhA',
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
  newgenUrl: 'https://cloud.justpruvit.com/',
  bonusServiceIrl: 'https://api-bonusgw.onebigsplash.com',
  facebookAppId: '1555318601409164',
  unicomShortenUrlEndPoint: 'https://pvt.ai/links/shorten',
  unicomAuthUserName: 'pruvit',
  unicomAuthPassword: 'viOBl4gM'
};