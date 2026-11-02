import { User } from "lucide-react";
import "../styles/Header.css";

function Header() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="header">
      <div>
        <h1 className="header-title">Welcome back! 👋</h1>
        <p className="header-date">{today}</p>
      </div>

      <div className="avatar" aria-label="Profile">
        <User size={22} />
      </div>
    </header>
  );
}

export default Header;