-- Add mock user for testing
-- Run this in Supabase SQL Editor to create a test user

INSERT INTO users (firebase_uid, email, display_name, first_name, last_name)
VALUES (
  'mock_user_123',
  'user@example.com',
  'Test User',
  'Test',
  'User'
)
ON CONFLICT (firebase_uid) DO NOTHING;

-- Verify the user was created
SELECT * FROM users WHERE firebase_uid = 'mock_user_123';
