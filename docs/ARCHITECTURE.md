# Air Quality Monitoring Dashboard - Architecture Guide

## Project Overview

This is a production-ready Next.js frontend for an Air Quality Monitoring Service. It provides real-time sensor data visualization, health alerts, and user classification-based thresholds.

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (redirects to dashboard)
│   ├── dashboard/
│   │   └── page.tsx             # Main dashboard page
│   └── globals.css              # Global styles
│
├── components/                   # Reusable React components
│   ├── AirQualityHero.tsx       # Hero display of current AQI
│   ├── AlertsFeed.tsx           # System alerts feed
│   ├── ClassificationTabs.tsx   # User classification selector
│   ├── ConnectionBadge.tsx      # Socket connection status indicator
│   ├── HealthAlertCard.tsx      # Individual health alert display
│   ├── MetricCard.tsx           # Metric value display card
│   ├── SystemStatusDrawer.tsx   # System status side panel
│   └── index.ts                 # Component exports
│
├── config/
│   └── api.ts                   # API endpoints and Socket.IO events
│
├── context/
│   └── DashboardContext.tsx     # Global state with React Context
│
├── lib/
│   └── utils.ts                 # Utility functions and helpers
│
├── services/
│   ├── apiService.ts            # HTTP API client layer
│   └── socketService.ts         # Socket.IO real-time layer
│
└── types/
    └── index.ts                 # TypeScript type definitions
```

## Component Architecture

### Pages

#### `app/dashboard/page.tsx`
- Main dashboard page component
- Orchestrates all features and state
- Manages Socket.IO connections and event listeners
- Loads initial data and handles real-time updates
- Responsive grid layout for all sections

### Components

#### `ConnectionBadge`
- **Purpose**: Display socket connection status
- **Props**: `connected`, `className`
- **Output**: Animated dot indicator with status text

#### `ClassificationTabs`
- **Purpose**: Switch between user classifications
- **Props**: `classifications`, `selected`, `onSelect`
- **Output**: Tab buttons for different user types

#### `AirQualityHero`
- **Purpose**: Hero section with current AQI status
- **Props**: `aqi`, `pm25`, `lastUpdated`
- **Features**: Color-coded severity, background effects, time display

#### `MetricCard`
- **Purpose**: Display individual sensor metrics
- **Props**: `label`, `value`, `unit`, `threshold`, `type`, `trend`, `icon`
- **Features**: Color-coded thresholds, trend indicators, optional sparklines

#### `HealthAlertCard`
- **Purpose**: Display individual health alerts
- **Props**: `alert`, `onAcknowledge`, `isLoading`
- **Features**: Severity levels, recommendations, health effects, actions

#### `AlertsFeed`
- **Purpose**: List of system alerts
- **Props**: `alerts`, `onAcknowledge`, `isLoading`, `maxItems`
- **Features**: Severity colors, time stamps, acknowledge functionality

#### `SystemStatusDrawer`
- **Purpose**: Side panel showing system health
- **Props**: `status`, `isOpen`, `onClose`
- **Features**: Database status, sensor connection, uptime display

## State Management

### DashboardContext
Centralized global state using React Context:

```typescript
interface DashboardContextType {
  // Data
  currentSensorData: SensorData | null
  healthAlerts: HealthAlert[]
  userClassification: UserClassification
  userProfile: UserProfile | null

  // State
  isConnected: boolean
  isLoading: boolean
  error: string | null

  // Actions (setters)
  setSensorData: (data: SensorData) => void
  setHealthAlerts: (alerts: ...) => void
  addHealthAlert: (alert: HealthAlert) => void
  // ... other setters
}
```

**Why Context?**
- Simple, no additional dependencies
- Perfect for dashboard-wide state
- Easy to access from any component with `useDashboard()` hook

## Service Layers

### API Service (`apiService.ts`)

Handles all HTTP requests:

```typescript
// Sensor data
getLatestSensorData()
getSensorHistory(limit, skip)
getStatistics(hours)

// Alerts
getAlerts(limit, unacknowledged)
acknowledgeAlert(id)

// Health alerts
getHealthAlerts(classification, limit, level, unacknowledged)
acknowledgeHealthAlert(id)
getHealthAlertStats(classification, hours)

// Classifications
getAvailableClassifications()
getClassificationThresholds(classification)

