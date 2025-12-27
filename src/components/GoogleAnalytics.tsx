'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gtmAuth = process.env.NEXT_PUBLIC_GTM_AUTH;
  const gtmPreview = process.env.NEXT_PUBLIC_GTM_PREVIEW;
  const serverContainerUrl = process.env.NEXT_PUBLIC_GTM_SERVER_URL;

  if (!gtmId) {
    console.warn('Google Tag Manager ID is not configured');
    return null;
  }

  // Build GTM URL with server-side parameters if available
  let gtmSrc = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  if (gtmAuth && gtmPreview) {
    gtmSrc += `&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x`;
  }

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl${gtmAuth && gtmPreview ? `+'&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x'` : ''};
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
            ${serverContainerUrl ? `
            // Server-side GTM configuration
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'gtm.serverContainerUrl': '${serverContainerUrl}'
            });
            ` : ''}
          `,
        }}
      />

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}${gtmAuth && gtmPreview ? `&gtm_auth=${gtmAuth}&gtm_preview=${gtmPreview}&gtm_cookies_win=x` : ''}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
