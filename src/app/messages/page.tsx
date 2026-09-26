"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCrm } from "@/context/CrmContext";
import { Avatar, Button, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export default function MessagesPage() {
  const { teamMessages, employees, currentEmployee, sendTeamMessage, refreshChat } = useCrm();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const members = useMemo(
    () => employees.filter((employee) => employee.status === "active"),
    [employees],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshChat();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refreshChat]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [teamMessages.length]);

  return (
    <>
      <PageHeader
        title="Team chat"
        subtitle="One group for everyone — admin, managers, BDs and developers."
      />
      <div className="messages">
        <div className="thread-list">
          <div className="thread-item active">
            <Avatar name="Loops team" size="sm" />
            <div className="copy">
              <strong>Loops team</strong>
              <span>{members.length} members in this chat</span>
            </div>
          </div>
          {members.map((employee) => (
            <div className="thread-item chat-member" key={employee.id}>
              <Avatar name={employee.name} size="sm" />
              <div className="copy">
                <strong>{employee.name}</strong>
                <span>{employee.title || employee.role}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="thread-view team-chat">
          <div className="card-head" style={{ padding: "16px 20px 0" }}>
            <h2>Loops team</h2>
            <span className="muted-link">{members.map((employee) => employee.greetingName).join(", ")}</span>
          </div>
          <div className="bubble-list" ref={scroller}>
            {teamMessages.length ? (
              teamMessages.map((message) => {
                const mine = message.senderId === currentEmployee.id;
                return (
                  <div key={message.id} className={`bubble ${mine ? "me" : "them"}`}>
                    {mine ? null : <div className="bubble-name">{message.senderName}</div>}
                    <div>{message.text}</div>
                    <div className="bubble-time">{formatDateTime(message.createdAt)}</div>
                  </div>
                );
              })
            ) : (
              <p className="empty-note">No messages yet. Say hi to the team.</p>
            )}
          </div>
          <form
            className="composer"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!draft.trim() || sending) return;
              setSending(true);
              try {
                await sendTeamMessage(draft.trim());
                setDraft("");
              } finally {
                setSending(false);
              }
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Message the team..."
            />
            <Button type="submit">{sending ? "Sending..." : "Send"}</Button>
          </form>
        </div>
      </div>
    </>
  );
}
