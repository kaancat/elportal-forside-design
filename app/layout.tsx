import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { SITE_URL, SITE_NAME } from '@/lib/url-helpers'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import './globals.css'

// Configure Inter font with optimal settings (Codex-recommended)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00CD52',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElPortal',
    template: '%s | DinElPortal',
  },
  description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
  keywords: 'elpriser, sammenlign el, billig el, elselskaber, elaftale, vindstød, grøn energi, spotpris, elmarked, strømpriser',
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'da_DK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElPortal',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
    images: [
      {
        url: `${SITE_URL}/dinelportal-logo.png`,
        width: 1200,
        height: 630,
        alt: 'DinElPortal - Sammenlign elpriser og find den bedste elaftale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dinelportal',
    creator: '@dinelportal',
    title: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElPortal',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig.',
    images: [`${SITE_URL}/dinelportal-logo.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization JSON-LD (once in root layout per Codex)
  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/dinelportal-logo.png`,
      width: 600,
      height: 60,
    },
    description: 'Danmarks uafhængige elportal for sammenligning af elpriser',
    sameAs: [
      'https://www.facebook.com/dinelportal',
      'https://twitter.com/dinelportal',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DK',
    },
  }

  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/sammenlign?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="da" className={inter.variable}>
      <head>
        {/* Organization schema in head, once only */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        {/* WebSite SearchAction to improve sitelinks search box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* Ensure no stray preload for external GPT scripts */}
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body suppressHydrationWarning>
        <PerformanceMonitor />
        <div id="root">{children}</div>
        
        {/* Cookiebot Consent Management (GDPR Compliance) */}
        {process.env.NEXT_PUBLIC_COOKIEBOT_ID && (
          <Script 
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={process.env.NEXT_PUBLIC_COOKIEBOT_ID}
            data-blockingmode="auto"
            strategy="afterInteractive"
          />
        )}
        
        {/* Google Consent Mode */}
        <Script 
          id="google-consent"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() {
                dataLayer.push(arguments);
              }
              gtag("consent", "default", {
                ad_personalization: "denied",
                ad_storage: "denied",
                ad_user_data: "denied",
                analytics_storage: "denied",
                functionality_storage: "denied",
                personalization_storage: "denied",
                security_storage: "granted",
                wait_for_update: 500,
              });
              gtag("set", "ads_data_redaction", true);
              gtag("set", "url_passthrough", false);
            `,
          }}
        />

        {/* Cookiebot -> GA4 consent updates */}
        <Script
          id="cookiebot-ga4-consent-sync"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateGaConsent() {
                  try {
                    var hasStats = (typeof Cookiebot !== 'undefined') && Cookiebot.consent && Cookiebot.consent.statistics === true;
                    var hasMarketing = (typeof Cookiebot !== 'undefined') && Cookiebot.consent && Cookiebot.consent.marketing === true;
                    var analytics = hasStats ? 'granted' : 'denied';
                    var marketing = hasMarketing ? 'granted' : 'denied';
                    if (typeof gtag === 'function') {
                      gtag('consent', 'update', {
                        analytics_storage: analytics,
                        ad_user_data: marketing,
                        ad_personalization: marketing,
                        ad_storage: marketing
                      });
                    }
                  } catch (e) {
                    // no-op
                  }
                }

                // Run when Cookiebot is ready or consent changes
                window.addEventListener('CookiebotOnConsentReady', updateGaConsent);
                window.addEventListener('CookiebotOnAccept', updateGaConsent);
                window.addEventListener('CookiebotOnDecline', updateGaConsent);

                // Attempt initial sync if Cookiebot already loaded
                if (typeof Cookiebot !== 'undefined') {
                  updateGaConsent();
                }
              })();
            `,
          }}
        />
        
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script 
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
                    'anonymize_ip': true
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Facebook Pixel with Consent */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                
                // Initialize with Limited Data Use for GDPR
                fbq('dataProcessingOptions', ['LDU'], 0, 0);
                fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                fbq('track', 'PageView');
                
                // Update when consent changes
                window.addEventListener('CookiebotOnAccept', function() {
                  if (typeof Cookiebot !== 'undefined' && Cookiebot.consent.marketing) {
                    fbq('dataProcessingOptions', []);
                  }
                });
              `,
            }}
          />
        )}
        
        {/* Removed GPT Engineer script to avoid CORS noise locally */}
      </body>
    </html>
  )
}
