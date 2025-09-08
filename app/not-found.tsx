// 404 Not Found page
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-green-600">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-gray-900">
          Siden blev ikke fundet
        </h2>
        <p className="mb-8 max-w-md text-gray-600">
          Beklager, men siden du leder efter eksisterer ikke eller er blevet flyttet.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
          >
            Gå til forsiden
          </Link>
          <Link
            href="/elpriser"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Se elpriser
          </Link>
        </div>
      </div>
    </div>
  )
}