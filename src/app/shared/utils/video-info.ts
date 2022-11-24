export function getWistiaVideoId(url: string) {
  return url.includes('wistia.com')
    ? url.substring(url.lastIndexOf('/') + 1)
    : url;
}

export function getPruvitTvVideoId(url: string) {
  return url.includes('pruvit.tv')
    ? url.substring(url.lastIndexOf('/') + 1)
    : url;
}
