import { NextRequest, NextResponse } from 'next/server'
import { sanityClient } from '@/server/sanity'

/**
 * API route for fetching site settings
 * Handles CORS and authentication server-side for navigation data
 */
export async function GET(request: NextRequest) {
  try {
    const query = `*[_type == "siteSettings"][0] {
      _id,
      _type,
      title,
      logo {
        asset-> {
          _id,
          _ref,
          url
        },
        alt
      },
      headerLinks[] {
        _type == "link" => {
          _key,
          _type,
          title,
          linkType,
          internalLink->{ "slug": slug.current, _type, title },
          externalUrl,
          isButton
        },
        _type == "megaMenu" => {
          _key,
          _type,
          title,
          content[] {
            _key,
            _type,
            title,
            items[] {
              _key,
              _type,
              title,
              description,
              icon {
                ...,
                metadata {
                  inlineSvg,
                  iconName,
                  url,
                  color
                }
              },
              link {
                _type,
                linkType,
                internalLink->{ "slug": slug.current, _type, title },
                externalUrl
              }
            }
          }
        }
      },
      footer {
        footerLogo {
          asset-> {
            _id,
            _ref,
            url
          },
          alt
        },
        footerDescription,
        copyrightText,
        secondaryCopyrightText,
        linkGroups[] {
          _key,
          title,
          links[] {
            _key,
            title,
            linkType,
            internalLink->{ "slug": slug.current, _type, title },
            externalUrl
          }
        }
      }
    }`

    const settings = await sanityClient.fetch(query)
    
    if (!settings) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}