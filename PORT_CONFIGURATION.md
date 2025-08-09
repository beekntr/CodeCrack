# CodeCrack Port Configuration

## Production Ports (to avoid conflicts with existing deployments):
- **API Server**: 3002 (instead of default 3000)
- **MongoDB**: 27018 (instead of default 27017)  
- **Redis**: 6380 (instead of default 6379)

## Development Ports:
- **Vite Dev Server**: 8080
- **API Server**: 3000
- **MongoDB**: 27017
- **Redis**: 6379

## Existing Server Deployment:
Your existing deployment is using ports 3000 and 3001, so this CodeCrack deployment will use port 3002 to avoid conflicts.

## Nginx Configuration:
The Nginx configuration will proxy requests from your domain to the CodeCrack API running on port 3002.
