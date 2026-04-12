# How to Start All Services

## Quick Start (4 Terminals)

### Terminal 1 - User Service (Port 8001)
```bash
cd user-service
php -S localhost:8001 -t public
```

### Terminal 2 - Content Service (Port 8002)
```bash
cd content-service
php -S localhost:8002 -t public
```

### Terminal 3 - Media Service (Port 8003)
```bash
cd media-service
php -S localhost:8003 -t public
```

### Terminal 4 - Frontend (Port 3000 or 3001)
```bash
cd mylocal-frontend
npm run dev
```

## Verify Services Are Running

Test each service:
```bash
# User Service
curl http://localhost:8001/api/users

# Content Service
curl http://localhost:8002/api/places

# Media Service
curl http://localhost:8003/api/photos
```

## Troubleshooting

### Port Already in Use
If a port is already in use, you can:
1. Kill the process using that port
2. Or change the port in the startup command

### Connection Refused Error
- Make sure the backend service is running
- Check the port number matches
- Verify the service started without errors

### CORS Errors
The CORS configuration allows `localhost` on any port, so port 3001 should work fine.

