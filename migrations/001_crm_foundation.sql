-- Migration: CRM Foundation Tables
-- Description: Create core CRM entities (Companies, Contacts, Deals, Campaigns, Projects, Tasks)
-- Author: AscendoreCRM
-- Date: 2025-01-20
-- Requires: Overlord Platform multi-tenancy migration (003_multi_tenancy.sql)

-- ============================================================================
-- 1. CRM COMPANIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Basic Information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100),
  industry VARCHAR(100),
  company_size VARCHAR(50) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  website VARCHAR(500),

  -- Contact Information
  billing_address JSONB DEFAULT '{}',
  shipping_address JSONB DEFAULT '{}',

  -- Business Metrics
  annual_revenue DECIMAL(15,2),
  employee_count INTEGER,

  -- Status & Classification
  company_status VARCHAR(50) DEFAULT 'lead' CHECK (company_status IN ('lead', 'prospect', 'customer', 'partner', 'churned', 'inactive')),

  -- Assignment
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(organization_id, slug)
);

-- Indexes for crm_companies
CREATE INDEX IF NOT EXISTS idx_crm_companies_organization_id ON public.crm_companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_owner_id ON public.crm_companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_company_status ON public.crm_companies(company_status);
CREATE INDEX IF NOT EXISTS idx_crm_companies_industry ON public.crm_companies(industry);
CREATE INDEX IF NOT EXISTS idx_crm_companies_created_at ON public.crm_companies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_companies_deleted_at ON public.crm_companies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_companies_tags ON public.crm_companies USING GIN(tags);

-- ============================================================================
-- 2. CRM CONTACTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,

  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),

  -- Professional Information
  title VARCHAR(100),
  department VARCHAR(100),

  -- Status & Scoring
  contact_status VARCHAR(50) DEFAULT 'active' CHECK (contact_status IN ('active', 'inactive', 'bounced', 'unsubscribed', 'do_not_contact')),
  lead_source VARCHAR(100),
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),

  -- Assignment
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Social & Preferences
  social_profiles JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(organization_id, email)
);

