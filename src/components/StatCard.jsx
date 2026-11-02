import "../styles/StatCard.css";

// `icon` is a Lucide component passed in as a prop, e.g. icon={Flame}
function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
        <p className="stat-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard;