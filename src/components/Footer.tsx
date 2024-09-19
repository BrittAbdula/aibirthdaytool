import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 mb-4 md:mb-0">© 2024 AI Birthday Card Generator. All rights reserved.</p>
          <ul className="flex space-x-4">
            <li><Link href="/privacy-policy" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="text-gray-600 hover:text-gray-800">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
