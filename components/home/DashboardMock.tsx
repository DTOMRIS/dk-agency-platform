export default function DashboardMock() {
  return (
    <div className="dk-dashboard-mock" aria-label="Dashboard mock">
      <div className="dk-dashboard-head">
        <strong>DK Ops Board</strong>
        <span>Live snapshot</span>
      </div>
      <div className="dk-kpi-grid">
        <article>
          <small>Revenue</small>
          <strong>AZN 118k</strong>
          <span>+12.4%</span>
        </article>
        <article>
          <small>Food Cost</small>
          <strong>31.2%</strong>
          <span>-1.1pp</span>
        </article>
        <article>
          <small>Labor</small>
          <strong>27.4%</strong>
          <span>stable</span>
        </article>
      </div>
      <div className="dk-trend-list">
        <div>
          <span>Campaign ROI</span>
          <b>2.6x</b>
        </div>
        <div>
          <span>Order mix shift</span>
          <b>+8%</b>
        </div>
        <div>
          <span>Waste alerts</span>
          <b>3 active</b>
        </div>
      </div>
    </div>
  );
}
