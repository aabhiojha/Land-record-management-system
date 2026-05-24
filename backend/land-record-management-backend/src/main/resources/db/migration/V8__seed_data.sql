-- Officers (password: officer123)
INSERT INTO users (full_name, email, password_hash, phone, citizenship_number, role, district, is_active)
VALUES
    ('Hari Prasad Sharma', 'hari@malpot.gov.np',
     '$2b$10$GcSa8Cy/F8rKP0ESgpvcmOqzB5c9HigKRm63s5trpX/VgevFJ1RJO',
     '9841000001', '01-01-00001', 'MALPOT_OFFICER', 'Kathmandu', true),
    ('Sita Devi Gurung', 'sita@malpot.gov.np',
     '$2b$10$GcSa8Cy/F8rKP0ESgpvcmOqzB5c9HigKRm63s5trpX/VgevFJ1RJO',
     '9841000002', '15-02-00002', 'MALPOT_OFFICER', 'Lalitpur', true);

-- Citizens (password: citizen123)
INSERT INTO users (full_name, email, password_hash, phone, citizenship_number, role, district, is_active)
VALUES
    ('Ram Bahadur Thapa', 'ram@example.com',
     '$2b$10$QqXP.72Lm7RSyEr2QHrXd.MZvDZWLMnyy54j3A5OFsIXBqT2OpHLG',
     '9841100001', '01-01-12345', 'CITIZEN', 'Kathmandu', true),
    ('Gita Kumari Shrestha', 'gita@example.com',
     '$2b$10$QqXP.72Lm7RSyEr2QHrXd.MZvDZWLMnyy54j3A5OFsIXBqT2OpHLG',
     '9841100002', '03-02-67890', 'CITIZEN', 'Bhaktapur', true),
    ('Bikash Tamang', 'bikash@example.com',
     '$2b$10$QqXP.72Lm7RSyEr2QHrXd.MZvDZWLMnyy54j3A5OFsIXBqT2OpHLG',
     '9841100003', '15-03-11223', 'CITIZEN', 'Lalitpur', true),
    ('Sunita Maharjan', 'sunita@example.com',
     '$2b$10$QqXP.72Lm7RSyEr2QHrXd.MZvDZWLMnyy54j3A5OFsIXBqT2OpHLG',
     '9841100004', '27-04-44556', 'CITIZEN', 'Kathmandu', true);
