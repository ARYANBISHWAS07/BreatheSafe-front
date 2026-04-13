# Deployment Guide

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone or navigate to project
cd /home/kali/Desktop/ai-front

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` (or the assigned port if 3000 is in use).

### Building

```bash
npm run build
npm start
```

## Production Deployment

### Vercel (Recommended)

1. **Push to Git**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Framework: Next.js (auto-detected)
   - Build settings: Default
   - Environment variables:
     - `NEXT_PUBLIC_API_URL=https://your-api.com`
     - `NEXT_PUBLIC_SOCKET_URL=https://your-api.com`

3. **Deploy**
   - Click "Deploy"
   - Updates auto-deploy on git push

### Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public
COPY .env.local ./

EXPOSE 3000

CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
      NEXT_PUBLIC_SOCKET_URL: http://backend:3001
    depends_on:
      - backend

  backend:
    image: your-backend:latest
    ports:
      - "3001:3001"
```

Build and run:
```bash
# Build
docker build -t air-quality-dashboard .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -e NEXT_PUBLIC_SOCKET_URL=http://localhost:3001 \
  air-quality-dashboard

# Or with docker-compose
docker-compose up
```

### AWS (with S3 + CloudFront)

1. **Build for static export** (if not using Node.js backend)
   - Update `next.config.js`:
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... other config
   };
   module.exports = nextConfig;
   ```

2. **Build**
```bash
npm run build
```

3. **Upload to S3**
```bash
aws s3 sync out/ s3://your-bucket-name/
```

4. **Configure CloudFront**
   - Create distribution pointing to S3
   - Set root object to `index.html`
   - Enable HTTPS
   - Configure environment variables in build

### Netlify

1. **Connect repository**
   - Go to https://app.netlify.com/signup
   - Connect your git repository
   - GitHub/GitLab/Bitbucket

2. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment variables**
   - Dashboard → Site settings → Build & deploy
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL=https://your-api.com`
     - `NEXT_PUBLIC_SOCKET_URL=https://your-api.com`

4. **Deploy**
   - Auto-deploys on git push
   - View at `https://your-site.netlify.app`

### Self-Hosted (VPS/EC2)

1. **Prepare server**
```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-repo.git
cd your-repo

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit with your production values
nano .env.local
```

2. **Build**
```bash
npm run build
```

3. **Use PM2 for process management**
```bash
# Install PM2 globally
npm install -g pm2

# Start app
pm2 start npm --name "air-quality-dashboard" -- start

# Save PM2 config
pm2 save

# Setup auto-start on reboot
pm2 startup
```

4. **Setup reverse proxy (Nginx)**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable HTTPS (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Required
```env
NEXT_PUBLIC_API_URL=http://api.example.com
NEXT_PUBLIC_SOCKET_URL=http://api.example.com
```

### Optional (for future enhancements)
```env
NEXT_PUBLIC_APP_NAME=Air Quality Dashboard
NEXT_PUBLIC_LOG_LEVEL=info
NODE_ENV=production
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -D @next/bundle-analyzer

# Build with analysis
ANALYZE=true npm run build
```

### Next.js Optimizations
- Image optimization (use `next/image`)
- Font optimization (already configured)
- Code splitting (automatic per route)
- CSS minification (automatic)
- JavaScript minification (automatic)

### CDN Caching
```
/                    → Cache busting
/_next/static/*      → Long-term cache (1 year)
/api/*               → No cache
/public/*            → Cache as needed
```

## Monitoring & Logging

### Sentry (Error tracking)

1. Install
```bash
npm install @sentry/react @sentry/nextjs
```

2. Configure in `instrumentation.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

export function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}
```

3. Add environment variable
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

### Health Check Endpoint

Backend should provide:
```bash
GET /api/health
→ { "status": "ok", "timestamp": "2024-04-13T10:30:00Z" }
```

### Server Logs
- Check PM2 logs: `pm2 logs air-quality-dashboard`
- Check Nginx logs: `/var/log/nginx/access.log`
- System logs: `journalctl -u pm2-root`

## Backup & Recovery

### Database Backups
- Regular backups of sensor data
- Point-in-time recovery capability
- Automated backup rotation

### Configuration Backups
- .env.local → Secure storage (1Password, Vault)
- SSL certificates → Auto-renewal with Certbot
- Docker images → Registry backup

### Disaster Recovery
1. Restore from latest backup
2. Update environment variables
3. Restart services
4. Verify API connectivity

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] Regular dependency updates (`npm audit`)
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Regular backups automated
- [ ] Monitoring/alerts configured

## Troubleshooting

### High CPU Usage
```bash
# Check process
ps aux | grep node

# Check with PM2
pm2 monit

# Increase memory
pm2 start npm --name "app" -- start --max-old-space-size=4096
```

### Out of Memory
```bash
# Check memory usage
free -h

# Increase Node heap
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Slow Socket Connection
- Check network latency
- Verify backend is responding
- Review Socket.IO settings
- Consider connection pooling

### API 404 Errors
- Verify backend is running
- Check NEXT_PUBLIC_API_URL
- Verify CORS headers
- Check backend route definitions

## Rollback Procedure

### Vercel
- Dashboard → Deployments → Select previous
- Click "Redeploy"

### Docker
```bash
# List images
docker images

# Revert to previous
docker run -d previous-image-id
```

### Self-Hosted
```bash
# List PM2 processes
pm2 list

# Restart from previous build
pm2 delete air-quality-dashboard
# Restore previous .next directory
npm start
```

## Scaling

### Horizontal Scaling
- Deploy multiple instances
- Load balance with Nginx/HAProxy
- Use session sticky routing for Socket.IO

### Vertical Scaling
- Increase CPU/RAM on instance
- Optimize Node.js heap size
- Monitor resource usage

### Database Scaling
- Read replicas for analytics
- Caching layer (Redis)
- Archive old sensor data
