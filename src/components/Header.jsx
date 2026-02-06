import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { BsXLg } from "react-icons/bs";
import { CiMenuFries } from "react-icons/ci";

const links = [
  { name: "Inicio", path: "/" },
  { name: "Gobernanza", path: "/governance" },
  { name: "Ética", path: "/ethics" },
  { name: "Monitoreo", path: "/monitoring" },
  { name: "Participación", path: "/participation" },
  { name: "Recursos", path: "/resources" },
  { name: "Publicaciones", path: "/dspace" },
];

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } =
    useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex justify-between items-center py-5 px-4 xl:px-0">
        {/* LOGO / MARCA */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            IA<span className="font-light tracking-widest ml-1">WATCH</span>
          </span>
          <span className="text-xs text-gray-500 tracking-wide">
            Observatorio de Inteligencia Artificial
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden xl:flex items-center gap-10">
          <nav className="flex gap-8 text-sm font-medium text-gray-700">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="hover:text-teal-500 transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* AUTH */}
          <div className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">
                  Hola, <strong>{user?.username}</strong>
                </span>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="xl:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {!isMenuOpen ? (
              <CiMenuFries className="text-3xl text-teal-500" />
            ) : (
              <BsXLg className="text-3xl text-teal-500" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <nav className="xl:hidden bg-white border-t px-6 py-6 flex flex-col gap-6 text-base font-medium">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-teal-500 transition"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <span>
                  Hola, <strong>{user?.username}</strong>
                </span>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-3 bg-teal-500 text-white rounded text-center"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="px-6 py-3 bg-teal-500 text-white rounded text-center"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
