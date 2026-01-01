import * as pactum from 'pactum';

describe('Auth E2E (Pactum)', () => {
    const baseUrl = 'http://localhost:3000';

    beforeAll(() => {
        pactum.request.setBaseUrl(baseUrl);
    });

    it('should login and return a bearer token', async () => {
        await pactum.spec()
            .post('/api/auth/sign-in/email')
            .withJson({
                email: 'garasiakartik@gmail.com',
                password: 'Str0ngPassw0rd!',
                rememberMe: true,
            })
            .expectStatus(200)
            .stores('authToken', 'token') // Assuming the response has a 'token' field. Adjust based on actual response structure.
            .inspect(); // This will print the response to the console for debugging
    });
});
