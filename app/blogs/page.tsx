/**
 * /blogs page route
 * What: Blog archive layout fetching real content from Sanity CMS
 * Why: Dynamic blog page with CMS-managed content
 */

import ClientLayout from '../(marketing)/ClientLayout'
import { getSiteSettings } from '@/server/sanity'
import { SanityService } from '@/services/sanityService'
import BlogArchive from './BlogArchive'
import BlogHeroSearch from './BlogHeroSearch'
import type { BlogPost } from '@/types/sanity'

interface SimplePost {
    date: string
    title: string
    description: string
    imageUrl: string
    imageAlt: string
    type: 'Blog' | 'Guide'
    slug: string
    readTime?: number  // Optional reading time in minutes
}

/**
 * Transform Sanity BlogPost to SimplePost format for components
 */
function transformBlogPost(post: BlogPost): SimplePost {
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
    
    // Calculate reading time from content blocks if not set in CMS
    const calculateReadTime = (): number => {
        if (post.readTime) return post.readTime
        
        let totalWords = 0
        totalWords += (post.title?.split(/\s+/).length || 0)
        totalWords += (post.description?.split(/\s+/).length || 0)
        
        // Extract text from content blocks
        post.contentBlocks?.forEach((block: any) => {
            if (block._type === 'richTextSection' && block.content) {
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
            if (block.title) totalWords += block.title.split(/\s+/).length
            if (block.description) totalWords += block.description.split(/\s+/).length
        })
        
        // 200 words per minute reading speed, minimum 1 minute
        return Math.max(1, Math.ceil(totalWords / 200))
    }
    
    return {
        date: formattedDate,
        title: post.title,
        description: post.description,
        imageUrl,
        imageAlt,
        type: post.type,
        slug: post.slug.current,
        readTime: calculateReadTime()
    }
}

export default async function BlogsPage() {
    const siteSettings = await getSiteSettings()

    // Fetch blog data from Sanity
    const [blogSettings, allBlogPosts] = await Promise.all([
        SanityService.getBlogPageSettings(),
        SanityService.getAllBlogPosts()
    ])

    // Transform all blog posts to SimplePost format
    const allPostsTransformed = allBlogPosts.map(transformBlogPost)

    // Determine featured posts
    let featuredPostsTransformed: SimplePost[] = []
    if (blogSettings?.featuredPosts && blogSettings.featuredPosts.length > 0) {
        // Use manually selected featured posts from CMS
        featuredPostsTransformed = blogSettings.featuredPosts.map(transformBlogPost)
    } else {
        // Fallback: use latest 3 posts
        featuredPostsTransformed = allPostsTransformed.slice(0, 3)
    }

    // Get hero background image from settings or use default (handle union type)
    const heroBackgroundImage = (blogSettings?.heroBackgroundImage?.asset && 'url' in blogSettings.heroBackgroundImage.asset && blogSettings.heroBackgroundImage.asset.url)
        ? blogSettings.heroBackgroundImage.asset.url
        : 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3'

    // Fallback content if no posts exist yet
    const defaultPost: SimplePost = {
        date: 'Marts 05, 2025',
        title: 'Velkommen til vores blog',
        description: 'Her deler vi indsigter om elpriser, energibesparelser og grøn strøm.',
        imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3',
        imageAlt: 'Energi og bæredygtighed',
        type: 'Blog',
        slug: 'velkommen',
        readTime: 1
    }

    // Use real posts or fallback
    const postsToDisplay = allPostsTransformed.length > 0 ? allPostsTransformed : [defaultPost]
    const featuredToDisplay = featuredPostsTransformed.length > 0 ? featuredPostsTransformed : [defaultPost]

    // Legacy hardcoded posts (kept as fallback, but commented out)
    /* const archivePosts: SimplePost[] = [
        {
            date: 'Marts 01, 2025',
            title: 'Komplet guide til at skifte elleverandør i 2025',
            description:
                'Alt du behøver at vide om at skifte leverandør - fra opsigelse til sammenligning af priser, vilkår og grønne certifikater.',
            imageUrl:
                'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3', // power lines and electricity grid
            imageAlt: 'Elnettet og højspændingsledninger',
            type: 'Guide',
            slug: 'guide-skifte-elleverandoer-2025',
        },
        {
            date: 'Februar 28, 2025',
            title: 'Timeprisernes hemmelighed: spar tusinder om året',
            description:
                'Vores erfaring med at flytte forbrug til de billige timer – og hvordan du kan gøre det samme uden besvær.',
            imageUrl:
                'https://images.unsplash.com/photo-1460574283810-2aab119d8511?ixlib=rb-4.0.3', // modern clock with energy concept
            imageAlt: 'Ur og tidsstyring af elforbrug',
            type: 'Blog',
            slug: 'timeprisernes-hemmelighed-spar-tusinder',
        },
        {
            date: 'Februar 26, 2025',
            title: 'Guide: Vælg den rigtige grønne elaftale',
            description:
                'Gennemgang af GO-certifikater, vedvarende energi-tillæg og hvordan du sikrer, at din aftale virkelig er klimavenlig.',
            imageUrl:
                'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3', // wind turbines in field
            imageAlt: 'Vindmøller i dansk landskab',
            type: 'Guide',
            slug: 'guide-vaelg-rigtige-groenne-elaftale',
        },
        {
            date: 'Februar 24, 2025',
            title: 'Vi kørte elbil i et år: her er vores erfaringer med opladning',
            description:
                'Reelle tal på forbrug, udgifter og besparelser – plus de tricks vi lærte om timing og smarte ladere.',
            imageUrl:
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3', // EV charging station
            imageAlt: 'Elbil ved ladestation',
            type: 'Blog',
            slug: 'vi-koerte-elbil-et-aar-erfaringer',
        },
        {
            date: 'Februar 23, 2025',
            title: 'Guide: Identificer og fix dine 7 største energislugere',
            description:
                'Step-by-step walkthrough af boligens værste energityve – med konkrete tal på besparelser i kWh og kroner.',
            imageUrl:
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3', // energy monitoring dashboard
            imageAlt: 'Energimåler og smart home display',
            type: 'Guide',
            slug: 'guide-identificer-fix-energislugere',
        },
        {
            date: 'Februar 21, 2025',
            title: 'Er varmepumper overvurderet? Min ærlige mening efter 2 år',
            description:
                'Erfaring med varmepumpe i ældre hus – hvad virker, hvad ikke virker, og om investeringen var det værd.',
            imageUrl:
                'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?ixlib=rb-4.0.3', // heat pump unit
            imageAlt: 'Moderne varmepumpe installation',
            type: 'Blog',
            slug: 'er-varmepumper-overvurderet-min-mening',
        },
        {
            date: 'Februar 19, 2025',
            title: 'Solceller til begyndere: komplet installations-guide',
            description:
                'Fra valg af anlægsstørrelse til tilslutning og administrative godkendelser – alt du skal vide før du starter.',
            imageUrl:
                'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3', // solar panels on roof
            imageAlt: 'Solceller på hustag',
            type: 'Guide',
            slug: 'solceller-begyndere-installations-guide',
        },
        {
            date: 'Februar 18, 2025',
            title: 'Spotpris vs. fastpris: jeg testede begge i 6 måneder',
            description:
                'Konkrete tal fra min egen måler – hvornår spotter vandt, og hvornår jeg fortrød ikke at have fastpris.',
            imageUrl:
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3', // data and charts
            imageAlt: 'Elpris grafer og statistik',
            type: 'Blog',
            slug: 'spotpris-vs-fastpris-testede-begge',
        },
        {
            date: 'Februar 16, 2025',
            title: 'Smart-home til strømbesparelser: den ultimative guide',
            description:
                'Komplet setup-guide til automatisering af forbrug – termostater, stikkontakter, tidsplaner og integrationer.',
            imageUrl:
                'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3', // smart home automation
            imageAlt: 'Smart home automation system',
            type: 'Guide',
            slug: 'smart-home-stroem-besparelser-guide',
        },
        {
            date: 'Februar 15, 2025',
            title: 'Hvorfor jeg valgte fra intropris-tilbuddet',
            description:
                'Min oplevelse med intropris-aftaler – hvad sælgeren ikke fortalte, og hvad jeg lærte om skjulte vilkår.',
            imageUrl:
                'https://images.unsplash.com/photo-1554224311-beee460c201f?ixlib=rb-4.0.3', // contract and pricing
            imageAlt: 'Elaftale og kontrakt',
            type: 'Blog',
            slug: 'hvorfor-valgte-fra-intropris',
        },
        {
            date: 'Februar 12, 2025',
            title: 'Forstå din elregning: guide til alle poster og gebyrer',
            description:
                'Detaljeret gennemgang af nettarif, PSO, moms, abonnement og elpris – så du ved præcis hvad du betaler for.',
            imageUrl:
                'https://images.unsplash.com/photo-1554224311-beee460c201f?ixlib=rb-4.0.3', // invoice and calculator
            imageAlt: 'Elregning og beregninger',
            type: 'Guide',
            slug: 'forstaa-elregning-guide-poster-gebyrer',
        },
        {
            date: 'Februar 10, 2025',
            title: 'Min rejse fra spotpris til fastpris – og tilbage igen',
            description:
                'Hvorfor jeg skiftede frem og tilbage mellem prismodeller, og hvad jeg lærte om min egen risikovillighed.',
            imageUrl:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3', // charts and graphs
            imageAlt: 'Prisgraf og markedsanalyse',
            type: 'Blog',
            slug: 'min-rejse-spotpris-fastpris-tilbage',
        },
        {
            date: 'Februar 08, 2025',
            title: 'Guide: Optimer dit elforbrug med timers og automation',
            description:
                'Trin-for-trin opsætning af smarte stikkontakter, timers og automatiseringer til maksimal besparelse.',
            imageUrl:
                'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3', // smart plugs and automation
            imageAlt: 'Smarte stikkontakter og automation',
            type: 'Guide',
            slug: 'guide-optimer-elforbrug-timers-automation',
        },
        {
            date: 'Februar 06, 2025',
            title: 'Vindenergi i Danmark: hvorfor elprisen svinger så meget',
            description:
                'En dybdegående forklaring på sammenhængen mellem vindproduktion og timepriser – med reelle eksempler.',
            imageUrl:
                'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3', // offshore wind farm
            imageAlt: 'Havvindmøllepark i Danmark',
            type: 'Blog',
            slug: 'vindenergi-danmark-elpris-svinger',
        },
        {
            date: 'Februar 04, 2025',
            title: 'Energimærkning og elbesparelser: komplet guide',
            description:
                'Sådan læser du energimærker korrekt og beregner reelle besparelser ved udskiftning af hårde hvidevarer.',
            imageUrl:
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3', // energy efficient appliances
            imageAlt: 'Energimærke og husholdningsapparater',
            type: 'Guide',
            slug: 'energimaerkning-elbesparelser-guide',
        },
        {
            date: 'Februar 02, 2025',
            title: 'Mit eksperiment: en måned uden standby-forbrug',
            description:
                'Jeg slukkede alt på stikkontakten i en måned – her er besparelsen og om det var besværet værd.',
            imageUrl:
                'https://images.unsplash.com/photo-1560250056-07ba64910f1b?ixlib=rb-4.0.3', // power strip and outlets
            imageAlt: 'Strømforgrener og stikkontakter',
            type: 'Blog',
            slug: 'eksperiment-maaned-uden-standby-forbrug',
        },
        {
            date: 'Januar 31, 2025',
            title: 'Guide: Vælg den rigtige kapacitet til dit solcelleanlæg',
            description:
                'Beregn optimal anlægsstørrelse baseret på dit forbrug, tagflade og orientering – med konkrete eksempler.',
            imageUrl:
                'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3', // large solar farm
            imageAlt: 'Stort solcelleanlæg',
            type: 'Guide',
            slug: 'guide-vaelg-kapacitet-solcelleanlaeg',
        },
        {
            date: 'Januar 29, 2025',
            title: 'Elprischok i januar 2025: hvad skete der egentlig?',
            description:
                'Analyse af de ekstreme prisudsving i januar – årsager, konsekvenser og læring til fremtidige vintre.',
            imageUrl:
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3', // dramatic electricity and lightning
            imageAlt: 'Dramatiske elprisudsving',
            type: 'Blog',
            slug: 'elprischok-januar-2025-analyse',
        },
        {
            date: 'Januar 27, 2025',
            title: 'Komplet guide til elaftaler: fastpris, variabel og spotpris',
            description:
                'Gennemgang af alle aftaletype – fordele, ulemper, risici og hvem de passer til. Med beslutningsdiagram.',
            imageUrl:
                'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3', // business contracts and documents
            imageAlt: 'Elaftaler og dokumenter',
            type: 'Guide',
            slug: 'komplet-guide-elaftaler-fastpris-variabel-spotpris',
        },
        {
            date: 'Januar 25, 2025',
            title: 'Jeg installerede en elbil-lader derhjemme: her er regnestykket',
            description:
                'Fra tilbud til installation – hvad det kostede, hvordan det påvirker elregningen, og om det var pengene værd.',
            imageUrl:
                'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?ixlib=rb-4.0.3', // home EV charger wallbox
            imageAlt: 'Hjemmelader til elbil',
            type: 'Blog',
            slug: 'installerede-elbil-lader-derhjemme-regnestykket',
        },
    ] */

    return (
        <ClientLayout initialSiteSettings={siteSettings ?? null}>
            {/* Hide "Refresh Nav" button on blogs page only */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .fixed.bottom-4.right-4 {
                    display: none !important;
                }
            `}} />

            {/* Hero section with search functionality */}
            <BlogHeroSearch
                allBlogPosts={postsToDisplay}
                blogSettings={blogSettings}
            />

            {/* Archive grid with filters - shows ALL posts including featured */}
            <BlogArchive posts={postsToDisplay} />
        </ClientLayout>
    )
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60
