'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'

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
    defaultFeaturedPosts: SimplePost[]  // Now accepts array of 3 featured posts
    allPosts: SimplePost[]
    heroBackgroundImage: string
}

export default function BlogHeroSearch({ defaultFeaturedPosts, allPosts, heroBackgroundImage }: BlogHeroSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [activeTopic, setActiveTopic] = useState<string | null>(null)

    // Filter posts based on search query
    const matchingPosts = useMemo(() => {
        if (!searchQuery.trim()) {
            return defaultFeaturedPosts  // Show 3 featured posts by default
        }

        const query = searchQuery.toLowerCase().trim()

        // Search only in title
        const matches = allPosts.filter(post => {
            const titleLower = post.title.toLowerCase()
            return titleLower.includes(query)
        })

        return matches.length > 0 ? matches : defaultFeaturedPosts
    }, [searchQuery, allPosts, defaultFeaturedPosts])

    // Reset index when matches change and activate search
    const handleSearch = () => {
        setCurrentIndex(0)
        setIsSearchActive(searchQuery.trim().length > 0)
    }

    // Update search active state and reset index when query changes
    useMemo(() => {
        const isActive = searchQuery.trim().length > 0
        setIsSearchActive(isActive)
        if (isActive) {
            setCurrentIndex(0) // Reset to first result when search changes
        }
    }, [searchQuery])

    // Carousel navigation
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? matchingPosts.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === matchingPosts.length - 1 ? 0 : prev + 1))
    }

    const currentPost = matchingPosts[currentIndex] || defaultFeaturedPosts[0]
    const showCarousel = matchingPosts.length > 1
    const isFeaturedPost = !isSearchActive && defaultFeaturedPosts.includes(currentPost)

    // Extract popular topics dynamically from all posts
    const popularTopics = useMemo(() => {
        const topicCounts: Record<string, number> = {}

        // Keywords to extract from titles
        const keywords = ['elpriser', 'solceller', 'elbil', 'varmepumpe', 'besparelse', 'grøn energi',
            'spotpris', 'fastpris', 'smart-home', 'energi', 'guide', 'intropris']

        allPosts.forEach(post => {
            const titleLower = post.title.toLowerCase()
            keywords.forEach(keyword => {
                if (titleLower.includes(keyword)) {
                    // Capitalize first letter for display
                    const displayName = keyword === 'elbil' ? 'Elbiler' :
                        keyword === 'grøn energi' ? 'Grøn energi' :
                            keyword === 'smart-home' ? 'Smart-home' :
                                keyword.charAt(0).toUpperCase() + keyword.slice(1)
                    topicCounts[displayName] = (topicCounts[displayName] || 0) + 1
                }
            })
        })

        // Sort by count and return top 6
        return Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([topic]) => topic)
    }, [allPosts])

    // Safety check - if no current post, don't render
    if (!currentPost) return null

    return (
        <div className="md:p-4">
            <section
                className="relative md:rounded-2xl overflow-hidden"
                style={{
                    height: '87.5vh',
                    background: 'linear-gradient(to bottom right, #001a12, rgba(132, 219, 65, 0.8))'
                }}
            >

                {/* Content - centered both vertically and horizontally */}
                <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center h-full">
                    {/* Mobile title - centered, above everything */}
                    <div className="text-center flex-shrink-0 lg:hidden mb-8">
                        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2 tracking-tight leading-tight">
                            <span className="text-brand-green">Indsigt</span> i elforbrug og priser
                        </h1>
                        <p className="text-base sm:text-lg text-white/90 leading-snug">
                            Hold dig opdateret med de seneste nyheder, guides og eksperttips om elpriser, grøn energi og intelligente besparelser til din husstand
                        </p>
                    </div>

                    {/* Main grid: 1fr (card) + 2fr (title + search/topics) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 md:gap-12 max-w-7xl mx-auto w-full relative">
                        {/* Column 1: Featured blog card (1fr) */}
                        <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-0 relative">
                            <div key={currentPost.title} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 flex flex-col w-full max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-left-4">
                                {/* Image with overlay gradient */}
                                <div className="relative w-full aspect-[16/9] flex-shrink-0 overflow-hidden">
                                    <Image
                                        src={currentPost.imageUrl.includes('?') ? `${currentPost.imageUrl}&auto=format&fit=crop&w=800&q=80` : `${currentPost.imageUrl}?auto=format&fit=crop&w=800&q=80`}
                                        alt={currentPost.imageAlt}
                                        fill
                                        sizes="(min-width: 1024px) 384px, (min-width: 640px) 448px, 100vw"
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

                                {/* Content */}
                                <div className="p-5 flex flex-col bg-white gap-3">
                                    <h2 className="font-display text-lg font-bold text-brand-dark leading-tight transition-colors duration-200">
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
                            </div>

                            {/* Carousel navigation arrows - only show if multiple matches */}
                            {showCarousel && (
                                <>
                                    <button
                                        onClick={goToPrevious}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-dark rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                                        aria-label="Previous post"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={goToNext}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-brand-dark rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                                        aria-label="Next post"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

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

                        {/* Column 2 (2fr): Title on top, Search + Topics on bottom */}
                        <div className="hidden lg:grid lg:grid-rows-[auto_1fr] gap-6">
                            {/* Row 1: Title + Subheading */}
                            <div className="text-left">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold text-white mb-2 tracking-tight leading-tight">
                                    <span className="text-brand-green">Indsigt</span> i elforbrug og priser
                                </h1>
                                <p className="text-base md:text-lg xl:text-xl text-white/90 max-w-2xl leading-snug">
                                    Hold dig opdateret med de seneste nyheder, guides og eksperttips om elpriser, grøn energi og intelligente besparelser til din husstand
                                </p>
                            </div>

                            {/* Row 2: Search field + Popular Topics in 2 columns */}
                            <div className="grid grid-cols-2 gap-6 items-end">
                                {/* Search field - with extra top margin to align with card bottom */}
                                <div className="w-full flex flex-col" style={{ marginTop: '0.5rem' }}>
                                    <h3 className="text-white text-lg font-display font-bold mb-4 leading-tight">
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
                                        {/* Clear button - shows when there's text */}
                                        {searchQuery && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('')
                                                    setCurrentIndex(0)
                                                    setIsSearchActive(false)
                                                    setActiveTopic(null)
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                                aria-label="Ryd søgning"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Popular Topics */}
                                <div className="w-full flex flex-col" style={{ marginTop: '0.5rem' }}>
                                    <h3 className="text-white text-lg font-display font-bold mb-4 leading-tight">
                                        Populære emner
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {popularTopics.map((topic) => (
                                            <button
                                                key={topic}
                                                onClick={() => {
                                                    setSearchQuery(topic)
                                                    setCurrentIndex(0)
                                                    setIsSearchActive(true)
                                                    setActiveTopic(topic)
                                                }}
                                                className={`px-3 py-1.5 backdrop-blur-sm border text-sm rounded-full transition-all duration-200 hover:scale-105 ${activeTopic === topic
                                                    ? 'bg-white/50 text-white border-white/70 shadow-md'
                                                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                                                    }`}
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

