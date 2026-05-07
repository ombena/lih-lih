import { Request, Response } from 'express';
import prisma from '../prismaClient';
import redis from '../redisClient';

export const getActiveRegions = async (req: Request, res: Response) => {
  const CACHE_KEY = 'system:active_regions';

  try {
    // 1. Try to fetch from Redis first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log('⚡ Serving Active Regions from Redis Cache');
      return res.json(JSON.parse(cachedData));
    }

    // 2. Cache miss - fetch from PostgreSQL
    console.log('🔄 Cache Miss - Fetching Regions from Database');
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
    activeWilayas.forEach((wilaya: any) => {
      regionMap[wilaya.name] = wilaya.baladias.map((b: any) => b.name);
    });

    // 3. Save to Redis (Cache for 24 hours)
    await redis.set(CACHE_KEY, JSON.stringify(regionMap), 'EX', 86400);

    return res.json(regionMap);
  } catch (error) {
    console.error("Failed to fetch active regions:", error);
    res.status(500).json({ error: "Failed to fetch active regions" });
  }
};
