ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('patient', 'admin', 'dentist'));
ALTER TABLE dentists ADD COLUMN user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE schedule_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  CHECK (ends_at > starts_at),
  EXCLUDE USING gist (dentist_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
);

CREATE TABLE availability_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dentist_id uuid NOT NULL REFERENCES dentists(id),
  actor_id uuid NOT NULL REFERENCES users(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  available boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
