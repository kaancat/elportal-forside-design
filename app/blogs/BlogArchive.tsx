'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

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

interface BlogArchiveProps {
    posts: SimplePost[]
}

function BlogCard({ post }: { post: SimplePost }) {
    // Use provided read time or calculate from title + description
    const readTime = post.readTime || (() => {
        const wordCount = (post.title + ' ' + post.description).split(' ').length
        return Math.max(1, Math.ceil(wordCount / 200))
    })()

    return (
        <Link href={`/blogs/${post.slug}`} className="group block h-full">
            <article className="flex flex-col overflow-hidden rounded-xl md:rounded-2xl border border-neutral-200/50 bg-white shadow-sm transition hover:shadow-md h-full cursor-pointer">
                <div className="relative h-40 sm:h-44 md:h-48 w-full flex-shrink-0">
                    <Image
                        src={post.imageUrl.includes('?') ? `${post.imageUrl}&auto=format&fit=crop&w=900&q=80` : `${post.imageUrl}?auto=format&fit=crop&w=900&q=80`}
                        alt={post.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                        priority={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-20" />
                    {/* Type badge */}
                    <div className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg ${post.type === 'Guide'
                        ? 'bg-brand-green-dark'
                        : 'bg-brand-green'
                        }`}>
                        {post.type.toUpperCase()}
                    </div>
                </div>
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <p className="text-xs text-neutral-500 flex-shrink-0">{post.date}</p>
                    <h3 className="mt-1 font-display text-base sm:text-lg font-semibold leading-snug text-brand-dark group-hover:text-brand-green transition-colors flex-shrink-0">{post.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-600 flex-1 line-clamp-3">{post.description}</p>
                    <div className="pt-3 flex-shrink-0 flex items-center justify-between">
                        <span className="text-xs text-neutral-400">
                            {readTime} min læsning
                        </span>
                        <span className="inline-flex items-center text-xs sm:text-sm font-semibold text-brand-green group-hover:text-brand-green-dark transition-colors">
                            læs mere
                            <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}

export default function BlogArchive({ posts }: BlogArchiveProps) {
    const [typeFilter, setTypeFilter] = useState<'All' | 'Blog' | 'Guide'>('All')
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

    // Parse dates for sorting
    const parseDate = (dateStr: string) => {
        // Format: "Marts 01, 2025"
        const months: Record<string, number> = {
            'Januar': 0, 'Februar': 1, 'Marts': 2, 'April': 3,
            'Maj': 4, 'Juni': 5, 'Juli': 6, 'August': 7,
            'September': 8, 'Oktober': 9, 'November': 10, 'December': 11
        }
        const parts = dateStr.split(' ')
        const month = months[parts[0]]
        const day = parseInt(parts[1].replace(',', ''))
        const year = parseInt(parts[2])
        return new Date(year, month, day)
    }

    // Filter and sort posts
    const filteredPosts = posts
        .filter(post => typeFilter === 'All' || post.type === typeFilter)
        .sort((a, b) => {
            const dateA = parseDate(a.date).getTime()
            const dateB = parseDate(b.date).getTime()
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
        })

    return (
        <section className="container mx-auto px-4 py-16">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-8 text-center">Seneste Indlæg</h2>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                {/* Type filters */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTypeFilter('All')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${typeFilter === 'All'
                            ? 'bg-brand-dark text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Alle
                    </button>
                    <button
                        onClick={() => setTypeFilter('Blog')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${typeFilter === 'Blog'
                            ? 'bg-brand-green text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Blog
                    </button>
                    <button
                        onClick={() => setTypeFilter('Guide')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${typeFilter === 'Guide'
                            ? 'bg-brand-green-dark text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Guide
                    </button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sorter:</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium bg-white hover:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    >
                        <option value="newest">Nyeste først</option>
                        <option value="oldest">Ældste først</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 mb-6">
                Viser {filteredPosts.length} {filteredPosts.length === 1 ? 'indlæg' : 'indlæg'}
            </p>

            {/* Archive grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post, i) => (
                    <BlogCard key={i} post={post} />
                ))}
            </div>

            {/* Empty state */}
            {filteredPosts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">Ingen indlæg matcher dine filtre</p>
                </div>
            )}
        </section>
    )
}

