import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h2 className="text-9xl font-extrabold text-primary-600">404</h2>
        <p className="mt-2 text-2xl font-semibold text-gray-900">Page not found</p>
        <p className="mt-2 text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="text-base font-medium text-primary-600 hover:text-primary-500"
          >
            Go back home<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}