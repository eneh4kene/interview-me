# AI Apply System SOP

## 📋 Overview

This SOP covers the operation and maintenance of the AI Apply system, which uses n8n automation to automatically apply to jobs on behalf of clients.

## 🎯 Purpose

To provide standardized procedures for managing the AI-powered job application system, including setup, monitoring, troubleshooting, and optimization.

## 🏗️ System Architecture

### **Components**
- **n8n Automation Platform**: Workflow orchestration engine
- **API Webhook**: Triggers AI apply requests from the main application
- **Job Aggregators**: Adzuna, Jooble for job listings
- **Client Data**: Resumes, preferences, and application history
- **Application Tracking**: Database for tracking application status

### **Data Flow**
1. Client/Worker triggers AI Apply from dashboard
2. API sends webhook to n8n with client data
3. n8n workflow processes job preferences
4. AI applies to matching jobs
5. Results tracked in database
6. Status updates sent back to application

## 🔧 Setup Procedures

### **Step 1: n8n Installation**
```bash
# Start n8n container
docker-compose -f docker-compose.yml up -d n8n

# Verify n8n is running
docker ps | grep n8n

# Access n8n web interface
# URL: http://localhost:5678
# Username: admin
# Password: admin
```

### **Step 2: Environment Configuration**
```bash
# Set n8n environment variables
N8N_AI_APPLY_WEBHOOK_URL=http://localhost:5678/webhook/ai-apply
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin
```

### **Step 3: Webhook Setup**
1. Access n8n web interface
2. Create new workflow
3. Add webhook trigger node
4. Configure webhook URL: `/webhook/ai-apply`
5. Set authentication if required

### **Step 4: Workflow Configuration**
```javascript
// Example webhook payload structure
{
  "event": "ai_apply_requested",
  "client": {
    "id": "client_id",
    "name": "Client Name",
    "email": "client@email.com",
    "phone": "+1234567890",
    "linkedinUrl": "https://linkedin.com/in/client"
  },
  "context": {
    "workerId": "worker_id",
    "jobPreferenceIds": ["pref1", "pref2"],
    "resumeId": "resume_id",
    "note": "Optional note",
    "requestedAt": "2024-01-15T10:00:00Z"
  }
}
```

## 📋 Daily Operations

### **Morning Checks**
```bash
# Check n8n container status
docker ps | grep n8n

# Check n8n logs
docker logs interviewsfirst-n8n --tail 50

# Verify webhook endpoint
curl -X POST http://localhost:5678/webhook/ai-apply \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```

### **Monitor Application Queue**
1. Access n8n dashboard
2. Check workflow execution history
3. Review success/failure rates
4. Monitor processing times

### **Review Application Results**
```sql
-- Check recent applications
SELECT 
  client_id,
  job_title,
  company_name,
  status,
  created_at
FROM applications 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## 🔍 Monitoring & Alerting

### **Key Metrics to Track**
- **Application Success Rate**: Target > 80%
- **Processing Time**: Target < 5 minutes per application
- **Error Rate**: Target < 5%
- **Queue Length**: Monitor for bottlenecks

### **Health Checks**
```bash
# n8n health check
curl http://localhost:5678/healthz

# Webhook availability
curl -X POST http://localhost:5678/webhook/ai-apply \
  -H "Content-Type: application/json" \
  -d '{"health_check": true}'

# Database connection
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "SELECT COUNT(*) FROM applications WHERE created_at >= NOW() - INTERVAL '1 hour';"
```

### **Alerting Setup**
```bash
# Monitor n8n container
docker events --filter container=interviewsfirst-n8n

# Monitor application rate
# Set up alerts for:
# - No applications in last hour
# - Error rate > 10%
# - Processing time > 10 minutes
```

## 🚨 Troubleshooting

### **Common Issues**

#### **n8n Container Not Starting**
```bash
# Check container logs
docker logs interviewsfirst-n8n

# Check port conflicts
lsof -i :5678

# Restart container
docker-compose -f docker-compose.yml restart n8n
```

#### **Webhook Not Receiving Requests**
```bash
# Check webhook URL configuration
echo $N8N_AI_APPLY_WEBHOOK_URL

# Test webhook manually
curl -X POST http://localhost:5678/webhook/ai-apply \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check n8n workflow status
# Access n8n UI and verify workflow is active
```

#### **High Error Rate**
```bash
# Check recent errors
docker logs interviewsfirst-n8n --tail 100 | grep ERROR

