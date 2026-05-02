export default function ReturnsPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-twenly text-6xl uppercase text-acid-green mb-12">Returns & Exchanges.</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">Our Policy</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          We do not offer a return policy. However, exchanges are possible only in the case of a defective item. Please ensure the item is in its original condition.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">How to Exchange</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          Contact us at support@khushkhush.com with your order number and the reason for exchange.
        </p>
      </section>
    </div>
  );
}
