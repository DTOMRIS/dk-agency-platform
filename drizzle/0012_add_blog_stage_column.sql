-- Migration: Add stage column to blog_posts
-- CTO approved (HALT-1 resolution, 2026-06-04)
-- Enables Başla/Böyüt/Devir filtering on blog articles

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS stage VARCHAR(20);
