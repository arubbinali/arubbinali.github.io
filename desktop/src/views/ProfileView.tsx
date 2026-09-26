import { useState } from "react";
import { UserRound, ShieldCheck } from "lucide-react";

// An unavailable provider is intentional: never manufacture a signed-in session.
export const accountProvider = { available: false, syncAvailable: false } as const;
export function ProfileView() {
  const [panel, setPanel] = useState("Profile");
  return <div className="account-page">
    <div className="page-heading"><div><h1>Your account</h1><p>Your workspace is yours. Currently stored on this device.</p></div></div>
    <nav className="section-tabs" aria-label="Account sections">{["Profile", "Account", "Sign in", "Sign up"].map(name => <button key={name} aria-pressed={panel === name} onClick={() => setPanel(name)}>{name}</button>)}</nav>
    <section className="account-panel" key={panel}>
      <UserRound size={28}/><h2>{panel === "Profile" ? "Local workspace" : panel}</h2>
      {panel === "Profile" || panel === "Account" ? <>
        <p className="muted">You are not signed in. No profile details or project data are being synchronized.</p>
        <p><ShieldCheck size={16}/> Local storage · Cloud sync unavailable</p>
        {panel === "Profile" && <button onClick={() => setPanel("Sign in")}>Explore account sign-in</button>}
        {panel === "Account" && <><button disabled title="No account is currently signed in">Log out</button><p className="small muted">Sign-out becomes available when an authentication provider is connected.</p></>}
      </> : <>
        <p className="muted">Account services aren't connected in this build. No credentials are collected or sent.</p>
        <fieldset disabled><label>Email<input type="email" placeholder="you@example.com" autoComplete="off"/></label><label>Password<input type="password" placeholder="Account service required" autoComplete="off"/></label><button>{panel === "Sign up" ? "Create account" : "Sign in"} — unavailable</button></fieldset>
        <button className="text-button" onClick={() => setPanel(panel === "Sign in" ? "Sign up" : "Sign in")}>{panel === "Sign in" ? "Need an account?" : "Already have an account?"}</button>
      </>}
    </section>
  </div>;
}
