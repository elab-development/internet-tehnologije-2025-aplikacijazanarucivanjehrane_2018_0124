import React from "react";

export default function EntityCard({
  title,
  subtitle,
  badge,          // { text, variant }  variant: primary|warning|success|danger
  meta,           // [{ label, value }]
  actions,        // JSX (buttons)
  imageUrl,       // optional
}) {
  const badgeClass =
    badge?.variant === "warning"
      ? "qb-badge--warning"
      : badge?.variant === "success"
      ? "qb-badge--success"
      : badge?.variant === "danger"
      ? "qb-badge--danger"
      : "qb-badge--primary";

  return (
    <div className="qb-card qb-card--soft">
      <div className="qb-card-body">
        <div className="qb-flex qb-between qb-center qb-gap-10" style={{ flexWrap: "wrap" }}>
          <div className="qb-flex qb-gap-10 qb-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  objectFit: "cover",
                  border: "1px solid var(--qb-border)",
                }}
              />
            )}

            <div>
              <h3 className="qb-card-title">{title}</h3>
              {subtitle && <p className="qb-text qb-muted">{subtitle}</p>}
            </div>
          </div>

          {badge?.text && <span className={`qb-badge ${badgeClass}`}>{badge.text}</span>}
        </div>

        {meta?.length > 0 && (
          <div className="qb-mt-12 qb-grid">
            {meta.map((m, idx) => (
              <div className="qb-col-4" key={idx}>
                <p className="qb-small">{m.label}</p>
                <p className="qb-text">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="qb-mt-12 qb-flex qb-gap-10">{actions}</div>}
      </div>
    </div>
  );
}
