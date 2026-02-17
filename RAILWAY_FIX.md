# Railway Deployment Fix Guide

## Issue Diagnosis

The error "Connection url is empty" means Railway cannot find the `DATABASE_URL` environment variable. This guide will help you fix it.

## Solution Steps

### Step 1: Check Railway Environment Variables

1. Go to your Railway project dashboard
2. Click on your **server** service
3. Go to the **Variables** tab
4. Check if `DATABASE_URL` is set

### Step 2: Configure DATABASE_URL

Railway PostgreSQL provides the database URL in a specific format. You need to:

#### Option A: Using Railway PostgreSQL (Recommended)

If you provisioned a PostgreSQL database in Railway:

1. Click on your **PostgreSQL** service card in Railway
2. Go to the **Variables** tab
3. You'll see several variables like:
   - `DATABASE_URL`
   - `POSTGRES_URL`  
   - `DATABASE_PRIVATE_URL`
   - `DATABASE_PUBLIC_URL`

4. **Copy the value of one of these URLs** (preferably `DATABASE_PRIVATE_URL` for internal connections)

5. Go back to your **server** service -> **Variables** tab
6. Add a new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the URL you copied (it should look like: `postgresql://postgres:password@host:port/railway`)

7. Click **Add** and **redeploy**

#### Option B: Using External PostgreSQL

If using an external database:

1. Go to your **server** service -> **Variables** tab
2. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://username:password@host:port/database?schema=public`

### Step 3: Set Other Required Variables

Make sure these are also set in your server service:

```
JWT_SECRET=your-random-secret-key-here
PORT=8000
NODE_ENV=production
```

To generate a secure JWT_SECRET, run:
```bash
openssl rand -hex 32
```

### Step 4: Check the Diagnostic Output

After deployment, check the Railway logs. You should see:

```
=== Environment Variable Check ===
DATABASE_URL exists: true
DATABASE_URL value: postgresql://postgres:password...
```

If it shows `DATABASE_URL exists: false`, the variable is not set correctly in Railway.

## Common Issues

### Issue 1: Wrong Variable Name

Railway might provide the database URL as:
- `POSTGRES_URL` instead of `DATABASE_URL`
- `DATABASE_PRIVATE_URL`
- `DATABASE_PUBLIC_URL`

**Fix**: Either:
1. Rename the reference in your code (not recommended)
2. **OR** manually create a `DATABASE_URL` variable pointing to the right URL (recommended)

### Issue 2: Variable Not Set on Service

The DATABASE_URL must be set on the **server service**, not just on the PostgreSQL service.

**Fix**: 
1. Go to server service -> Variables
2. Manually add `DATABASE_URL` with the PostgreSQL connection string

### Issue 3: Railway Service Connection

If you want Railway to automatically inject the database URL:

1. Go to server service -> Settings
2. Look for "Service Variables" or "Connect"
3. Link/connect your PostgreSQL service to your server service
4. This should automatically expose the database connection variables

## Verification

After fixing, your deployment logs should show:

```
=== Environment Variable Check ===
DATABASE_URL exists: true
DATABASE_URL value: postgresql://postgres:xxxxx...

All DATABASE-related env vars:
  DATABASE_URL: postgresql://postgres:xxxxx...
=== End Check ===

Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database

X migrations found in prisma/migrations
...
✅ Migrations applied successfully
```

## Removing the Diagnostic Check (Optional)

Once everything works, you can remove the diagnostic check:

1. Edit `package.json`
2. Change `start:prod` from:
   ```json
   "start:prod": "node check-env.js && npx prisma migrate deploy && node dist/main"
   ```
   To:
   ```json
   "start:prod": "npx prisma migrate deploy && node dist/main"
   ```

3. Delete `check-env.js` (optional)

## Still Having Issues?

If the problem persists, share the output of the environment check from your Railway logs.
