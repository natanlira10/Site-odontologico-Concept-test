CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_expiry ON sessions(expires_at);

CREATE TABLE rate_limits (
  key char(64) PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX rate_limits_expiry ON rate_limits(expires_at);

CREATE TABLE dentists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL
);
CREATE TABLE treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes BETWEEN 15 AND 240 AND duration_minutes % 15 = 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0)
);
CREATE TABLE dentist_treatments (
  dentist_id uuid NOT NULL REFERENCES dentists(id),
  treatment_id uuid NOT NULL REFERENCES treatments(id),
  PRIMARY KEY (dentist_id, treatment_id)
);

-- Explicit work windows: UTC instants supplied with a timezone offset.
CREATE TABLE schedule_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  CHECK (ends_at > starts_at AND ends_at - starts_at <= interval '12 hours'),
  EXCLUDE USING gist (dentist_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES users(id),
  dentist_id uuid NOT NULL,
  treatment_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  idempotency_key uuid NOT NULL,
  request_starts_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (dentist_id, treatment_id) REFERENCES dentist_treatments(dentist_id, treatment_id),
  CHECK (ends_at > starts_at),
  UNIQUE (patient_id, idempotency_key),
  CONSTRAINT dentist_no_overlap EXCLUDE USING gist
    (dentist_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
    WHERE (status <> 'cancelled'),
  CONSTRAINT patient_no_overlap EXCLUDE USING gist
    (patient_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
    WHERE (status <> 'cancelled')
);
CREATE INDEX appointments_patient_time ON appointments(patient_id, starts_at);
CREATE INDEX appointments_dentist_time ON appointments(dentist_id, starts_at);

CREATE TABLE appointment_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES appointments(id),
  actor_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL CHECK (action IN ('booked', 'rescheduled', 'cancelled', 'completed')),
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
