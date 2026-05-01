-- Add learning_notes field to dictionaries table
-- This field stores a concise summary of the user's conversation with AI
-- to help them quickly recall key learning points

ALTER TABLE dictionaries
ADD COLUMN IF NOT EXISTS learning_notes TEXT;

COMMENT ON COLUMN dictionaries.learning_notes IS 'Concise summary of key learning points from the conversation with AI tutor';
