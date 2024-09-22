import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-[#FFF9F0] border-b border-[#FFC0CB] py-4">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-[#4A4A4A]">
          MewTruCard
        </Link>
        <ul className="flex space-x-6">
          <li><Link href="/" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Home</Link></li>
          <li><Link href="/birthday-card-gallery" className="text-[#4A4A4A] hover:text-[#FFC0CB] font-serif">Gallery</Link></li>
        </ul>
        <Link href="/" className="bg-[#FFC0CB] text-[#4A4A4A] px-4 py-2 rounded-md hover:bg-[#FFD1DC] font-serif">
          Login
        </Link>
      </nav>
    </header>
  );
};

export default Header;
