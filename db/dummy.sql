DROP TABLE IF EXISTS "User";
CREATE TABLE "public"."User" (
    "id" text NOT NULL,
    "username" text NOT NULL,
    "password_hash" text NOT NULL,
    "name" text,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);

INSERT INTO "User" ("id", "username", "password_hash", "name") VALUES
('ckm4b2ttd0000gnr61tkc1djd',	'test',	'test_hash',	'Jonny Tester');