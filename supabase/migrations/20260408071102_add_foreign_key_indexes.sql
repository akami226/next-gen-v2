/*
  # Add indexes for unindexed foreign keys

  1. New Indexes
    - `idx_admin_activity_log_admin_id` on admin_activity_log(admin_id)
    - `idx_admin_users_user_id` on admin_users(user_id)
    - `idx_review_replies_shop_owner_id` on review_replies(shop_owner_id)
    - `idx_saved_builds_user_id` on saved_builds(user_id)
    - `idx_shop_notifications_shop_owner_id` on shop_notifications(shop_owner_id)
    - `idx_shop_reviews_user_id` on shop_reviews(user_id)

  2. Purpose
    - Foreign keys without covering indexes cause slow sequential scans
      during cascading deletes, joins, and ON DELETE CASCADE operations
    - These indexes ensure the database can efficiently look up child rows
      when a parent row is modified or deleted
*/

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id
  ON admin_activity_log (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
  ON admin_users (user_id);

CREATE INDEX IF NOT EXISTS idx_review_replies_shop_owner_id
  ON review_replies (shop_owner_id);

CREATE INDEX IF NOT EXISTS idx_saved_builds_user_id
  ON saved_builds (user_id);

CREATE INDEX IF NOT EXISTS idx_shop_notifications_shop_owner_id
  ON shop_notifications (shop_owner_id);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_user_id
  ON shop_reviews (user_id);
