# Job Aggregation System SOP

## 📋 Overview

This SOP covers the operation and maintenance of the job aggregation system, which fetches job listings from multiple sources (Adzuna, Jooble) and provides a unified search interface.

## 🎯 Purpose

To ensure reliable and efficient job data collection from multiple aggregators, with proper caching, deduplication, and error handling.

## 🏗️ System Architecture

### **Supported Aggregators**
- **Adzuna**: UK job listings with comprehensive metadata
- **Jooble**: Global job search with location-based filtering
- **Future**: Indeed, ZipRecruiter, Workable, Greenhouse

### **System Components**
- **Job Aggregation Service**: Core service for fetching and processing jobs
- **Redis Cache**: 30-minute TTL for search results
- **PostgreSQL Database**: Job storage with 30-day TTL
- **Rate Limiting**: Respects API limits per aggregator
- **Deduplication**: Smart hashing to prevent duplicates

## 🔧 Setup Procedures

### **Step 1: API Key Configuration**
```bash
# Set aggregator API keys in environment
export ADZUNA_APP_ID="your_adzuna_app_id"
export ADZUNA_APP_KEY="your_adzuna_app_key"
export JOOBLE_API_KEY="your_jooble_api_key"

# Verify configuration
echo "Adzuna App ID: $ADZUNA_APP_ID"
echo "Adzuna App Key: $ADZUNA_APP_KEY"
echo "Jooble API Key: $JOOBLE_API_KEY"
```

### **Step 2: Rate Limit Configuration**
```bash
# Set rate limits (requests per minute)
export ADZUNA_RATE_LIMIT_PER_MINUTE=25
export JOOBLE_RATE_LIMIT_PER_MINUTE=60

# Cache settings
export JOB_CACHE_TTL_SECONDS=1800  # 30 minutes
export JOB_STORAGE_TTL_DAYS=30     # 30 days
```

### **Step 3: Database Setup**
```sql
-- Create job storage table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(255),
    description_snippet TEXT,
    source VARCHAR(50) NOT NULL,
    posted_date TIMESTAMP,
    apply_url TEXT,
    job_type VARCHAR(50),
    work_location VARCHAR(50),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10),
    requirements TEXT[],
    benefits TEXT[],
    auto_apply_status VARCHAR(50) DEFAULT 'pending_review',
    auto_apply_notes TEXT,
    external_id VARCHAR(255),
    job_hash VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_source ON jobs(source);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_auto_apply_status ON jobs(auto_apply_status);
CREATE INDEX idx_jobs_job_hash ON jobs(job_hash);
```

## 📋 Daily Operations

### **Morning Health Checks**
```bash
# Check aggregator health
curl -X GET "http://localhost:3001/api/jobs/health/aggregators"

# Check recent job counts
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "SELECT source, COUNT(*) FROM jobs WHERE created_at >= NOW() - INTERVAL '24 hours' GROUP BY source;"

# Check cache status
docker exec -it interviewsfirst-redis redis-cli info memory
```

### **Monitor Job Collection**
```bash
# Check job collection metrics
curl -X GET "http://localhost:3001/api/jobs/stats/aggregators"

# Monitor error rates
docker logs interviewsfirst-api --tail 100 | grep -i "aggregator\|error"
```

### **Review Search Performance**
```bash
# Test search functionality
curl -X GET "http://localhost:3001/api/jobs/search?keywords=software&location=london&limit=10"

# Check search response times
time curl -X GET "http://localhost:3001/api/jobs/search?keywords=developer"
```

## 🔍 Monitoring & Alerting

### **Key Metrics to Track**
- **Job Collection Rate**: Target > 1000 jobs/day
- **Search Response Time**: Target < 2 seconds
- **Cache Hit Rate**: Target > 80%
- **Error Rate**: Target < 5%
- **Deduplication Rate**: Monitor for effectiveness

