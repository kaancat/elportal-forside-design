import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Side ikke fundet</p>
        <Link to="/" className="text-brand-green hover:text-brand-green/80 underline">
          Tilbage til forsiden
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
