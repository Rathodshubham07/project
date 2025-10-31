# N8N Integration Guide

This document explains how to integrate your college attendance system with N8N for automated attendance management.

## Overview

The attendance system provides three API endpoints for N8N integration:

1. **Webhook Endpoint** - Receive attendance data from N8N
2. **Get Students Endpoint** - Fetch all students for N8N workflows
3. **Get Classes Endpoint** - Fetch all classes for N8N workflows

## API Endpoints

### 1. Attendance Webhook Endpoint

**URL:** `https://your-domain.com/api/n8n/webhook`

**Method:** POST

**Purpose:** Receive attendance data from N8N and save it to the database

**Request Payload:**
\`\`\`json
{
  "classId": "uuid-of-class",
  "date": "2024-01-15",
  "students": [
    {
      "rollNumber": "CS-001",
      "status": "present"
    },
    {
      "rollNumber": "CS-002",
      "status": "absent"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Attendance recorded for 2 students",
  "recordsCount": 2
}
\`\`\`

### 2. Get Students Endpoint

**URL:** `https://your-domain.com/api/n8n/get-students`

**Method:** GET

**Purpose:** Fetch all students in the system

**Response:**
\`\`\`json
{
  "success": true,
  "count": 50,
  "students": [
    {
      "id": "uuid",
      "rollNumber": "CS-001",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Computer Science",
      "semester": 3
    }
  ]
}
\`\`\`

### 3. Get Classes Endpoint

**URL:** `https://your-domain.com/api/n8n/get-classes`

**Method:** GET

**Purpose:** Fetch all classes in the system

**Response:**
\`\`\`json
{
  "success": true,
  "count": 10,
  "classes": [
    {
      "id": "uuid",
      "className": "CS-101",
      "subject": "Data Structures",
      "semester": 3,
      "schedule": "Mon, Wed 10:00 AM",
      "teacher": {
        "id": "uuid",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
\`\`\`

## N8N Workflow Setup

### Step 1: Create a New Workflow

1. Open N8N and create a new workflow
2. Add a "Webhook" trigger node
3. Set the webhook URL to: `https://your-domain.com/api/n8n/webhook`
4. Set the method to POST

### Step 2: Fetch Students

1. Add an "HTTP Request" node
2. Set URL to: `https://your-domain.com/api/n8n/get-students`
3. Set method to GET
4. This will fetch all students in the system

### Step 3: Process Attendance Data

1. Add a "Function" node to process the attendance data
2. Map the student roll numbers to attendance status
3. Format the data according to the webhook payload structure

### Step 4: Send to Webhook

1. Add another "HTTP Request" node
2. Set URL to: `https://your-domain.com/api/n8n/webhook`
3. Set method to POST
4. Set the body to the formatted attendance data

### Example N8N Workflow

\`\`\`
Webhook Trigger
    ↓
HTTP Request (Get Students)
    ↓
Function (Process Data)
    ↓
HTTP Request (Send to Webhook)
    ↓
Webhook Response
\`\`\`

## Testing the Integration

### Test the Webhook Endpoint

\`\`\`bash
curl -X POST https://your-domain.com/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "your-class-uuid",
    "date": "2024-01-15",
    "students": [
      {"rollNumber": "CS-001", "status": "present"},
      {"rollNumber": "CS-002", "status": "absent"}
    ]
  }'
\`\`\`

### Test the Get Students Endpoint

\`\`\`bash
curl https://your-domain.com/api/n8n/get-students
\`\`\`

### Test the Get Classes Endpoint

\`\`\`bash
curl https://your-domain.com/api/n8n/get-classes
\`\`\`

## Security Considerations

1. **Authentication**: Consider adding API key authentication to the endpoints
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Validation**: Always validate the incoming data
4. **HTTPS**: Use HTTPS for all API calls
5. **CORS**: Configure CORS if needed for cross-origin requests

## Troubleshooting

### Webhook Not Receiving Data

1. Check that the webhook URL is correct
2. Verify that the N8N instance can reach your server
3. Check the N8N logs for errors
4. Ensure the payload format matches the expected structure

### Students Not Found

1. Verify that students exist in the database
2. Check that the roll numbers match exactly
3. Ensure the student records have the correct user associations

### Attendance Not Saving

1. Check the database connection
2. Verify that the class ID exists
3. Ensure the student IDs are correct
4. Check for any RLS policy violations

## Advanced Features

### Bulk Attendance Import

You can use N8N to:
- Read attendance data from external sources (CSV, Excel, APIs)
- Transform and validate the data
- Send it to the webhook endpoint
- Log the results

### Automated Attendance Reports

Create N8N workflows to:
- Generate daily attendance reports
- Send notifications for low attendance
- Export attendance data to external systems
- Trigger alerts for absent students

### Integration with External Systems

Connect with:
- Email systems for notifications
- SMS gateways for alerts
- Google Sheets for data storage
- Slack for team notifications
