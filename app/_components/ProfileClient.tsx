"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./cms.module.css";

const ROLE_LABELS: Record<string, string> = { admin: "Admin", moderator: "Moderator", author: "Author", user: "Reader" };
const ROLE_BADGE: Record<string, string> = { admin: styles.roleAdmin, moderator: styles.roleModerator, author: styles.roleAuthor, user: styles.roleUser };

interface User {
  id: string; name: string; email: string; bio?: string;
  role: string; createdAt: string; image?: string;
}

interface Props { user: User; }

export default function ProfileClient({ user }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [profileOk, setProfileOk] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdOk, setPwdOk] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  async function saveProfile() {
    if (!name.trim()) { setProfileErr("Name is required"); return; }
    setSaving(true); setProfileErr(""); setProfileOk("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileErr(data.error ?? "Failed"); return; }
      setProfileOk("Profile updated successfully.");
    } finally { setSaving(false); }
  }

  async function changePassword() {
    if (!curPwd || !newPwd) { setPwdErr("All fields required"); return; }
    if (newPwd !== confirmPwd) { setPwdErr("New passwords do not match"); return; }
    if (newPwd.length < 8) { setPwdErr("New password must be at least 8 characters"); return; }
    setPwdSaving(true); setPwdErr(""); setPwdOk("");
    try {
      const result = await authClient.changePassword({ currentPassword: curPwd, newPassword: newPwd });
      if (result.error) { setPwdErr(result.error.message ?? "Failed to change password"); return; }
      setPwdOk("Password changed successfully.");
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    } finally { setPwdSaving(false); }
  }

  const initials = (user.name ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>My Profile</h1>
        </div>
      </div>

      {/* Profile card */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Avatar + meta */}
        <div className={styles.formCard} style={{ width: 200, flexShrink: 0, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 700, margin: "0 auto 14px" }}>
            {initials}
          </div>
          <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1rem", margin: "0 0 4px" }}>{user.name}</p>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.78rem", color: "var(--color-ink-muted)", margin: "0 0 10px", wordBreak: "break-all" }}>{user.email}</p>
          <span className={`${styles.badge} ${ROLE_BADGE[user.role] ?? ""}`}>{ROLE_LABELS[user.role] ?? user.role}</span>
          {user.createdAt && (
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.73rem", color: "var(--color-ink-muted)", marginTop: 10 }}>
              Member since {new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Edit profile */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className={styles.formCard}>
            <p className={styles.formTitle}>Edit Profile</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.field}>
                <label className={styles.label}>Display Name *</label>
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input className={styles.input} value={user.email} readOnly style={{ background: "#f8f7f2", cursor: "not-allowed" }} />
                <p className={styles.hint}>Email cannot be changed here.</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Bio</label>
                <textarea className={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about yourself…" rows={3} style={{ resize: "vertical" }} />
              </div>
              {profileErr && <p className={styles.errMsg}>{profileErr}</p>}
              {profileOk && <p className={styles.successMsg}>{profileOk}</p>}
              <div>
                <button className={styles.submitBtn} onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving…" : "Save Profile"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formCard}>
            <p className={styles.formTitle}>Change Password</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className={styles.field}>
                <label className={styles.label}>Current Password</label>
                <input className={styles.input} type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} placeholder="••••••••" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input className={styles.input} type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm New Password</label>
                <input className={styles.input} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Repeat new password" onKeyDown={(e) => e.key === "Enter" && changePassword()} />
              </div>
              {pwdErr && <p className={styles.errMsg}>{pwdErr}</p>}
              {pwdOk && <p className={styles.successMsg}>{pwdOk}</p>}
              <div>
                <button className={styles.submitBtn} onClick={changePassword} disabled={pwdSaving}>
                  {pwdSaving ? "Updating…" : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
