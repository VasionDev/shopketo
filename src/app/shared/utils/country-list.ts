export function isEuropeanCountry(countryCode: string) {
  return (
    countryCode === 'AT' ||
    countryCode === 'BE' ||
    countryCode === 'FI' ||
    countryCode === 'FR' ||
    countryCode === 'DE' ||
    countryCode === 'HU' ||
    countryCode === 'IE' ||
    countryCode === 'IT' ||
    countryCode === 'NL' ||
    countryCode === 'PL' ||
    countryCode === 'PT' ||
    countryCode === 'ES' ||
    countryCode === 'SE' ||
    countryCode === 'CH' ||
    countryCode === 'RO' ||
    countryCode === 'GB'
  );
}
