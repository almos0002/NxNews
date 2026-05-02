"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { signUp, signIn } from "@/lib/auth/auth-client";
import { signupSchema } from "@/lib/util/validation";
import styles from "@/app/[locale]/signup/page.module.css";

export default function SignupForm() {
  const router = useRouter();

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
    setServerError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { firstName, lastName, email, password } = parsed.data;
      const res = await signUp.email({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });

      if (res.error) {
        setServerError(res.error.message ?? "Could not create account. Try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSocial(provider: "google" | "github") {
    await signIn.social({ provider, callbackURL: "/dashboard" });
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <div className={styles.nameRow}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>First name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Jane"
            className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
            value={values.firstName}
            onChange={onChange}
            required
          />
          {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>Last name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Smith"
            className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
            value={values.lastName}
            onChange={onChange}
            required
          />
          {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          value={values.email}
          onChange={onChange}
          required
        />
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
          value={values.password}
          onChange={onChange}
          required
        />
        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
          value={values.confirmPassword}
          onChange={onChange}
          required
        />
        {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
      </div>

      <label className={styles.checkboxLabel}>
        <input type="checkbox" name="newsletter" className={styles.checkbox} defaultChecked />
        <span>Subscribe to the Daily Briefing newsletter</span>
      </label>

      <label className={styles.checkboxLabel}>
        <input type="checkbox" name="terms" className={styles.checkbox} required />
        <span>
          I agree to the <Link href="/terms" className={styles.inlineLink}>Terms of Service</Link> and <Link href="/privacy" className={styles.inlineLink}>Privacy Policy</Link>
        </span>
      </label>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or sign up with</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.socialRow}>
        <button type="button" className={styles.socialBtn} onClick={() => onSocial("google")}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button type="button" className={styles.socialBtn} onClick={() => onSocial("github")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </button>
      </div>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.footerLink}>Sign in</Link>
      </p>
    </form>
  );
}
