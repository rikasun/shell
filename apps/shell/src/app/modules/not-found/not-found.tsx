import { Link } from 'react-router-dom';
import './not-found.scss';

export function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="px-4 lg:py-12">
        <div className="lg:flex lg:gap-4">
          <div className="flex flex-col items-center justify-center md:py-24 lg:py-32">
            <h1 className="text-9xl font-bold text-blue-600">404</h1>
            <p className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl">
              <span className="text-red-500">Oops!</span> Page not found
            </p>
            <p className="mb-8 text-center text-gray-500 md:text-lg">
              The page you’re looking for doesn’t exist.
            </p>
            <Link
              to="/"
              className="bg-blue-100 px-6 py-2 text-sm font-semibold text-blue-800"
            >
              Go home
            </Link>
          </div>
          <div className="mt-4">
            <img
              src="/assets/images/boka.jpg"
              alt="img"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
