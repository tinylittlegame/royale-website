'use client';

import { useEffect } from 'react';

export default function TikTokPixel() {
  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

    if (!pixelId) {
      console.warn('TikTok Pixel ID is not configured');
      return;
    }

    // TikTok Pixel Code
    (function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = [
        'page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
        'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
        'holdConsent', 'revokeConsent', 'grantConsent'
      ];
      ttq.setAndDefer = function (t: any, e: string) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (t: string) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(e, ttq.methods[n]);
        }
        return e;
      };
      ttq.load = function (e: string, n?: any) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js',
          o = n && n.partner;
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = r + '?sdkid=' + e + '&lib=' + t;
        var a = d.getElementsByTagName('script')[0];
        a.parentNode!.insertBefore(s, a);
      };

      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');
  }, []);

  return null;
}
