import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-white via-purple-50/50 to-white border-t border-purple-100/50 ">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            {new Date().getFullYear()} MewTruCard. All rights reserved.
          </p>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
