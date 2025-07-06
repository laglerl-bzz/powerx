import { Home, Upload } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '../mode-toggle';

const Navbar = () => {
  const location = useLocation();
  const { pathname } = location;
  return (
    <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-8 max-w-7xl mx-auto justify-between">
        <div className="flex">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-green-500 rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">PX</span>
            </div>
            <span className="font-semibold">PowerX</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link 
            to="/" 
            className={`flex items-center text-sm transition-colors hover:text-primary ${
              pathname === "/" ? "font-bold" : "font-medium text-muted-foreground"
            }`}
          >
            <Home className="mr-2 h-4 w-4" />
            Startseite
          </Link>
          <Link 
            to="/upload" 
            className={`flex items-center text-sm transition-colors hover:text-primary ${
              pathname === "/upload" ? "font-bold" : "font-medium text-muted-foreground"
            }`}
          >
            <Upload className="mr-2 h-4 w-4" />
            Hochladen
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </div>
  );
};

export default Navbar;