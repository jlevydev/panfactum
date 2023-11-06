'use client'

import Image from 'next/image'

import Users from './users.jpeg'

export default function AWSImage () {
  return (
    <Image
      className={'p-2'}
      src={Users}
      alt={'AAD User Management Portal'}
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
