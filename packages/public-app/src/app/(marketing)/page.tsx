import { SortUp, Fingerprint, PackageLock, HandCard, CandlestickChart, Globe } from 'iconoir-react'
import Link from 'next/link'

export default function Page () {
  return (
    <div className="flex flex-col">
      <div
        className="bg-neutral flex flex-row flex-wrap-reverse px-8 py-8 md:py-16"
      >
        <div className="mt-8 basis-full md:basis-1/2 flex flex-col gap-4 md:pr-8">
          <h2 className="text-primary text-2xl md:text-4xl font-semibold">
            Sustainable subscriptions for software of all shapes and sizes
          </h2>
          <p className="text-lg md:text-xl">
            Panfactum enables you to build recurring revenue for your software projects. Using
            familiar tools and workflows, provide value that your users will want to pay for.
            Build your first subscription in 15 minutes or less.
          </p>
          <Link
            href="/login"
            className="btn-primary text-xl md:text-2xl font-bold w-fit py-4 px-8 rounded-md"
          >
            Get Started
          </Link>
        </div>
        <div className="basis-full md:basis-1/2 px-8">
          <div className="h-48 bg-black md:h-full w-full block" />
        </div>
      </div>
      <div className="flex flex-col px-8 py-8 md:py-16">
        <h2 className="text-primary text-4xl text-center w-full">Deliver real value to your subscribers</h2>
        <div className="flex flex-row flex-wrap">
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <PackageLock
              width="50%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Distribute early access and private packages using existing tools like
              docker, pip, npm, etc.
            </p>
          </div>
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <SortUp
              width="50%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Prioritize issues submitted by subscribers automatically in your Github repository.
            </p>
          </div>
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <Fingerprint
              width="40%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Enable “Sign In With Panfactum” and  authenticate
              your private resources and sites for subscribers.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-neutral flex flex-col px-8 py-8 md:py-16">
        <h2 className="text-primary text-4xl text-center w-full">
          Focus on what&apos;s important, we&apos;ll do the rest
        </h2>
        <div className="flex flex-row w-full flex-wrap">
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <Globe
              width="40%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Panfactum is the merchant of record,
              taking care of global taxes and regulations on your behalf.
            </p>
          </div>
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <HandCard
              width="50%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Panfactum handles the subscription workflow.
              No time wasted configuring payment processing systems.
            </p>
          </div>
          <div className="basis-full md:basis-1/3 flex flex-col p-4 gap-2">
            <CandlestickChart
              width="40%"
              height="66%"
              className="mx-auto"
            />
            <p className="text-xl text-center">
              Panfactum provides analytics and tools to help you grow and your subscriber base.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
