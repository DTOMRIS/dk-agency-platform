-- Slug redirect table — when blog slug changes, old URL → 301 → new slug
CREATE TABLE IF NOT EXISTS slug_redirects (
  id SERIAL PRIMARY KEY,
  old_slug VARCHAR(255) NOT NULL,
  new_slug VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'blog',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_old ON slug_redirects (old_slug);

-- Add cascade delete to guru_boxes FK (drop + re-add)
ALTER TABLE guru_boxes DROP CONSTRAINT IF EXISTS guru_boxes_blog_post_id_blog_posts_id_fk;
ALTER TABLE guru_boxes
  ADD CONSTRAINT guru_boxes_blog_post_id_blog_posts_id_fk
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
