# Client Onboarding SOP

## 📋 Overview

This SOP outlines the complete process for onboarding new clients to the InterviewsFirst platform, from initial contact to full account activation.

## 🎯 Purpose

To ensure consistent, efficient, and professional client onboarding that maximizes client success and platform adoption.

## 👥 Client Types

### **Individual Job Seekers**
- Direct clients seeking job placement assistance
- Pay £10 per interview accepted
- Full access to platform features

### **Corporate Clients**
- Companies seeking candidates for multiple positions
- Bulk pricing arrangements
- Dedicated account management

## 📋 Pre-Onboarding Checklist

### **Required Information**
- [ ] Full name and contact details
- [ ] Professional background and experience
- [ ] Target job roles and industries
- [ ] Geographic preferences
- [ ] Salary expectations
- [ ] Availability for interviews
- [ ] Resume/CV (if available)
- [ ] LinkedIn profile (if available)

### **Platform Requirements**
- [ ] Valid email address
- [ ] Phone number for notifications
- [ ] Payment method setup
- [ ] Agreement to terms of service
- [ ] Privacy policy acknowledgment

## 🔧 Step-by-Step Onboarding Process

### **Step 1: Initial Contact & Qualification**

#### **Lead Capture**
```bash
# Record lead information in CRM
Client Name: [Full Name]
Email: [Email Address]
Phone: [Phone Number]
Source: [How they found us]
Initial Interest: [What they're looking for]
```

#### **Qualification Questions**
1. **What type of role are you seeking?**
   - Full-time, part-time, contract, internship
   - Industry and specific job titles

2. **What is your experience level?**
   - Entry-level, mid-career, senior, executive
   - Years of experience in field

3. **What is your geographic preference?**
   - Remote, hybrid, on-site
   - Specific cities or regions

4. **What is your salary expectation?**
   - Minimum and target salary ranges
   - Currency preference

5. **What is your timeline?**
   - Immediate, 1-3 months, 3-6 months
   - Urgency level

### **Step 2: Account Creation**

#### **Create Client Profile**
```sql
-- Insert new client record
INSERT INTO clients (
    id,
    worker_id,
    name,
    email,
    phone,
    linkedin_url,
    status,
    payment_status,
    total_interviews,
    total_paid,
    is_new,
    assigned_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'worker_id',
    'Client Name',
    'client@email.com',
    '+1234567890',
    'https://linkedin.com/in/client',
    'active',
    'pending',
    0,
    0,
    true,
    NOW(),
    NOW(),
    NOW()
);
```

#### **Set Up Authentication**
```bash
# Generate client credentials
# Username: client email
# Password: temporary password (client will change)
# Send welcome email with login instructions
```

### **Step 3: Profile Setup**

#### **Complete Client Profile**
1. **Personal Information**
   - Full name and contact details
   - Professional summary
   - Current employment status

2. **Professional Background**
   - Work experience
   - Education and certifications
   - Skills and competencies

3. **Job Preferences**
   - Target roles and industries
   - Geographic preferences
   - Salary expectations
   - Work type preferences (remote, hybrid, on-site)

4. **Resume Upload**
   - Upload current resume/CV
   - Set as default resume
   - Option to upload multiple versions

### **Step 4: Job Preference Configuration**

#### **Create Job Preferences**
```sql
-- Insert job preference record
INSERT INTO job_preferences (
    id,
    client_id,
    title,
    company,
    location,
    work_type,
    salary_range_min,
    salary_range_max,
    visa_sponsorship,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'client_id',
    'Software Engineer',
    NULL,
    'London, UK',
    'full_time',
    50000,
    80000,
    false,
    'active',
    NOW(),
    NOW()
);
```

#### **Configure Search Parameters**
1. **Job Titles**: Primary and alternative titles
2. **Companies**: Target companies (optional)
3. **Locations**: Preferred cities/regions
4. **Salary Range**: Minimum and maximum expectations
5. **Work Type**: Full-time, part-time, contract
6. **Visa Sponsorship**: Required or not
7. **Remote Work**: Remote, hybrid, or on-site preference

