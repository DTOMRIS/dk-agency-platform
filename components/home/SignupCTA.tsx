import Link from 'next/link';

interface SignupCTAProps {
  onClick: (label: string) => void;
}

export default function SignupCTA({ onClick }: SignupCTAProps) {
  return (
    <section id="signup">
      <span className="home-kicker">Signup CTA</span>
      <h2 className="home-title">Build your growth operating loop this week.</h2>
      <p className="home-body">No migration drama. Keep existing routes and tools, add modular execution in layers.</p>
      <div className="home-cta-row">
        <Link href="/auth/register" className="home-btn home-btn-primary" onClick={() => onClick('signup_register')}>
          Create account
        </Link>
        <Link href="/haberler" className="home-btn home-btn-secondary" onClick={() => onClick('signup_newsroom')}>
          Read latest reports
        </Link>
      </div>
    </section>
  );
}
