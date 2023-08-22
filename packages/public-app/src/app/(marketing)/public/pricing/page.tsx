import Link from "next/link";

export default function Page () {
  return (
    <div className="max-w-7xl m-auto bg-base-100 h-screen flex flex-col justify-center items-center p-4">
      <div className="bg-neutral p-12 rounded-lg drop-shadow-md max-w-4xl">
        <h1 className="text-primary text-2xl md:text-4xl font-semibold">
          We're still baking this page at 404 degrees. Check back soon for something delicious!
        </h1>
        <div className="text-lg md:text-xl my-8 space-y-1">
          <p>In the meantime, here's a sneak peak:</p>
          <ul className="list-disc pl-4">
            <li>Panfactum is <b className="font-bold">free</b> to get started. No payment info needed.</li>
            <li>You set the prices of the subscription bundles you want to offer. $5 minimum. No other limits.</li>
            <li>When you make a sale, we will collect the processor fees and taxes on your behalf and remit
            them to the appropriate parties. Typically, payment processor fees are 	&lt;5%, and the sales taxes
            are passed on to your buyers.</li>
            <li>From what's left, we charge a 10% platform fee to cover our overhead.</li>
            <li>You get the rest via <Link href="https://stripe.com/connect" className="link">Stripe Connect.</Link></li>
          </ul>

        </div>

        <Link className="btn" href="/"> Back to main site</Link>
      </div>
    </div>
  )
}
