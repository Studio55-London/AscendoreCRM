# AscendoreCRM Setup Guide

## Prerequisites

Before setting up AscendoreCRM, ensure you have the following installed:

- **Node.js** 18+
- **PostgreSQL** 14+
- **Overlord Platform** running and accessible

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/andrewjsmart-S55/AscendoreCRM.git
cd AscendoreCRM
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and update with your configuration:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database connection to Overlord's PostgreSQL instance
- JWT secret (must match Overlord's)
- AWS credentials for AI features
- CORS origins

### 4. Run Database Migration

The CRM migration must be run on the same database as Overlord Platform since it depends on the multi-tenancy tables.

```bash
# Connect to your Overlord PostgreSQL database
psql -U postgres -d overlord -f migrations/001_crm_foundation.sql
```

Or use the migration script:

```bash
npm run migrate
```

### 5. Verify Setup

Check that all CRM tables were created:

```sql
-- List all CRM tables
SELECT tablename FROM pg_tables WHERE tablename LIKE 'crm_%';
```

You should see:
- crm_companies
- crm_contacts
- crm_deals
- crm_campaigns
- crm_projects
- crm_tasks
- crm_activities
- crm_notes
- crm_campaign_contacts

## Database Integration

AscendoreCRM is designed to run on the **same PostgreSQL database** as Overlord Platform:

### Why Same Database?

1. **Multi-Tenancy**: CRM entities reference `organizations` table from Overlord
2. **Authentication**: Uses Overlord's `auth.users` table
3. **RLS Policies**: Leverages Overlord's authentication functions
4. **Data Consistency**: Ensures referential integrity

### Connection String

Your `DATABASE_URL` should point to the Overlord database:

```
postgresql://user:password@host:port/overlord
```

## Architecture Overview

```
Overlord Database (PostgreSQL)
├── auth.users (Overlord)
├── public.organizations (Overlord)
├── public.organization_members (Overlord)
├── crm_companies (AscendoreCRM)
├── crm_contacts (AscendoreCRM)
├── crm_deals (AscendoreCRM)
├── crm_campaigns (AscendoreCRM)
├── crm_projects (AscendoreCRM)
├── crm_tasks (AscendoreCRM)
├── crm_activities (AscendoreCRM)
├── crm_notes (AscendoreCRM)
└── crm_campaign_contacts (AscendoreCRM)
```

## Development

### Start Development Server

```bash
npm run dev
```

The CRM API will be available at: `http://localhost:3001/api/v1/a-crm/`

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

## API Endpoints

All CRM endpoints are prefixed with `/api/v1/a-crm/`:

- **Companies**: `/a-crm/companies`
- **Contacts**: `/a-crm/contacts`
- **Deals**: `/a-crm/deals`
- **Campaigns**: `/a-crm/campaigns`
- **Projects**: `/a-crm/projects`
- **Tasks**: `/a-crm/tasks`
- **Notes**: `/a-crm/notes`
- **Activities**: `/a-crm/activities`

## Security

### Row-Level Security (RLS)

All CRM tables have RLS policies enforcing:
- Organization-level data isolation
- Role-based access control (owner, admin, member, viewer)
- User authentication via JWT

### Authentication

AscendoreCRM uses Overlord's JWT authentication:
1. Users authenticate via Overlord Platform
2. JWT token includes user ID and organization context
3. CRM API validates JWT and enforces RLS policies

## Next Steps

After setup is complete:

1. [ ] Review [Architecture Plan](https://github.com/andrewjsmart-S55/AscendoreCRM/issues/1)
2. [ ] Implement API endpoints (Phase 2)
3. [ ] Add AI-powered features (Phase 4)
4. [ ] Set up real-time subscriptions (Phase 5)

## Troubleshooting

### Migration Fails

**Issue**: Migration fails with "function does not exist"

**Solution**: Ensure Overlord's multi-tenancy migration (`003_multi_tenancy.sql`) has been run first.

### Authentication Errors

**Issue**: JWT validation fails

**Solution**: Verify `JWT_SECRET` in `.env` matches Overlord's configuration.

### RLS Policy Errors

**Issue**: Cannot access CRM data

**Solution**:
1. Verify user is a member of an organization
2. Check organization_id is set correctly in requests
3. Confirm RLS policies are enabled

## Support

For issues and questions:
- GitHub Issues: https://github.com/andrewjsmart-S55/AscendoreCRM/issues
- Architecture Docs: `.github/ISSUE_PLAN.md`