### **Step 5: Resume Management**

#### **Resume Upload Process**
```bash
# Acceptable file formats: PDF, DOC, DOCX
# Maximum file size: 10MB
# Multiple resumes allowed per client

# Upload resume to secure storage
# Generate unique filename
# Store metadata in database
```

#### **Resume Optimization**
1. **Review and Edit**
   - Check for formatting issues
   - Ensure contact information is current
   - Verify professional summary

2. **Set Default Resume**
   - Choose primary resume for applications
   - Configure for different job types if needed

3. **Version Management**
   - Create specialized versions for different roles
   - Label resumes appropriately

### **Step 6: Platform Orientation**

#### **Dashboard Walkthrough**
1. **Overview Dashboard**
   - Client statistics and metrics
   - Recent activity and updates
   - Quick action buttons

2. **Profile Management**
   - How to update personal information
   - How to manage job preferences
   - How to upload/edit resumes

3. **Job Search Features**
   - How to search for jobs
   - How to filter and sort results
   - How to save interesting positions

4. **Application Tracking**
   - How to view application status
   - How to track interview progress
   - How to manage interview scheduling

5. **AI Apply System**
   - How the AI apply system works
   - How to trigger automated applications
   - How to monitor AI apply progress

### **Step 7: Payment Setup**

#### **Payment Method Configuration**
```bash
# Set up Stripe payment method
# Configure for £10 per interview model
# Test payment processing
# Verify webhook configuration
```

#### **Payment Terms Explanation**
1. **£10 Per Interview Model**
   - No upfront costs
   - Pay only when interview is accepted
   - Transparent pricing structure

2. **Payment Process**
   - Automatic billing when interview accepted
   - Payment confirmation emails
   - Invoice generation

3. **Refund Policy**
   - Conditions for refunds
   - Dispute resolution process

### **Step 8: Communication Setup**

#### **Notification Preferences**
```sql
-- Configure notification settings
INSERT INTO notification_preferences (
    client_id,
    email_notifications,
    sms_notifications,
    interview_reminders,
    application_updates,
    payment_notifications
) VALUES (
    'client_id',
    true,
    true,
    true,
    true,
    true
);
```

#### **Communication Channels**
1. **Email Notifications**
   - Interview invitations
   - Application status updates
   - Payment confirmations
   - Platform updates

2. **SMS Notifications**
   - Interview reminders
   - Urgent updates
   - Payment confirmations

3. **In-App Notifications**
   - Real-time updates
   - Dashboard notifications
   - Activity feed

## 📊 Onboarding Metrics

### **Key Performance Indicators**
- **Onboarding Completion Rate**: Target > 90%
- **Time to First Application**: Target < 48 hours
- **Profile Completion Rate**: Target > 95%
- **Client Satisfaction Score**: Target > 4.5/5

### **Tracking Metrics**
```sql
-- Onboarding completion tracking
SELECT 
    client_id,
    created_at,
    profile_completed_at,
    first_application_at,
    DATEDIFF(hour, created_at, profile_completed_at) as hours_to_complete,
    DATEDIFF(hour, created_at, first_application_at) as hours_to_first_application
FROM clients 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Profile Completion Issues**
```bash
# Check incomplete profiles
SELECT 
    id, name, email, 
    CASE 
        WHEN linkedin_url IS NULL THEN 'Missing LinkedIn'
        WHEN phone IS NULL THEN 'Missing Phone'
        ELSE 'Complete'
    END as status
FROM clients 
WHERE status = 'active' 
AND (linkedin_url IS NULL OR phone IS NULL);
```

#### **Resume Upload Issues**
```bash
# Check resume upload status
SELECT 
    c.name,
    COUNT(r.id) as resume_count,
    MAX(r.created_at) as last_upload
