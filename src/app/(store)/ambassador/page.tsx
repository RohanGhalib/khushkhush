import type { Metadata } from "next";
import Link from "next/link";
import { KhushCoinIcon } from "@/components/ambassador/KhushCoinIcon";
import { getKhusbassadorConfig } from "@/lib/khusbassadorConfig.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khusbassador Program | KhushKhush.",
  description:
    "Run your campus. Move shirts. Stack KhushCoins. Spend them on more drip. The KhushKhush ambassador program.",
};

function buildTierData(config: Awaited<ReturnType<typeof getKhusbassadorConfig>>) {
  return [
    {
      name: "Scout",
      sales: `0 - ${Math.max(0, config.iconTierSales - 1)} sales`,
      perk: "Code is live. Coins start dropping.",
      accent: "border-pure-white",
    },
    {
      name: "Icon",
      sales: `${config.iconTierSales}+ sales`,
      perk: "Featured on the campus heat board. Bonus drops.",
      accent: "border-acid-green",
    },
    {
      name: "BVIBE Legend",
      sales: `${config.legendTierSales}+ sales`,
      perk: "Top tier. First look at every drop. Khushfiesta access.",
      accent: "border-acid-green shadow-[8px_8px_0px_#C8FF00]",
    },
  ];
}

function buildFaqs(config: Awaited<ReturnType<typeof getKhusbassadorConfig>>) {
  return [
    {
      q: "Is this real money?",
      a: "Nope. KhushCoins live inside KhushKhush. No bank transfer, no cashout. Spend them on drip. That's the whole game.",
    },
    {
      q: "How do I earn coins?",
      a: `Every shirt sold with your referral code drops ${config.ambassadorCoinsPerShirt} KhushCoins into your vault. Customer also gets Rs. ${config.customerDiscountPerShirt} off. Win win, mostly for us.`,
    },
    {
      q: "What can I do with coins?",
      a: `Apply them at checkout. 1 coin = Rs. ${config.coinValuePkr}. Up to ${config.maxCoinRedemptionPercent}% of your subtotal per order. The rest you actually pay.`,
    },
    {
      q: "Do coins expire?",
      a: "Not yet. Don't push it.",
    },
    {
      q: "Can I trade coins with friends?",
      a: "No. Account-bound. Stop trying to game it.",
    },
  ];
}

