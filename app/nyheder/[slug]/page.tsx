/**
 * Dynamic Blog Post Page
 * Renders individual blog posts at /nyheder/[slug]
 * What: Dynamic route for viewing a single blog post fetched from Sanity CMS
 * Why: Allows users to read full articles from the blog archive with provider comparison
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getSiteSettings, getProviders } from '@/server/sanity'
import { SanityService } from '@/services/sanityService'
import { SITE_URL, SITE_NAME, canonicalUrl, getRobotsDirective } from '@/lib/url-helpers'
import ClientLayout from '../../(marketing)/ClientLayout'
import ContentBlocks from '@/components/ContentBlocks'
import ProviderListClientWrapper from '@/components/providers/ProviderListClientWrapper'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'
import type { BlogPost, ProviderListBlock } from '@/types/sanity'

// Cache blog post fetches (use false to disable in dev for instant updates)
const REVALIDATE_SECS = process.env.NODE_ENV === 'development' ? false : 3600
const getCachedBlogPost = async (slug: string) =>
    await unstable_cache(
        async () => SanityService.getBlogPostBySlug(slug),
        ['blogPost', slug],
        {
            revalidate: REVALIDATE_SECS, // false in dev (no cache), 1h otherwise
            tags: ['blogPost', `blogPost:${slug}`],
        }
    )()

// Generate metadata for blog posts
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = await getCachedBlogPost(slug)

    if (!post) {
        return {
            title: 'Artikel ikke fundet',
            description: 'Denne artikel kunne ikke findes.',
            robots: 'noindex, nofollow',
        }
    }

    const title = post.seoMetaTitle || post.title
    const description = post.seoMetaDescription || post.description
    const keywords = post.seoMetaKeywords || []
    const keywordsArray = Array.isArray(keywords)
        ? keywords
        : String(keywords)
            .split(',')
            .map(k => k.trim())
            .filter(Boolean)
    // Sanity image asset can be a reference or a direct asset with url; guard accordingly
    const ogImage =
        (post.seoOpenGraphImage?.asset && 'url' in post.seoOpenGraphImage.asset
            ? (post.seoOpenGraphImage.asset as { url: string }).url
            : undefined) ||
        (post.featuredImage?.asset && 'url' in post.featuredImage.asset
            ? (post.featuredImage.asset as { url: string }).url
            : undefined)

    return {
        title: `${title} | ${SITE_NAME}`,
        description,
        keywords: keywordsArray,
        openGraph: {
            title,
            description,
            url: canonicalUrl(`/nyheder/${slug}`),
            siteName: SITE_NAME,
            type: 'article',
            images: ogImage ? [{ url: ogImage }] : [],
            publishedTime: post.publishedDate,
            tags: post.tags || [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
        alternates: {
            canonical: canonicalUrl(`/nyheder/${slug}`),
        },
        robots: getRobotsDirective(),
    }
}

// Generate static paths for blog posts
export async function generateStaticParams() {
    try {
        const posts = await SanityService.getAllBlogPosts()
        return posts.map((post) => ({
            slug: post.slug?.current || '',
        }))
    } catch (error) {
        console.error('Error generating static params for blog posts:', error)
        return []
    }
}

// Revalidate: use a static literal so Next can statically analyze
export const revalidate = 3600

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [post, siteSettings, providers] = await Promise.all([
        getCachedBlogPost(slug),
        getSiteSettings(),
        getProviders().catch(() => []), // Fetch providers for comparison list
    ])

    if (!post) {
        notFound()
    }

    // Format date to Danish format
    const date = new Date(post.publishedDate)
    const formattedDate = date.toLocaleDateString('da-DK', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    })

    // Get image URL from Sanity asset
    const imageUrl = (post.featuredImage?.asset && 'url' in post.featuredImage.asset && post.featuredImage.asset.url)
        ? post.featuredImage.asset.url
        : 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3'
    const imageAlt = post.featuredImage?.alt || post.title

    // Get content blocks from the blog post
    const contentBlocks = post.contentBlocks || []

    // Append Provider Comparison List to the bottom of every blog post
    const providerListBlock: ProviderListBlock = {
        _type: 'providerList',
        _key: 'blog-provider-list',
        title: 'Sammenlign populære elselskaber',
        subtitle: 'Se aktuelle elaftaler og priser',
        headerAlignment: 'left',
        providers: Array.isArray(providers) ? providers : []
    }

    // For blog posts, we render the provider list as a sticky sidebar on desktop.
    // On mobile, we show it below the content.

    // Calculate reading time dynamically based on content length
    const calculateReadTime = (blocks: any[]): number => {
        let totalWords = 0

        // Count words in title and description
        totalWords += (post.title?.split(/\s+/).length || 0)
        totalWords += (post.description?.split(/\s+/).length || 0)

        // Extract text from content blocks
        blocks.forEach((block: any) => {
            if (block._type === 'richTextSection' && block.content) {
                // Handle Portable Text content
                const extractText = (node: any): string => {
                    if (typeof node === 'string') return node
                    if (Array.isArray(node)) return node.map(extractText).join(' ')
                    if (node.text) return node.text
                    if (node.children) return extractText(node.children)
                    return ''
                }
                const text = extractText(block.content)
                totalWords += text.split(/\s+/).filter(word => word.length > 0).length
            }

            // Count words in other text fields
            if (block.title) totalWords += block.title.split(/\s+/).length
            if (block.description) totalWords += block.description.split(/\s+/).length
            if (block.leadingText) totalWords += block.leadingText.split(/\s+/).length
        })

        // Average reading speed: 200 words per minute
        // Minimum 1 minute, round up
        return Math.max(1, Math.ceil(totalWords / 200))
    }

    // Use calculated reading time or fall back to CMS value or default
    const readTime = post.readTime || calculateReadTime(contentBlocks)

    // Generate Article JSON-LD
    const jsonLdArticle = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        url: canonicalUrl(`/nyheder/${slug}`),
        datePublished: post.publishedDate,
        dateModified: post.publishedDate,
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/logo.png`,
            },
        },
        image: imageUrl || `${SITE_URL}/og-image.png`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl(`/nyheder/${slug}`),
        },
        keywords: post.tags?.join(', ') || '',
        articleSection: post.primaryTopic || 'Energi',
    }

    // Generate Breadcrumb JSON-LD
    const jsonLdBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Hjem',
                item: SITE_URL,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Nyheder',
                item: canonicalUrl('/nyheder'),
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl(`/nyheder/${slug}`),
            },
        ],
    }

    return (
        <>
            {/* JSON-LD structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
            />

            <ClientLayout initialSiteSettings={siteSettings ?? null} showReadingProgress={true}>
                <article className="min-h-screen">
                    {/* Hero section with image - rounded like /nyheder hero */}
                    <div className="md:p-4">
                        <div className="relative min-h-[60vh] md:min-h-[70vh] md:rounded-2xl overflow-hidden">
                            <Image
                                src={imageUrl.includes('?') ? `${imageUrl}&auto=format&fit=crop&w=1920&q=80` : `${imageUrl}?auto=format&fit=crop&w=1920&q=80`}
                                alt={imageAlt}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Content overlay */}
                            <div className="relative container mx-auto px-4 py-12 md:py-16 min-h-[60vh] md:min-h-[70vh] flex items-end">
                                <div className="max-w-4xl pb-4 md:pb-8">
                                    {/* Back button */}
                                    <Link
                                        href="/nyheder"
                                        className="inline-flex items-center gap-2 text-white hover:text-brand-green transition-colors mb-4 md:mb-6"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="text-sm font-semibold">Tilbage til alle indlæg</span>
                                    </Link>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                        <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${post.type === 'Guide' ? 'bg-brand-green-dark' : 'bg-brand-green'
                                            }`}>
                                            {post.type.toUpperCase()}
                                        </span>
                                        <time className="text-xs md:text-sm text-white/80">{formattedDate}</time>
                                        <span className="flex items-center gap-1 text-xs md:text-sm text-white/80">
                                            <Clock className="h-3 w-3" />
                                            {readTime} min
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white mb-3 md:mb-4 leading-tight">
                                        {post.title}
                                    </h1>
                                    <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl">
                                        {post.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Article content with sticky provider sidebar (desktop) */}
                    <div className="container mx-auto px-4 py-16">
                        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main content */}
                            <div className="lg:col-span-8 xl:col-span-8">
                                {contentBlocks.length > 0 ? (
                                    <ContentBlocks blocks={contentBlocks} blogFullBleedExceptRich />
                                ) : (
                                    <div className="prose prose-lg max-w-none">
                                        <p className="text-gray-700 leading-relaxed mb-6">
                                            Intet indhold tilgængeligt endnu. Tilføj content blocks i Sanity CMS for at vise indhold her.
                                        </p>
                                    </div>
                                )}

                                {/* Mobile-only provider list (full component) */}
                                <div className="mt-12 lg:hidden">
                                    {/* Keep the original component look; no style changes */}
                                    {/* Narrow container to feel balanced on mobile */}
                                    <div className="max-w-xl mx-auto">
                                        <ProviderListClientWrapper block={providerListBlock} />
                                    </div>
                                </div>

                                {/* Call to action */}
                                <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Fandt du denne artikel nyttig?</p>
                                        <p className="text-lg font-semibold text-brand-dark">Læs flere guides og blog-indlæg</p>
                                    </div>
                                    <Button asChild className="bg-brand-green hover:bg-brand-green-hover text-white flex-shrink-0">
                                        <Link href="/nyheder">
                                            Se alle indlæg
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Sticky sidebar with providers (desktop only) */}
                            <aside className="hidden lg:block lg:col-span-4 xl:col-span-4">
                                <div className="sticky top-24">
                                    <div className="max-h-[calc(100vh-5rem)] rounded-2xl border border-gray-100 bg-white shadow-lg">
                                        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
                                            <ProviderListClientWrapper block={providerListBlock} variant="sidebar" className="px-4 pt-4" />
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </article>
            </ClientLayout>
        </>
    )
}