FROM clients c
LEFT JOIN resumes r ON c.id = r.client_id
WHERE c.status = 'active'
GROUP BY c.id, c.name
HAVING COUNT(r.id) = 0;
```

#### **Payment Setup Issues**
```bash
# Check payment method status
SELECT 
    c.name,
    c.email,
    c.payment_status,
    CASE 
        WHEN c.payment_status = 'pending' THEN 'Needs Payment Setup'
        ELSE 'Payment Configured'
    END as payment_status_detail
FROM clients c
WHERE c.status = 'active';
```

### **Recovery Procedures**

#### **Incomplete Onboarding Recovery**
1. **Identify Stuck Clients**
   - Check onboarding progress
   - Identify missing information
   - Contact clients for completion

2. **Re-engagement Process**
   - Send reminder emails
   - Offer assistance calls
   - Provide step-by-step guidance

3. **Escalation Process**
   - Assign to senior team member
   - Schedule consultation call
   - Provide personalized support

## 📈 Success Optimization

### **Onboarding Optimization**
1. **Streamline Process**
   - Reduce required fields
   - Auto-fill information where possible
   - Provide clear progress indicators

2. **Improve Communication**
   - Send welcome series emails
   - Provide video tutorials
   - Offer live onboarding sessions

3. **Gamify Experience**
   - Progress badges
   - Completion rewards
   - Achievement tracking

### **Client Success Metrics**
```sql
-- Client success tracking
SELECT 
    c.name,
    c.created_at,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'interviewing' THEN 1 END) as interviews,
    COUNT(CASE WHEN a.status = 'offered' THEN 1 END) as offers,
    c.total_paid
FROM clients c
LEFT JOIN applications a ON c.id = a.client_id
WHERE c.created_at >= NOW() - INTERVAL '90 days'
GROUP BY c.id, c.name, c.created_at, c.total_paid
ORDER BY c.created_at DESC;
```

## 🔄 Maintenance Procedures

### **Weekly Reviews**
1. **Onboarding Performance**
   - Review completion rates
   - Identify bottlenecks
   - Optimize process flow

2. **Client Feedback**
   - Review satisfaction scores
   - Address common issues
   - Update procedures

3. **System Updates**
   - Test new features
   - Update documentation
   - Train team members

### **Monthly Reviews**
1. **Process Optimization**
   - Analyze onboarding data
   - Identify improvement opportunities
   - Implement changes

2. **Client Success Analysis**
   - Review success rates
   - Identify success factors
   - Optimize for better outcomes

## 📞 Support & Escalation

### **Level 1 Support**
- **Basic Onboarding**: Standard onboarding procedures
- **Profile Setup**: Help with profile completion
- **Technical Issues**: Basic platform navigation

### **Level 2 Support**
- **Complex Profiles**: Specialized career guidance
- **Technical Problems**: Platform issues and bugs
- **Payment Issues**: Payment processing problems

### **Level 3 Support**
- **Strategic Guidance**: Career planning and strategy
- **System Issues**: Platform architecture problems
- **Business Development**: Corporate client onboarding

### **Emergency Contacts**
- **Onboarding Manager**: [Contact Info]
- **Technical Support**: [Contact Info]
- **Client Success Manager**: [Contact Info]

## 📋 Checklist

### **Initial Contact**
- [ ] Capture lead information
- [ ] Qualify client needs
- [ ] Schedule onboarding call
- [ ] Send welcome materials

### **Account Setup**
- [ ] Create client profile
- [ ] Set up authentication
- [ ] Configure notifications
- [ ] Set up payment method

### **Profile Completion**
- [ ] Complete personal information
- [ ] Upload resume/CV
- [ ] Configure job preferences
- [ ] Set up communication preferences

### **Platform Orientation**
- [ ] Dashboard walkthrough
- [ ] Feature demonstration
- [ ] Q&A session
- [ ] Follow-up scheduling

### **Post-Onboarding**
- [ ] Send welcome email
- [ ] Schedule follow-up call
- [ ] Monitor first week activity
- [ ] Collect feedback

---

**Document Version**: 1.0  
**Last Updated**: [Date]  
**Next Review**: [Date]  
**Author**: [Name]
