import 'dotenv/config';
import { betterAuth } from 'better-auth';
import type { SocialProviders } from 'better-auth/social-providers';
import { PostgresDialect } from 'kysely';
import { pool } from '../common/database/db.config';
import * as jwt from 'jsonwebtoken';
import * as os from 'node:os';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to initialize Better Auth.');
}

const baseURL = process.env.BETTER_AUTH_BASE_URL ?? 'http://localhost:3000';
const basePath = process.env.BETTER_AUTH_BASE_PATH ?? '/api/auth';
const port = process.env.PORT ?? 3000;
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  Object.keys(interfaces).forEach((ifaceName) => {
    interfaces[ifaceName]?.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(`http://${iface.address}:${port}`);
      }
    });
  });

  return ips;
};

const envOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? baseURL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = [
  ...envOrigins,
  ...getLocalIPs(),
  // Admin panel development origins
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const configuredSocialProviders: SocialProviders = {};

const googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (googleClientId && googleClientSecret) {
  configuredSocialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    redirectURI: `${baseURL.replace(/\/$/, '')}${basePath}/callback/google`,
  };
}

const generateAppleSecret = () => {
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const clientId = process.env.APPLE_BUNDLE_ID;

  if (!privateKey || !teamId || !keyId || !clientId) return undefined;

  const secret = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '24h',
    audience: 'https://appleid.apple.com',
    issuer: teamId,
    subject: clientId,
    keyid: keyId,
  });

  return secret;
};

const appleBundleId = process.env.APPLE_BUNDLE_ID;

if (appleBundleId) {
  const appleSecret = generateAppleSecret();

  if (appleSecret) {
    configuredSocialProviders.apple = {
      clientId: appleBundleId,
      clientSecret: appleSecret,
    };
  }
}

const socialProviders =
  Object.keys(configuredSocialProviders).length > 0
    ? configuredSocialProviders
    : undefined;

const logCallbackLink = async (label: string, email: string, url: string) => {
  console.info(`[BetterAuth:${label}] ${email} => ${url}`);
};

export const auth = betterAuth({
  appName: 'Plan Vision',
  baseURL,
  basePath,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: new PostgresDialect({ pool }),

  // ✅ UPDATED TABLE MAPPINGS TO MATCH PRISMA SCHEMA
  user: {
    modelName: 'user',
  },
  verification: {
    modelName: 'verification', // Changed from 'auth_verification'
  },
  session: {
    modelName: 'session', // Changed from 'auth_session'
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  account: {
    modelName: 'account', // Changed from 'auth_account'
    encryptOAuthTokens: true,
    updateAccountOnSignIn: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await logCallbackLink('verify-email', user.email, url);
    },
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await logCallbackLink('reset-password', user.email, url);
    },
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders,
});