### **Health Checks**
```bash
# Aggregator health check
curl -X GET "http://localhost:3001/api/jobs/health/aggregators"

# Expected response:
{
  "adzuna": {
    "status": "healthy",
    "lastCheck": "2024-01-15T10:00:00Z",
    "jobsCollected": 150
  },
  "jooble": {
    "status": "healthy", 
    "lastCheck": "2024-01-15T10:00:00Z",
    "jobsCollected": 200
  }
}
```

### **Alerting Setup**
```bash
# Monitor job collection rate
# Alert if < 100 jobs collected in last hour

# Monitor error rates
# Alert if error rate > 10%

# Monitor response times
# Alert if search response time > 5 seconds
```

## 🚨 Troubleshooting

### **Common Issues**

#### **API Key Issues**
```bash
# Check API key configuration
echo "Adzuna App ID: $ADZUNA_APP_ID"
echo "Adzuna App Key: $ADZUNA_APP_KEY"
echo "Jooble API Key: $JOOBLE_API_KEY"

# Test API keys directly
curl -X GET "https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=$ADZUNA_APP_ID&app_key=$ADZUNA_APP_KEY&results_per_page=1"
```

#### **Rate Limiting Issues**
```bash
# Check rate limit status
docker exec -it interviewsfirst-redis redis-cli keys "*rate_limit*"

# Reset rate limits if needed
docker exec -it interviewsfirst-redis redis-cli del "rate_limit:adzuna"
docker exec -it interviewsfirst-redis redis-cli del "rate_limit:jooble"
```

#### **Cache Issues**
```bash
# Check cache status
docker exec -it interviewsfirst-redis redis-cli info memory

# Clear cache if needed
docker exec -it interviewsfirst-redis redis-cli flushdb

# Check cache keys
docker exec -it interviewsfirst-redis redis-cli keys "*job_search*"
```

#### **Database Issues**
```bash
# Check database connection
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst -c "SELECT COUNT(*) FROM jobs;"

# Check for duplicate jobs
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "SELECT job_hash, COUNT(*) FROM jobs GROUP BY job_hash HAVING COUNT(*) > 1;"
```

### **Recovery Procedures**

#### **Aggregator Failure Recovery**
```bash
# Restart aggregation service
docker-compose -f docker-compose.dev.yml restart api

# Check logs for errors
docker logs interviewsfirst-api --tail 100

# Test individual aggregators
curl -X GET "http://localhost:3001/api/jobs/health/aggregators"
```

#### **Cache Recovery**
```bash
# Clear and rebuild cache
docker exec -it interviewsfirst-redis redis-cli flushdb

# Trigger cache rebuild
curl -X GET "http://localhost:3001/api/jobs/search?keywords=test&limit=1"
```

#### **Database Recovery**
```bash
# Backup current data
docker exec -it interviewsfirst-postgres pg_dump -U postgres interviewsfirst > jobs_backup.sql

# Clean old jobs if needed
docker exec -it interviewsfirst-postgres psql -U postgres -d interviewsfirst \
  -c "DELETE FROM jobs WHERE created_at < NOW() - INTERVAL '30 days';"
```

## 📊 Performance Optimization

### **Search Optimization**
```sql
-- Create composite indexes for common searches
CREATE INDEX idx_jobs_search ON jobs(title, company, location);
CREATE INDEX idx_jobs_salary ON jobs(salary_min, salary_max);
CREATE INDEX idx_jobs_type_location ON jobs(job_type, location);

-- Analyze table statistics
ANALYZE jobs;
```

### **Cache Optimization**
```bash
# Monitor cache hit rate
docker exec -it interviewsfirst-redis redis-cli info stats | grep keyspace_hits

# Optimize cache TTL based on usage patterns
# Adjust JOB_CACHE_TTL_SECONDS in environment
```

### **Rate Limiting Optimization**
```bash
# Monitor rate limit usage
docker exec -it interviewsfirst-redis redis-cli keys "*rate_limit*"

# Adjust rate limits based on aggregator performance
# Update ADZUNA_RATE_LIMIT_PER_MINUTE and JOOBLE_RATE_LIMIT_PER_MINUTE
```

## 🔒 Security Considerations

