# Backend Integration Guide

## API Endpoints Expected

The dashboard expects these endpoints on your backend API (default: `http://localhost:3001`).

### Sensor Data Endpoints

#### `GET /api/data`
Get the latest sensor reading.

**Response:**
```json
{
  "id": "sensor_1",
  "timestamp": "2024-04-13T10:30:00Z",
  "pm25": 45.2,
  "aqi": 78,
  "mq135_ppm": 350,
  "correctedPPM": 280,
  "aci": 65.5,
  "uaqs": 72.3,
  "cri": 58.9,
  "temperature": 22.5,
  "humidity": 45.0,
  "lastUpdated": "2024-04-13T10:30:00Z"
}
```

#### `GET /api/history?limit=100&skip=0`
Get historical sensor data for charts.

**Response:**
```json
{
  "data": [...sensor readings...],
  "total": 1440,
  "limit": 100,
  "skip": 0
}
```

#### `GET /api/statistics?hours=24`
Get summary statistics for the specified time range.

**Response:**
```json
{
  "timestamp": "2024-04-13T10:30:00Z",
  "averageAQI": 65.4,
  "maxPM25": 120.5,
  "minPM25": 15.3,
  "averageTemperature": 21.8,
  "averageHumidity": 48.2,
  "alertCount": 12,
  "healthAlertCount": 5
}
```

### Alert Endpoints

#### `GET /api/alerts?limit=50&unacknowledged=false`
Get system alerts.

**Query Parameters:**
- `limit`: Max results (default: 50)
- `unacknowledged`: Filter unacknowledged only (boolean)

**Response:**
```json
{
  "data": [
    {
      "id": "alert_1",
      "timestamp": "2024-04-13T10:25:00Z",
      "metric": "PM2.5",
      "value": 120.5,
      "threshold": 50,
      "severity": "DANGER",
      "message": "PM2.5 level critically high",
      "acknowledged": false
    }
  ],
  "total": 12,
  "limit": 50,
  "skip": 0
}
```

#### `POST /api/alerts/:id/acknowledge`
Mark an alert as acknowledged.

**Response:** Updated alert object with `acknowledged: true` and `acknowledgedAt: timestamp`.

### Health Alert Endpoints

#### `GET /api/health-alerts?classification=adults&limit=50`
Get health alerts for a user classification.

**Query Parameters:**
- `classification`: `adults`, `children`, `elderly`, `asthma_patient`
- `limit`: Max results (default: 50)
- `level`: Optional filter (SAFE, CAUTION, WARNING, DANGER)
- `unacknowledged`: Filter unacknowledged only (boolean)

**Response:**
```json
{
  "data": [
    {
      "id": "health_alert_1",
      "classification": "adults",
      "timestamp": "2024-04-13T10:20:00Z",
      "level": "WARNING",
      "metric": "AQI",
      "value": 95,
      "threshold": 100,
      "message": "Air quality is unhealthy for sensitive groups",
      "recommendation": "Consider limiting outdoor activities",
      "healthEffects": [
        "Breathing difficulties",
        "Reduced lung function"
      ],
      "acknowledged": false
    }
  ],
  "total": 5,
  "limit": 50,
  "skip": 0
}
```

#### `POST /api/health-alerts/:id/acknowledge`
Mark a health alert as acknowledged.

**Response:** Updated health alert with `acknowledged: true` and `acknowledgedAt: timestamp`.

#### `GET /api/health-alerts/stats/:classification?hours=24`
Get statistics for health alerts of a classification.

**Response:**
```json
{
  "totalAlerts": 15,
  "byLevel": {
    "SAFE": 3,
    "CAUTION": 6,
    "WARNING": 4,
    "DANGER": 2
  },
  "acknowledgedCount": 10,
  "averageAcknowledgementTime": 1200000
}
```

### Classification Endpoints

#### `GET /api/users/classifications/available`
Get all available user classifications.

**Response:**
```json
[
  {
    "classification": "adults",
    "displayName": "Adults",
    "description": "Standard thresholds for healthy adults",
    "thresholds": [
      {
        "metric": "AQI",
        "safe": 50,
        "caution": 100,
        "warning": 150,
        "danger": 200
      }
    ]
  },
  ...
]
```

#### `GET /api/users/thresholds/:classification`
Get specific thresholds for a classification.

**Response:**
```json
{
  "classification": "asthma_patient",
  "thresholds": [
    {
      "metric": "AQI",
      "safe": 35,
      "caution": 70,
      "warning": 100,
      "danger": 150
    },
    {
      "metric": "PM2.5",
      "safe": 12,
      "caution": 25,
      "warning": 50,
      "danger": 100
    }
  ]
}
```

### User Endpoints

#### `POST /api/users`
Create a new user profile.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "classification": "adults"
}
```

**Response:**
```json
{
  "id": "user_1",
  "email": "user@example.com",
  "name": "John Doe",
  "classification": "adults",
  "createdAt": "2024-04-13T10:00:00Z",
  "updatedAt": "2024-04-13T10:00:00Z"
}
```

#### `GET /api/users/email/:email`
Get user by email address.

**Response:** User profile object or 404 if not found.

#### `PUT /api/users/:id`
Update user profile.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "classification": "children"
}
```

