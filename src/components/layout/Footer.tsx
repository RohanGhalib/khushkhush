import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-void-black border-t-4 border-pure-white py-12 px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-twenly text-5xl md:text-7xl text-acid-green hover:text-pure-white transition-colors leading-none flex flex-col md:block">
            <span className="block md:inline">KhUSh</span>
            <span className="block md:inline">KhUSh.</span>
          </Link>
          <p className="font-sans font-bold text-pure-white uppercase text-xl md:text-2xl tracking-widest">
            Gen-z We're Coming!
          </p>
        </div>

        <div className="flex flex-col md:text-right gap-2 font-sans font-bold text-pure-white text-lg">
          <Link href="/shop" className="hover:text-acid-green uppercase transition-colors">Shop All</Link>
          <Link href="/account" className="hover:text-acid-green uppercase transition-colors">My Account</Link>
          <a href="https://instagram.com/khushkhush.pk" target="_blank" rel="noreferrer" className="hover:text-acid-green uppercase transition-colors mt-4">
            @khushkhush.pk
          </a>
          <a href="https://khushkhush.com" className="text-acid-green hover:text-pure-white transition-colors">
            khushkhush.com
          </a>
        </div>

      </div>
    </footer>
  );
}