-- Indexes for crm_contacts
CREATE INDEX IF NOT EXISTS idx_crm_contacts_organization_id ON public.crm_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_id ON public.crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_id ON public.crm_contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_contact_status ON public.crm_contacts(contact_status);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_lead_score ON public.crm_contacts(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_at ON public.crm_contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_deleted_at ON public.crm_contacts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_tags ON public.crm_contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_name ON public.crm_contacts(last_name, first_name);

-- ============================================================================
-- 3. CRM DEALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  primary_contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE SET NULL,

  -- Deal Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Pipeline Stage
  stage VARCHAR(50) DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,

  -- Source & Lost Reason
  deal_source VARCHAR(100),
  lost_reason TEXT,

  -- Assignment
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for crm_deals
CREATE INDEX IF NOT EXISTS idx_crm_deals_organization_id ON public.crm_deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_company_id ON public.crm_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_primary_contact_id ON public.crm_deals(primary_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner_id ON public.crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_expected_close_date ON public.crm_deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_crm_deals_created_at ON public.crm_deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_deals_deleted_at ON public.crm_deals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_deals_tags ON public.crm_deals USING GIN(tags);

-- ============================================================================
-- 4. CRM CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Campaign Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) DEFAULT 'email' CHECK (campaign_type IN ('email', 'social', 'webinar', 'event', 'content', 'advertising', 'other')),

  -- Status & Dates
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,

  -- Budget & Cost
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),

  -- Assignment
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Campaign Details
  target_audience JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for crm_campaigns
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_organization_id ON public.crm_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_owner_id ON public.crm_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON public.crm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_campaign_type ON public.crm_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_start_date ON public.crm_campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_created_at ON public.crm_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_deleted_at ON public.crm_campaigns(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_tags ON public.crm_campaigns USING GIN(tags);

-- ============================================================================
-- 5. CRM PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL,

  -- Project Information
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status & Priority
  project_status VARCHAR(50) DEFAULT 'planning' CHECK (project_status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  start_date DATE,
  due_date DATE,
  completion_date DATE,

  -- Time Tracking
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),

  -- Assignment
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for crm_projects
CREATE INDEX IF NOT EXISTS idx_crm_projects_organization_id ON public.crm_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_projects_company_id ON public.crm_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_projects_deal_id ON public.crm_projects(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_projects_owner_id ON public.crm_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_projects_project_manager_id ON public.crm_projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_crm_projects_project_status ON public.crm_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_crm_projects_priority ON public.crm_projects(priority);
CREATE INDEX IF NOT EXISTS idx_crm_projects_due_date ON public.crm_projects(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_projects_created_at ON public.crm_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_projects_deleted_at ON public.crm_projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_projects_tags ON public.crm_projects USING GIN(tags);

-- ============================================================================
-- 6. CRM TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Task Information
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Polymorphic Relationship
  related_to_type VARCHAR(50) CHECK (related_to_type IN ('company', 'contact', 'deal', 'campaign', 'project', 'none')),
  related_to_id UUID,

  -- Task Type & Status
  task_type VARCHAR(50) DEFAULT 'todo' CHECK (task_type IN ('call', 'email', 'meeting', 'todo', 'follow_up', 'demo', 'other')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Assignment
  assigned_to_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Flexible Fields
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for crm_tasks
CREATE INDEX IF NOT EXISTS idx_crm_tasks_organization_id ON public.crm_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to_id ON public.crm_tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_created_by_id ON public.crm_tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_priority ON public.crm_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_task_type ON public.crm_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON public.crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_related_to ON public.crm_tasks(related_to_type, related_to_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_created_at ON public.crm_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deleted_at ON public.crm_tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_tags ON public.crm_tasks USING GIN(tags);

-- ============================================================================
-- 7. CRM ACTIVITIES LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Activity Information
  activity_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  description TEXT,

  -- User Attribution
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Additional Context
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crm_activities
CREATE INDEX IF NOT EXISTS idx_crm_activities_organization_id ON public.crm_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_entity ON public.crm_activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON public.crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_activity_type ON public.crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_at ON public.crm_activities(created_at DESC);

-- ============================================================================
-- 8. CRM NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Note Information
  content TEXT NOT NULL,

  -- Polymorphic Relationship
  related_to_type VARCHAR(50),
  related_to_id UUID,

  -- User Attribution
  created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Pin Status
  is_pinned BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for crm_notes
CREATE INDEX IF NOT EXISTS idx_crm_notes_organization_id ON public.crm_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_related_to ON public.crm_notes(related_to_type, related_to_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_created_by_id ON public.crm_notes(created_by_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_is_pinned ON public.crm_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_crm_notes_created_at ON public.crm_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_notes_deleted_at ON public.crm_notes(deleted_at);

-- ============================================================================
-- 9. CRM CAMPAIGN CONTACTS TABLE (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.crm_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,

  -- Engagement Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),

  -- Engagement Timestamps
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(campaign_id, contact_id)
);

-- Indexes for crm_campaign_contacts
CREATE INDEX IF NOT EXISTS idx_crm_campaign_contacts_campaign_id ON public.crm_campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_contacts_contact_id ON public.crm_campaign_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_contacts_status ON public.crm_campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_campaign_contacts_sent_at ON public.crm_campaign_contacts(sent_at);

-- ============================================================================
-- 10. HELPER FUNCTIONS
-- ============================================================================

-- Function to log CRM activity
CREATE OR REPLACE FUNCTION log_crm_activity(
  p_organization_id UUID,
  p_activity_type VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_description TEXT,
  p_user_id UUID,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.crm_activities (
    organization_id,
    activity_type,
    entity_type,
    entity_id,
    description,
    user_id,
    metadata,
    created_at
  )
  VALUES (
    p_organization_id,
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_description,
    p_user_id,
    p_metadata,
    NOW()
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all CRM tables
ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_contacts ENABLE ROW LEVEL SECURITY;

-- CRM Companies Policies
CREATE POLICY "Users can view org companies"
  ON public.crm_companies FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create companies"
  ON public.crm_companies FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update companies"
  ON public.crm_companies FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Admins can delete companies"
  ON public.crm_companies FOR DELETE
  USING (auth.has_organization_role(organization_id, 'admin'));

-- CRM Contacts Policies
CREATE POLICY "Users can view org contacts"
  ON public.crm_contacts FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create contacts"
  ON public.crm_contacts FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update contacts"
  ON public.crm_contacts FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Admins can delete contacts"
  ON public.crm_contacts FOR DELETE
  USING (auth.has_organization_role(organization_id, 'admin'));

-- CRM Deals Policies
CREATE POLICY "Users can view org deals"
  ON public.crm_deals FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create deals"
  ON public.crm_deals FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update deals"
  ON public.crm_deals FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Admins can delete deals"
  ON public.crm_deals FOR DELETE
  USING (auth.has_organization_role(organization_id, 'admin'));

-- CRM Campaigns Policies
CREATE POLICY "Users can view org campaigns"
  ON public.crm_campaigns FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create campaigns"
  ON public.crm_campaigns FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update campaigns"
  ON public.crm_campaigns FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Admins can delete campaigns"
  ON public.crm_campaigns FOR DELETE
  USING (auth.has_organization_role(organization_id, 'admin'));

-- CRM Projects Policies
CREATE POLICY "Users can view org projects"
  ON public.crm_projects FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create projects"
  ON public.crm_projects FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update projects"
  ON public.crm_projects FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Admins can delete projects"
  ON public.crm_projects FOR DELETE
  USING (auth.has_organization_role(organization_id, 'admin'));

-- CRM Tasks Policies
CREATE POLICY "Users can view org tasks"
  ON public.crm_tasks FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create tasks"
  ON public.crm_tasks FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update tasks"
  ON public.crm_tasks FOR UPDATE
  USING (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can delete tasks"
  ON public.crm_tasks FOR DELETE
  USING (auth.has_organization_role(organization_id, 'member'));

-- CRM Activities Policies
CREATE POLICY "Users can view org activities"
  ON public.crm_activities FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create activities"
  ON public.crm_activities FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

-- CRM Notes Policies
CREATE POLICY "Users can view org notes"
  ON public.crm_notes FOR SELECT
  USING (auth.is_organization_member(organization_id));

CREATE POLICY "Members can create notes"
  ON public.crm_notes FOR INSERT
  WITH CHECK (auth.has_organization_role(organization_id, 'member'));

CREATE POLICY "Members can update own notes"
  ON public.crm_notes FOR UPDATE
  USING (
    auth.has_organization_role(organization_id, 'member')
    AND (created_by_id = auth.uid() OR auth.has_organization_role(organization_id, 'admin'))
  );

CREATE POLICY "Members can delete own notes"
  ON public.crm_notes FOR DELETE
  USING (
    auth.has_organization_role(organization_id, 'member')
    AND (created_by_id = auth.uid() OR auth.has_organization_role(organization_id, 'admin'))
  );

-- CRM Campaign Contacts Policies
CREATE POLICY "Users can view org campaign contacts"
  ON public.crm_campaign_contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_campaigns
      WHERE id = campaign_id
      AND auth.is_organization_member(organization_id)
    )
  );

CREATE POLICY "Members can manage campaign contacts"
  ON public.crm_campaign_contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_campaigns
      WHERE id = campaign_id
      AND auth.has_organization_role(organization_id, 'member')
    )
  );

-- ============================================================================
-- 12. TRIGGERS
-- ============================================================================

-- Updated_at triggers for all tables
CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON public.crm_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_campaigns_updated_at
  BEFORE UPDATE ON public.crm_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_projects_updated_at
  BEFORE UPDATE ON public.crm_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_notes_updated_at
  BEFORE UPDATE ON public.crm_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_campaign_contacts_updated_at
  BEFORE UPDATE ON public.crm_campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 13. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.crm_companies TO postgres;
GRANT ALL ON public.crm_contacts TO postgres;
GRANT ALL ON public.crm_deals TO postgres;
GRANT ALL ON public.crm_campaigns TO postgres;
GRANT ALL ON public.crm_projects TO postgres;
GRANT ALL ON public.crm_tasks TO postgres;
GRANT ALL ON public.crm_activities TO postgres;
GRANT ALL ON public.crm_notes TO postgres;
GRANT ALL ON public.crm_campaign_contacts TO postgres;

GRANT EXECUTE ON FUNCTION log_crm_activity(UUID, VARCHAR, VARCHAR, UUID, TEXT, UUID, JSONB) TO postgres;

-- ============================================================================
-- 14. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.crm_companies IS 'CRM companies/accounts - customer organizations and prospects';
COMMENT ON TABLE public.crm_contacts IS 'CRM contacts - individuals associated with companies';
COMMENT ON TABLE public.crm_deals IS 'CRM deals/opportunities - sales pipeline tracking';
COMMENT ON TABLE public.crm_campaigns IS 'CRM campaigns - marketing initiatives';
COMMENT ON TABLE public.crm_projects IS 'CRM projects - customer projects and deliverables';
COMMENT ON TABLE public.crm_tasks IS 'CRM tasks - activities and follow-ups';
COMMENT ON TABLE public.crm_activities IS 'CRM activities log - audit trail for all CRM operations';
COMMENT ON TABLE public.crm_notes IS 'CRM notes - contextual notes on any CRM entity';
COMMENT ON TABLE public.crm_campaign_contacts IS 'CRM campaign contacts - many-to-many relationship with engagement tracking';

COMMENT ON FUNCTION log_crm_activity(UUID, VARCHAR, VARCHAR, UUID, TEXT, UUID, JSONB) IS 'Log an activity in the CRM activities table';
