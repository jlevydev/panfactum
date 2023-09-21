import Link from 'next/link'

function Links () {
  return (
    <>
      <li>
        <Link
          href="/public/subscribers"
          className="text-lg font-bold"
        >
          For Subscribers
        </Link>
      </li>
      <li>
        <Link
          href="/blog"
          className="text-lg font-bold"
        >
          Blog
        </Link>
      </li>
      <li>
        <Link
          href="/docs"
          className="text-lg font-bold"
        >
          Documentation
        </Link>
      </li>
      <li>
        <Link
          href="/public/pricing"
          className="text-lg font-bold"
        >
          Pricing
        </Link>
      </li>
    </>
  )
}

export default function Navbar () {
  return (
    <div className="navbar border-b-4 border-b-base-300 md:px-8">
      <div className="flex navbar-start">
        <div className="dropdown">
          <label
            tabIndex={0}
            className="btn btn-ghost lg:hidden mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 md:h-10 w-8 md:w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 w-52"
          >
            <Links/>
          </ul>
        </div>
        <Link
          href="/"
          className="text-primary font-semibold text-3xl md:text-5xl"
        >
          Panfactum
        </Link>
      </div>
      <div className="navbar-end basis-full">
        <ul className="hidden lg:flex  menu menu-horizontal px-8">
          <Links/>
        </ul>
        <Link
          href="/login"
          className="text-xl font-bold py-2 px-4 btn btn-primary"
        >
          Login
        </Link>
      </div>
    </div>
  )
}
