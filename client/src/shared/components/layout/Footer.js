export const Footer = () => (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Receipt Scanner. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-600">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-600">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-600">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
