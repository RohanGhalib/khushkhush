export default function ShippingPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-twenly text-6xl uppercase text-acid-green mb-12">Shipping Info.</h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">Delivery Times</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          BASED IN BAHAWALPUR.<br/>
          COUNTRY WIDE SHIPPING (NO WORLDWIDE SHIPPING).<br/>
          4 DAYS DELIVERY EVERYWHERE.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-pure-white border-b border-gray-800 pb-2">Tracking</h2>
        <p className="text-gray-400 leading-relaxed uppercase text-sm font-bold">
          You will receive a tracking link via email once your order is dispatched. You can also track your order in your account dashboard.
        </p>
      </section>
    </div>
  );
}
