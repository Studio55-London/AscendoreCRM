# CRM System Architecture and Implementation Plan

## Executive Summary

This issue outlines the complete architecture and implementation plan for AscendoreCRM, a comprehensive Customer Relationship Management system built on top of the Overlord Platform.

## Overlord Platform Overview

### Technology Stack
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with pgvector for AI/RAG capabilities
- **Caching**: Redis
- **Cloud**: AWS (S3, RDS, ECS Fargate, Bedrock, ElastiCache)
- **Supabase OSS**: GoTrue (auth), Realtime (WebSocket), Storage

### Key Features
- Multi-tenancy with organizations
- JWT authentication with role-based access control
- Row-level security (RLS) policies
- Stripe billing integration
- AI services (Claude via Bedrock, OpenAI, etc.)
- Real-time subscriptions via WebSocket
- Enterprise-grade security and monitoring

---

## CRM Entities Design

### 1. Companies (CRM)

```sql
crm_companies
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- name VARCHAR(255) NOT NULL
- slug VARCHAR(100) UNIQUE
- industry VARCHAR(100)
- company_size VARCHAR(50) (startup, small, medium, enterprise)
- website VARCHAR(500)
- billing_address JSONB
- shipping_address JSONB
- annual_revenue DECIMAL(15,2)
- employee_count INTEGER
- company_status VARCHAR(50) (lead, prospect, customer, churned)
- owner_id UUID (assigned user)
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Track customer organizations and prospects
- Industry classification and company sizing
- Revenue and employee metrics
- Customizable fields and tagging
- Assignment to account owners

---

### 2. Contacts

```sql
crm_contacts
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- company_id UUID (FK to crm_companies)
- first_name VARCHAR(100) NOT NULL
- last_name VARCHAR(100) NOT NULL
- email VARCHAR(255) UNIQUE
- phone VARCHAR(50)
- mobile VARCHAR(50)
- title VARCHAR(100)
- department VARCHAR(100)
- contact_status VARCHAR(50) (active, inactive, bounced)
- lead_source VARCHAR(100)
- lead_score INTEGER (0-100)
- owner_id UUID
- social_profiles JSONB (linkedin, twitter, etc.)
- preferences JSONB (communication, interests)
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Individual contact management
- Lead scoring and source tracking
- Social profile integration
- Communication preferences
- Multi-channel contact info

---

### 3. Deals

```sql
crm_deals
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- company_id UUID (FK to crm_companies)
- primary_contact_id UUID (FK to crm_contacts)
- name VARCHAR(255) NOT NULL
- amount DECIMAL(15,2)
- currency VARCHAR(3) DEFAULT 'USD'
- stage VARCHAR(50) (prospecting, qualification, proposal, negotiation, closed_won, closed_lost)
- probability INTEGER (0-100)
- expected_close_date DATE
- actual_close_date DATE
- deal_source VARCHAR(100)
- lost_reason TEXT
- owner_id UUID
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Sales pipeline management
- Deal stage tracking
- Win/loss analysis
- Revenue forecasting
- Probability-based projections

---

### 4. Campaigns

```sql
crm_campaigns
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- name VARCHAR(255) NOT NULL
- description TEXT
- campaign_type VARCHAR(50) (email, social, webinar, event, content, other)
- status VARCHAR(50) (planning, active, paused, completed, cancelled)
- start_date DATE
- end_date DATE
- budget DECIMAL(15,2)
- actual_cost DECIMAL(15,2)
- owner_id UUID
- target_audience JSONB
- goals JSONB
- metrics JSONB (impressions, clicks, conversions, roi)
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Marketing campaign management
- Budget tracking and ROI analysis
- Multi-channel campaign support
- Target audience segmentation
- Performance metrics tracking

---

### 5. Projects

```sql
crm_projects
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- company_id UUID (FK to crm_companies)
- deal_id UUID (FK to crm_deals, optional)
- name VARCHAR(255) NOT NULL
- description TEXT
- project_status VARCHAR(50) (planning, in_progress, on_hold, completed, cancelled)
- priority VARCHAR(50) (low, medium, high, urgent)
- start_date DATE
- due_date DATE
- completion_date DATE
- estimated_hours DECIMAL(10,2)
- actual_hours DECIMAL(10,2)
- owner_id UUID
- project_manager_id UUID
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Customer project tracking
- Time and resource management
- Deal association
- Priority management
- Progress tracking

---

### 6. Tasks

```sql
crm_tasks
- id UUID PRIMARY KEY
- organization_id UUID (multi-tenant FK)
- title VARCHAR(255) NOT NULL
- description TEXT
- related_to_type VARCHAR(50) (company, contact, deal, campaign, project)
- related_to_id UUID
- task_type VARCHAR(50) (call, email, meeting, todo, follow_up, demo)
- status VARCHAR(50) (pending, in_progress, completed, cancelled)
- priority VARCHAR(50) (low, medium, high, urgent)
- due_date TIMESTAMPTZ
- completed_at TIMESTAMPTZ
- assigned_to_id UUID
- created_by_id UUID
- tags JSONB
- custom_fields JSONB
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Features**:
- Activity and follow-up management
- Polymorphic relationships
- Task assignment and tracking
- Priority and deadline management
- Task type categorization

