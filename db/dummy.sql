DROP TABLE IF EXISTS "User";
CREATE TABLE "public"."User" (
    "id" text NOT NULL,
    "username" text NOT NULL,
    "password" text NOT NULL,
    "name" text,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);

INSERT INTO "User" ("id", "username", "password", "role", "name") VALUES
('ckm4b2ttd0000gnr61tkc1djd', 'admin', '$2a$12$v61otLTs7yf/NtH9a4.EA.dQCfA9qZwC5gy6jR0A.LQ.aQI1FsQ5y', 'ADMIN', 'Jonny Tester');

INSERT INTO "User" ("id", "username", "password", "role", "name") VALUES
('cmmdrwsi400052a6i94pgself', 'user', '$2a$12$VSYVchlRN2bDTm/v9iQhW.iejCdpgByY416gMe9GNoY7GW4pH627C', 'USER', 'Jimmy User');