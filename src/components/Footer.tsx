import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-white via-purple-50/50 to-white border-t border-purple-100/50">
      <div className="container mx-auto px-4 py-8">
        {/* Feedback Section */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            We&apos;d love to hear your feedback and suggestions to help us improve MewtruCard.{' '}
            <a 
              href="https://tally.so/r/mJXGvX" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Click here
            </a>
            {' '}to share your thoughts with us!
          </p>
        </div>

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
                <a 
                  href="https://posegen.com" 
                  target="_blank" 
                  className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Pose Generator
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
