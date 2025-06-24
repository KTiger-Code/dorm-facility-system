# Dorm Facility System Backend

This repository contains the backend and frontend sources for a simple dormitory management system. The project relies on a MySQL database.

## Database Setup

The `database/schema.sql` file provides the complete SQL schema, including recent fields for water and electricity meter details in the `invoices` table. To initialise a fresh database, run the SQL file in your MySQL server:

```bash
mysql -u <user> -p <database> < database/schema.sql
```

After applying the schema, configure connection details via environment variables (see `backend/db.js`) and start the backend server:

```bash
cd backend
node server.js
```

