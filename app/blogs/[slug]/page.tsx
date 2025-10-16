/**
 * Individual blog post page
 * What: Dynamic route for viewing a single blog post fetched from Sanity CMS
 * Why: Allows users to read full articles from the blog archive
 */

import ClientLayout from '../../(marketing)/ClientLayout'
import { getSiteSettings } from '@/server/sanity'
import { SanityService } from '@/services/sanityService'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import ContentBlocks from '@/components/ContentBlocks'
import { getProviders } from '@/server/sanity'
import type { ProviderListBlock } from '@/types/sanity'

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
    const posts = await SanityService.getAllBlogPosts()
    return posts.map((post) => ({
        slug: post.slug.current,
    }))
}

// Legacy mock blog data (kept as reference but commented out)
/* const getBlogPost = (slug: string) => {
    const allPosts = {
        'saadan-undgaar-du-stroem-spild': {
            title: 'Sådan undgår du "strøm-spild" – smarte vaner der sænker elregningen',
            description: 'Praktiske tips til at reducere standby-forbrug, optimere opvarmning og bruge strøm i de billigste timer.',
            date: 'Marts 05, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3',
            imageAlt: 'Smart home energistyring',
        },
        'guide-skifte-elleverandoer-2025': {
            title: 'Komplet guide til at skifte elleverandør i 2025',
            description: 'Alt du behøver at vide om at skifte leverandør - fra opsigelse til sammenligning af priser, vilkår og grønne certifikater.',
            date: 'Marts 01, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3',
            imageAlt: 'Elnettet og højspændingsledninger',
        },
        'timeprisernes-hemmelighed-spar-tusinder': {
            title: 'Timeprisernes hemmelighed: spar tusinder om året',
            description: 'Vores erfaring med at flytte forbrug til de billige timer – og hvordan du kan gøre det samme uden besvær.',
            date: 'Februar 28, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1460574283810-2aab119d8511?ixlib=rb-4.0.3',
            imageAlt: 'Ur og tidsstyring af elforbrug',
        },
        'guide-vaelg-rigtige-groenne-elaftale': {
            title: 'Guide: Vælg den rigtige grønne elaftale',
            description: 'Gennemgang af GO-certifikater, vedvarende energi-tillæg og hvordan du sikrer, at din aftale virkelig er klimavenlig.',
            date: 'Februar 26, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3',
            imageAlt: 'Vindmøller i dansk landskab',
        },
        'vi-koerte-elbil-et-aar-erfaringer': {
            title: 'Vi kørte elbil i et år: her er vores erfaringer med opladning',
            description: 'Reelle tal på forbrug, udgifter og besparelser – plus de tricks vi lærte om timing og smarte ladere.',
            date: 'Februar 24, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3',
            imageAlt: 'Elbil ved ladestation',
        },
        'guide-identificer-fix-energislugere': {
            title: 'Guide: Identificer og fix dine 7 største energislugere',
            description: 'Step-by-step walkthrough af boligens værste energityve – med konkrete tal på besparelser i kWh og kroner.',
            date: 'Februar 23, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3',
            imageAlt: 'Energimåler og smart home display',
        },
        'er-varmepumper-overvurderet-min-mening': {
            title: 'Er varmepumper overvurderet? Min ærlige mening efter 2 år',
            description: 'Erfaring med varmepumpe i ældre hus – hvad virker, hvad ikke virker, og om investeringen var det værd.',
            date: 'Februar 21, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?ixlib=rb-4.0.3',
            imageAlt: 'Moderne varmepumpe installation',
        },
        'solceller-begyndere-installations-guide': {
            title: 'Solceller til begyndere: komplet installations-guide',
            description: 'Fra valg af anlægsstørrelse til tilslutning og administrative godkendelser – alt du skal vide før du starter.',
            date: 'Februar 19, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3',
            imageAlt: 'Solceller på hustag',
        },
        'spotpris-vs-fastpris-testede-begge': {
            title: 'Spotpris vs. fastpris: jeg testede begge i 6 måneder',
            description: 'Konkrete tal fra min egen måler – hvornår spotter vandt, og hvornår jeg fortrød ikke at have fastpris.',
            date: 'Februar 18, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3',
            imageAlt: 'Elpris grafer og statistik',
        },
        'smart-home-stroem-besparelser-guide': {
            title: 'Smart-home til strømbesparelser: den ultimative guide',
            description: 'Komplet setup-guide til automatisering af forbrug – termostater, stikkontakter, tidsplaner og integrationer.',
            date: 'Februar 16, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3',
            imageAlt: 'Smart home automation system',
        },
        'hvorfor-valgte-fra-intropris': {
            title: 'Hvorfor jeg valgte fra intropris-tilbuddet',
            description: 'Min oplevelse med intropris-aftaler – hvad sælgeren ikke fortalte, og hvad jeg lærte om skjulte vilkår.',
            date: 'Februar 15, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1554224311-beee460c201f?ixlib=rb-4.0.3',
            imageAlt: 'Elaftale og kontrakt',
        },
        'forstaa-elregning-guide-poster-gebyrer': {
            title: 'Forstå din elregning: guide til alle poster og gebyrer',
            description: 'Detaljeret gennemgang af nettarif, PSO, moms, abonnement og elpris – så du ved præcis hvad du betaler for.',
            date: 'Februar 12, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1554224311-beee460c201f?ixlib=rb-4.0.3',
            imageAlt: 'Elregning og beregninger',
        },
        'min-rejse-spotpris-fastpris-tilbage': {
            title: 'Min rejse fra spotpris til fastpris – og tilbage igen',
            description: 'Hvorfor jeg skiftede frem og tilbage mellem prismodeller, og hvad jeg lærte om min egen risikovillighed.',
            date: 'Februar 10, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3',
            imageAlt: 'Prisgraf og markedsanalyse',
        },
        'guide-optimer-elforbrug-timers-automation': {
            title: 'Guide: Optimer dit elforbrug med timers og automation',
            description: 'Trin-for-trin opsætning af smarte stikkontakter, timers og automatiseringer til maksimal besparelse.',
            date: 'Februar 08, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3',
            imageAlt: 'Smarte stikkontakter og automation',
        },
        'vindenergi-danmark-elpris-svinger': {
            title: 'Vindenergi i Danmark: hvorfor elprisen svinger så meget',
            description: 'En dybdegående forklaring på sammenhængen mellem vindproduktion og timepriser – med reelle eksempler.',
            date: 'Februar 06, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3',
            imageAlt: 'Havvindmøllepark i Danmark',
        },
        'energimaerkning-elbesparelser-guide': {
            title: 'Energimærkning og elbesparelser: komplet guide',
            description: 'Sådan læser du energimærker korrekt og beregner reelle besparelser ved udskiftning af hårde hvidevarer.',
            date: 'Februar 04, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3',
            imageAlt: 'Energimærke og husholdningsapparater',
        },
        'eksperiment-maaned-uden-standby-forbrug': {
            title: 'Mit eksperiment: en måned uden standby-forbrug',
            description: 'Jeg slukkede alt på stikkontakten i en måned – her er besparelsen og om det var besværet værd.',
            date: 'Februar 02, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1560250056-07ba64910f1b?ixlib=rb-4.0.3',
            imageAlt: 'Strømforgrener og stikkontakter',
        },
        'guide-vaelg-kapacitet-solcelleanlaeg': {
            title: 'Guide: Vælg den rigtige kapacitet til dit solcelleanlæg',
            description: 'Beregn optimal anlægsstørrelse baseret på dit forbrug, tagflade og orientering – med konkrete eksempler.',
            date: 'Januar 31, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3',
            imageAlt: 'Stort solcelleanlæg',
        },
        'elprischok-januar-2025-analyse': {
            title: 'Elprischok i januar 2025: hvad skete der egentlig?',
            description: 'Analyse af de ekstreme prisudsving i januar – årsager, konsekvenser og læring til fremtidige vintre.',
            date: 'Januar 29, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3',
            imageAlt: 'Dramatiske elprisudsving',
        },
        'komplet-guide-elaftaler-fastpris-variabel-spotpris': {
            title: 'Komplet guide til elaftaler: fastpris, variabel og spotpris',
            description: 'Gennemgang af alle aftaletype – fordele, ulemper, risici og hvem de passer til. Med beslutningsdiagram.',
            date: 'Januar 27, 2025',
            type: 'Guide' as const,
            imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3',
            imageAlt: 'Elaftaler og dokumenter',
        },
        'installerede-elbil-lader-derhjemme-regnestykket': {
            title: 'Jeg installerede en elbil-lader derhjemme: her er regnestykket',
            description: 'Fra tilbud til installation – hvad det kostede, hvordan det påvirker elregningen, og om det var pengene værd.',
            date: 'Januar 25, 2025',
            type: 'Blog' as const,
            imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?ixlib=rb-4.0.3',
            imageAlt: 'Hjemmelader til elbil',
        },
    }

    return allPosts[slug as keyof typeof allPosts] || null
} */

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params
    const siteSettings = await getSiteSettings()

    // Fetch the blog post from Sanity
    const post = await SanityService.getBlogPostBySlug(slug)

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

    // Get image URL from Sanity asset (handle union type)
    const imageUrl = (post.featuredImage?.asset && 'url' in post.featuredImage.asset && post.featuredImage.asset.url) 
        ? post.featuredImage.asset.url 
        : 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3'
    const imageAlt = post.featuredImage?.alt || post.title

    // Get content blocks from the blog post
    const contentBlocks = post.contentBlocks || []

    // Append Provider Comparison List to the bottom of every blog post
    // Populate with current electricity providers from Sanity
    let providers: any[] = []
    try {
        providers = await getProviders()
    } catch (e) {
        console.error('[Blog] Failed to fetch providers for comparison list:', e)
    }

    const providerListBlock: ProviderListBlock = {
        _type: 'providerList',
        _key: 'blog-provider-list',
        title: 'Sammenlign populære elselskaber',
        subtitle: 'Se aktuelle elaftaler og priser',
        headerAlignment: 'left',
        providers: Array.isArray(providers) ? providers : []
    }

    const augmentedBlocks = [...contentBlocks, providerListBlock]

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

    return (
        <ClientLayout initialSiteSettings={siteSettings ?? null}>
            <article className="min-h-screen">
                {/* Hero section with image - rounded like /blogs hero */}
                <div className="md:p-4">
                    <div className="relative h-[60vh] md:h-[70vh] md:rounded-2xl overflow-hidden">
                        <Image
                            src={imageUrl.includes('?') ? `${imageUrl}&auto=format&fit=crop&w=1920&q=80` : `${imageUrl}?auto=format&fit=crop&w=1920&q=80`}
                            alt={imageAlt}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12 md:pb-16">
                            <div className="max-w-4xl">
                                {/* Back button */}
                                <Link
                                    href="/blogs"
                                    className="inline-flex items-center gap-2 text-white hover:text-brand-green transition-colors mb-6"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="text-sm font-semibold">Tilbage til alle indlæg</span>
                                </Link>

                                {/* Meta */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${post.type === 'Guide' ? 'bg-brand-green-dark' : 'bg-brand-green'
                                        }`}>
                                        {post.type.toUpperCase()}
                                    </span>
                                    <time className="text-sm text-white/80">{formattedDate}</time>
                                    <span className="flex items-center gap-1 text-sm text-white/80">
                                        <Clock className="h-3 w-3" />
                                        {readTime} min
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white mb-4 leading-tight">
                                    {post.title}
                                </h1>
                                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                                    {post.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article content - render content blocks from Sanity */}
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto">
                        {augmentedBlocks.length > 0 ? (
                            <ContentBlocks blocks={augmentedBlocks} blogFullBleedExceptRich />
                        ) : (
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    Intet indhold tilgængeligt endnu. Tilføj content blocks i Sanity CMS for at vise indhold her.
                                </p>
                            </div>
                        )}

                        {/* Call to action */}
                        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Fandt du denne artikel nyttig?</p>
                                <p className="text-lg font-semibold text-brand-dark">Læs flere guides og blog-indlæg</p>
                            </div>
                            <Button asChild className="bg-brand-green hover:bg-brand-green-hover text-white flex-shrink-0">
                                <Link href="/blogs">
                                    Se alle indlæg
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </article>
        </ClientLayout>
    )
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60
