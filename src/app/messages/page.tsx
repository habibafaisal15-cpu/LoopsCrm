"use client";

import { useMemo, useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Button, PageHeader } from "@/components/ui";
import { relativeTime } from "@/lib/utils";

export default function MessagesPage() {
  const { visibleThreads, contactById, sendMessage, markThreadRead } = useCrm();
  const [activeId, setActiveId] = useState(visibleThreads[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const sorted = useMemo(
    () => [...visibleThreads].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [visibleThreads],
  );
  const active = sorted.find((thread) => thread.id === activeId) ?? sorted[0];
  const contact = active ? contactById(active.contactId) : undefined;

  return (
    <>
      <PageHeader title="Messages" subtitle="Keep conversations next to the deal." />
      <div className="messages">
        <div className="thread-list">
          {sorted.map((thread) => {
            const person = contactById(thread.contactId);
            const last = thread.messages[thread.messages.length - 1];
            return (
              <button
                key={thread.id}
                className={`thread-item ${thread.id === active?.id ? "active" : ""}`}
                onClick={() => {
                  setActiveId(thread.id);
                  markThreadRead(thread.id);
                }}
              >
                <Avatar name={person?.name ?? "Contact"} size="sm" />
                <div className="copy">
                  <strong>
                    {person?.name}
                    {thread.unread ? " ·" : ""}
                  </strong>
                  <span>{last?.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="thread-view">
          {active && contact ? (
            <>
              <div className="card-head" style={{ padding: "16px 20px 0" }}>
                <h2>{contact.name}</h2>
                <span className="muted-link">{relativeTime(active.updatedAt)}</span>
              </div>
              <div className="bubble-list">
                {active.messages.map((message) => (
                  <div key={message.id} className={`bubble ${message.from}`}>
                    {message.text}
                  </div>
                ))}
              </div>
              <form
                className="composer"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!draft.trim()) return;
                  await sendMessage(active.id, draft.trim());
                  setDraft("");
                }}
              >
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${contact.name}...`}
                />
                <Button type="submit">Send</Button>
              </form>
            </>
          ) : (
            <div className="bubble-list">No conversations yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
