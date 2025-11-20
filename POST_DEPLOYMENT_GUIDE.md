# AscendoreCRM Post-Deployment Guide

This guide covers the steps to complete after AscendoreCRM has been deployed to AWS.

## Deployment Details

- **API URL**: https://crm-api.theoverlord.ai
- **Region**: eu-north-1 (Stockholm)
- **Environment**: production
- **Stack Name**: AscendoreCRM-prod

## Required Post-Deployment Steps

### 1. Configure Anthropic API Key

The deployment created a placeholder for the Anthropic API key. You need to update it with your real API key.

**Using AWS CLI:**
```bash
aws secretsmanager update-secret \
    --secret-id "ascendore-crm/prod/anthropic-api-key" \
    --secret-string "sk-ant-YOUR-REAL-API-KEY-HERE" \
    --region eu-north-1
```

**Using AWS Console:**
1. Go to AWS Secrets Manager console
2. Select region: eu-north-1
3. Find secret: `ascendore-crm/prod/anthropic-api-key`
4. Click "Retrieve secret value"
5. Click "Edit"
6. Replace `PLACEHOLDER-UPDATE-WITH-REAL-API-KEY` with your Anthropic API key
7. Click "Save"

**After updating the secret, restart the ECS service:**
```bash
aws ecs update-service \
    --cluster ascendore-crm-cluster-prod \
    --service AscendoreCRM-Service \
    --force-new-deployment \
    --region eu-north-1
```

### 2. Configure Security Group Rules

The AscendoreCRM ECS service needs to access the Overlord PostgreSQL database and Redis cache. You need to add inbound rules to allow this traffic.

**Get the AscendoreCRM Service Security Group ID:**
```bash
aws cloudformation describe-stacks \
    --stack-name AscendoreCRM-prod \
    --query 'Stacks[0].Outputs[?OutputKey==`ServiceSecurityGroupId`].OutputValue' \
    --output text \
    --region eu-north-1
```

**Add rule to Overlord Database Security Group:**
```bash
# Get Overlord DB security group ID
DB_SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=tag:aws:cloudformation:logical-id,Values=DBSecurityGroup" \
              "Name=tag:aws:cloudformation:stack-name,Values=OverlordProdStack" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region eu-north-1)

# Add inbound rule for PostgreSQL (port 5432)
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 5432 \
    --source-group YOUR_ASCENDORE_CRM_SG_ID \
    --description "AscendoreCRM ECS to PostgreSQL" \
    --region eu-north-1
```

**Add rule to Overlord Redis Security Group:**
```bash
# Get Overlord Redis security group ID
REDIS_SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=tag:aws:cloudformation:logical-id,Values=RedisSecurityGroup" \
              "Name=tag:aws:cloudformation:stack-name,Values=OverlordProdStack" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region eu-north-1)

# Add inbound rule for Redis (port 6379)
aws ec2 authorize-security-group-ingress \
    --group-id $REDIS_SG_ID \
    --protocol tcp \
    --port 6379 \
    --source-group YOUR_ASCENDORE_CRM_SG_ID \
    --description "AscendoreCRM ECS to Redis" \
    --region eu-north-1
```

**Or use AWS Console:**
1. Go to EC2 > Security Groups
2. Find the Overlord Database Security Group
3. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: AscendoreCRM Service Security Group
   - Description: "AscendoreCRM ECS to PostgreSQL"
4. Find the Overlord Redis Security Group
5. Add inbound rule:
   - Type: Custom TCP
   - Port: 6379
   - Source: AscendoreCRM Service Security Group
   - Description: "AscendoreCRM ECS to Redis"

### 3. Run Database Migrations

The CRM database tables need to be created in the Overlord database.

**Option A: Using ECS Exec (Recommended)**

```bash
# Get the task ARN
TASK_ARN=$(aws ecs list-tasks \
    --cluster ascendore-crm-cluster-prod \
    --service-name AscendoreCRM-Service \
    --query 'taskArns[0]' \
    --output text \
    --region eu-north-1)

# Execute migration
aws ecs execute-command \
    --cluster ascendore-crm-cluster-prod \
    --task $TASK_ARN \
    --container ascendore-crm \
    --interactive \
    --command "/bin/sh" \
    --region eu-north-1

# Once inside the container, run:
psql -h overlordprodstack-overlorddb2e4d21b1-u4k5jqmkorpg.c7qieucq8pn1.rds.amazonaws.com \
     -U postgres \
     -d overlord \
     -f migrations/001_crm_foundation.sql
```

**Option B: Using Local psql Client**

