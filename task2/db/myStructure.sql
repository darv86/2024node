CREATE TABLE "Departments" (
  "id" bigint generated always as identity,
  "departmentName" text NOT NULL
);

ALTER TABLE "Departments" ADD CONSTRAINT "pkDepartments" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "akDepartments" ON "Departments" ("departmentName");

CREATE TABLE "Roles" (
  "id" bigint generated always as identity,
  "roleName" text NOT NULL
);

ALTER TABLE "Roles" ADD CONSTRAINT "pkRoles" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "akRoles" ON "Roles" ("roleName");

CREATE TABLE "Subjects" (
  "id" bigint generated always as identity,
  "subjectName" text NOT NULL,
  "role" bigint NOT NULL
);

ALTER TABLE "Subjects" ADD CONSTRAINT "pkSubjects" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "akSubjects" ON "Subjects" ("subjectName");
ALTER TABLE "Subjects" ADD CONSTRAINT "fkSubjectsRoles" FOREIGN KEY ("role") REFERENCES "Roles" ("id");

CREATE TABLE "Teachers" (
  "id" bigint generated always as identity,
  "name" text,
  "middleName" text,
  "surname" text NOT NULL,
  "role" bigint NOT NULL,
  "subject" bigint NOT NULL,
  "department" bigint NOT NULL
);

ALTER TABLE "Teachers" ADD CONSTRAINT "pkTeachers" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "akTeachers" ON "Teachers" ("surname");
ALTER TABLE "Teachers" ADD CONSTRAINT "fkTeachersRoles" FOREIGN KEY ("role") REFERENCES "Roles" ("id");
ALTER TABLE "Teachers" ADD CONSTRAINT "fkTeachersSubjects" FOREIGN KEY ("subject") REFERENCES "Subjects" ("id");
ALTER TABLE "Teachers" ADD CONSTRAINT "fkTeachersDepartments" FOREIGN KEY ("department") REFERENCES "Departments" ("id");

