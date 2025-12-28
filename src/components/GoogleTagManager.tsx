'use client';

import Script from 'next/script';

interface GTMParams {
  gtmId: string;
  gtmAuth?: string;
  gtmPreview?: string;
}

function buildGTMUrl({ gtmId, gtmAuth, gtmPreview }: GTMParams): string {
  let url = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

  if (gtmAuth && gtmPreview) {
    url += `&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x`;
  }

  return url;
}

function buildGTMScript({ gtmId, gtmAuth, gtmPreview }: GTMParams): string {
  const authParams = gtmAuth && gtmPreview
    ? `+'&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x'`
    : '';

  return `
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl${authParams};
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
}

export default function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gtmAuth = process.env.NEXT_PUBLIC_GTM_AUTH;
  const gtmPreview = process.env.NEXT_PUBLIC_GTM_PREVIEW;
  const serverContainerUrl = process.env.NEXT_PUBLIC_GTM_SERVER_URL;

  if (!gtmId) {
    console.warn('Google Tag Manager ID is not configured');
    return null;
  }

  const gtmParams = { gtmId, gtmAuth, gtmPreview };
  const noscriptUrl = buildGTMUrl(gtmParams).replace('/gtm.js', '/ns.html');

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildGTMScript(gtmParams),
        }}
      />

      {/* Server-side Container Configuration */}
      {serverContainerUrl && (
        <Script
          id="gtm-server-container"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                'gtm.serverContainerUrl': '${serverContainerUrl}'
              });
            `,
          }}
        />
      )}

      {/* Google Tag Manager NoScript Fallback */}
      <noscript>
        <iframe
          src={noscriptUrl}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
