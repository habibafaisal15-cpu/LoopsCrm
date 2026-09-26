"use client";

import { useCrm } from "@/context/CrmContext";
import { LeadAccessGate } from "@/components/LeadAccessGate";
import { Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const { leads, followUps } = useCrm();
  const clients = leads.filter((lead) => lead.status === "client");

  return (
    <LeadAccessGate>
      <PageHeader
        title="Clients"
        subtitle="Leads land here only after a business developer marks them closed."
      />
      <div className="cards-grid">
        {clients.length ? (
          clients.map((client) => {
            const closeNote = followUps.find((item) => item.leadId === client.id && item.outcome === "client");
            return (
              <Card key={client.id} className="company-card">
                <h3>{client.name}</h3>
                <p>{client.company || "Independent"}</p>
                <div className="company-meta">
                  <span className="chip">{client.phone}</span>
                  {client.email ? <span className="chip">{client.email}</span> : null}
                  <span className="chip">Closed {client.closedAt ? formatDate(client.closedAt) : ""}</span>
                </div>
                <p style={{ marginTop: 12 }}>{closeNote?.result || client.notes}</p>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="empty-note">No closed clients yet. Close a follow-up as “Client close” to move them here.</p>
          </Card>
        )}
      </div>
    </LeadAccessGate>
  );
}
