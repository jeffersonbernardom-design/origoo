import { Link } from "react-router-dom";
import { Church } from "lucide-react";

const AppHeader = () => (
  <header className="fixed top-0 inset-x-0 z-40 h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5">
    <Link to="/" className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
        <Church className="w-5 h-5 text-primary-foreground" />
      </span>
      <span className="font-bold text-primary tracking-tight">Escala de Igreja</span>
    </Link>
    <Link to="/perfil" aria-label="Perfil">
      <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shadow-card">
        R
      </div>
    </Link>
  </header>
);

export default AppHeader;