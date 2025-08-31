import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../utils/validation';
import { authenticate, authorize } from '../middleware/auth';
import { clientAssignmentService } from '../services/clientAssignment';
import { ApiResponse, Client } from '@interview-me/types';

const N8N_WEBHOOK_URL = process.env.N8N_AI_APPLY_WEBHOOK_URL || '';
const N8N_BASIC_AUTH_USER = process.env.N8N_BASIC_AUTH_USER;
const N8N_BASIC_AUTH_PASSWORD = process.env.N8N_BASIC_AUTH_PASSWORD;

const router = express.Router();

// Mock data - in real app, this would come from database
const mockClients: Client[] = [
    {
        id: "1",
        workerId: "worker1",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        linkedinUrl: "https://linkedin.com/in/sarahjohnson",
        status: "active",
        paymentStatus: "pending",
        totalInterviews: 2,
        totalPaid: 20,
        isNew: false,
        assignedAt: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
    },
    {
        id: "2",
        workerId: "worker1",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+1 (555) 234-5678",
        linkedinUrl: "https://linkedin.com/in/michaelchen",
        status: "active",
        paymentStatus: "paid",
        totalInterviews: 1,
        totalPaid: 10,
        isNew: false,
        assignedAt: new Date("2024-01-10"),
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
    },
    {
        id: "3",
        workerId: "worker1",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        phone: "+1 (555) 345-6789",
        linkedinUrl: "https://linkedin.com/in/emilyrodriguez",
        status: "placed",
        paymentStatus: "paid",
        totalInterviews: 3,
        totalPaid: 30,
        isNew: false,
        assignedAt: new Date("2023-12-20"),
        createdAt: new Date("2023-12-20"),
        updatedAt: new Date("2024-01-05"),
    },
    // NEW: Recently assigned clients (within 72 hours)
    {
        id: "4",
        workerId: "worker1",
        name: "Alex Thompson",
        email: "alex.thompson@email.com",
        phone: "+1 (555) 456-7890",
        linkedinUrl: "https://linkedin.com/in/alexthompson",
        status: "active",
        paymentStatus: "pending",
        totalInterviews: 0,
        totalPaid: 0,
        isNew: true,
        assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
        id: "5",
        workerId: "worker1",
        name: "Jessica Kim",
        email: "jessica.kim@email.com",
        phone: "+1 (555) 567-8901",
        linkedinUrl: "https://linkedin.com/in/jessicakim",
        status: "active",
        paymentStatus: "pending",
        totalInterviews: 0,
        totalPaid: 0,
        isNew: true,
        assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
];

// Get all clients for a worker
router.get('/', (req, res) => {
    const workerId = req.query.workerId as string;
    const status = req.query.status as string;

    let filteredClients = mockClients;

    if (workerId) {
        filteredClients = filteredClients.filter(client => client.workerId === workerId);
    }

    if (status && status !== 'all') {
        if (status === 'new') {
            // Filter for clients assigned within the last 72 hours
            const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
            filteredClients = filteredClients.filter(client =>
                client.assignedAt > seventyTwoHoursAgo
            );
        } else {
            filteredClients = filteredClients.filter(client => client.status === status);
        }
    }

    const response: ApiResponse<Client[]> = {
        success: true,
        data: filteredClients,
        message: `Found ${filteredClients.length} clients`,
    };

    res.json(response);
});

// Get client by ID
router.get('/:id', (req, res) => {
    const clientId = req.params.id;
    const client = mockClients.find(c => c.id === clientId);

    if (!client) {
        const response: ApiResponse = {
            success: false,
            error: 'Client not found',
        };
        return res.status(404).json(response);
    }

    const response: ApiResponse<Client> = {
        success: true,
        data: client,
    };

    res.json(response);
});

// Create new client
const createClientSchema = z.object({
    body: z.object({
        workerId: z.string().min(1, 'Worker ID is required'),
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        status: z.enum(['active', 'inactive', 'placed']).default('active'),
    }),
});

router.post('/', validateRequest(createClientSchema), (req, res) => {
    const { workerId, name, email, phone, linkedinUrl, status } = req.body;

    const newClient: Client = {
        id: `client_${Date.now()}`,
        workerId,
        name,
        email,
        phone,
        linkedinUrl,
        status,
        paymentStatus: "pending",
        totalInterviews: 0,
        totalPaid: 0,
        isNew: true,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // In real app, save to database
    mockClients.push(newClient);

    const response: ApiResponse<Client> = {
        success: true,
        data: newClient,
        message: 'Client created successfully',
    };

    res.status(201).json(response);
});

// NEW: Automatic client assignment endpoint (for when clients sign up)
const autoAssignClientSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        phone: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        company: z.string().optional(),
        position: z.string().optional(),
    }),
});

router.post('/auto-assign', validateRequest(autoAssignClientSchema), async (req, res) => {
    try {
        const { name, email, phone, linkedinUrl, company, position } = req.body;

        // Create new client with mock data (temporary until database is set up)
        const newClient: Client = {
            id: `client_${Date.now()}`,
            workerId: "worker1", // Hardcoded for now
            name,
            email,
            phone: phone || "",
            linkedinUrl: linkedinUrl || "",
            status: "active",
            paymentStatus: "pending",
            totalInterviews: 0,
            totalPaid: 0,
            isNew: true,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Add to mock data
        mockClients.push(newClient);

        const response: ApiResponse<Client> = {
            success: true,
            data: newClient,
            message: `Client ${name} automatically assigned to worker worker1`,
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Auto-assign error:', error);
        const response: ApiResponse = {
            success: false,
            error: 'Failed to auto-assign client',
        };
        res.status(500).json(response);
    }
});

// Update client
const updateClientSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Invalid email format').optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        status: z.enum(['active', 'inactive', 'placed']).optional(),
    }),
});

