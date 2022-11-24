export const environment = {
  production: true,
  isStaging: true,
  userURL: 'https://demo.justpruvit.com/',
  checkoutDomain: 'https://demo-opc.justpruvit.com/',
  shareCartDomain: 'https://shopketo.mypruvit.com/{country}/cart?ref={code}',
  apiDomain: 'https://shopketo.marketvision.com',
  redirectDomain: 'https://demo.justpruvit.com',
  accountHost: 'https://account-demo.marketvision.com',
  accountClientId: 'pruvitdemoshopketoroclient',
  accountClientsecret: 'demosecret',
  clientID: 'pruvitdemoomicronclient',
  returningDomain: 'https://account-demo.justpruvit.com/',
  clientDomain: 'https://shopketo.mypruvit.com',
  phraseBase: 'https://api.phraseapp.com/api/v2/projects/',
  phraseAppId: 'dec2efdab93d62d55da009cb683a438a',
  phraseAppToken:
    'token 98b16648a3a885dcb8bab72744c3081aa315322dbb8d0a52ddf0110e57e897e8',
  shaSalt: 'QM=5LGFkAczk',
  foodCheckoutUrl: 'https://demo-opc.justpruvit.com/',
  contactHost: 'https://contacts-demo.marketvision.com',
  vaptHost: 'https://api-vapt-int.onebigsplash.com',
  iaaConfig: {
    stsServer: 'https://account-demo.justpruvit.com',
    redirectUrl: 'https://shopketo-demo.azurewebsites.net/implicit',
    // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer
    // identified by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
    // or if it contains additional audiences not trusted by the Client.
    clientId: 'pruvitdemoomicronimpclient',
    responseType: 'code',
    scope: 'openid newgen email phone profile offline_access',
    postLogoutRedirectUri: 'https://shopketo-demo.azurewebsites.net',
    startCheckSession: false,
    silentRenew: true,
    silentRenewUrl: 'https://shopketo-demo.azurewebsites.net/silent.html',
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
  newgenUrl: 'https://demo.justpruvit.com/',
  bonusServiceIrl: 'https://bonus-gateway.integration.onebigsplash.com',
  facebookAppId: '1555318601409164',
  unicomShortenUrlEndPoint: 'https://u.elde.rs/links/shorten',
  unicomAuthUserName: 'pruvit',
  unicomAuthPassword: 'pruvitdemo'
};
