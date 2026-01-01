// swagger.ts
import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return (
    new DocumentBuilder()
      .setTitle('Plan Vision API')
      .setDescription(
        `
      **Authentication Flow for Testing:**
      1. Go to **Auth** > \`/api/auth/sign-in/email\`.
      2. Execute with your email/password.
      3. Copy the \`token\` string from the response body.
      4. Scroll to the top, click the **Authorize** button.
      5. Paste the token into the **access-token** (Bearer) field.
      6. Click **Authorize**.
      
      Now you can test protected endpoints like Image Upload.
      `,
      )
      .setVersion('1.0.0')
      // This allows you to paste the token in the UI
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter the token returned from /sign-in endpoint',
          in: 'header',
        },
        'access-token', // This name matches @ApiBearerAuth('access-token') in controllers
      )
      .build()
  );
}
