# CarIT Audev — Workshop Management Frontend

React frontend for the CarIT Audev workshop management system.

## Tech Stack
- React 18
- React Router v6
- Axios (API calls)
- Lucide React (icons)
- date-fns

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Install & Run

```bash
npm install
npm start
```

The app will open at http://localhost:3000

### Build for Production
```bash
npm run build
```

## API Configuration

All API calls go through the gateway at `http://localhost:8080`.  
To change this, edit `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:8080'; // ← change here
```

## Service Endpoints

| Service       | Base Path                       |
|---------------|---------------------------------|
| Planning      | `/planning-service/plannings`   |
| Orders        | `/order-service/orders`         |
| Customers     | `/customer-service/customers`   |
| Cars          | `/car-service/cars`             |

## Pages

- `/` — Dashboard with stats and recent orders
- `/planning` — Calendar grid + time slot booking
- `/orders` — Order management (CRUD)
- `/customers` — Customer management (CRUD)
- `/cars` — Vehicle registry (CRUD)

## Notes

- All pages fall back to mock data if the API is unreachable
- The planning calendar highlights days with existing appointments
- Forms include validation and toast notifications
- The sidebar is collapsible
