import request from 'supertest';
import app from '../app';

describe('Rule API E2E', () => {
    let createdRuleId: number;

    // Test POST /api/rules
    it('should create a rule', async () => {
        const rule = {
            name: "Test Rule",
            action: "Allow",
            sources: [{ name: "Source1", email: "s1@mail.com" }],
            destinations: [{ name: "Dest1", address: "addr1" }]
        };
        const res = await request(app)
            .post('/api/rules')
            .send(rule)
            .expect(201);
        expect(res.body).toHaveProperty('id');
        createdRuleId = res.body.id;
        expect(res.body.name).toBe("Test Rule");
    });

    // Test GET /api/rules
    it('should list rules', async () => {
        const res = await request(app)
            .get('/api/rules')
            .expect(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.total).toBeDefined();
    });

    // Test PATCH /api/rules/:id (move rule order)
    it('should move a rule', async () => {
        const res = await request(app)
            .patch(`/api/rules/${createdRuleId}/move`)
            .send({ newIndex: 123 })
            .expect(200);
        expect(res.body.ruleIndex).toBe(123);
    });

    // Test PATCH /api/rules/:id (edit rule)
    it('should edit a rule', async () => {
        const res = await request(app)
            .patch(`/api/rules/${createdRuleId}`)
            .send({ name: "Updated Rule" })
            .expect(200);
        expect(res.body.name).toBe("Updated Rule");
    });

    // Test DELETE /api/rules/:id
    it('should delete a rule', async () => {
        await request(app)
            .delete(`/api/rules/${createdRuleId}`)
            .expect(204);
    });

    // Test DELETE for non-existent rule returns 404
    it('should return 404 for deleting non-existent rule', async () => {
        await request(app)
            .delete(`/api/rules/999999`)
            .expect(404);
    });
});
