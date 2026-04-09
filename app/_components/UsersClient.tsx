"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./cms.module.css";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  banned: boolean | null;
  banReason: string | null;
}

const ROLE_LABELS: Record<string, string> = { admin: "Admin", moderator: "Moderator", author: "Author", user: "Reader" };
const ROLE_BADGE: Record<string, string> = { admin: styles.roleAdmin, moderator: styles.roleModerator, author: styles.roleAuthor, user: styles.roleUser };

interface Props {
  initialUsers: User[];
  currentUserId: string;
}

export default function UsersClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  async function patchUser(userId: string, patch: { role?: string; banned?: boolean }) {
    setUpdating(userId); setErr("");
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to update"); return; }
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, ...data.user } : u));
    } finally { setUpdating(null); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>User Management</h1>
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </span>
      </div>

      {err && <p className={styles.errMsg}>{err}</p>}

      <div style={{ marginBottom: 16 }}>
        <input
          className={styles.input}
          style={{ maxWidth: 320 }}
          placeholder="Search by name, email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className={styles.emptyRow}>No users found.</td></tr>
            ) : filtered.map((u) => {
              const isMe = u.id === currentUserId;
              const isDisabled = isMe || updating === u.id;
              return (
                <tr key={u.id} style={u.banned ? { opacity: 0.6 } : undefined}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name?.charAt(0)?.toUpperCase() ?? "?"}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}{isMe && <span style={{ marginLeft: 6, fontSize: "0.72rem", color: "var(--color-ink-muted)" }}>(you)</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-ink-muted)", fontSize: "0.85rem" }}>{u.email}</td>
                  <td>
                    {isMe ? (
                      <span className={`${styles.badge} ${ROLE_BADGE[u.role] ?? ""}`}>{ROLE_LABELS[u.role] ?? u.role}</span>
                    ) : (
                      <select
                        className={styles.roleSelect}
                        value={u.role}
                        disabled={isDisabled}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                      >
                        <option value="user">Reader</option>
                        <option value="author">Author</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td style={{ color: "var(--color-ink-muted)", fontSize: "0.82rem" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td>
                    {u.banned
                      ? <span className={`${styles.badge} ${styles.badgeArchived}`}>Banned</span>
                      : <span className={`${styles.badge} ${styles.badgePublished}`}>Active</span>
                    }
                  </td>
                  <td>
                    {!isMe && (
                      <div className={styles.actionRow}>
                        {u.banned ? (
                          <button className={styles.editBtn} disabled={isDisabled} onClick={() => patchUser(u.id, { banned: false })}>
                            Unban
                          </button>
                        ) : (
                          <button className={styles.deleteBtn} disabled={isDisabled} onClick={() => { if (confirm(`Ban ${u.name}?`)) patchUser(u.id, { banned: true }); }}>
                            Ban
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
