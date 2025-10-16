'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { BlogPageSettings } from '@/types/sanity'
import { getBackgroundStyle, getTextColorClass, isLightText } from '@/lib/backgroundStyles'

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

interface BlogHeroSearchProps {
    allBlogPosts: SimplePost[]
    blogSettings?: BlogPageSettings
}

export default function BlogHeroSearch({ allBlogPosts, blogSettings }: BlogHeroSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [activeTopic, setActiveTopic] = useState<string | null>(null)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Get default featured posts from settings or fallback to latest 3 posts
    const defaultFeaturedPosts = useMemo(() => {
        if (blogSettings?.featuredPosts && blogSettings.featuredPosts.length > 0) {
            return blogSettings.featuredPosts.map(post => {
                // Format date to match parseDate format: "Marts 01, 2025"
                const date = new Date(post.publishedDate)
                const months = [
                    'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
                    'Juli', 'August', 'September', 'Oktober', 'November', 'December'
                ]
                const day = String(date.getDate()).padStart(2, '0')
                const month = months[date.getMonth()]
                const year = date.getFullYear()
                const formattedDate = `${month} ${day}, ${year}`

                return {
                    date: formattedDate,
                    title: post.title,
                    description: post.description,
                    imageUrl: (post.featuredImage?.asset && 'url' in post.featuredImage.asset && post.featuredImage.asset.url)
                        ? post.featuredImage.asset.url
                        : 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3',
                    imageAlt: post.featuredImage?.alt || 'Featured blog image',
                    type: post.type,
                    slug: post.slug.current,
                    readTime: post.readTime
                }
            })
        }
        // Fallback to latest 3 posts if no featured posts are set
        return allBlogPosts.slice(0, 3)
    }, [blogSettings, allBlogPosts])

    // Filter posts based on search query
    const filteredPosts = useMemo(() => {
        if (!isSearchActive || !searchQuery.trim()) {
            return defaultFeaturedPosts
        }
        const lowerCaseQuery = searchQuery.toLowerCase()
        return allBlogPosts.filter(post =>
            post.title.toLowerCase().includes(lowerCaseQuery) ||
            post.description.toLowerCase().includes(lowerCaseQuery) ||
            post.type.toLowerCase().includes(lowerCaseQuery)
        )
    }, [allBlogPosts, searchQuery, isSearchActive, defaultFeaturedPosts])

    const matchingPosts = filteredPosts.length > 0 ? filteredPosts : defaultFeaturedPosts

    // Build topics by matching to a controlled set of domain categories
    const popularTopics = useMemo(() => {
        type Cat = { label: string; patterns: RegExp[] }
        const categories: Cat[] = [
            { label: 'Elpriser', patterns: [/\belpris/i, /\belpriser/i, /\bspotpris/i, /\bspotpriser/i, /\bfastpris/i] },
            { label: 'Tariffer', patterns: [/\btarif/i, /\btariffer/i, /\bnettarif/i, /transporttarif/i] },
            { label: 'Afgifter', patterns: [/\bafgift/i, /\belafgift/i] },
            { label: 'CO2', patterns: [/\bco2\b/i, /udledning/i] },
            { label: 'Vind', patterns: [/\bvind\b/i, /havvind/i, /vindm[øo]lle/i] },
            { label: 'Solceller', patterns: [/solcelle/i, /solceller/i, /\bsol\b/i] },
            { label: 'Elbiler', patterns: [/\belbil/i, /elbiler/i, /oplad/i] },
            { label: 'Varmepumper', patterns: [/varmepumpe/i, /varmepumper/i] },
            { label: 'El-net', patterns: [/(el-?net|netudbyg|get|transmissions|balancering|kabler|netkapacitet)/i] },
            { label: 'Batterier', patterns: [/batteri/i, /lagring/i, /energilagring/i] },
            { label: 'Power-to-X', patterns: [/power ?to ?x/i, /\bptx\b/i] },
            { label: 'Forbrug', patterns: [/\bforbrug/i, /elforbrug/i] },
            { label: 'Prissikring', patterns: [/fastpris/i, /prisloft/i, /indk[øo]bsaftale/i] },
        ]
        const counts: Record<string, number> = {}
        const textOf = (p: any) => `${p.title || ''} ${p.description || ''}`.toLowerCase()
        // Prefer stored primaryTopic when present; otherwise infer via categories
        for (const post of allBlogPosts) {
            const pt = (post as any).primaryTopic as string | undefined
            if (pt && pt.length > 0) {
                counts[pt] = (counts[pt] || 0) + 1
                continue
            }
            const txt = textOf(post)
            for (const cat of categories) {
                if (cat.patterns.some(rx => rx.test(txt))) {
                    counts[cat.label] = (counts[cat.label] || 0) + 1
                    break
                }
            }
        }
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([label]) => label)
    }, [allBlogPosts])

    const handleSearch = useCallback((topic?: string) => {
        const query = topic || searchQuery
        if (query.trim()) {
            setIsSearchActive(true)
            setActiveTopic(topic || null)
            setCurrentIndex(0) // Reset carousel to first result
        } else {
            setIsSearchActive(false)
            setActiveTopic(null)
        }
    }, [searchQuery])

    const goToNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % matchingPosts.length)
    }, [matchingPosts.length])

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + matchingPosts.length) % matchingPosts.length)
    }, [matchingPosts.length])

    // Swipe handling for mobile/tablet
    const minSwipeDistance = 50 // Minimum distance for a swipe

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null) // Reset touch end
        setTouchStart(e.targetTouches[0].clientX)
    }

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            goToNext()
        }
        if (isRightSwipe) {
            goToPrevious()
        }
    }

    const currentPost = matchingPosts[currentIndex] || defaultFeaturedPosts[0]
    const showCarousel = matchingPosts.length > 1
    const isFeaturedPost = !isSearchActive && defaultFeaturedPosts.includes(currentPost)

    // Safety check - if no current post, don't render
    if (!currentPost) return null

    // Get hero title and subtitle from settings or use defaults
    const heroTitle = blogSettings?.heroTitle || 'Indsigt i elforbrug og priser'
    const heroSubtitle = blogSettings?.heroSubtitle || 'Hold dig opdateret med de seneste nyheder, guides og eksperttips om elpriser, grøn energi og intelligente besparelser til din husstand'

    // Split title to make first word green
    const titleWords = heroTitle.split(' ')
    const firstWord = titleWords[0]
    const restOfTitle = titleWords.slice(1).join(' ')

    // Determine background style and text color from settings
    const selectedBackgroundStyle = blogSettings?.backgroundStyle || 'gradientClassic'
    const containerStyle = getBackgroundStyle({ backgroundStyle: selectedBackgroundStyle }) as React.CSSProperties
    const textColorClass = getTextColorClass({ backgroundStyle: selectedBackgroundStyle })

    return (
        <div className="md:p-4">
            <section
                className="relative md:rounded-2xl overflow-hidden"
                style={{
                    height: '87.5vh',
                    ...(containerStyle || {})
                }}
            >

                {/* Content - centered both vertically and horizontally */}
                <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full pt-6 lg:pt-0">
                    {/* Mobile title - left-aligned, compact spacing */}
                    <div className="text-left w-full flex-shrink-0 lg:hidden mb-6 px-4 sm:px-6">
                        <h1 className={`text-[2rem] sm:text-4xl font-display font-extrabold ${textColorClass} mb-2 tracking-tight leading-tight`}>
                            <span className="text-brand-green">{firstWord}</span> {restOfTitle}
                        </h1>
                        <p className={`text-lg sm:text-lg ${isLightText(textColorClass) ? 'text-white/90' : 'text-gray-700'} leading-snug`}>
                            {heroSubtitle}
                        </p>
                    </div>

                    {/* Main grid: 1.2fr (title + search) + 1fr (blog stack) - News-style layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-10 max-w-7xl mx-auto w-full relative items-start">
                        {/* Column 1: Title + Search + Topics (compact vertical flow) */}
                        <div className="hidden lg:flex lg:flex-col lg:gap-6 lg:max-w-xl">
                            {/* Title + Subheading */}
                            <div className="text-left w-full">
                                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-extrabold ${textColorClass} mb-3 tracking-tight leading-tight`}>
                                    <span className="text-brand-green">{firstWord}</span> {restOfTitle}
                                </h1>
                                <p className={`text-base md:text-lg ${isLightText(textColorClass) ? 'text-white/90' : 'text-gray-700'} leading-relaxed`}>
                                    {heroSubtitle}
                                </p>
                            </div>

                            {/* Search field */}
                            <div className="w-full">
                                <h3 className="text-white text-lg font-display font-bold mb-3 leading-tight">
                                    Filtrer indlæg
                                </h3>
                                <div className="relative shadow-xl rounded-xl md:rounded-2xl border-2 border-white/20 bg-white overflow-hidden">
                                    <input
                                        type="text"
                                        aria-label="Søg efter blog indlæg"
                                        placeholder="Skriv emne eller nøgleord..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-4 pr-10 h-11 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                        style={{ boxShadow: 'none' }}
                                    />
                                    {/* Clear button */}
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('')
                                                setIsSearchActive(false)
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Popular Topics */}
                            <div className="w-full">
                                <h3 className="text-white text-lg font-display font-bold mb-3 leading-tight">
                                    Populære emner
                                </h3>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Populære emner">
                                    {popularTopics.map((topic, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSearchQuery(topic)
                                                handleSearch(topic)
                                            }}
                                            aria-label={`Søg efter ${topic}`}
                                            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Featured blog card (compact, magazine-style) */}
                        <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-0">
                            <div
                                key={currentPost.title}
                                className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 flex flex-col w-full max-w-md transition-all duration-300 animate-in fade-in slide-in-from-right-4 relative touch-pan-y"
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                            >
                                {/* Image with overlay gradient - compact size */}
                                <div className="relative w-full aspect-[16/9] flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={currentPost.imageUrl.includes('?') ? `${currentPost.imageUrl}&auto=format&fit=crop&w=800&q=75&fm=webp` : `${currentPost.imageUrl}?auto=format&fit=crop&w=800&q=75&fm=webp`}
                                        alt={currentPost.imageAlt}
                                        fill
                                        priority
                                        sizes="(min-width: 1024px) 500px, (min-width: 640px) 448px, 100vw"
                                        className="object-cover transition-all duration-500 hover:scale-105"
                                    />
                                    {/* Subtle gradient overlay at bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                                    {/* Badge - FREMHÆVET for featured posts, type for search results */}
                                    <div className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg transition-all duration-200 ${isFeaturedPost
                                        ? 'bg-brand-green'
                                        : currentPost.type === 'Guide'
                                            ? 'bg-brand-green-dark'
                                            : 'bg-brand-green'
                                        }`}>
                                        {isFeaturedPost ? 'FREMHÆVET' : currentPost.type.toUpperCase()}
                                    </div>
                                </div>

                                {/* Content - compact size */}
                                <div className="p-4 lg:p-5 flex flex-col bg-white gap-2.5">
                                    <h2 className="font-display text-base lg:text-lg font-bold text-brand-dark leading-tight transition-colors duration-200">
                                        {currentPost.title}
                                    </h2>
                                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 transition-opacity duration-200">{currentPost.description}</p>

                                    {/* Footer with date and button */}
                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100 gap-3">
                                        <p className="text-xs text-neutral-400 transition-opacity duration-200">{currentPost.date}</p>
                                        <Button asChild size="sm" className="bg-brand-green-dark text-white hover:bg-brand-green shadow-sm flex-shrink-0 transition-all duration-200">
                                            <Link href={`/blogs/${currentPost.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
                                                Læs mere
                                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Carousel navigation arrows - only show if multiple matches */}
                                {showCarousel && (
                                    <>
                                        <button
                                            onClick={goToPrevious}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-dark rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                                            aria-label="Previous post"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={goToNext}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-dark rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                                            aria-label="Next post"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Carousel dots and search results - aligned together */}
                            <div className="flex gap-4 justify-center items-center mt-4 h-6">
                                {/* Carousel dots */}
                                {showCarousel && (
                                    <div className="flex gap-2">
                                        {matchingPosts.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentIndex(index)}
                                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                                    ? 'bg-brand-green w-6'
                                                    : 'bg-white/50 hover:bg-white/75 w-2'
                                                    }`}
                                                aria-label={`Go to post ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Search results indicator */}
                                {searchQuery && isSearchActive && (
                                    <p className="text-white/80 text-sm transition-opacity duration-200">
                                        Fandt {matchingPosts.length} {matchingPosts.length === 1 ? 'resultat' : 'resultater'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Mobile Search & Topics - HIDDEN on mobile per user request */}
                        {/* <div className="lg:hidden mt-8 w-full max-w-2xl mx-auto px-4 flex flex-col gap-6">

                            Search field
                            <div className="w-full">
                                <h3 className="text-white text-lg font-display font-bold mb-3 leading-tight">
                                    Filtrer indlæg
                                </h3>
                                <div className="relative shadow-xl rounded-xl md:rounded-2xl border-2 border-white/20 bg-white overflow-hidden">
                                    <input
                                        type="text"
                                        placeholder="Skriv emne eller nøgleord..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-4 pr-10 h-11 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                        style={{ boxShadow: 'none' }}
                                    />
                                    Clear button
                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('')
                                                setIsSearchActive(false)
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            Popular Topics
                            <div className="w-full">
                                <h3 className="text-white text-base font-display font-semibold mb-3 leading-tight">
                                    Populære emner
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {popularTopics.map((topic, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSearchQuery(topic)
                                                handleSearch(topic)
                                            }}
                                            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>
        </div>
    )
}

