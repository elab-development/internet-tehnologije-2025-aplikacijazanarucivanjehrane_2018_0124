import React from "react";
import PageHeader from "../components/PageHeader";

export default function Shops() {
  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Prodavnice"
          subtitle="Ovde će biti lista prodavnica + filter (kasnije)."
        />

        <div className="qb-section">
          <div className="qb-card qb-card--soft">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">
                Prazna stranica. Sledeće dodajemo: fetch prodavnica, search/filter i prikaz kartica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
