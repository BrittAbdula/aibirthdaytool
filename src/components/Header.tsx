import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white py-4">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-purple-800">
        Aibirthdaytool.com
        </Link>
        <ul className="flex space-x-6">
          <li><Link href="/" className="text-gray-600 hover:text-purple-800">Home</Link></li>
          <li><Link href="/birthday-card-gallery" className="text-gray-600 hover:text-purple-800">Gallery</Link></li>
          {/* <li><Link href="/blog" className="text-gray-600 hover:text-purple-800">Blog</Link></li>
          <li><Link href="/pricing" className="text-gray-600 hover:text-purple-800">Pricing</Link></li>
          <li><Link href="/account" className="text-gray-600 hover:text-purple-800">Account</Link></li> */}
        </ul>
        <Link href="/" className="bg-purple-800 text-white px-4 py-2 rounded-md hover:bg-purple-900">
          Login
        </Link>
      </nav>
    </header>
  );
};

export default Header;
