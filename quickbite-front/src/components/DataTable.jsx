import React from "react";

export default function DataTable({
  title,
  subtitle,
  columns,   
  rows,      // array
  rowKey = (row) => row.id,
  rowActions, // (row) => JSX (buttons)
  emptyText = "Nema podataka.",
}) {
  return (
    <div className="qb-card">
      {(title || subtitle) && (
        <div className="qb-card-header">
          {title && <h2 className="qb-h2">{title}</h2>}
          {subtitle && <p className="qb-card-subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="qb-card-body">
        <div className="qb-table-wrap">
          <table className="qb-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.header}</th>
                ))}
                {rowActions && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {(!rows || rows.length === 0) && (
                <tr>
                  <td colSpan={columns.length + (rowActions ? 1 : 0)}>
                    <p className="qb-text qb-muted" style={{ padding: 10 }}>
                      {emptyText}
                    </p>
                  </td>
                </tr>
              )}

              {rows?.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}

                  {rowActions && (
                    <td>
                      <div className="qb-table-actions">{rowActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