```bash
# Get database credentials from AWS Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
    --secret-id overlord/prod/db-credentials \
    --query 'SecretString' \
    --output text \
    --region eu-north-1 | jq -r '.password')

# Run migration
psql -h overlordprodstack-overlorddb2e4d21b1-u4k5jqmkorpg.c7qieucq8pn1.rds.amazonaws.com \
     -U postgres \
     -d overlord \
     -f migrations/001_crm_foundation.sql
```

### 4. Verify Deployment

**Check Health Endpoint:**
```bash
curl https://crm-api.theoverlord.ai/health
```

Expected response:
```json
{
  "success": true,
  "service": "AscendoreCRM",
  "version": "0.1.0",
  "status": "healthy",
  "timestamp": "2025-11-20T..."
}
```

**Test API Endpoints:**
```bash
# Get JWT token from Overlord
TOKEN="your-jwt-token-here"

# Test companies endpoint
curl https://crm-api.theoverlord.ai/api/v1/a-crm/companies \
  -H "Authorization: Bearer $TOKEN"
```

**Check Logs:**
```bash
# View recent logs
aws logs tail /aws/ascendore-crm/prod/api \
    --follow \
    --region eu-north-1

# Filter for errors
aws logs filter-log-events \
    --log-group-name /aws/ascendore-crm/prod/api \
    --filter-pattern "ERROR" \
    --region eu-north-1
```

**Check ECS Service Status:**
```bash
aws ecs describe-services \
    --cluster ascendore-crm-cluster-prod \
    --services AscendoreCRM-Service \
    --region eu-north-1
```

### 5. Update DNS (if needed)

If using a custom domain or different subdomain, update Route 53:
```bash
# Get load balancer DNS name
LB_DNS=$(aws cloudformation describe-stacks \
    --stack-name AscendoreCRM-prod \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' \
    --output text \
    --region eu-north-1)

# Create or update Route 53 record
aws route53 change-resource-record-sets \
    --hosted-zone-id YOUR_HOSTED_ZONE_ID \
    --change-batch file://dns-change.json
```

## Monitoring & Observability

### CloudWatch Metrics

Monitor the following metrics:
- ECS Service CPU Utilization
- ECS Service Memory Utilization
- Application Load Balancer Target Response Time
- Application Load Balancer Healthy Host Count
- Application Load Balancer Request Count

### CloudWatch Alarms

Set up alarms for:
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
    --alarm-name ascendore-crm-high-error-rate \
    --alarm-description "Alert on high error rate" \
    --metric-name HTTPCode_Target_5XX_Count \
    --namespace AWS/ApplicationELB \
    --statistic Sum \
    --period 300 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --region eu-north-1

# Service unhealthy alarm
aws cloudwatch put-metric-alarm \
    --alarm-name ascendore-crm-service-unhealthy \
    --alarm-description "Alert when service is unhealthy" \
    --metric-name HealthyHostCount \
    --namespace AWS/ApplicationELB \
    --statistic Average \
    --period 60 \
    --threshold 1 \
    --comparison-operator LessThanThreshold \
    --evaluation-periods 2 \
    --region eu-north-1
```

### Log Insights Queries

Useful CloudWatch Logs Insights queries:

**Error Analysis:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
```

**API Response Times:**
```
fields @timestamp, duration
| filter @type = "report"
| stats avg(duration), max(duration), min(duration) by bin(5m)
```

**Request Count:**
```
fields @timestamp
| filter @message like /GET|POST|PUT|DELETE/
| stats count() by bin(5m)
```

## Scaling Configuration

### Manual Scaling

Update desired task count:
```bash
aws ecs update-service \
    --cluster ascendore-crm-cluster-prod \
    --service AscendoreCRM-Service \
    --desired-count 2 \
    --region eu-north-1
```

### Auto-Scaling

Set up auto-scaling based on CPU:
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/ascendore-crm-cluster-prod/AscendoreCRM-Service \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 1 \
    --max-capacity 5 \
    --region eu-north-1

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --resource-id service/ascendore-crm-cluster-prod/AscendoreCRM-Service \
    --scalable-dimension ecs:service:DesiredCount \
    --policy-name cpu-scaling \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration \
    "PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},TargetValue=70.0" \
    --region eu-north-1
```

## Troubleshooting

### Service Won't Start

1. Check ECS service events:
```bash
aws ecs describe-services \
    --cluster ascendore-crm-cluster-prod \
    --services AscendoreCRM-Service \
    --query 'services[0].events[0:10]' \
    --region eu-north-1
```

2. Check task logs:
```bash
aws logs tail /aws/ascendore-crm/prod/api --follow --region eu-north-1
```

3. Verify secrets are accessible:
```bash
aws secretsmanager get-secret-value \
    --secret-id ascendore-crm/prod/anthropic-api-key \
    --region eu-north-1
