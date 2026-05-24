-- Default Super Admin account
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (full_name, email, password_hash, role, is_active)
VALUES (
    'Nepal Government Admin',
    'admin@landrecord.gov.np',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SUPER_ADMIN',
    true
);
