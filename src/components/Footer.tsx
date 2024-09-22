import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#FFF9F0] border-t border-[#FFC0CB] mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#4A4A4A] mb-4 md:mb-0">
            © {new Date().getFullYear()} MewTruCard. All rights reserved.
          </p>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/privacy-policy" className="text-[#4A4A4A] hover:text-[#FFC0CB]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-[#4A4A4A] hover:text-[#FFC0CB]">
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
