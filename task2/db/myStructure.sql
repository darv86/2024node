CREATE TABLE "Roles" (
	"id" bigint ;
	"roleName" text ;
);

CREATE TABLE "Subjects" (
	"id" bigint ;
	"subjectName" text ;
	"role" bigint ;
);

CREATE TABLE "Teachers" (
	"id" bigint ;
	"name" text ;
	"middleName" text ;
	"surname" text ;
	"role" bigint ;
);

