# Deployment Guide — RoamNest (Wanderlust)

> Production deployment instructions for the full-stack MERN application.

---

## Architecture Overview (Production)

```
Browser ? Vite Build (static) ? Express serves client/dist/
                                    |
                              API routes (/api/*)
                                    |
                              MongoDB Atlas
```

In production, the Node.js Express server both serves the React SPA (from `client/dist`) and handles all API routes. No separate dev server needed.

---

## Option 1: Render (Recommended)

### Backend (Web Service)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| Build Command | `npm install && npm run build --prefix client` |
| Start Command | `npm start` |
| Node Version | 18.17.1 or later |

4. Add environment variables (see [Environment Variables](#environment-variables) below)

### Environment Variables

Add these in Render Dashboard > Environment:

```env
NODE_ENV=production
PORT=10000

ATLASDB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/roamnest

SECRET=<random-64-char-hex>
JWT_SECRET=<random-64-char-hex> (optional)

CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUD_API_KEY=<your-cloudinary-api-key>
CLOUD_API_SECRET=<your-cloudinary-api-secret>

MAP_TOKEN=pk.<your-mapbox-token>

VITE_MAPBOX_TOKEN=pk.<your-mapbox-token>
```

> **Important:** The backend serves the built client files, so `VITE_MAPBOX_TOKEN` must also be set on the backend environment so Vite can inject it at build time.

---

## Option 2: Railway

1. Create a new **Project** on Railway
2. Connect your GitHub repository
3. Add a **Service** ? **Deploy from repo**
4. Set build/start commands and env vars (same as Render above)
5. A `railway.json` can be added for config-as-code:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build --prefix client"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## Option 3: Traditional VPS (DigitalOcean, Linode, AWS EC2)

### 1. Server Setup

```bash
ssh root@your-server

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Install PM2 (process manager)
npm install -g pm2
```

### 2. Deploy Application

```bash
git clone <repo-url> /opt/wanderlust
cd /opt/wanderlust

# Install dependencies
npm install --production
npm install --prefix client
npm run build --prefix client

# Create .env file
nano .env
# Paste all environment variables

# Start with PM2
pm2 start app.js --name wanderlust
pm2 save
pm2 startup
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable HTTPS with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Environment Variables Reference

| Variable | Required | Where Used | Notes |
|---|---|---|---|
| NODE_ENV | Yes | app.js, cloudConfig.js | Set to "production" |
| PORT | No | app.js | Defaults to 8080 |
| ATLASDB_URL | Yes | app.js, init/index.js | MongoDB Atlas connection string |
| SECRET | Yes* | utils/jwt.js | 64+ char hex string |
| JWT_SECRET | No | utils/jwt.js | Falls back to SECRET |
| CLOUD_NAME | Yes | cloudConfig.js | From Cloudinary dashboard |
| CLOUD_API_KEY | Yes | cloudConfig.js | From Cloudinary dashboard |
| CLOUD_API_SECRET | Yes | cloudConfig.js | From Cloudinary dashboard |
| MAP_TOKEN | Yes | controllers/listing.js | Mapbox public token |
| VITE_MAPBOX_TOKEN | Yes | client MapboxMap.jsx | Same Mapbox token, needed at build time |
| AI_PROVIDER | No | services/aiProvider.js | Defaults to "mock" |

*Only one of SECRET/JWT_SECRET required.

---

## Build Process

```bash
# From project root
npm install
cd client && npm install && npm run build && cd ..
```

The build outputs to `client/dist/`. Express serves it via `app.use(express.static(path.join(__dirname, "client", "dist")))`.

Any route not matching `/api/*` falls through to `client/dist/index.html` for SPA client-side routing.

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SECRET` (use `openssl rand -hex 32`)
- [ ] MongoDB Atlas IP whitelist includes deployment IP (or use 0.0.0.0/0 with strong user/pass)
- [ ] Cookie `secure: true` will activate automatically in production (check `utils/jwt.js`)
- [ ] Cloudinary upload preset configured (or relies on API key)
- [ ] `VITE_MAPBOX_TOKEN` set in backend environment for build step
- [ ] CORS not needed since Express serves the same origin

---

## Health Check

```
GET /api/listings?limit=1

Expected: 200 with { listings: [...], total: ..., page: 1, pages: ... }
```

The root `/` route serves the React SPA. If the page loads, both frontend and backend are working.

---

## Monitoring

- **Render/Railway:** Built-in logs and metrics dashboards
- **PM2:** `pm2 logs wanderlust`, `pm2 monit`
- **Uptime:** Consider UptimeRobot or similar for external monitoring
