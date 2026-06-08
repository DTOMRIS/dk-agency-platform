CREATE TABLE IF NOT EXISTS email_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  newsletter_subscribed BOOLEAN NOT NULL DEFAULT true,
  blog_digest_subscribed BOOLEAN NOT NULL DEFAULT true,
  product_updates_subscribed BOOLEAN NOT NULL DEFAULT true,
  admin_digest_subscribed BOOLEAN NOT NULL DEFAULT true,
  consent_given_at TIMESTAMPTZ DEFAULT NOW(),
  consent_source VARCHAR(50) DEFAULT 'signup_form',
  unsubscribe_token VARCHAR(64) UNIQUE,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX idx_ep_email ON email_preferences(email);
CREATE INDEX idx_ep_user ON email_preferences(user_id);
CREATE INDEX idx_ep_token ON email_preferences(unsubscribe_token);
