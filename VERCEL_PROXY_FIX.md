# 🔧 CRITICAL FIX: Vercel Proxy Configuration

## 🐛 The Problem with Previous Setup

When `NEXT_PUBLIC_API_URL` points directly to Railway (e.g., `https://your-app.railway.app`), the cookies are set on the Railway domain, but your frontend is on Vercel domain. This creates a **cross-origin cookie issue** where the browser rejects the cookies.

## ✅ The Solution: Use Vercel Rewrites (Proxy)

By using Vercel's proxy feature via `vercel.json`, all API requests go through `/api/*` on your Vercel domain, which then forwards them to Railway. This makes cookies work because:

1. Cookies are set on your Vercel domain (same-origin)
2. Vercel proxy forwards cookies to Railway backend
3. No cross-origin cookie issues!

---

## 📝 Changes Made

### 1. **[vercel.json](vercel.json)** - Added Proxy Configuration

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://twistlist-production.up.railway.app/:path*"
    }
  ]
}
```

**⚠️ IMPORTANT:** Replace `https://twistlist-production.up.railway.app` with your actual Railway backend URL!

### 2. **[client/src/lib/api.ts](client/src/lib/api.ts)** - Fixed API Base URL

```typescript
const API_BASE_URL = "/api"; // Always use proxy path
```

This ensures all requests go through Vercel's proxy.

---

## 🚀 Deployment Steps

### Step 1: Update vercel.json with Your Railway URL

Edit [vercel.json](vercel.json) line 8:

```json
"destination": "https://YOUR-RAILWAY-APP.railway.app/:path*"
```

Replace `YOUR-RAILWAY-APP` with your actual Railway domain.

### Step 2: Remove NEXT_PUBLIC_API_URL from Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. **DELETE** `NEXT_PUBLIC_API_URL` if it exists
5. Make sure **NO API URL** environment variables are set

### Step 3: Deploy to Vercel

```bash
cd /home/zayan/Documents/TwistList/client
git add .
git commit -m "fix: use Vercel proxy for Railway backend"
git push origin main
```

Vercel will automatically redeploy.

---

## 🧪 Testing After Deployment

1. **Open your Vercel app**: `https://twist-list.vercel.app`

2. **Open DevTools** (F12) → **Network** tab

3. **Try to login**

4. **Check the request**:
   - Request URL should be: `https://twist-list.vercel.app/api/auth/signin`
   - NOT: `https://your-railway-app.railway.app/auth/signin`

5. **Check cookies**:
   - Go to **Application** → **Cookies** → `https://twist-list.vercel.app`
   - You should see `auth_token` cookie

6. **Try accessing dashboard**:
   - Navigate to `/dashboard`
   - Should work without redirecting to login

---

## 🔍 How to Verify It's Working

### ✅ Correct Behavior (With Proxy)

```
Frontend: https://twist-list.vercel.app/dashboard
API Request: https://twist-list.vercel.app/api/tasks  👈 Same domain!
Cookie Domain: twist-list.vercel.app
Backend: (Vercel proxies to Railway behind the scenes)
```

### ❌ Incorrect Behavior (Direct to Railway)

```
Frontend: https://twist-list.vercel.app/dashboard
API Request: https://your-railway-app.railway.app/tasks  👈 Different domain!
Cookie Domain: your-railway-app.railway.app
Browser: ❌ Blocks cross-origin cookies
```

---

## 🛠️ Local Development

For local development, the proxy still works via [next.config.ts](next.config.ts):

```bash
cd client
pnpm run dev
# Frontend: http://localhost:3001
# API calls to /api/* → proxied to http://localhost:3000
```

---

## 📋 Deployment Checklist

- [ ] Updated [vercel.json](vercel.json) with your Railway URL
- [ ] Removed `NEXT_PUBLIC_API_URL` from Vercel environment variables
- [ ] Committed and pushed changes to Git
- [ ] Vercel has redeployed (check deployment logs)
- [ ] Tested login → Cookie appears in DevTools
- [ ] Tested dashboard → No redirect to login
- [ ] Verified API requests go to `/api/*` path

---

## 🆘 Troubleshooting

### Issue: Still redirecting to login

**Solution:** Clear your browser cache and cookies, then try again in Incognito mode.

### Issue: API requests still go to Railway directly

**Solution:**

1. Check Vercel environment variables - make sure `NEXT_PUBLIC_API_URL` is deleted
2. Rebuild the app in Vercel
3. Hard refresh (Ctrl+Shift+R)

### Issue: 404 on /api/\* endpoints

**Solution:**

1. Verify `vercel.json` syntax is correct
2. Check Railway URL is accessible: `curl https://your-railway-app.railway.app/health`
3. Redeploy in Vercel

---

## 🎯 Expected Result

✅ **After this fix:**

- Login works
- Cookies are stored on Vercel domain
- Dashboard loads without redirect
- All protected routes work
- API requests go through Vercel proxy

---

**Last Updated:** February 18, 2026  
**Status:** ✅ Ready to deploy
