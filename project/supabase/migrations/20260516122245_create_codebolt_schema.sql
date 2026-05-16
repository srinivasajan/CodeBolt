/*
  # CODEBOLT Chat Schema

  ## New Tables
  - `chats`
    - `id` (uuid, primary key)
    - `title` (text) - chat display name
    - `model` (text) - AI model used
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `messages`
    - `id` (uuid, primary key)
    - `chat_id` (uuid, FK to chats)
    - `role` (text) - 'user' | 'assistant' | 'system'
    - `content` (text) - message body
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Public read/write allowed (no auth for this app)
*/

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Chat',
  model text NOT NULL DEFAULT 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS chats_updated_at_idx ON chats(updated_at DESC);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read chats"
  ON chats FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert chats"
  ON chats FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update chats"
  ON chats FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete chats"
  ON chats FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public can read messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update messages"
  ON messages FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete messages"
  ON messages FOR DELETE
  TO anon
  USING (true);

CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_chat_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_updated_at();
