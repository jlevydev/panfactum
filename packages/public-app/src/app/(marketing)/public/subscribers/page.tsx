import {HomeHospital} from "iconoir-react";
import Image from 'next/image';

import centralizeDependencyIcon from "./centralizeDependencyIcon.png";
import keyIcon from "./keyIcon.png";

export default function Page () {
  return (
    <div className="flex flex-col">
      <div
        className="bg-neutral flex flex-row flex-wrap px-8 py-8 md:py-16"
      >
        <div className="h-36 md:h-48 basis-full md:basis-1/3 relative m-auto">
          <Image
            priority
            src={centralizeDependencyIcon}
            sizes="200px"
            fill
            style={{
              objectFit: "contain"
            }}
            alt="Graphic for centralizing dependencies"
            className="m-auto h-full"
          />
        </div>
        <div className="mt-8 basis-full md:basis-2/3 flex flex-col gap-4 md:px-8">
          <h2 className="text-primary text-2xl md:text-4xl font-semibold">
            Centralize your dependencies
          </h2>
          <p className="text-lg md:text-xl">
            Panfactum enables you to build recurring revenue for your software projects. Using
            familiar tools and workflows, provide value that your users will want to pay for.
            Build your first subscription in 15 minutes or less.
          </p>
        </div>
      </div>
      <div
        className="flex flex-row flex-wrap-reverse px-8 py-8 md:py-16"
      >
        <div className="mt-8 basis-full md:basis-2/3 flex flex-col gap-4 md:px-8">
          <h2 className="text-primary text-2xl md:text-4xl font-semibold">
            One simple token
          </h2>
          <p className="text-lg md:text-xl">
            Your Panpat is now your single access token for every third party dependency
            in your ecosystem supported by Panfactum. Just another benefit of every package
            in your ecosystem managed under one roof. Package not on Panfactum? Send them a note!
          </p>
        </div>
        <div className="h-36 md:h-48 basis-full md:basis-1/3 relative m-auto">
          <Image
            priority
            src={keyIcon}
            sizes="200px"
            fill
            style={{
              objectFit: "contain"
            }}
            alt="Graphic for centralizing dependencies"
            className="m-auto h-full"
          />
        </div>
      </div>
      <div
        className="bg-neutral flex flex-row flex-wrap px-8 py-8 md:py-16"
      >
        <div className="h-36 md:h-48 basis-full md:basis-1/3 relative m-auto">
          <HomeHospital width="100%" height="100%"/>
        </div>
        <div className="mt-8 basis-full md:basis-2/3 flex flex-col gap-4 md:px-8">
          <h2 className="text-primary text-2xl md:text-4xl font-semibold">
            Ensure your third-party dependencies are resilient
          </h2>
          <p className="text-lg md:text-xl">
            Third-party maintainers change their minds. Repos go dark, minds change, and business models
            can evolve unpredictably. Once you begin paying for a package on Panfactum, your access
            is guaranteed. Ensure your team is not left in the dark.
          </p>
        </div>
      </div>
    </div>
  )
}
