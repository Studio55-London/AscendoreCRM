# AscendoreCRM

A modern CRM system built on the Overlord Platform, leveraging enterprise-grade AI capabilities and multi-tenancy.

## Overview

AscendoreCRM is a comprehensive Customer Relationship Management system that integrates with the Overlord Platform to provide:

- **Multi-tenant Architecture**: Secure organization-based data isolation
- **AI-Powered Features**: Lead scoring, insights, and automation using AWS Bedrock
- **Real-time Updates**: WebSocket-based live data synchronization
- **Enterprise Security**: Row-level security, JWT authentication, and role-based access control

## Core Entities

- **Companies**: Manage customer organizations and prospects
- **Contacts**: Track individuals and their relationships
- **Deals**: Monitor sales pipeline and opportunities
- **Campaigns**: Plan and execute marketing initiatives
- **Projects**: Coordinate customer projects and deliverables
- **Tasks**: Organize activities and follow-ups

## Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with pgvector
- **Caching**: Redis
- **AI**: AWS Bedrock (Claude)
- **Auth**: Supabase GoTrue
- **Real-time**: Supabase Realtime
- **Storage**: AWS S3
- **Infrastructure**: AWS ECS Fargate

## Platform Integration

AscendoreCRM leverages the Overlord Platform located at `C:\Users\AndrewSmart\Claude_Projects\Overlord` for:
- Authentication and user management
- Multi-tenancy infrastructure
- AI service integrations
- File storage and management
- Real-time subscriptions
- Billing and payments (Stripe)

## Getting Started

Coming soon...

## License

MIT
