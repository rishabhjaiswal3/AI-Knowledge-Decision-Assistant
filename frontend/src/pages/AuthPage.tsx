import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../lib/useAuth";

type Mode = "login" | "register";

export default function AuthPage({ mode }: { mode: Mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ organization_name: "", name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.email.trim() || !form.password) return setError("Enter your email and password.");
    if (isRegister) {
      if (form.organization_name.trim().length < 2) return setError("Organization name needs at least 2 characters.");
      if (!form.name.trim()) return setError("Enter your name.");
      if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
        return setError("Password needs at least 8 characters, with a letter and a number.");
    }
    setBusy(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <main className="auth__main">
        <div className="auth__top"><Logo /></div>

        <div className="auth__card">
          <h1 className="auth__title">{isRegister ? "Create your workspace" : "Welcome back"}</h1>
          <p className="auth__subtitle">
            {isRegister
              ? "Turn your organization's PDFs into an assistant that answers — and decides — with sources."
              : "Sign in to manage your knowledge base and assistant."}
          </p>

          <form onSubmit={submit} className="form" noValidate>
            {isRegister && (
              <>
                <Field label="Organization name" htmlFor="org">
                  <input id="org" className="input" placeholder="Acme University" value={form.organization_name} onChange={set("organization_name")} required minLength={2} autoFocus />
                </Field>
                <Field label="Your name" htmlFor="name">
                  <input id="name" className="input" placeholder="Ada Lovelace" value={form.name} onChange={set("name")} required autoComplete="name" />
                </Field>
              </>
            )}
            <Field label="Work email" htmlFor="email">
              <input id="email" type="email" className="input" placeholder="you@company.com" value={form.email} onChange={set("email")} required autoComplete="email" autoFocus={!isRegister} />
            </Field>
            <Field label="Password" htmlFor="password" hint={isRegister ? "8+ characters, a letter and a number" : undefined}>
              <div className="input-wrap">
                <input id="password" type={showPassword ? "text" : "password"} className="input" placeholder="••••••••" value={form.password} onChange={set("password")} required autoComplete={isRegister ? "new-password" : "current-password"} />
                <button type="button" className="input-wrap__btn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && <div className="alert alert--error" role="alert">{error}</div>}

            <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
              {busy ? <Loader2 size={16} className="spin" /> : null}
              {isRegister ? "Create workspace" : "Sign in"}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth__switch">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create a workspace"}</Link>
          </p>
        </div>

        <footer className="auth__foot">Each organization's documents stay private to its own assistant.</footer>
      </main>

      <aside className="auth__aside" aria-hidden="true">
        <div className="aside__inner">
          <p className="eyebrow eyebrow--light">How it answers</p>
          <h2 className="aside__title">Not just a chatbot.<br /><em>A reasoning pipeline.</em></h2>

          <div className="trace">
            <div className="trace__q">
              <span className="trace__who">Visitor</span>
              “I'm a 2nd-year student with a 3.7 GPA and a sports scholarship. Can I get the merit scholarship too?”
            </div>

            <ol className="trace__steps">
              <Step label="Understand" detail="3 conditions extracted" />
              <Step label="Year ≥ 2" detail="Boolean · true" tone="ok" />
              <Step label="GPA ≥ 3.5" detail="Boolean · true" tone="ok" />
              <Step label="Stacking policy" detail="Choice · allowed with cap" tone="ok" />
            </ol>

            <div className="trace__a">
              <span className="trace__who">Assistant</span>
              Yes — you meet all three conditions. Combined awards are capped at full tuition.
              <div className="trace__refs">
                <span className="ref"><FileText size={12} /> Scholarship_Rules.pdf · p.4</span>
                <span className="ref"><FileText size={12} /> Athletics_Policy.pdf · p.2</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field__row">
        <span className="field__label">{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Step({ label, detail, tone }: { label: string; detail: string; tone?: "ok" }) {
  return (
    <li className="trace__step">
      <span className={`trace__dot ${tone ? "trace__dot--ok" : ""}`}>{tone && <Check size={10} strokeWidth={3} />}</span>
      <span className="trace__label">{label}</span>
      <span className="trace__detail">{detail}</span>
    </li>
  );
}
