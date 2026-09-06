ALTER TABLE users ADD COLUMN phone varchar(32), ADD COLUMN cpf varchar(11);
ALTER TABLE appointments
  ADD COLUMN patient_phone varchar(32),
  ADD COLUMN patient_cpf varchar(11),
  ADD COLUMN notes varchar(2000),
  ADD COLUMN is_first_visit boolean NOT NULL DEFAULT true;
