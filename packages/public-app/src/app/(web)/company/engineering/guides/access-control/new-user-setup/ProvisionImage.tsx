'use client'

import Image from 'next/image'

import Users from './provision.jpeg'

export default function ProvisionImage () {
  return (
    <Image
      className={'p-2'}
      src={Users}
      alt={'Provision on demand'}
      sizes="100vw"
      style={{
        width: '100%',
        height: 'auto'
      }}
      placeholder={'empty'}
      loading="lazy"
      quality={80}
    />
  )
}
