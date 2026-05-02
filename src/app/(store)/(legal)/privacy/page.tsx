export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-twenly text-6xl uppercase text-acid-green mb-12">Privacy Policy.</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">1. Data Collection</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          We collect your email, address, and phone number solely for processing orders and delivery. We don't sell your data to anyone. We're too busy making cool clothes for that.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">2. Cookies</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          We use cookies to keep your cart alive. No creepy tracking involved.
        </p>
      </section>
    </div>
  );
}
