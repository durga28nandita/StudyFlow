import "../styles/Header.css";

function Header({ userName }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Use the first letter of the name as the avatar
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="header">
      <div>
        <h1 className="header-title">Welcome back, {userName} 👋</h1>
        <p className="header-date">{today}</p>
      </div>

      <div className="avatar" title={userName}>
        {initial}
      </div>
    </header>
  );
}

export default Header;