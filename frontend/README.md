# AscendoreCRM Frontend

Modern chat-driven web UI for AscendoreCRM with AI-powered command interpretation.

## Features

- **Chat-Driven Interface**: Natural language commands to manage CRM data
- **AI-Powered**: Integrated with AI service for intelligent command interpretation
- **Pipedrive-Inspired Design**: Clean, professional UI with sidebar navigation
- **Real-time Updates**: Live data synchronization with backend
- **Responsive**: Mobile-friendly design with collapsible sidebar
- **Type-Safe**: Full TypeScript implementation

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:3001`
- Dev credentials: `dev@ascendore.ai` / `DevPassword123!`

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:3001
```

Or copy from example:

```bash
cp .env.example .env
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── chat/        # Chat interface components
│   │   ├── crm/         # CRM-specific components
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   └── ui/          # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
└── tailwind.config.js   # Tailwind config
```

## Key Features

### Authentication
- JWT-based authentication
- Protected routes
- Auto-redirect on unauthorized access
- Token stored in localStorage

### Chat Interface
- Natural language command processing
- Message history
- Command suggestions
- Loading states
- Error handling
- Floating chat button (bottom-right)

### CRM Views
- **Dashboard**: Overview with metrics cards
- **Contacts**: List view with search/filter
- **Companies**: Company management (coming soon)
- **Deals**: Pipeline view with stages
- **Activities**: Task/activity timeline (coming soon)

### Layout
- Collapsible sidebar navigation
- Top header with search and user menu
- Responsive design (mobile-friendly)
- Pipedrive-inspired color scheme

## Chat Commands

The AI assistant understands natural language. Try:

- "Show me all contacts"
- "Create a new company called Acme Corp"
- "Find deals over $50k"
- "Show recent activities"
- "What deals are in negotiation stage?"

## API Integration

The frontend communicates with the backend via REST API:

### Endpoints
- `/api/v1/auth/login` - User login
- `/api/v1/auth/register` - User registration
- `/api/v1/a-crm/contacts` - Contact management
- `/api/v1/a-crm/companies` - Company management
- `/api/v1/a-crm/deals` - Deal management
- `/api/v1/a-crm/activities` - Activity management
- `/api/v1/a-crm/dashboard/metrics` - Dashboard metrics
- `/api/v1/a-crm/chat` - AI chat endpoint

### Authentication
All CRM endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Development Tips

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

### Adding New Components
1. Create component in appropriate directory
2. Export from component file
3. Import where needed

### Styling
- Use Tailwind utility classes
- Use `cn()` utility for conditional classes
- Follow existing component patterns

## Color Scheme

Based on enterprise UI patterns:
- **Primary**: Blue (#0ea5e9) - Actions, links
- **Secondary**: Gray - Backgrounds, borders
- **Accent**: Light blue - Hover states
- **Destructive**: Red - Errors, delete actions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port already in use
If port 5173 is in use:
```bash
# Kill the process or use a different port
npm run dev -- --port 3000
```

### API connection errors
- Ensure backend is running at `http://localhost:3001`
- Check CORS settings in backend
- Verify `.env` file configuration

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Next Steps

1. Implement remaining CRM views (Companies, Deals, Activities)
2. Add real-time notifications
3. Implement advanced search/filtering
4. Add export functionality
5. Implement role-based access control
6. Add analytics and reporting

## License

MIT