export default async function AmbassadorHubPage() {
  const config = await getKhusbassadorConfig();
  const tiers = buildTierData(config);
  const faqs = buildFaqs(config);

  return (
    <main className="min-h-screen bg-void-black text-pure-white">
      <section className="relative overflow-hidden border-b-[6px] border-acid-green bg-acid-green text-void-black selection:bg-void-black selection:text-acid-green">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -top-12 left-1/2 h-32 w-[150%] -translate-x-1/2 rotate-3 border-y-[6px] border-void-black" />
          <div className="absolute bottom-0 left-1/2 h-32 w-[150%] -translate-x-1/2 -rotate-3 border-y-[6px] border-void-black" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-28">
          <div>
            <div className="mb-6 inline-block rotate-[-2deg] border-[3px] border-void-black bg-void-black px-5 py-3 text-acid-green shadow-[6px_6px_0px_#FFFFFF]">
              <p className="font-sans text-xs font-black uppercase tracking-[0.35em]">Khusbassador Program</p>
            </div>
            <h1 className="font-urdu text-4xl font-bold leading-[1.6] md:text-6xl">
              کیمپس تمہارا ہے
            </h1>
            <p className="mt-6 max-w-2xl font-twenly text-5xl font-black uppercase leading-none md:text-7xl">
              Run the campus.<br />Stack KhushCoins.
            </p>
            <p className="mt-6 max-w-xl font-sans text-sm font-black uppercase tracking-[0.2em]">
              No cashouts. No promises of fame. Just a referral code, real sales, and store credit you can actually spend.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ambassador/apply"
                className="group relative inline-block"
              >
                <span className="absolute inset-0 translate-x-2 translate-y-2 bg-void-black transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
                <span className="relative inline-block border-[3px] border-void-black bg-pure-white px-7 py-4 font-twenly text-2xl uppercase text-void-black">
                  APPLY KARDO
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="border-[3px] border-void-black px-7 py-4 font-twenly text-2xl uppercase text-void-black hover:bg-void-black hover:text-acid-green"
              >
                HOW IT WORKS
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-6 rounded-full bg-void-black" />
              <div className="relative rounded-full border-[6px] border-void-black bg-acid-green p-6">
                <KhushCoinIcon size={220} />
              </div>
            </div>
            <p className="mt-6 max-w-xs text-center font-sans text-[11px] font-black uppercase tracking-widest">
              KhushCoin. Looks like gold. Spends like store credit. Honest about it.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b-2 border-gray-800 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="mb-3 font-urdu text-3xl leading-[1.7] text-acid-green md:text-4xl">طریقہ کار</p>
          <h2 className="font-twenly text-5xl uppercase text-pure-white md:text-7xl">HOW THE COINS DROP.</h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Get the code",
                body: "Apply, get reviewed, get approved. Your custom referral code unlocks.",
              },
              {
                step: "02",
                title: "Move shirts",
                body: `Every sale with your code = ${config.ambassadorCoinsPerShirt} KhushCoins in your vault. Customer saves Rs. ${config.customerDiscountPerShirt}.`,
              },
              {
                step: "03",
                title: "Spend the stack",
                body: `Apply coins at checkout. 1 coin = Rs. ${config.coinValuePkr}. Cap of ${config.maxCoinRedemptionPercent}% per order. Stack and rotate.`,
              },
            ].map((card) => (
              <div
                key={card.step}
                className="relative border-[3px] border-pure-white bg-card-bg p-6 shadow-[6px_6px_0px_#C8FF00]"
              >
                <p className="font-twenly text-6xl text-acid-green opacity-30">{card.step}</p>
                <h3 className="mt-2 font-twenly text-3xl uppercase text-pure-white">{card.title}</h3>
                <p className="mt-3 font-sans text-sm text-gray-400">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-gray-800 bg-card-bg py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
            <div>
              <p className="mb-3 font-urdu text-3xl leading-[1.7] text-acid-green md:text-4xl">سکے کیا ہیں</p>
              <h2 className="font-twenly text-5xl uppercase text-pure-white md:text-6xl">
                WHAT THE HELL IS A KHUSHCOIN?
              </h2>
              <ul className="mt-6 space-y-3 font-sans text-sm font-bold uppercase tracking-widest text-gray-300">
                <li className="border-l-4 border-acid-green pl-4">Store credit. Not crypto. Not cash.</li>
                <li className="border-l-4 border-acid-green pl-4">
                  1 coin = Rs. {config.coinValuePkr} off your next order.
                </li>
                <li className="border-l-4 border-acid-green pl-4">
                  Max {config.maxCoinRedemptionPercent}% of subtotal per order. Don&apos;t get greedy.
                </li>
                <li className="border-l-4 border-acid-green pl-4">Earned only. Never bought. Never sold.</li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-4">
              <KhushCoinIcon size={260} />
              <p className="text-center font-twenly text-3xl uppercase text-acid-green">FAKE GOLD. REAL DRIP.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-gray-800 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <p className="mb-3 font-urdu text-3xl leading-[1.7] text-acid-green md:text-4xl">درجے</p>
          <h2 className="font-twenly text-5xl uppercase text-pure-white md:text-7xl">TIERS.</h2>
          <p className="mt-3 max-w-2xl font-sans text-sm font-bold uppercase tracking-widest text-gray-400">
            Sales count. Tiers unlock. Don&apos;t ask for a free shirt.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div key={tier.name} className={`border-[3px] bg-void-black p-6 ${tier.accent}`}>
                <p className="font-twenly text-4xl uppercase text-acid-green">{tier.name}</p>
                <p className="mt-1 font-sans text-xs font-black uppercase tracking-widest text-gray-500">
                  {tier.sales}
                </p>
                <p className="mt-4 font-sans text-sm text-gray-300">{tier.perk}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-gray-800 bg-card-bg py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-10">
          <p className="mb-3 font-urdu text-3xl leading-[1.7] text-acid-green md:text-4xl">سوالات</p>
          <h2 className="font-twenly text-5xl uppercase text-pure-white md:text-7xl">FAQ.</h2>
          <div className="mt-10 divide-y-2 divide-gray-800 border-y-2 border-gray-800">
            {faqs.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer items-center justify-between font-twenly text-2xl uppercase text-pure-white">
                  <span>{item.q}</span>
                  <span className="font-sans text-3xl text-acid-green transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 font-sans text-sm text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-acid-green py-20 text-void-black selection:bg-void-black selection:text-acid-green">
        <div className="mx-auto max-w-5xl px-5 text-center md:px-10">
          <p className="font-urdu text-3xl leading-[1.7] md:text-4xl">آخری موقع نہیں ہے، لیکن جلدی کرو</p>
          <h2 className="mt-6 font-twenly text-5xl uppercase md:text-7xl">READY TO RUN IT?</h2>
          <p className="mx-auto mt-4 max-w-xl font-sans text-sm font-black uppercase tracking-widest">
            Fill the form. Tell us why your campus listens to you. We&apos;ll review and slide you a referral code.
          </p>
          <Link
            href="/ambassador/apply"
            className="mt-8 inline-block border-[3px] border-void-black bg-void-black px-10 py-5 font-twenly text-3xl uppercase text-acid-green shadow-[8px_8px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            APPLY NOW
          </Link>
        </div>
      </section>
    </main>
  );
}
