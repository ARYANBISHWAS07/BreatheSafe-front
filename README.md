# Air Quality Monitoring Dashboard

A modern, production-quality responsive frontend for an Air Quality Monitoring Service dashboard. This application connects to a Node.js backend with REST APIs and Socket.IO for real-time updates.

## Features

### Core Functionality
- **Real-time Dashboard**: Live sensor data with Socket.IO updates
- **Classification System**: Tailored thresholds and alerts for different user types (asthma patients, children, elderly, adults)
- **Health Alert Feed**: Prominent, actionable health alerts with acknowledge functionality
- **Alert History & Statistics**: Track and analyze air quality trends
- **User Profile Management**: Manage classification preferences
- **System Connection Status**: Monitor backend and socket health

### User Classifications
- **Asthma Patient**: Specialized thresholds for respiratory conditions
- **Children**: Lower thresholds for developing lungs
- **Elderly**: Sensitivities appropriate for older adults
- **Adults**: Standard thresholds for healthy adults

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard` in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
├── config/          # Configuration & constants
├── context/         # React Context for state management
├── lib/             # Utility functions
├── services/        # API & Socket.IO service layers
├── types/           # TypeScript type definitions
```

## Key Features

- **Mobile-first, responsive design** optimized for all devices
- **Real-time sensor updates** via Socket.IO WebSockets
- **Health-based classifications** with tailored thresholds
- **Visual severity indicators** for air quality levels
- **System status monitoring** showing connection health
- **Graceful error handling** with mock data fallback
- **Accessible UI** with semantic HTML and ARIA labels

## Backend Integration

The dashboard expects a Node.js backend with:

- REST API endpoints at `/api/*`
- Socket.IO server on same URL
- Support for WebSocket connections
- Real-time event emission for sensor updates and alerts

See the API contract in `src/config/api.ts` for all required endpoints and events.

## For More Information

- See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed component architecture
- Check [docs/API_INTEGRATION.md](./docs/API_INTEGRATION.md) for backend integration details
- Review [docs/STATE_MANAGEMENT.md](./docs/STATE_MANAGEMENT.md) for state management patterns

## License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
