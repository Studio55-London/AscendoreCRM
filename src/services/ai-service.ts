import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

/**
 * AI Service for CRM operations
 */
export class AIService {
  /**
   * Score a lead based on contact and company information
   */
  async scoreContact(contactData: {
    firstName: string;
    lastName: string;
    email?: string;
    title?: string;
    company?: {
      name: string;
      industry?: string;
      companySize?: string;
      annualRevenue?: number;
    };
    leadSource?: string;
  }): Promise<{
    score: number;
    reasoning: string;
    factors: Array<{ factor: string; impact: string; weight: number }>;
  }> {
    try {
      const prompt = `You are a B2B sales expert. Analyze this lead and provide a score from 0-100 based on their potential value.

Contact Information:
- Name: ${contactData.firstName} ${contactData.lastName}
- Email: ${contactData.email || 'N/A'}
- Title: ${contactData.title || 'N/A'}
- Lead Source: ${contactData.leadSource || 'N/A'}

${contactData.company ? `Company Information:
- Name: ${contactData.company.name}
- Industry: ${contactData.company.industry || 'N/A'}
- Company Size: ${contactData.company.companySize || 'N/A'}
- Annual Revenue: ${contactData.company.annualRevenue ? '$' + contactData.company.annualRevenue.toLocaleString() : 'N/A'}` : 'No company information available'}

Provide your response in the following JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "factors": [
    {"factor": "<factor name>", "impact": "<positive/negative/neutral>", "weight": <1-10>}
  ]
}

Consider factors like:
- Job title seniority and relevance
- Company size and revenue
- Industry fit
- Email domain quality
- Lead source quality`;

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return result;
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      logger.error('AI lead scoring failed', { error, contactData });
      // Return a default score if AI fails
      return {
        score: 50,
        reasoning: 'Unable to generate AI score, using default value',
        factors: [],
      };
    }
  }

  /**
   * Generate email draft for a contact
   */
  async generateEmailDraft(context: {
    recipientName: string;
    recipientTitle?: string;
    companyName?: string;
    purpose: 'introduction' | 'follow_up' | 'proposal' | 'meeting_request' | 'thank_you';
    additionalContext?: string;
    tone?: 'professional' | 'friendly' | 'casual';
  }): Promise<{
    subject: string;
    body: string;
  }> {
    try {
      const prompt = `Generate a professional ${context.purpose} email.

Recipient Information:
- Name: ${context.recipientName}
${context.recipientTitle ? `- Title: ${context.recipientTitle}` : ''}
${context.companyName ? `- Company: ${context.companyName}` : ''}

Purpose: ${context.purpose}
Tone: ${context.tone || 'professional'}
${context.additionalContext ? `Additional Context: ${context.additionalContext}` : ''}

Generate a compelling email with:
1. An engaging subject line
2. A well-structured body with proper greeting and closing

Provide response in JSON format:
{
  "subject": "<subject line>",
  "body": "<email body with proper formatting>"
}`;

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return result;
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      logger.error('Email generation failed', { error, context });
      throw new Error('Failed to generate email draft');
    }
  }

  /**
   * Analyze deal and predict win probability
   */
  async predictDealOutcome(dealData: {
    name: string;
    amount?: number;
    stage: string;
    companyName?: string;
    contactTitle?: string;
    dealAge: number; // days since creation
    lastActivityDate?: Date;
    notes?: string;
  }): Promise<{
    winProbability: number;
    reasoning: string;
    recommendations: string[];
    riskFactors: string[];
  }> {
    try {
      const prompt = `You are a sales forecasting expert. Analyze this deal and predict its win probability.

Deal Information:
- Name: ${dealData.name}
- Amount: ${dealData.amount ? '$' + dealData.amount.toLocaleString() : 'N/A'}
- Current Stage: ${dealData.stage}
- Deal Age: ${dealData.dealAge} days
${dealData.companyName ? `- Company: ${dealData.companyName}` : ''}
${dealData.contactTitle ? `- Contact Title: ${dealData.contactTitle}` : ''}
${dealData.lastActivityDate ? `- Last Activity: ${dealData.lastActivityDate.toISOString().split('T')[0]}` : ''}
${dealData.notes ? `- Notes: ${dealData.notes}` : ''}

Provide analysis in JSON format:
{
  "winProbability": <number 0-100>,
  "reasoning": "<brief explanation>",
  "recommendations": ["<actionable recommendation>", ...],
  "riskFactors": ["<risk factor>", ...]
}`;

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return result;
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      logger.error('Deal prediction failed', { error, dealData });
      throw new Error('Failed to predict deal outcome');
    }
  }

  /**
   * Generate insights from notes and activities
   */
  async generateInsights(data: {
    entityType: string;
    entityName: string;
    notes: Array<{ content: string; createdAt: Date }>;
    activities: Array<{ type: string; description: string; createdAt: Date }>;
  }): Promise<{
    summary: string;
    keyPoints: string[];
    sentimentAnalysis: 'positive' | 'neutral' | 'negative';
    nextActions: string[];
  }> {
    try {
      const notesText = data.notes
        .map((n) => `[${n.createdAt.toISOString().split('T')[0]}] ${n.content}`)
        .join('\n');

      const activitiesText = data.activities
        .map((a) => `[${a.createdAt.toISOString().split('T')[0]}] ${a.type}: ${a.description}`)
        .join('\n');

      const prompt = `Analyze the following ${data.entityType} data and provide insights.

Entity: ${data.entityName}

Recent Notes:
${notesText || 'No notes available'}

Recent Activities:
${activitiesText || 'No activities available'}

Provide analysis in JSON format:
{
  "summary": "<brief summary of the entity's current state>",
  "keyPoints": ["<important point>", ...],
  "sentimentAnalysis": "<positive/neutral/negative>",
  "nextActions": ["<recommended action>", ...]
}`;

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return result;
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      logger.error('Insights generation failed', { error, data });
      throw new Error('Failed to generate insights');
    }
  }

  /**
   * Suggest next best action for a contact or deal
   */
  async suggestNextAction(context: {
    entityType: 'contact' | 'deal' | 'company';
    entityData: any;
    recentActivities: Array<{ type: string; description: string; date: Date }>;
    lastContactDate?: Date;
  }): Promise<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reasoning: string;
    suggestedDate: Date;
  }> {
    try {
      const prompt = `You are a CRM automation expert. Based on the following information, suggest the next best action.

Entity Type: ${context.entityType}
Entity Data: ${JSON.stringify(context.entityData, null, 2)}

Recent Activities:
${context.recentActivities.map((a) => `- ${a.date.toISOString().split('T')[0]}: ${a.type} - ${a.description}`).join('\n')}

${context.lastContactDate ? `Last Contact: ${context.lastContactDate.toISOString().split('T')[0]}` : 'No previous contact'}

Suggest the next action in JSON format:
{
  "action": "<specific action to take>",
  "priority": "<low/medium/high/urgent>",
  "reasoning": "<why this action is recommended>",
  "suggestedDate": "<ISO date string>"
}`;

      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = JSON.parse(content.text);
        return {
          ...result,
          suggestedDate: new Date(result.suggestedDate),
        };
      }

      throw new Error('Unexpected response format from AI');
    } catch (error) {
      logger.error('Next action suggestion failed', { error, context });
      throw new Error('Failed to suggest next action');
    }
  }
}

export const aiService = new AIService();
