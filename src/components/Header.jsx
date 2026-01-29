import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BsXLg } from "react-icons/bs";
import { CiMenuFries } from "react-icons/ci";
import { useState } from 'react';

const links = [
  { name: "Inicio", path: "/" },
  { name: "Gobernanza", path: "/governance" },
  { name: "Ética", path: "/ethics" },
  { name: "Casos de Uso", path: "/use-cases" },
  { name: "Monitoreo", path: "/monitoring" },
  { name: "Participación", path: "/participation" },
  { name: "Recursos", path: "/resources" },
  { name: "Publicaciones", path: "/dspace" },
];

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="py-6 xl:py-8 container mx-auto flex justify-between items-center flex-wrap">
      {/* Logo / Título */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-text-dark">KI</span>
        <span className="text-base text-text-medium">
          Observatorio de Inteligencia Artificial
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden xl:flex items-center gap-8">
        <nav className="flex gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="capitalize hover:text-teal-400 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / User Info */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-text-medium">
                Hola, <strong>{user?.username}</strong>
              </span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-teal-400 text-white rounded hover:bg-teal-500 transition"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500 transition"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-teal-400 text-white rounded hover:bg-teal-500 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 border border-teal-400 text-teal-400 rounded hover:bg-teal-400 hover:text-white transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="xl:hidden">
        <button
          className="cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {!isMenuOpen ? (
            <CiMenuFries className="text-[32px] text-teal-400" />
          ) : (
            <BsXLg className="text-[32px] text-teal-400" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="xl:hidden flex flex-col basis-full justify-center items-center gap-6 py-5 font-semibold text-lg">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="capitalize hover:text-teal-400 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* Auth en mobile */}
          <div className="flex flex-col gap-4 mt-4">
            {isAuthenticated ? (
              <>
                <span className="text-center">
                  Hola, <strong>{user?.username}</strong>
                </span>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-6 py-3 bg-teal-400 text-white rounded text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="px-6 py-3 bg-red-400 text-white rounded"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-teal-400 text-white rounded text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 border border-teal-400 text-teal-400 rounded text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;