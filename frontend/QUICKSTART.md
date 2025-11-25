# AscendoreCRM Frontend - Quick Start Guide

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Backend API running at http://localhost:3001
- [ ] Database set up and migrated

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd C:\Users\AndrewSmart\Claude_Projects\AscendoreCRM\frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React & React DOM
- React Router
- Axios (API client)
- Tailwind CSS
- TypeScript
- Vite
- Lucide React (icons)

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
copy .env.example .env
```

The `.env` file should contain:
```
VITE_API_URL=http://localhost:3001
```

### 4. Start the Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Open in Browser

Navigate to: **http://localhost:5173**

## First Login

Use the dev credentials:
- **Email**: `dev@ascendore.ai`
- **Password**: `DevPassword123!`

## Verify Everything Works

### Test Checklist

1. [ ] Login page loads correctly
2. [ ] Can log in with dev credentials
3. [ ] Dashboard displays (even if empty)
4. [ ] Sidebar navigation works
5. [ ] Can navigate to Contacts page
6. [ ] Can open Chat interface
7. [ ] Floating chat button appears
8. [ ] Can type and send messages in chat

## Common Issues & Solutions

### Issue: Port 5173 already in use

**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Issue: Cannot connect to backend API

**Symptoms:** Login fails, 404 errors in console

**Solution:**
1. Check backend is running: http://localhost:3001
2. Verify CORS is enabled in backend
3. Check `.env` file has correct `VITE_API_URL`

### Issue: Module not found errors

**Solution:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Rebuild if needed
npm run build
```

## Project Structure Overview

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/         # Login, Register, ProtectedRoute
│   │   ├── chat/         # ChatInterface, FloatingChat
│   │   ├── crm/          # DashboardStats, ContactList, DealsPipeline
│   │   ├── layout/       # Sidebar, Header, MainLayout
│   │   └── ui/           # Button, Card, Input, etc.
│   ├── pages/            # LoginPage, DashboardPage, ContactsPage
│   ├── services/         # API client, auth service
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   └── App.tsx           # Main app with routing
└── package.json
```

## Available Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Main dashboard (default)
- `/contacts` - Contacts list
- `/companies` - Companies (coming soon)
- `/deals` - Deals pipeline (coming soon)
- `/activities` - Activities (coming soon)
- `/chat` - Full-screen chat interface
- `/settings` - Settings (coming soon)

## Development Workflow

### Making Changes

1. Edit files in `src/`
2. Save - Vite will hot-reload automatically
3. Check browser for changes
4. Check console for errors

### Adding New Components

```tsx
// src/components/example/MyComponent.tsx
import { Card } from '@/components/ui/card'

export function MyComponent() {
  return <Card>Hello World</Card>
}
```

### Adding New Pages

```tsx
// src/pages/MyPage.tsx
export function MyPage() {
  return <div>My Page</div>
}

// Then add route in src/App.tsx
<Route path="mypage" element={<MyPage />} />
```

## Testing the Chat Interface

Try these commands in the chat:

1. "Show me all contacts"
2. "Create a new company called Test Corp"
3. "Find deals over $50000"
4. "Show recent activities"
5. "What deals are in the pipeline?"

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Build output will be in `dist/` directory.

## Next Steps

1. Explore the Dashboard
2. Try adding a contact via chat
3. Check out the Contacts page
4. Test the floating chat feature
5. Customize the UI colors in `tailwind.config.js`
6. Add new features as needed

## Getting Help

- Check `README.md` for detailed documentation
- Review component files for implementation examples
- Check browser console for errors
- Review network tab for API issues

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API base URL |

## Build Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Backend Requirements

The frontend expects these backend endpoints:

**Auth:**
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/register`
- GET `/api/v1/auth/me`

**CRM:**
- GET `/api/v1/a-crm/contacts`
- GET `/api/v1/a-crm/companies`
- GET `/api/v1/a-crm/deals`
- GET `/api/v1/a-crm/activities`
- GET `/api/v1/a-crm/dashboard/metrics`
- POST `/api/v1/a-crm/chat`

All CRM endpoints require JWT token in `Authorization: Bearer <token>` header.

## Success Criteria

You've successfully set up the frontend when:

- [x] Application runs without errors
- [x] You can log in
- [x] Dashboard displays
- [x] Navigation works
- [x] Chat interface is functional
- [x] API calls succeed

Happy coding!
