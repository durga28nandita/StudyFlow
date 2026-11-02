// A small number tile used inside the task and focus analytics cards.
// `tone` can be "default", "good", "warn" or "danger" and changes the colour.
function MiniStat({ icon: Icon, label, value, tone = "default" }) {
  return (
    <div className={`an-mini ${tone}`}>
      <div className="an-mini-icon">
        <Icon size={18} />
      </div>
      <div>
        <p className="an-mini-label">{label}</p>
        <p className="an-mini-value">{value}</p>
      </div>
    </div>
  );
}

export default MiniStat;