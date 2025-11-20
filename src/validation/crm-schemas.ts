/**
 * Zod Validation Schemas for CRM Entities
 * Used for API request validation
 */

import { z } from 'zod';
import {
  CompanySize,
  CompanyStatus,
  ContactStatus,
  DealStage,
  CampaignType,
  CampaignStatus,
  ProjectStatus,
  Priority,
  TaskType,
  TaskStatus,
  RelatedToType,
  CampaignContactStatus,
} from '../types/crm';

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

const socialProfilesSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  github: z.string().url().optional(),
});

const contactPreferencesSchema = z.object({
  preferred_contact_method: z.enum(['email', 'phone', 'sms']).optional(),
  email_opt_in: z.boolean().optional(),
  sms_opt_in: z.boolean().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

const tagsSchema = z.array(z.string()).default([]);
const customFieldsSchema = z.record(z.any()).default({});
const metadataSchema = z.record(z.any()).default({});

// ============================================================================
// CRM COMPANY SCHEMAS
// ============================================================================

export const createCompanySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  industry: z.string().max(100).optional(),
  company_size: z.nativeEnum(CompanySize).optional(),
  website: z.string().url().max(500).optional(),
  billing_address: addressSchema.optional(),
  shipping_address: addressSchema.optional(),
  annual_revenue: z.number().positive().optional(),
  employee_count: z.number().int().positive().optional(),
  company_status: z.nativeEnum(CompanyStatus).default(CompanyStatus.LEAD),
  owner_id: z.string().uuid().optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  industry: z.string().max(100).optional(),
  company_size: z.nativeEnum(CompanySize).optional(),
  website: z.string().url().max(500).optional(),
  billing_address: addressSchema.optional(),
  shipping_address: addressSchema.optional(),
  annual_revenue: z.number().positive().optional(),
  employee_count: z.number().int().positive().optional(),
  company_status: z.nativeEnum(CompanyStatus).optional(),
  owner_id: z.string().uuid().nullable().optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const companyFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  company_status: z.nativeEnum(CompanyStatus).optional(),
  industry: z.string().optional(),
  company_size: z.nativeEnum(CompanySize).optional(),
  owner_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM CONTACT SCHEMAS
// ============================================================================

export const createContactSchema = z.object({
  company_id: z.string().uuid().optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  mobile: z.string().max(50).optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  contact_status: z.nativeEnum(ContactStatus).default(ContactStatus.ACTIVE),
  lead_source: z.string().max(100).optional(),
  lead_score: z.number().int().min(0).max(100).default(0),
  owner_id: z.string().uuid().optional(),
  social_profiles: socialProfilesSchema.optional(),
  preferences: contactPreferencesSchema.optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateContactSchema = z.object({
  company_id: z.string().uuid().nullable().optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  mobile: z.string().max(50).nullable().optional(),
  title: z.string().max(100).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
  contact_status: z.nativeEnum(ContactStatus).optional(),
  lead_source: z.string().max(100).nullable().optional(),
  lead_score: z.number().int().min(0).max(100).optional(),
  owner_id: z.string().uuid().nullable().optional(),
  social_profiles: socialProfilesSchema.optional(),
  preferences: contactPreferencesSchema.optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const contactFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  company_id: z.string().uuid().optional(),
  contact_status: z.nativeEnum(ContactStatus).optional(),
  lead_source: z.string().optional(),
  owner_id: z.string().uuid().optional(),
  min_lead_score: z.number().int().min(0).max(100).optional(),
  max_lead_score: z.number().int().min(0).max(100).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM DEAL SCHEMAS
// ============================================================================

export const createDealSchema = z.object({
  company_id: z.string().uuid().optional(),
  primary_contact_id: z.string().uuid().optional(),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  stage: z.nativeEnum(DealStage).default(DealStage.PROSPECTING),
  probability: z.number().int().min(0).max(100).default(0),
  expected_close_date: z.string().datetime().or(z.date()).optional(),
  deal_source: z.string().max(100).optional(),
  owner_id: z.string().uuid().optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateDealSchema = z.object({
  company_id: z.string().uuid().nullable().optional(),
  primary_contact_id: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().nullable().optional(),
  amount: z.number().positive().nullable().optional(),
  currency: z.string().length(3).optional(),
  stage: z.nativeEnum(DealStage).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expected_close_date: z.string().datetime().or(z.date()).nullable().optional(),
  actual_close_date: z.string().datetime().or(z.date()).nullable().optional(),
  deal_source: z.string().max(100).nullable().optional(),
  lost_reason: z.string().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const dealFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  company_id: z.string().uuid().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  owner_id: z.string().uuid().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM CAMPAIGN SCHEMAS
// ============================================================================

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  campaign_type: z.nativeEnum(CampaignType),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.PLANNING),
  start_date: z.string().datetime().or(z.date()).optional(),
  end_date: z.string().datetime().or(z.date()).optional(),
  budget: z.number().positive().optional(),
  actual_cost: z.number().positive().optional(),
  owner_id: z.string().uuid().optional(),
  target_audience: z.record(z.any()).optional(),
  goals: z.record(z.any()).optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateCampaignSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().nullable().optional(),
  campaign_type: z.nativeEnum(CampaignType).optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  start_date: z.string().datetime().or(z.date()).nullable().optional(),
  end_date: z.string().datetime().or(z.date()).nullable().optional(),
  budget: z.number().positive().nullable().optional(),
  actual_cost: z.number().positive().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
  target_audience: z.record(z.any()).optional(),
  goals: z.record(z.any()).optional(),
  metrics: z.record(z.any()).optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const campaignFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  campaign_type: z.nativeEnum(CampaignType).optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  owner_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM PROJECT SCHEMAS
// ============================================================================

export const createProjectSchema = z.object({
  company_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  project_status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  start_date: z.string().datetime().or(z.date()).optional(),
  due_date: z.string().datetime().or(z.date()).optional(),
  estimated_hours: z.number().positive().optional(),
  owner_id: z.string().uuid().optional(),
  project_manager_id: z.string().uuid().optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateProjectSchema = z.object({
  company_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().nullable().optional(),
  project_status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  start_date: z.string().datetime().or(z.date()).nullable().optional(),
  due_date: z.string().datetime().or(z.date()).nullable().optional(),
  completion_date: z.string().datetime().or(z.date()).nullable().optional(),
  estimated_hours: z.number().positive().nullable().optional(),
  actual_hours: z.number().positive().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
  project_manager_id: z.string().uuid().nullable().optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const projectFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  company_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  owner_id: z.string().uuid().optional(),
  project_manager_id: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM TASK SCHEMAS
// ============================================================================

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  related_to_type: z.nativeEnum(RelatedToType).optional(),
  related_to_id: z.string().uuid().optional(),
  task_type: z.nativeEnum(TaskType).default(TaskType.TODO),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  due_date: z.string().datetime().or(z.date()).optional(),
  assigned_to_id: z.string().uuid().optional(),
  tags: tagsSchema,
  custom_fields: customFieldsSchema,
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  related_to_type: z.nativeEnum(RelatedToType).nullable().optional(),
  related_to_id: z.string().uuid().nullable().optional(),
  task_type: z.nativeEnum(TaskType).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  due_date: z.string().datetime().or(z.date()).nullable().optional(),
  completed_at: z.string().datetime().or(z.date()).nullable().optional(),
  assigned_to_id: z.string().uuid().nullable().optional(),
  tags: tagsSchema.optional(),
  custom_fields: customFieldsSchema.optional(),
});

export const taskFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  related_to_type: z.nativeEnum(RelatedToType).optional(),
  related_to_id: z.string().uuid().optional(),
  task_type: z.nativeEnum(TaskType).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assigned_to_id: z.string().uuid().optional(),
  created_by_id: z.string().uuid().optional(),
  overdue: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// CRM NOTE SCHEMAS
// ============================================================================

export const createNoteSchema = z.object({
  content: z.string().min(1),
  related_to_type: z.string().optional(),
  related_to_id: z.string().uuid().optional(),
  is_pinned: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1).optional(),
  is_pinned: z.boolean().optional(),
});

// ============================================================================
// CRM CAMPAIGN CONTACT SCHEMAS
// ============================================================================

export const addContactToCampaignSchema = z.object({
  contact_id: z.string().uuid(),
  status: z.nativeEnum(CampaignContactStatus).default(CampaignContactStatus.PENDING),
});

export const updateCampaignContactSchema = z.object({
  status: z.nativeEnum(CampaignContactStatus).optional(),
  sent_at: z.string().datetime().or(z.date()).optional(),
  opened_at: z.string().datetime().or(z.date()).optional(),
  clicked_at: z.string().datetime().or(z.date()).optional(),
});
