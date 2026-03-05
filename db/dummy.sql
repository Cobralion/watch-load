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

INSERT INTO "User" ("id", "username", "password", "role", "name") VALUES
('ckm4b2ttd0000gnr61tkc1djd', 'admin', '$2a$12$tKbgSBwOYWB6BrMbR2bk8.3lB2Fj.JRbfx7LwBwwJRJpgpwXGBSse', 'admin', 'Jonny Tester');

INSERT INTO "User" ("id", "username", "password", "role", "name") VALUES
('cmmdrwsi400052a6i94pgself', 'user', '$2a$12$UhmS4W86tP4NWussO6iFm.EVAL114.PF1hrQ2ZoiYeEp52RP/hWpK', 'user', 'Jimmy User');