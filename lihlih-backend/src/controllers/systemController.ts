import { Request, Response } from 'express';
import prisma from '../prismaClient';

/**
 * Fetches all active Wilayas and their active Baladias.
 * Formats the data into a Record<WilayaName, BaladiaNames[]> for the frontend.
 */
export const getActiveRegions = async (req: Request, res: Response) => {
  try {
    const activeWilayas = await prisma.wilaya.findMany({
      where: { is_active: true },
      include: {
        baladias: {
          where: { is_active: true },
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const regionMap: Record<string, string[]> = {};

    activeWilayas.forEach(wilaya => {
      regionMap[wilaya.name] = wilaya.baladias.map(b => b.name);
    });

    res.json(regionMap);
  } catch (error) {
    console.error("Failed to fetch active regions:", error);
    res.status(500).json({ error: "Failed to fetch active regions" });
  }
};