**Response:** Updated user object.

## Socket.IO Events

### Connection Flow

1. **Client connects** → Server emits `connection-confirmation`
2. **Client subscribes** → Server emits `subscription-confirmed`
3. **Server updates** → Server emits `sensor-update`, `health_alert`, etc.
4. **Client disconnects** → Auto-reconnect with backoff

### Client Emits

#### `subscribe-sensor-updates`
Subscribe to real-time sensor updates.
```javascript
socket.emit('subscribe-sensor-updates')
```

#### `subscribe-alerts`
Subscribe to system alert events.
```javascript
socket.emit('subscribe-alerts')
```

#### `subscribe-health-alerts`
Subscribe to health alerts for a classification.
```javascript
socket.emit('subscribe-health-alerts', {
  classification: 'adults'
})
```

#### `unsubscribe`
Unsubscribe from all events.
```javascript
socket.emit('unsubscribe')
```

#### `request-latest-sensor-data`
Request current sensor data via socket.
```javascript
socket.emit('request-latest-sensor-data')
```

#### `request-system-status`
Request system status (connections, uptime, etc).
```javascript
socket.emit('request-system-status')
```

### Server Emits

#### `connection-confirmation`
Sent when connection is established.
```json
{
  "status": "connected",
  "socketId": "abc123"
}
```

#### `subscription-confirmed`
Sent when subscription is confirmed.
```json
{
  "event": "sensor-updates",
  "status": "confirmed"
}
```

#### `sensor-update`
Real-time sensor data update.
```json
{
  "id": "sensor_1",
  "timestamp": "2024-04-13T10:30:00Z",
  "pm25": 45.2,
  "aqi": 78,
  ...
}
```

#### `alert-triggered`
New system alert.
```json
{
  "id": "alert_1",
  "timestamp": "2024-04-13T10:25:00Z",
  "metric": "PM2.5",
  "severity": "DANGER",
  "message": "PM2.5 level critically high",
  ...
}
```

#### `health_alert`
**Important:** Event name is `health_alert` (not `health-alert`).
```json
{
  "id": "health_alert_1",
  "classification": "adults",
  "level": "WARNING",
  "metric": "AQI",
  "message": "Air quality is unhealthy",
  ...
}
```

#### `system-status`
System health and status information.
```json
{
  "connected": true,
  "database": "connected",
  "sensorConnection": "connected",
  "uptime": 3600000,
  "lastUpdate": "2024-04-13T10:30:00Z"
}
```

#### `error`
Error event with details.
```json
{
  "message": "Failed to connect to database"
}
```

## Environment Configuration

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Backend Requirements

### Node.js API
- Express (or similar) for REST endpoints
- Socket.IO for WebSocket support
- CORS enabled for frontend origin
- Database with sensor and alert data

### Minimal Server Example

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// REST endpoints
app.get('/api/data', (req, res) => {
  res.json({
    id: 'sensor_1',
    timestamp: new Date().toISOString(),
    pm25: Math.random() * 100,
    aqi: Math.random() * 200,
    mq135_ppm: Math.random() * 800,
    correctedPPM: Math.random() * 600,
    aci: Math.random() * 100,
    uaqs: Math.random() * 100,
    cri: Math.random() * 100,
    temperature: 15 + Math.random() * 15,
    humidity: 30 + Math.random() * 40,
    lastUpdated: new Date().toISOString()
  });
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('connection-confirmation', { status: 'connected' });

  socket.on('subscribe-sensor-updates', () => {
    socket.emit('subscription-confirmed', { event: 'sensor-updates' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

## Testing the Integration

### 1. Start Backend
```bash
node server.js
```

### 2. Start Frontend Dev Server
```bash
npm run dev
```

### 3. Check Browser Console
- Should show "Socket connected"
- No 404 errors for API calls
- See sensor data loading

### 4. Test Socket Connection
Open browser DevTools → Network → WS tab to see WebSocket activity.

### 5. Test Subscriptions
Check Socket.IO server logs for:
```
Client subscribed to: sensor-updates
Client subscribed to: health-alerts
```

## Debugging

### API Issues
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS is enabled on backend
- Check Network tab for 404/500 errors
- Review backend logs

### Socket Issues
- Check `NEXT_PUBLIC_SOCKET_URL` matches API_URL
- Verify Socket.IO is enabled
- Check WS tab in DevTools
- Look for connection timeout errors

### Data Issues
- Verify backend is returning correct schema
- Check timestamp formats (ISO 8601)
- Ensure numeric values are numbers, not strings
- Verify classification values match enum

## Production Deployment

### Frontend
```bash
npm run build
npm start
# or deploy to Vercel/Netlify
```

### Backend
- Set proper environment variables
- Configure CORS for production domain
- Use secure WebSocket (WSS)
- Implement authentication/authorization
- Add rate limiting

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```