// Users
createUser(email, name, classification)
getUserByEmail(email)
updateUser(id, updates)
```

**Features:**
- Axios-based HTTP client
- Automatic error handling
- Request/response interceptors
- Type-safe responses

### Socket Service (`socketService.ts`)

Manages WebSocket real-time connections:

```typescript
// Connection
connect()          // Establish connection
disconnect()       // Close connection
isConnected()      // Check status

// Subscriptions
subscribeSensorUpdates()
subscribeAlerts()
subscribeHealthAlerts(classification)
unsubscribe()

// Requests
requestLatestSensorData()
requestSystemStatus()

// Listeners (callbacks)
onConnectionStatusChange(callback)
onSensorUpdate(callback)
onHealthAlert(callback)
onAlert(callback)
onSystemStatus(callback)
onError(callback)
```

**Features:**
- Automatic reconnection with backoff
- Multiple concurrent event listeners
- Cleanup unsubscribe functions
- Connection status tracking

## Data Flow

```
1. Page Mount
   ├─ Connect to Socket.IO
   ├─ Fetch initial sensor data (API)
   ├─ Fetch initial health alerts (API)
   ├─ Subscribe to real-time events (Socket)
   └─ Update context state

2. Real-time Updates
   ├─ Socket emits sensor-update
   ├─ Socket emits health_alert
   └─ Update context state immediately

3. User Actions
   ├─ User clicks acknowledge
   ├─ Call API to acknowledge
   ├─ Optimistically update UI
   └─ Verify with server

4. Classification Change
   ├─ User selects new classification
   ├─ Re-subscribe to health alerts
   ├─ Fetch new health alerts
   └─ Update context state
```

## Styling Strategy

### Tailwind CSS
- Utility-first approach
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Custom color palette in `tailwind.config.ts`
- Dark mode support configured

### Color System
```
Atmospheric Blue:  #123046
Clean Teal:        #1F8A8A
Soft Mint:         #BEE9E8
Warm Sand:         #F3E9D2
Alert Amber:       #F2A65A
Risk Red:          #D95D39
Safe Green:        #4CAF50
```

### Severity Indicators
```
SAFE    → Green background, green text
CAUTION → Amber background, amber text
WARNING → Orange background, orange text
DANGER  → Red background, red text
```

## Performance Optimizations

### Code Splitting
- Route-based splitting via Next.js
- Component lazy loading where beneficial

### State Updates
- Context batches updates efficiently
- Socket listeners use callbacks to avoid re-renders
- Memoized callbacks in DashboardContext

### API Calls
- Pagination support (limit, skip)
- Request debouncing on events
- Graceful fallback to mock data

## Error Handling

### API Errors
```
→ Log to console
→ Display in UI error banner
→ Fallback to mock data if available
→ Show user-friendly message
```

### Socket Errors
```
→ Log connection errors
→ Retry with exponential backoff
→ Show connection status badge
→ Attempt reconnection automatically
```

### Component Errors
```
→ Boundary not implemented (simple app)
→ Each component handles own errors
→ Errors logged to console
```

## Type Safety

All types defined in `src/types/index.ts`:

```typescript
SensorData, SensorReading
Alert, HealthAlert, AlertStats
UserClassification, ClassificationThreshold, ClassificationConfig
UserProfile
Statistics, SystemStatus
PaginatedResponse<T>, ApiResponse<T>
```

TypeScript strictMode enabled in `tsconfig.json` for full type safety.

## Extension Points

### Adding New Metrics
1. Add to `SensorData` type
2. Add to mock data generator
3. Add MetricCard to dashboard grid
4. Update backend API

### Adding New Alerts Types
1. Extend `Alert` or `HealthAlert` types
2. Update `apiService` to fetch new alerts
3. Create new Card component
4. Add to dashboard

### Adding New Classifications
1. Update `UserClassification` type
2. Add to utilities mapping objects
3. Backend will serve thresholds
4. UI updates automatically

## Testing Approach

### Manual Testing
- Use mock data when backend unavailable
- Test with different classifications
- Verify socket connection/reconnection
- Test alert acknowledgement flows

### Browser DevTools
- Network tab: Monitor API calls
- Console: Check for errors/warnings
- React DevTools: Inspect context state
- Application tab: Check localStorage

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with ES2020+ support

## Performance Targets

- First Contentful Paint: < 2s
- Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Real-time latency: < 500ms

## Security Considerations

- No sensitive data in localStorage
- CORS configured on backend
- Socket.IO authentication recommended
- Validate all user inputs
- Sanitize displayed data
