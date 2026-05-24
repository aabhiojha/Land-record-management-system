-- Fix admin password hash (password: admin123)
UPDATE users SET password_hash = '$2b$10$VKtd0mF9fOERcwx0oDuLQuOugHjRhPO4ft/U0JgbTv8FxJTQGWcPi'
WHERE email = 'admin@landrecord.gov.np';
