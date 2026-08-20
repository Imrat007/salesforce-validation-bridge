# 🚢 Deployment Guide

Production deployment guide for Salesforce Validation Rules Bridge.

## 🎯 Pre-Deployment Checklist

- [ ] Node.js 18+ installed on production server
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Salesforce Connected App created for production
- [ ] Production database/session store ready (Redis recommended)
- [ ] Monitoring tools setup
- [ ] Backup strategy in place

## 🔧 Production Configuration

### 1. Environment Variables

Create `backend/.env` for production:

```env
# Salesforce OAuth
CLIENT_ID=your_production_connected_app_client_id
CLIENT_SECRET=your_production_connected_app_client_secret
REDIRECT_URI=https://yourdomain.com/oauth/callback

# Session
SESSION_SECRET=generate_a_very_long_and_secure_random_string

# Server
PORT=3000
NODE_ENV=production
APP_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Optional
TOOLING_API_VERSION=v59.0
```

### 2. Generate Secure Session Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Update Salesforce Connected App

1. Go to your production Salesforce org
2. Setup → Apps → App Manager
3. Edit your Connected App
4. Update **Callback URL** to: `https://yourdomain.com/oauth/callback`
5. Save changes

## 🏗️ Build Process

### Build Frontend

```bash
cd frontend
npm run build
```

This creates optimized production files in `frontend/dist/`

### Verify Build

```bash
cd frontend
npm run preview
```

## 🚀 Deployment Options

### Option 1: Traditional Server (Recommended)

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start backend/src/server.js --name "salesforce-validation-bridge"

# Save PM2 configuration
pm2 save

# Setup auto-restart on server reboot
pm2 startup
```

#### PM2 Configuration File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'salesforce-validation-bridge',
    script: './backend/src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install only production dependencies
RUN cd backend && npm ci --only=production

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - backend/.env
    restart: unless-stopped
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis-data:
```

#### Build and Run

```bash
docker-compose up -d
```

### Option 3: Cloud Platform (Heroku Example)

#### Procfile

```
web: node backend/src/server.js
```

#### Deploy

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set CLIENT_ID=your_client_id
heroku config:set CLIENT_SECRET=your_client_secret
heroku config:set REDIRECT_URI=https://your-app-name.herokuapp.com/oauth/callback
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## 🔒 Nginx Configuration

### Basic Configuration

Create `/etc/nginx/sites-available/salesforce-validation-bridge`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3000;
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

Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/salesforce-validation-bridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Production Session Store

### Redis Setup (Recommended)

Install Redis:
```bash
# Ubuntu/Debian
sudo apt install redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

Update `backend/src/server.js`:

```javascript
// Add Redis session store
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({
  host: 'localhost',
  port: 6379
});

redisClient.connect().catch(console.error);

sessionConfig.store = new RedisStore({ client: redisClient });
```

Install dependencies:
```bash
cd backend
npm install redis connect-redis
```

## 🔍 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs salesforce-validation-bridge

# Monitor processes
pm2 monit

# View status
pm2 status
```

### Health Checks

Setup monitoring for:
- `GET /health` - Application health
- Process uptime
- Memory usage
- CPU usage
- Response times

Recommended tools:
- Uptime Robot
- Pingdom
- New Relic
- Datadog

## 🔐 Security Hardening

### 1. Firewall Configuration

```bash
# Ubuntu/Debian with UFW
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

### 2. SSL/TLS Certificate

Using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 3. Environment Security

- Never commit `.env` files
- Rotate secrets regularly
- Use strong session secrets (64+ characters)
- Enable HTTPS only
- Configure secure cookies
- Implement rate limiting
- Keep dependencies updated

## 📈 Performance Optimization

### 1. Enable Clustering

Update PM2 config to use cluster mode:
```javascript
instances: 'max', // Or specific number
exec_mode: 'cluster'
```

### 2. Database Connection Pooling

If using PostgreSQL for sessions, configure connection pool.

### 3. CDN for Static Assets

Consider using CloudFlare or similar CDN for static assets.

### 4. Caching Strategy

Implement caching for frequently accessed data.

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/salesforce-validation-bridge
            git pull
            npm run install:all
            npm run build
            pm2 restart salesforce-validation-bridge
```

## 🆘 Troubleshooting

### Application won't start
- Check environment variables
- Verify port is available
- Check logs: `pm2 logs`

### SSL issues
- Verify certificate paths
- Check certificate expiration
- Test with SSL Labs

### High memory usage
- Increase server resources
- Implement connection pooling
- Review session store configuration

### Session issues
- Check Redis connection
- Verify session secret
- Review cookie settings

## 📞 Support

For deployment assistance:
- Documentation: See README.md
- Issues: GitHub Issues
- Email: support@yourorganization.com

---

✅ **Remember**: Always test deployment in a staging environment first!
