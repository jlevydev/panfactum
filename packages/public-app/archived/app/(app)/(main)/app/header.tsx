import Link from 'next/link'

export function Header () {
  return (
    <div className="bg-white flex justify-between p-4 border-b-4 border-b-base-300 navbar">
      <Link
        href="/"
        className="text-primary text-5xl block"
      >
        Panfactum
      </Link>
      <div>
        <div>
          Jack
        </div>
      </div>
    </div>
  )
}
