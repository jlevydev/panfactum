import Button from '@mui/material/Button'
import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

import NavbarContainer from '@/components/layout/web/primary/navbar/NavbarContainer'
import NavbarLink from '@/components/layout/web/primary/navbar/NavbarLink'

const Links = memo(() => {
  return (
    <>
      <NavbarLink
        href="/product"
        text="Product"
      />
      <NavbarLink
        href="/pricing"
        text="Pricing"
      />
      <NavbarLink
        href="/docs"
        text="Docs"
      />
      <NavbarLink
        href="/company"
        text="Company"
      />
    </>
  )
})

export default memo(function Navbar () {
  return (
    <NavbarContainer>
      <div className="flex flex-row justify-between px-4 h-full items-center">

        <Link
          href="/"
          className="text-white text-3xl hidden sm:flex items-center gap-x-1"
        >
          <Image
            alt="Panfactum Logo"
            src="/logo.svg"
            width={40}
            height={40}
          />
          Panfactum
        </Link>
        <nav
          className="flex flex-row gap-2 justify-self-center h-full w-full sm:w-fit"
          aria-label="primary-navigation-bar"
        >
          <Links/>
        </nav>
        <div className="hidden sm:block">
          <Button
            variant="contained"
            className="bg-white text-primary font-semibold"
            size="small"
          >
            <Link href="/a/auth/login">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
      <div />
    </NavbarContainer>
  )
})
