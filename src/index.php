<?php
header("Expires: Tue, 03 Jul 2001 06:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
define( 'ABSPATH', dirname(__FILE__) );
require_once ABSPATH . '/lib/inc.php';
$gaTrackId = $gaConversionId = $fbMetaTag = '';
$MvReferrer = new MvReferrer();
$referrerID = $MvReferrer->get_referrer_id();
if($referrerID != '') {
  $refTrackingInfo = $MvReferrer->get_referrer_tracking_data($referrerID);
  $gaTrackId = isset($refTrackingInfo['ga_id']) && $refTrackingInfo['ga_id'] != '' ? $refTrackingInfo['ga_id'] : '';
  $gaConversionId = isset($refTrackingInfo['ga_ad_id']) && $refTrackingInfo['ga_ad_id'] != '' ? $refTrackingInfo['ga_ad_id'] : '';
  $fbMetaTag = isset($refTrackingInfo['fb_meta_tag']) && $refTrackingInfo['fb_meta_tag'] != '' ? $refTrackingInfo['fb_meta_tag'] : '';
}

$server = preg_match('/shopketo.com/', $_SERVER['HTTP_HOST']) ? 'shopketo' : 'pruvit';
$templateFile = fopen("template.html", "r");
$template = fread($templateFile, filesize("template.html"));
fclose($templateFile);

$headScriptString = '';
$url = $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$pattern = $server == 'shopketo' ? "@shopketo.com/([^/\?]+)@" : "@pruvit.com/([^/\?]+)@";
$pattern1 = $server == 'shopketo' ? "@([^/?]+).shopketo.com@" : "@([^/?]+).pruvit.com@";

preg_match($pattern, $url, $matches);
preg_match($pattern1, $_SERVER['HTTP_HOST'], $m);
$europeCountries = array('at', 'be', 'bg', 'hr', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se', 'ch', 'gb');
$countryCode = isset($matches[1]) ? $matches[1] : '';
if(in_array($countryCode, $europeCountries) || isset($m[1])) $headScriptString = '<meta name="robots" content="noindex,nofollow">';
if($fbMetaTag != '') $headScriptString .= '<meta name="facebook-domain-verification" content="'.$fbMetaTag.'">';

$gtmId = $server == 'shopketo' ? 'GTM-58H7D22' : 'GTM-KJ69L3C7';
$mmtId = $server == 'shopketo' ? 'G-7EP01WBP8F' : 'G-1FGZ3TM7ZH';

if(isset($_COOKIE["CookieConsent"])) {
  $json = urldecode($_COOKIE["CookieConsent"]);
  $cookieConsent = json_decode($json, true);
  if ($cookieConsent["analytics"]) { 
    $headScriptString .= '
    <script>
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
        });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "'.$gtmId.'");
    </script>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id='.$mmtId.'"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag(\'js\', new Date());
      gtag(\'config\', \''.$mmtId.'\');
    </script>';

    if ($gaTrackId != '') {
      $headScriptString .='
      <script async src="https://www.googletagmanager.com/gtag/js?id='.$gaTrackId.'"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag(\'js\', new Date());
        gtag(\'config\', \''.$gaTrackId.'\');
        '.($gaConversionId != '' ? 'gtag(\'config\', \''.$gaConversionId.'\');' : '').'
      </script>';
    }
  }
} else {
  $headScriptString .='
  <script>
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", "'.$gtmId.'");
  </script>

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id='.$mmtId.'"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag(\'js\', new Date());
    gtag(\'config\', \''.$mmtId.'\');
  </script>';

  if ($gaTrackId != '') { 
    $headScriptString .='
    <script async src="https://www.googletagmanager.com/gtag/js?id='.$gaTrackId.'"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag(\'js\', new Date());
      gtag(\'config\', \''.$gaTrackId.'\');
      '.($gaConversionId != '' ? 'gtag(\'config\', \''.$gaConversionId.'\');' : '').'
    </script>';
  }
}

$bodyScriptString = '';
if(isset($_COOKIE["CookieConsent"])) {
  $json = urldecode($_COOKIE["CookieConsent"]);
  $cookieConsent = json_decode($json, true);
  if ($cookieConsent["analytics"]) {
    $bodyScriptString = '<noscript><iframe
        src="https://www.googletagmanager.com/ns.html?id='.$gtmId.'"
        height="0"
        width="0"
        style="display: none; visibility: hidden"
      ></iframe>
    </noscript>';
  }
} else {
  $bodyScriptString = 
  '<noscript>
    <iframe 
      src="https://www.googletagmanager.com/ns.html?id='.$gtmId.'" 
      height="0" 
      width="0" 
      style="display: none; visibility: hidden">
    </iframe>
  </noscript>';
}

$content = str_replace(array('<script>[[headscript]]</script>', '<script>[[bodyscript]]</script>'), array($headScriptString, $bodyScriptString), $template);
echo $content;

exit(0);
