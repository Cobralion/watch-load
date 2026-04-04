# TODO
- [ ] use next-safe-actions for auth actions

# Node
*Version 24.11.0*

# Prisma migrations
`pnpx prisma migrate dev`
`pnpx prisma generate`

# ENV FILE (watch-load)
- DATABASE_URL
- NEXTAUTH_URL -> set in production to url ??
- AUTH_SECRET -> menditory for auth.js
- ENCRYPTION_KEY must be 32 characters long for AES-256 encryption
- JWT_APP_ISSUER=watch-load
- JWT_APP_AUDIENCE=watch-load
- JWT_SECRET
- WITHINGS_CLIENT_ID
- WITHINGS_CLIENT_SECRET
- WITHINGS_REDIRECT_URI=http://localhost:3000/api/withings/callback

# Test Passwords
- admin:Admin!123
- user:User!123
- user2:User!123
- test:User!123
