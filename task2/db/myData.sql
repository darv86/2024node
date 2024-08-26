
INSERT INTO "Departments" ("departmentName") VALUES
  ('back-end'),
  ('from-end'),
  ('management');

INSERT INTO "Roles" ("roleName") VALUES
  ('junior'),
  ('middle'),
  ('senior');

INSERT INTO "Subjects" ("subjectName", "role") VALUES
  ('patterns', 3),
  ('bugs', 1),
  ('api', 2);

INSERT INTO "Teachers" ("name", "surname", "role", "subject", "department") VALUES
  ('John', 'Johnson', 1, 1, 1),
  ('Bob', 'Don', 2, 2, 2),
  ('Ann', 'Hus', 3, 3, 3);