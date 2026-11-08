import { useAuth } from "../lib/useAuth";

export default function Home() {
  const { user, organization } = useAuth();

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <p className="eyebrow">{organization?.name}</p>
          <h1 className="page__title">Good to see you, {user?.name.split(" ")[0]}.</h1>
          <p className="page__lede">You're signed in to your organization's workspace.</p>
        </div>
      </header>

      <section className="panel">
        <dl className="details">
          <div><dt>Organization</dt><dd>{organization?.name}</dd></div>
          <div><dt>Name</dt><dd>{user?.name}</dd></div>
          <div><dt>Email</dt><dd>{user?.email}</dd></div>
          <div><dt>Member since</dt><dd>{organization && new Date(organization.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</dd></div>
        </dl>
      </section>
    </div>
  );
}
