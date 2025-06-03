import { useState } from "react";
import { BsXLg } from "react-icons/bs";
import { CiMenuFries } from "react-icons/ci";
import { Link } from "react-router-dom";

const links = [
  {
    name: "Inicio",
    path: "/",
  },
  {
    name: "Gobernanza",
    path: "/governance",
  },
  {
    name: "Ética",
    path: "/ethics",
  },
  {
    name: "Casos de Uso",
    path: "/use-cases",
  },
  {
    name: "Monitoreo",
    path: "/monitoring",
  },
  {
    name: "Participación",
    path: "/participation",
  },
  {
    name: "Recursos",
    path: "/resources",
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="py-6 xl:py-8 container  mx-auto flex justify-between items-center flex-wrap">
      {/* Center Section: Main Title */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-text-dark">KI</span>
        <span className="text-base text-text-medium">
          Observatorio de Inteligencia Artificial
        </span>
      </div>

      {/* desktop nav & hire me/contact button */}
      <div className="hidden xl:flex items-center gap-8">
        <nav className="flex gap-8">
          {links.map((link) => {
            return (
              <Link
                to={link.path}
                className="capitalize hover:text-teal-400 transition-all"
                key={link.name}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* mobile nav */}
      <div className="xl:hidden">
        <i
          className="cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {!isMenuOpen ? (
            <CiMenuFries className="text-[32px] text-teal-400" />
          ) : (
            <BsXLg className="text-[32px] text-teal-400" />
          )}
        </i>
      </div>
      {isMenuOpen && (
        <nav className="flex flex-col basis-full justify-center items-center gap-6 py-5 font-semibold text-lg">
          {links.map((link) => {
            return (
              <Link
                to={link.path}
                className="capitalize hover:text-teal-400 transition-all"
                key={link.name}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  )
}

export default Header