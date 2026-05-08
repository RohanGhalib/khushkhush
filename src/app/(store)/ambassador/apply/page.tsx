import type { Metadata } from "next";
import { AmbassadorApplyForm } from "@/components/ambassador/AmbassadorApplyForm";
import { getKhusbassadorConfig } from "@/lib/khusbassadorConfig.server";

export const metadata: Metadata = {
  title: "Khusbassador | KhushKhush.",
  description: "Apply for the KhushKhush college ambassador program.",
};

export const dynamic = "force-dynamic";

export default async function AmbassadorApplyPage() {
  const config = await getKhusbassadorConfig();
  return (
    <main className="min-h-screen overflow-hidden bg-acid-green text-void-black selection:bg-void-black selection:text-acid-green">
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute left-[-10%] top-16 h-24 w-[120%] rotate-3 border-y-[6px] border-void-black" />
        <div className="absolute bottom-28 left-[-10%] h-24 w-[120%] -rotate-2 border-y-[6px] border-void-black" />
        <div className="absolute right-8 top-1/4 hidden rotate-90 font-twenly text-8xl font-black uppercase md:block">
          KHUSBASSADOR
        </div>
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-10">
        <div>
          <div className="mb-6 inline-block rotate-[-2deg] border-[3px] border-void-black bg-void-black px-5 py-3 text-acid-green shadow-[6px_6px_0px_#FFFFFF]">
            <p className="font-sans text-xs font-black uppercase tracking-[0.35em]">Khusbassador Program</p>
          </div>

          <h1 className="whitespace-nowrap font-urdu text-4xl font-bold leading-[1.6] md:text-6xl">
            مفت کی شرٹ چاہیے؟
          </h1>
          <p className="mt-6 max-w-2xl font-twenly text-5xl font-black uppercase leading-none md:text-7xl">
            Prove you can move the campus.
          </p>
          <p className="mt-6 max-w-xl font-sans text-sm font-black uppercase tracking-[0.2em] leading-relaxed">
            Referral codes. Real sales. KhushCoins. No guaranteed freebies.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 border-[3px] border-void-black bg-pure-white text-center shadow-[8px_8px_0px_#111111]">
            <div className="border-r-[3px] border-void-black p-4">
              <p className="font-twenly text-3xl">{config.ambassadorCoinsPerShirt}</p>
              <p className="font-sans text-[10px] font-black uppercase">coins / shirt</p>
            </div>
            <div className="border-r-[3px] border-void-black p-4">
              <p className="font-twenly text-3xl">{config.vaultContributionPerShirt}</p>
              <p className="font-sans text-[10px] font-black uppercase">PKR to vault</p>
            </div>
            <div className="p-4">
              <p className="font-twenly text-3xl">0</p>
              <p className="font-sans text-[10px] font-black uppercase">cashout</p>
            </div>
          </div>
        </div>

        <div className="border-[4px] border-void-black bg-acid-green p-4 shadow-[10px_10px_0px_#111111] md:p-6">
          <div className="mb-5 border-[3px] border-void-black bg-void-black p-4 text-acid-green">
            <h2 className="font-twenly text-4xl font-black uppercase">FORM FILL KARO</h2>
            <p className="mt-1 font-sans text-xs font-bold uppercase tracking-widest text-acid-green/80">
              Campus reps for the unfiltered generation.
            </p>
          </div>
          <AmbassadorApplyForm />
        </div>
      </section>
    </main>
  );
}