---

## Supporting Tables

### 7. Activities Log

```sql
crm_activities
- id UUID PRIMARY KEY
- organization_id UUID
- activity_type VARCHAR(50) (created, updated, deleted, status_changed, etc.)
- entity_type VARCHAR(50) (company, contact, deal, etc.)
- entity_id UUID
- description TEXT
- user_id UUID
- metadata JSONB
- created_at TIMESTAMPTZ
```

**Purpose**: Audit trail and activity history

---

### 8. Notes

```sql
crm_notes
- id UUID PRIMARY KEY
- organization_id UUID
- content TEXT NOT NULL
- related_to_type VARCHAR(50)
- related_to_id UUID
- created_by_id UUID
- is_pinned BOOLEAN DEFAULT false
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- deleted_at TIMESTAMPTZ
```

**Purpose**: Contextual notes on any CRM entity

---

### 9. Campaign Contacts (Many-to-Many)

```sql
crm_campaign_contacts
- id UUID PRIMARY KEY
- campaign_id UUID (FK to crm_campaigns)
- contact_id UUID (FK to crm_contacts)
- status VARCHAR(50) (sent, delivered, opened, clicked, bounced, unsubscribed)
- sent_at TIMESTAMPTZ
- opened_at TIMESTAMPTZ
- clicked_at TIMESTAMPTZ
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**Purpose**: Track campaign engagement per contact

---

## API Endpoints Structure

### Base Path: `/api/v1/a-crm/`

#### Companies
```
GET    /a-crm/companies              - List companies (with filters)
POST   /a-crm/companies              - Create company
GET    /a-crm/companies/:id          - Get company details
PUT    /a-crm/companies/:id          - Update company
DELETE /a-crm/companies/:id          - Soft delete company
GET    /a-crm/companies/:id/contacts - List company contacts
GET    /a-crm/companies/:id/deals    - List company deals
GET    /a-crm/companies/:id/projects - List company projects
GET    /a-crm/companies/:id/activities - Company activity log
GET    /a-crm/companies/:id/notes    - Company notes
```

#### Contacts
```
GET    /a-crm/contacts               - List contacts (with filters)
POST   /a-crm/contacts               - Create contact
GET    /a-crm/contacts/:id           - Get contact details
PUT    /a-crm/contacts/:id           - Update contact
DELETE /a-crm/contacts/:id           - Soft delete contact
GET    /a-crm/contacts/:id/deals     - Contact deals
GET    /a-crm/contacts/:id/activities - Contact activity log
GET    /a-crm/contacts/:id/notes     - Contact notes
```

#### Deals
```
GET    /a-crm/deals                  - List deals (with filters, pipeline view)
POST   /a-crm/deals                  - Create deal
GET    /a-crm/deals/:id              - Get deal details
PUT    /a-crm/deals/:id              - Update deal
DELETE /a-crm/deals/:id              - Soft delete deal
PUT    /a-crm/deals/:id/stage        - Update deal stage
GET    /a-crm/deals/:id/activities   - Deal activity log
GET    /a-crm/deals/:id/notes        - Deal notes
GET    /a-crm/deals/pipeline         - Pipeline analytics
```

#### Campaigns
```
GET    /a-crm/campaigns              - List campaigns
POST   /a-crm/campaigns              - Create campaign
GET    /a-crm/campaigns/:id          - Get campaign details
PUT    /a-crm/campaigns/:id          - Update campaign
DELETE /a-crm/campaigns/:id          - Soft delete campaign
POST   /a-crm/campaigns/:id/contacts - Add contacts to campaign
GET    /a-crm/campaigns/:id/contacts - List campaign contacts
GET    /a-crm/campaigns/:id/metrics  - Campaign performance metrics
```

#### Projects
```
GET    /a-crm/projects               - List projects
POST   /a-crm/projects               - Create project
GET    /a-crm/projects/:id           - Get project details
PUT    /a-crm/projects/:id           - Update project
DELETE /a-crm/projects/:id           - Soft delete project
GET    /a-crm/projects/:id/tasks     - Project tasks
GET    /a-crm/projects/:id/activities - Project activity log
```

#### Tasks
```
GET    /a-crm/tasks                  - List tasks (with filters)
POST   /a-crm/tasks                  - Create task
GET    /a-crm/tasks/:id              - Get task details
PUT    /a-crm/tasks/:id              - Update task
DELETE /a-crm/tasks/:id              - Delete task
PUT    /a-crm/tasks/:id/complete     - Mark task complete
GET    /a-crm/tasks/my-tasks         - Current user tasks
```

#### Activities & Notes
```
GET    /a-crm/activities             - List activities (with filters)
POST   /a-crm/notes                  - Create note
GET    /a-crm/notes/:id              - Get note
PUT    /a-crm/notes/:id              - Update note
DELETE /a-crm/notes/:id              - Delete note
```

---

## Key Features

### 1. Multi-Tenancy
- All CRM entities scoped to organization_id
- Row-level security policies enforce data isolation
- Organization members can access CRM data based on roles

### 2. Role-Based Access Control
- **Owner**: Full access to all CRM data
- **Admin**: Manage CRM settings, bulk operations
- **Member**: Create and manage assigned records
- **Viewer**: Read-only access

### 3. AI-Powered Features
- **Lead Scoring**: AI-based contact/company scoring using Bedrock
- **Email Drafting**: Generate email templates from context
- **Insights**: Extract insights from notes and activities
- **Smart Recommendations**: Next best action suggestions
- **Sentiment Analysis**: Analyze communication sentiment

### 4. Real-Time Updates
- WebSocket subscriptions for CRM entity changes
- Live pipeline updates
- Task notifications
- Activity feed

### 5. Advanced Search
- Full-text search across all CRM entities
- Filter by tags, custom fields, dates
- Advanced query builder
- Saved searches

### 6. Reporting & Analytics
- Sales pipeline reports
- Campaign performance dashboards
- Activity analytics
- Custom report builder
- Export to CSV/Excel

### 7. Integrations
- **Files**: Attach files from Overlord storage
- **Calendar**: Sync tasks to calendar
- **Email**: Email integration via AWS SES
- **Webhooks**: Real-time event notifications

---

## Security Considerations

### Row-Level Security (RLS) Policies

All tables will have RLS policies enforcing organization-level isolation and role-based access control.

### Data Validation
- Zod schemas for all API inputs
- Email validation
- Phone number formatting
- URL validation
- Currency and amount validation

### Audit Trail
- All CRM operations logged to crm_activities
- User attribution for all changes
- Metadata tracking (IP, user agent)

---

## Implementation Plan

### Phase 1: Foundation
- [ ] Create database migration for all CRM tables
- [ ] Set up TypeScript types and interfaces
- [ ] Implement RLS policies
- [ ] Create base CRUD operations

### Phase 2: API Development
- [ ] Companies API endpoints
- [ ] Contacts API endpoints
- [ ] Deals API endpoints
- [ ] Tasks API endpoints
- [ ] Activities and Notes APIs

### Phase 3: Advanced Features
- [ ] Campaigns API endpoints
- [ ] Projects API endpoints
- [ ] Search functionality
- [ ] Filtering and pagination
- [ ] Bulk operations

### Phase 4: AI Integration
- [ ] Lead scoring with Bedrock
- [ ] Email draft generation
- [ ] Insights extraction
- [ ] Smart recommendations

### Phase 5: Real-Time & Analytics
- [ ] WebSocket subscriptions
- [ ] Real-time notifications
- [ ] Reporting engine
- [ ] Dashboard APIs

### Phase 6: Testing & Documentation
- [ ] Unit tests for all endpoints
- [ ] Integration tests
- [ ] API documentation (Swagger)
- [ ] Developer guides

---

## Success Metrics

- **Performance**: API response time < 200ms (p95)
- **Scalability**: Support 10,000+ companies per organization
- **Security**: Zero data leaks between organizations
- **Reliability**: 99.9% uptime
- **AI Accuracy**: Lead scoring accuracy > 80%

---

## Next Steps

1. Review and approve this architecture
2. Set up project structure in AscendoreCRM directory
3. Create initial database migrations
4. Implement first entity (Companies) as reference
5. Iterate on remaining entities
