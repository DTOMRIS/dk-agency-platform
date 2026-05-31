-- Migration 0009: Member Profile V2 — extended fields + approval workflow
-- Date: 2026-05-31

-- Company / business identity
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS voen VARCHAR(20);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS sector VARCHAR(80);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- Contact person
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS authorized_person VARCHAR(150);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(30);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(30);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);

-- Location
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(80);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS district VARCHAR(80);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS street_address TEXT;

-- Bio & social
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS instagram VARCHAR(120);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);

-- Visibility per-field settings (jsonb: { phone: true, email: false, address: true, ... })
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{}';

-- Approval workflow
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'draft' NOT NULL;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Public slug for /uzv/[slug] route
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS slug VARCHAR(150);

-- Language preference
ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'az';

-- Index for public listing of approved profiles
CREATE INDEX IF NOT EXISTS idx_member_profiles_approval ON member_profiles(approval_status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_profiles_slug ON member_profiles(slug) WHERE slug IS NOT NULL;