```

### Database Connection Issues

1. Verify security group rules allow traffic from ECS service
2. Check database endpoint is correct
3. Verify database credentials in secrets manager
4. Test connectivity from ECS task:
```bash
# Get into ECS task
aws ecs execute-command \
    --cluster ascendore-crm-cluster-prod \
    --task TASK_ARN \
    --container ascendore-crm \
    --interactive \
    --command "/bin/sh" \
    --region eu-north-1

# Test database connection
telnet overlordprodstack-overlorddb2e4d21b1-u4k5jqmkorpg.c7qieucq8pn1.rds.amazonaws.com 5432
```

### High Costs

1. Review CloudWatch Logs retention (currently 14 days)
2. Check ECS task count
3. Review Application Load Balancer usage
4. Monitor data transfer costs

Optimize costs:
```bash
# Reduce log retention
aws logs put-retention-policy \
    --log-group-name /aws/ascendore-crm/prod/api \
    --retention-in-days 7 \
    --region eu-north-1

# Scale down to 1 task if traffic is low
aws ecs update-service \
    --cluster ascendore-crm-cluster-prod \
    --service AscendoreCRM-Service \
    --desired-count 1 \
    --region eu-north-1
```

## Updating the Application

### Deploy New Version

```bash
cd C:\Users\AndrewSmart\Claude_Projects\AscendoreCRM\infrastructure

# Build and deploy
export CDK_DEFAULT_REGION=eu-north-1
export CDK_DEFAULT_ACCOUNT=252321108661
npx cdk deploy \
    --context environment=prod \
    --context domainName=theoverlord.ai \
    --require-approval never
```

### Quick Code Update (without CDK)

```bash
# Build new Docker image
docker build -t ascendore-crm:latest .

# Tag for ECR
ECR_URI=$(aws ecr describe-repositories \
    --repository-names cdk-hnb659fds-container-assets-252321108661-eu-north-1 \
    --query 'repositories[0].repositoryUri' \
    --output text \
    --region eu-north-1)

docker tag ascendore-crm:latest $ECR_URI:latest

# Push to ECR
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin $ECR_URI
docker push $ECR_URI:latest

# Force new deployment
aws ecs update-service \
    --cluster ascendore-crm-cluster-prod \
    --service AscendoreCRM-Service \
    --force-new-deployment \
    --region eu-north-1
```

## Maintenance

### Regular Tasks

1. **Weekly**: Review CloudWatch metrics and logs
2. **Monthly**: Review and optimize costs
3. **Quarterly**: Update dependencies and security patches
4. **As needed**: Rotate secrets

### Backup & Recovery

Database backups are handled by Overlord's RDS automated backups (7-day retention).

To restore:
```bash
# List available snapshots
aws rds describe-db-snapshots \
    --db-instance-identifier overlordprodstack-overlorddb2e4d21b1-u4k5jqmkorpg \
    --region eu-north-1

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier overlord-restored \
    --db-snapshot-identifier snapshot-name \
    --region eu-north-1
```

## Security Best Practices

1. ✅ Secrets stored in AWS Secrets Manager
2. ✅ HTTPS-only communication
3. ✅ Non-root container execution
4. ✅ IAM roles with least privilege
5. ✅ VPC isolation with security groups
6. ⚠️ **TODO**: Enable AWS WAF for DDoS protection
7. ⚠️ **TODO**: Enable AWS Shield Standard
8. ⚠️ **TODO**: Configure rate limiting

## Support & Documentation

- **Deployment Guide**: DEPLOYMENT.md
- **API Documentation**: README.md
- **CloudWatch Logs**: `/aws/ascendore-crm/prod/api`
- **Stack Name**: AscendoreCRM-prod
- **Region**: eu-north-1

## Quick Reference Commands

```bash
# View logs
aws logs tail /aws/ascendore-crm/prod/api --follow --region eu-north-1

# Restart service
aws ecs update-service --cluster ascendore-crm-cluster-prod --service AscendoreCRM-Service --force-new-deployment --region eu-north-1

# Scale service
aws ecs update-service --cluster ascendore-crm-cluster-prod --service AscendoreCRM-Service --desired-count 2 --region eu-north-1

# Update secret
aws secretsmanager update-secret --secret-id ascendore-crm/prod/anthropic-api-key --secret-string "NEW_KEY" --region eu-north-1

# Check service status
aws ecs describe-services --cluster ascendore-crm-cluster-prod --services AscendoreCRM-Service --region eu-north-1

# View stack outputs
aws cloudformation describe-stacks --stack-name AscendoreCRM-prod --region eu-north-1
```

---

**Last Updated**: 2025-11-20
**Version**: 1.0
**Contact**: AscendoreCRM Team
