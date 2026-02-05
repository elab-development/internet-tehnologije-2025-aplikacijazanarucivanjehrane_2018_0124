import React from "react";

export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="qb-card qb-card--soft">
      <div className="qb-card-body">
        <div className="qb-flex qb-between qb-center qb-gap-10" style={{ flexWrap: "wrap" }}>
          <div>
            <h1 className="qb-h1">{title}</h1>
            {subtitle && <p className="qb-text qb-muted">{subtitle}</p>}
          </div>
          {right && <div className="qb-flex qb-gap-10 qb-center">{right}</div>}
        </div>
      </div>
    </div>
  );
}
