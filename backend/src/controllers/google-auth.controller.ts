import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { query, getClient } from '../config/database';
import { env } from '../config/env';
import { User, Wallet } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,        // ✅ FIXED: role now included
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    } as jwt.SignOptions
  );
}

function makeUsername(email: string): string {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');

  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `${base}${suffix}`;
}

async function verifyGoogleCredential(credential: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new Error('Invalid Google token');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    fullName: payload.name || payload.email.split('@')[0],
    picture: payload.picture || null,
  };
}

async function getWalletOrCreate(userId: string): Promise<Wallet> {
  const wallets = await query<Wallet>(
    `SELECT * FROM wallets WHERE user_id = $1`,
    [userId]
  );

  if (wallets.length > 0) {
    return wallets[0];
  }

  const walletResult = await query<Wallet>(
    `INSERT INTO wallets (user_id, balance, total_deposited)
     VALUES ($1, 1000000.00, 1000000.00)
     RETURNING *`,
    [userId]
  );

  return walletResult[0];
}

export class GoogleAuthController {
  static async login(req: Request, res: Response) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      const googleUser = await verifyGoogleCredential(credential);

      // ✅ FIXED: role now included in SELECT
      const existingUsers = await query<User>(
        `SELECT id, email, username, full_name, avatar_url, is_verified, role, created_at, updated_at
         FROM users
         WHERE email = $1`,
        [googleUser.email]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No TradeSphere account found. Please create an account first.',
        });
      }

      const user = existingUsers[0];
      const wallet = await getWalletOrCreate(user.id);
      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Google login successful',
        data: {
          user,
          token,
          wallet,
        },
      });
    } catch (error) {
      console.error('Google login failed:', error);

      return res.status(500).json({
        success: false,
        message: 'Google login failed',
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      const googleUser = await verifyGoogleCredential(credential);

      const existingUsers = await query<User>(
        `SELECT id FROM users WHERE email = $1`,
        [googleUser.email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Account already exists. Please sign in instead.',
        });
      }

      const client = await getClient();

      try {
        await client.query('BEGIN');

        const userId = uuidv4();
        const username = makeUsername(googleUser.email);
        const fakePasswordHash = `GOOGLE_AUTH_${googleUser.googleId}`;

        // ✅ FIXED: role now included in RETURNING
        const userResult = await client.query(
          `INSERT INTO users (
            id,
            email,
            username,
            full_name,
            avatar_url,
            is_verified,
            password_hash
          )
          VALUES ($1, $2, $3, $4, $5, true, $6)
          RETURNING id, email, username, full_name, avatar_url, is_verified, role, created_at, updated_at`,
          [
            userId,
            googleUser.email,
            username,
            googleUser.fullName,
            googleUser.picture,
            fakePasswordHash,
          ]
        );

        const walletResult = await client.query(
          `INSERT INTO wallets (user_id, balance, total_deposited)
           VALUES ($1, 1000000.00, 1000000.00)
           RETURNING *`,
          [userId]
        );

        await client.query(
          `INSERT INTO leaderboard (user_id, portfolio_value)
           VALUES ($1, 1000000.00)`,
          [userId]
        );

        await client.query('COMMIT');

        const user = userResult.rows[0] as User;
        const wallet = walletResult.rows[0] as Wallet;
        const token = generateToken(user);

        return res.status(201).json({
          success: true,
          message: 'Google account created successfully',
          data: {
            user,
            token,
            wallet,
          },
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Google registration failed:', error);

      return res.status(500).json({
        success: false,
        message: 'Google registration failed',
      });
    }
  }
}