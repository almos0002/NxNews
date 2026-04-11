"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import ConfirmDialog from "./ConfirmDialog";
import styles from "./cms.module.css";
import Combobox from "./Combobox";

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
  const [banConfirm, setBanConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  async function patchUser(userId: string, patch: { role?: string; banned?: boolean }) {
    setUpdating(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to update user", "error"); return; }
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, ...data.user } : u));
      if (patch.role) toast(`Role updated to ${ROLE_LABELS[patch.role] ?? patch.role}.`, "success");
      if (patch.banned === false) toast("User unbanned successfully.", "success");
    } finally { setUpdating(null); }
  }

  async function confirmBan() {
    if (!banConfirm) return;
    await patchUser(banConfirm.id, { banned: true });
    toast(`${banConfirm.name} has been banned.`, "success");
    setBanConfirm(null);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm.id);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteConfirm.id }),
      });
      const data = await res.json();
      if (!res.ok) { toast(data.error ?? "Failed to delete user", "error"); return; }
      setUsers((p) => p.filter((u) => u.id !== deleteConfirm.id));
      toast(`${deleteConfirm.name} has been permanently deleted.`, "success");
      setDeleteConfirm(null);
    } finally { setDeleting(null); }
  }

  return (
    <div className={styles.page}>
      {banConfirm && (
        <ConfirmDialog
          title="Ban User"
          message={`Are you sure you want to ban "${banConfirm.name}"? They will no longer be able to access their account.`}
          confirmLabel="Ban User"
          cancelLabel="Cancel"
          variant="danger"
          loading={updating === banConfirm.id}
          onConfirm={confirmBan}
          onCancel={() => setBanConfirm(null)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete User"
          message={`Permanently delete "${deleteConfirm.name}"? This removes their account and all associated data. This cannot be undone.`}
          confirmLabel="Delete User"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting === deleteConfirm.id}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Link href="/en/dashboard" className={styles.breadcrumb}>← Dashboard</Link>
          <h1 className={styles.pageTitle}>User Management</h1>
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </span>
      </div>

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
                      <Combobox
                        options={[
                          { value: "user",      label: "Reader" },
                          { value: "author",    label: "Author" },
                          { value: "moderator", label: "Moderator" },
                          { value: "admin",     label: "Admin" },
                        ]}
                        value={u.role}
                        searchable={false}
                        disabled={isDisabled}
                        onChange={(v) => patchUser(u.id, { role: v })}
                      />
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
                          <button className={styles.editBtn} disabled={isDisabled} onClick={() => patchUser(u.id, { banned: false })} title="Unban user">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                            </svg>
                          </button>
                        ) : (
                          <button className={styles.deleteBtn} disabled={isDisabled} onClick={() => setBanConfirm({ id: u.id, name: u.name })} title="Ban user">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                          </button>
                        )}
                        <button
                          className={styles.deleteBtn}
                          disabled={isDisabled || deleting === u.id}
                          onClick={() => setDeleteConfirm({ id: u.id, name: u.name })}
                          title="Delete user permanently"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
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
