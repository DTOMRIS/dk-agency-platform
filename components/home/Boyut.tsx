export default function Boyut() {
  const metrics = [
    { label: 'Active operator accounts', value: '1,240+' },
    { label: 'Tracked campaigns', value: '420+' },
    { label: 'Weekly automated briefs', value: '95%' },
    { label: 'Avg. decision cycle drop', value: '-32%' },
  ];

  return (
    <section id="boyut">
      <span className="home-kicker">Boyut</span>
      <h2 className="home-title">Scale from single site to multi-unit operations.</h2>
      <p className="home-body">From one kitchen to distributed groups, the same narrative modules keep governance consistent.</p>
      <div className="metric-row">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric">
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
