import { Request, Response } from 'express';
import prisma from '../prismaClient';

/**
 * Validates the current client session.
 * For now, we verify if the provided phone_number exists in the DB.
 */
export const getMe = async (req: Request, res: Response) => {
  const { phone_number } = req.query;

  if (!phone_number) {
    return res.status(401).json({ error: 'Identification required' });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { phone_number: phone_number as string }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Login or Register: Finds or creates a client by phone number.
 */
export const login = async (req: Request, res: Response) => {
  const { phone_number, name } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const client = await prisma.client.upsert({
      where: { phone_number },
      update: { name }, // Update name if already exists
      create: { phone_number, name }
    });

    res.json(client);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Failed to login or register' });
  }
};
