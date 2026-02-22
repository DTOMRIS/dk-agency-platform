import Link from 'next/link';

interface SignupCTAProps {
  onClick: (label: string) => void;
}

export default function SignupCTA({ onClick }: SignupCTAProps) {
  return (
    <section id="signup">
      <span className="home-kicker">Pulsuz Uzv Ol</span>
      <h2 className="home-title">Bu hefte growth emeliyyat loopunu qurasdir.</h2>
      <p className="home-body">No migration drama. Keep existing routes and tools, add modular execution in layers.</p>
      <div className="home-cta-row">
        <Link href="/auth/register" className="home-btn home-btn-primary" onClick={() => onClick('signup_register')}>
          Hesab yarat
        </Link>
        <Link href="/haberler" className="home-btn home-btn-secondary" onClick={() => onClick('signup_newsroom')}>
          Son xeberleri oxu
        </Link>
      </div>
    </section>
  );
}

