# Database Setup

1. Make sure MySQL service is running.
2. Open a terminal in the `server` directory.
3. Execute:

```bash
mysql -u root -p < db/schema.sql
```

4. Copy `.env.example` to `.env` and fill your database credentials.
5. Start backend:

```bash
npm run dev
```

6. Verify:

- `GET /api/health`
- `GET /api/health/db`