router.put('/:id', validateRequest(updateClientSchema), (req, res) => {
    const clientId = req.params.id;
    const clientIndex = mockClients.findIndex(c => c.id === clientId);

    if (clientIndex === -1) {
        const response: ApiResponse = {
            success: false,
            error: 'Client not found',
        };
        return res.status(404).json(response);
    }

    const updatedClient = {
        ...mockClients[clientIndex],
        ...req.body,
        updatedAt: new Date(),
    };

    mockClients[clientIndex] = updatedClient;

    const response: ApiResponse<Client> = {
        success: true,
        data: updatedClient,
        message: 'Client updated successfully',
    };

    res.json(response);
});

// Delete client
router.delete('/:id', (req, res) => {
    const clientId = req.params.id;
    const clientIndex = mockClients.findIndex(c => c.id === clientId);

    if (clientIndex === -1) {
        const response: ApiResponse = {
            success: false,
            error: 'Client not found',
        };
        return res.status(404).json(response);
    }

    mockClients.splice(clientIndex, 1);

    const response: ApiResponse = {
        success: true,
        message: 'Client deleted successfully',
    };

    res.json(response);
});

// Get dashboard stats for a worker
router.get('/stats/dashboard', (req, res) => {
    const workerId = req.query.workerId as string;

    if (!workerId) {
        const response: ApiResponse = {
            success: false,
            error: 'Worker ID is required',
        };
        return res.status(400).json(response);
    }

    // Filter clients for this worker
    const workerClients = mockClients.filter(client => client.workerId === workerId);

    // Calculate stats
    const totalClients = workerClients.length;
    const activeClients = workerClients.filter(c => c.status === 'active').length;
    const newClients = workerClients.filter(c => c.isNew).length;
    const interviewsThisMonth = workerClients.reduce((sum, c) => sum + c.totalInterviews, 0);
    const placementsThisMonth = workerClients.filter(c => c.status === 'placed').length;
    const pendingPayments = workerClients.filter(c => c.paymentStatus === 'pending').length;
    const totalRevenue = workerClients.reduce((sum, c) => sum + c.totalPaid, 0);

    // Mock interview stats (in real app, these would come from interviews table)
    const interviewsScheduled = 8;
    const interviewsAccepted = 5;
    const interviewsDeclined = 2;
    const successRate = interviewsScheduled > 0 ? ((interviewsAccepted / interviewsScheduled) * 100) : 0;

    const stats = {
        totalClients,
        activeClients,
        newClients,
        interviewsThisMonth,
        placementsThisMonth,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
        pendingPayments,
        totalRevenue,
        interviewsScheduled,
        interviewsAccepted,
        interviewsDeclined,
    };

    const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
    };

    res.json(response);
});

// Trigger AI Apply via n8n webhook
const aiApplySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Client ID is required'),
    }),
    body: z.object({
        workerId: z.string().min(1, 'Worker ID is required'),
        jobPreferenceIds: z.array(z.string()).optional(),
        resumeId: z.string().optional(),
        note: z.string().optional(),
    })
});

router.post('/:id/ai-apply', validateRequest(aiApplySchema), async (req, res) => {
    try {
        if (!N8N_WEBHOOK_URL) {
            return res.status(500).json({ success: false, error: 'N8N_AI_APPLY_WEBHOOK_URL not configured' });
        }

        const clientId = req.params.id;
        const { workerId, jobPreferenceIds, resumeId, note } = req.body;

        // Lookup client basic info (mock for now)
        const client = mockClients.find(c => c.id === clientId);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found' });
        }

        // Build payload for n8n
        const payload = {
            event: 'ai_apply_requested',
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                linkedinUrl: client.linkedinUrl,
            },
            context: {
                workerId,
                jobPreferenceIds: jobPreferenceIds || [],
                resumeId: resumeId || null,
                note: note || null,
                requestedAt: new Date().toISOString(),
            }
        };

        // Build headers (include basic auth if configured)
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (N8N_BASIC_AUTH_USER && N8N_BASIC_AUTH_PASSWORD) {
            const creds = Buffer.from(`${N8N_BASIC_AUTH_USER}:${N8N_BASIC_AUTH_PASSWORD}`).toString('base64');
            headers['Authorization'] = `Basic ${creds}`;
        }

        // Post to n8n webhook using Node's global fetch
        const n8nResp = await (global as any).fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const text = await n8nResp.text();

        if (!n8nResp.ok) {
            return res.status(502).json({ success: false, error: `n8n error: ${text}` });
        }

        const response: ApiResponse = {
            success: true,
            data: { forwarded: true },
            message: 'AI Apply request forwarded to automation engine'
        };
        res.status(202).json(response);
    } catch (error) {
        console.error('AI Apply trigger failed:', error);
        res.status(500).json({ success: false, error: 'Failed to trigger AI Apply' });
    }
});

export default router;