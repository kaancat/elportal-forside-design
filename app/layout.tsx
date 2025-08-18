import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00CD52',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://elportal.dk'),
  title: {
    default: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElportal',
    template: '%s | DinElportal',
  },
  description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
  keywords: 'elpriser, sammenlign el, billig el, elselskaber, elaftale, vindstød, grøn energi, spotpris, elmarked, strømpriser',
  authors: [{ name: 'DinElportal' }],
  creator: 'DinElportal',
  publisher: 'DinElportal',
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
    url: 'https://elportal.dk/',
    siteName: 'DinElportal - Din Elportal',
    title: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElportal',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
    images: [
      {
        url: 'https://elportal.dk/opengraph-elportal.jpg',
        width: 1200,
        height: 630,
        alt: 'DinElportal - Sammenlign elpriser og find den bedste elaftale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elportal',
    creator: '@elportal',
    title: 'Sammenlign Elpriser - Find Billigste Elaftale',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig.',
    images: ['https://elportal.dk/opengraph-elportal.jpg'],
  },
  applicationName: 'DinElportal',
  alternates: {
    canonical: 'https://elportal.dk/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          href="/fonts/Inter-VariableFont_opsz,wght.ttf" 
          as="font" 
          type="font/ttf" 
          crossOrigin="anonymous" 
        />
        <link 
          rel="preload" 
          href="/fonts/Geist-VariableFont_wght.ttf" 
          as="font" 
          type="font/ttf" 
          crossOrigin="anonymous" 
        />
      </head>
      <body suppressHydrationWarning>
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
        
        {/* IMPORTANT: GPT Engineer script preserved */}
        <Script 
          src="https://cdn.gpteng.co/gptengineer.js" 
          type="module"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}