### **API Key Management**
- **Rotation**: Rotate API keys quarterly
- **Access Control**: Limit API key access to necessary services only
- **Monitoring**: Monitor API key usage for anomalies
- **Backup**: Store API keys securely with encryption

### **Data Protection**
- **PII Handling**: Ensure no PII in job data
- **Data Retention**: Automatically delete old job data
- **Access Logging**: Log all job search activities
- **Encryption**: Encrypt sensitive data in transit and at rest

## 📈 Analytics & Reporting

### **Daily Reports**
```sql
-- Daily job collection summary
SELECT 
  DATE(created_at) as date,
  source,
  COUNT(*) as jobs_collected,
  COUNT(DISTINCT company) as unique_companies,
  AVG(salary_min) as avg_min_salary,
  AVG(salary_max) as avg_max_salary
FROM jobs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at), source
ORDER BY date DESC, source;
```

### **Weekly Reports**
```sql
-- Weekly aggregator performance
SELECT 
  DATE_TRUNC('week', created_at) as week,
  source,
  COUNT(*) as total_jobs,
  COUNT(DISTINCT company) as unique_companies,
  COUNT(DISTINCT location) as unique_locations,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('week', created_at)), 2) as percentage
FROM jobs 
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY DATE_TRUNC('week', created_at), source
ORDER BY week DESC, source;
```

### **Monthly Reports**
```sql
-- Monthly trends analysis
SELECT 
  DATE_TRUNC('month', created_at) as month,
  source,
  COUNT(*) as jobs_collected,
  COUNT(DISTINCT company) as unique_companies,
  AVG(salary_min) as avg_min_salary,
  AVG(salary_max) as avg_max_salary,
  COUNT(CASE WHEN auto_apply_status = 'eligible' THEN 1 END) as eligible_jobs
FROM jobs 
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at), source
ORDER BY month DESC, source;
```

## 🔄 Maintenance Procedures

### **Daily Maintenance**
1. **Health Checks**: Verify all aggregators are working
2. **Error Review**: Check for and resolve any errors
3. **Performance Monitoring**: Monitor search response times
4. **Cache Management**: Ensure cache is functioning properly

### **Weekly Maintenance**
1. **Performance Analysis**: Review search and collection performance
2. **Error Analysis**: Analyze error patterns and implement fixes
3. **Data Cleanup**: Remove old or duplicate job data
4. **Configuration Review**: Review and optimize settings

### **Monthly Maintenance**
1. **Comprehensive Analysis**: Full system performance review
2. **Security Audit**: Review API keys and access controls
3. **Capacity Planning**: Assess storage and performance needs
4. **Aggregator Review**: Evaluate aggregator performance and consider alternatives

## 📞 Support & Escalation

### **Level 1 Support**
- **Basic Monitoring**: Health checks and error monitoring
- **Cache Management**: Cache clearing and optimization
- **Basic Troubleshooting**: Common issues and quick fixes

### **Level 2 Support**
- **Aggregator Issues**: API problems and rate limiting
- **Performance Optimization**: Search and collection optimization
- **Database Issues**: Storage and query optimization

### **Level 3 Support**
- **System Architecture**: Major system changes and improvements
- **New Aggregators**: Integration of new job sources
- **Business Logic**: Job matching and filtering improvements

### **Emergency Contacts**
- **System Administrator**: [Contact Info]
- **DevOps Team**: [Contact Info]
- **Data Engineer**: [Contact Info]

## 📋 Checklist

### **Daily Operations**
- [ ] Check aggregator health
- [ ] Monitor job collection rate
- [ ] Review error logs
- [ ] Verify search functionality
- [ ] Check cache performance

### **Weekly Operations**
- [ ] Generate performance reports
- [ ] Review and optimize settings
- [ ] Clean old data
- [ ] Update documentation
- [ ] Security review

### **Monthly Operations**
- [ ] Comprehensive performance analysis
- [ ] Security audit
- [ ] Capacity planning
- [ ] Aggregator evaluation
- [ ] System optimization

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date]  
**Author**: [Name]
