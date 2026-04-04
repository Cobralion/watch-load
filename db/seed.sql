INSERT INTO "users" ("id", "username", "password", "role", "name", "updated_at") VALUES
('ckm4b2ttd0000gnr61tkc1djd', 'admin', '$2a$12$v61otLTs7yf/NtH9a4.EA.dQCfA9qZwC5gy6jR0A.LQ.aQI1FsQ5y', 'ADMIN', 'Jonny Tester', '2024-06-01 12:00:00');

INSERT INTO "users" ("id", "username", "password", "role", "name", "updated_at") VALUES
('cmngafhv100032a6iu7st4mm8', 'user', '$2a$12$VSYVchlRN2bDTm/v9iQhW.iejCdpgByY416gMe9GNoY7GW4pH627C', 'USER', 'Jimmy User', '2024-06-01 12:00:00');

INSERT INTO "users" ("id", "username", "password", "role", "name", "updated_at") VALUES
('cmngafkfw00092a6it9xer5qm', 'user2', '$2a$12$TkBN1iu95ZSoMt3ROtuOWebQOqkZcXOXvsiXzOmdLOGkI38psUz/6', 'USER', 'James User', '2024-06-01 12:00:00');

INSERT INTO "users" ("id", "username", "password", "role", "name", "updated_at") VALUES
('cmnkeq3j800052a6imq245cr2', 'test', '$2a$12$YevL//FqxhoK0b4pVdfTq.jmV9ImnmffrffNdYpaQacsuq25OXptC', 'USER', 'Jane User', '2024-06-01 12:00:00');

INSERT INTO "workspaces" (id, name, description, slug, updated_at) VALUES
('cmngaj1zf00072a6itpsrp8ah', 'Jimmys Workspace', 'This is Jimmys workspace', 'jimmys-workspace', '2024-06-01 12:00:00');

INSERT INTO "workspaces" (id, name, description, slug, updated_at) VALUES
('cmngal4g8000b2a6iwthrdnnn', 'James Workspace', 'This is James workspace', 'james-workspace', '2024-06-01 12:00:00');


/* Membership from Jimmy */

INSERT INTO "memberships" (id, user_id, workspace_id, workspace_role, updated_at) VALUES
('cmngan6ut000f2a6ihq07flgb', 'cmngafhv100032a6iu7st4mm8', 'cmngaj1zf00072a6itpsrp8ah', 'WORKSPACE_ADMIN', '2024-06-01 12:00:00');

/* Membership from James */

INSERT INTO "memberships" (id, user_id, workspace_id, workspace_role, updated_at) VALUES
('cmngapxl8000j2a6i6i1i3grd', 'cmngafkfw00092a6it9xer5qm', 'cmngal4g8000b2a6iwthrdnnn', 'WORKSPACE_ADMIN', '2024-06-01 12:00:00');

/* Membership from Jane */

INSERT INTO "memberships" (id, user_id, workspace_id, workspace_role, updated_at) VALUES
('cmnkeqse400092a6imxklf373', 'cmnkeq3j800052a6imq245cr2', 'cmngaj1zf00072a6itpsrp8ah', 'WORKSPACE_USER', '2024-06-01 12:00:00');

INSERT INTO "memberships" (id, user_id, workspace_id, workspace_role, updated_at) VALUES
('cmnkerkbn000d2a6iu4548iqj', 'cmnkeq3j800052a6imq245cr2', 'cmngal4g8000b2a6iwthrdnnn', 'WORKSPACE_USER', '2024-06-01 12:00:00');