import Link from 'next/link';
import { Mail, MapPin, ShieldCheck, Truck, ArrowRight, Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-void-black border-t-4 border-gray-800 pt-20 pb-8 px-6 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="font-twenly text-6xl text-acid-green hover:text-pure-white transition-colors leading-none inline-block">
            KhUSh<br/>KhUSh.
          </Link>
          <p className="font-sans font-bold text-pure-white uppercase text-sm tracking-[0.2em] leading-relaxed max-w-xs">
            Aggressive Streetwear for the Unfiltered Generation. Made in Pakistan.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/khushkhush.pk" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-900 border border-gray-800 flex items-center justify-center text-acid-green hover:bg-acid-green hover:text-void-black transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="mailto:support@khushkhush.com" className="w-10 h-10 bg-gray-900 border border-gray-800 flex items-center justify-center text-acid-green hover:bg-acid-green hover:text-void-black transition-all">
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-twenly text-2xl text-pure-white uppercase mb-6 tracking-widest border-b border-gray-800 pb-2">Shop.</h3>
          <ul className="space-y-4 font-sans font-bold uppercase text-xs tracking-widest text-gray-400">
            <li><Link href="/shop" className="hover:text-acid-green transition-colors flex items-center gap-2 group">All Products <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
            <li><Link href="/collections/meme" className="hover:text-acid-green transition-colors">Meme Culture</Link></li>
            <li><Link href="/collections/frame" className="hover:text-acid-green transition-colors">Frame Collection</Link></li>
            <li><Link href="/collections/movie" className="hover:text-acid-green transition-colors">Movie Merch</Link></li>
            <li><Link href="/shop?filter=featured" className="hover:text-acid-green transition-colors">Featured Drops</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="font-twenly text-2xl text-pure-white uppercase mb-6 tracking-widest border-b border-gray-800 pb-2">Support.</h3>
          <ul className="space-y-4 font-sans font-bold uppercase text-xs tracking-widest text-gray-400">
            <li><Link href="/account" className="hover:text-acid-green transition-colors">Track Order</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-acid-green transition-colors flex items-center gap-2"><Truck size={12} /> Shipping Info</Link></li>
            <li><Link href="/returns" className="hover:text-acid-green transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/privacy" className="hover:text-acid-green transition-colors flex items-center gap-2"><ShieldCheck size={12} /> Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-acid-green transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-twenly text-2xl text-pure-white uppercase mb-6 tracking-widest border-b border-gray-800 pb-2">Connect.</h3>
          <div className="space-y-6 font-sans font-bold uppercase text-xs tracking-widest text-gray-400">
            <div className="flex gap-3">
              <MapPin size={16} className="text-acid-green shrink-0" />
              <p>Bahawalpur, Pakistan<br/>Country Wide Shipping</p>
            </div>
            <div className="flex gap-3">
              <Truck size={16} className="text-acid-green shrink-0" />
              <p>4 Days Delivery Everywhere</p>
            </div>
            <div className="flex gap-3">
              <Mail size={16} className="text-acid-green shrink-0" />
              <p>support@khushkhush.com<br/>24/7 Support</p>
            </div>
            <div className="pt-4 space-y-2">
               <p className="text-[10px] text-gray-600">Payments We Accept</p>
               <div className="flex flex-wrap gap-3 opacity-50 grayscale">
                  <span className="border border-gray-700 px-2 py-1 text-[8px]">CASH ON DELIVERY</span>
                  <span className="border border-gray-700 px-2 py-1 text-[8px]">EASYPAISA</span>
                  <span className="border border-gray-700 px-2 py-1 text-[8px]">JAZZCASH</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans font-bold text-[10px] uppercase text-gray-600 tracking-widest">
          © {currentYear} KhUShKhUSh Streetwear. All Rights Reserved.
        </p>
        <div className="flex gap-6 font-sans font-bold text-[10px] uppercase text-gray-600 tracking-widest">
          <Link href="/privacy" className="hover:text-pure-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-pure-white transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-pure-white transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