# Check application database
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "SELECT status, COUNT(*) FROM applications WHERE created_at >= NOW() - INTERVAL '1 hour' GROUP BY status;"
```

#### **Slow Processing**
```bash
# Check n8n resource usage
docker stats interviewsfirst-n8n

# Check database performance
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "SELECT COUNT(*) FROM applications WHERE status = 'processing';"
```

### **Recovery Procedures**

#### **n8n Workflow Reset**
1. Access n8n web interface
2. Stop the workflow
3. Clear execution history
4. Restart the workflow
5. Test with sample data

#### **Database Recovery**
```bash
# Backup current data
docker exec -it interviewsfirst-postgres pg_dump -U postgres interviewsfirst > backup.sql

# Reset application status if needed
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "UPDATE applications SET status = 'pending' WHERE status = 'processing';"
```

## 📊 Performance Optimization

### **Workflow Optimization**
1. **Parallel Processing**: Configure multiple job searches to run in parallel
2. **Batch Processing**: Group similar applications together
3. **Caching**: Cache job search results to reduce API calls
4. **Rate Limiting**: Respect job board API limits

### **Resource Management**
```bash
# Monitor resource usage
docker stats interviewsfirst-n8n

# Adjust container resources if needed
# Edit docker-compose.yml to add memory/CPU limits
```

### **Database Optimization**
```sql
-- Create indexes for better performance
CREATE INDEX idx_applications_client_id ON applications(client_id);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_status ON applications(status);
```

## 🔒 Security Considerations

### **Access Control**
- **n8n Authentication**: Ensure basic auth is enabled
- **Webhook Security**: Use HTTPS in production
- **API Keys**: Rotate job aggregator API keys regularly
- **Database Access**: Limit database access to necessary users only

### **Data Protection**
- **Client Data**: Ensure PII is handled securely
- **Resume Storage**: Secure file storage for resumes
- **Application History**: Encrypt sensitive application data
- **Audit Logging**: Log all AI apply activities

## 📈 Analytics & Reporting

### **Daily Reports**
```sql
-- Daily application summary
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_applications,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_processing_time_minutes
FROM applications 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at);
```

### **Weekly Reports**
```sql
-- Weekly performance metrics
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_applications,
  COUNT(DISTINCT client_id) as unique_clients,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_applications,
  ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM applications 
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```

## 🔄 Maintenance Procedures

### **Weekly Maintenance**
1. **Review Error Logs**: Analyze error patterns
2. **Update Workflows**: Optimize based on performance data
3. **Clean Old Data**: Remove old application records
4. **Backup Configuration**: Export n8n workflows

### **Monthly Maintenance**
1. **Performance Review**: Analyze processing times and success rates
2. **Security Audit**: Review access controls and API keys
3. **Capacity Planning**: Assess resource usage and scaling needs
4. **Workflow Updates**: Implement improvements based on analytics

## 📞 Support & Escalation

### **Level 1 Support**
- **Basic Troubleshooting**: Container restarts, webhook testing
- **Daily Monitoring**: Health checks and basic metrics
- **Documentation**: Update procedures and troubleshooting guides

### **Level 2 Support**
- **Workflow Debugging**: Complex n8n workflow issues
- **Performance Optimization**: Database and system optimization
- **Security Issues**: Authentication and access control problems

### **Level 3 Support**
- **System Architecture**: Major system changes and improvements
- **Integration Issues**: Job aggregator API problems
- **Business Logic**: AI application strategy and optimization

### **Emergency Contacts**
- **System Administrator**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **AI/ML Specialist**: [Contact Info]

## 📋 Checklist

### **Daily Operations**
- [ ] Check n8n container status
- [ ] Review application success rate
- [ ] Monitor error logs
- [ ] Verify webhook functionality
- [ ] Check processing queue

### **Weekly Operations**
- [ ] Generate performance reports
- [ ] Review and optimize workflows
- [ ] Update documentation
- [ ] Backup configurations
- [ ] Security review

### **Monthly Operations**
- [ ] Comprehensive performance analysis
- [ ] Security audit
- [ ] Capacity planning
- [ ] Workflow optimization
- [ ] Training and knowledge transfer

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date]  
**Author**: [Name]
