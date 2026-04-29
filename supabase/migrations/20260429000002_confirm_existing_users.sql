-- Confirm all existing unconfirmed users so they can login immediately
-- This is safe to run multiple times (idempotent)
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now()
where
  email_confirmed_at is null;
