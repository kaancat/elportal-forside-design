'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS: Array<{ href: string; label: string }> = [
  { href: '/elpriser', label: 'Aktuelle elpriser' },
  { href: '/leverandoer-sammenligning', label: 'Sammenlign elaftaler' },
  { href: '/elselskaber', label: 'Elselskaber i Danmark' },
  { href: '/historiske-priser', label: 'Historiske elpriser' },
  { href: '/forbrug-tracker', label: 'Forbrug tracker' },
  { href: '/elprisberegner', label: 'Elpris-beregner' },
  { href: '/prognoser', label: 'Prognoser for elpriser' },
  { href: '/ladeboks', label: 'Ladeboks og elbiler' },
  { href: '/om-os', label: 'Om DinElPortal' },
  { href: '/energibesparende-tips-2025', label: 'Energibesparende tips 2025' },
]

export default function SEOInternalLinks() {
  const pathname = usePathname() || '/'
  // Hide on very small pages like admin or debug paths
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return null

  return (
    <nav aria-label="Vigtige interne links" className="bg-[#0b1720] text-white/90">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.filter(l => l.href !== pathname).map(link => (
            <Link key={link.href} href={link.href} className="hover:text-brand-green transition-colors underline-offset-4 hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

