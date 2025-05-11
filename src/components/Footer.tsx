import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-white via-purple-50/50 to-white border-t border-purple-100/50">
      <div className="container mx-auto px-4 py-8">

        {/* Links and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-600 order-2 md:order-1">
            © {new Date().getFullYear()} MewTruCard. All rights reserved.
          </p>
          <nav className="order-1 md:order-2">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/refund-policy" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Refund Policy
                </Link>
              </li> 
              {/* <li>
                <a 
                  href="https://linktr.ee/auroroa" 
                  target="_blank" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Aurora
                </a>
              </li>
              <li>
                <a 
                  href="https://share.evernote.com/note/613065a4-8cb8-1736-d1e2-b81fcbf0b746" 
                  target="_blank" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Games
                </a>
              </li>
              <li>
                <a 
                  href="https://picapica.app/" 
                  target="_blank" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  PicaPica
                </a>
              </li> */}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
