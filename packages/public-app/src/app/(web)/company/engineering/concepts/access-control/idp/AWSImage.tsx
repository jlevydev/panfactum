'use client'

import Image from 'next/image'

import AWSPng from './aws.jpeg'

export default function AWSImage () {
  return (
    <Image
      className={'p-2'}
      src={AWSPng}
      alt={'AWS IAM Identity Center Group Assignments'}
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
