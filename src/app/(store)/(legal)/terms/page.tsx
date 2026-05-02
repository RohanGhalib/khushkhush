export default function TermsPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-twenly text-6xl uppercase text-acid-green mb-12">Terms of Service.</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">1. Usage</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          By using this site, you agree to be cool. No malicious botting or scraping.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">2. Orders</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          We reserve the right to cancel orders that look suspicious or use invalid coupon codes.
        </p>
      </section>
    </div>
  );
}
