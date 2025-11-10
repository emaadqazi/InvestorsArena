import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create a league
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, virtualBudget } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'League name is required' });
    }
    
    // Generate unique invitation code
    const invitationCode = uuidv4().split('-')[0].toUpperCase();
    
    const league = await prisma.league.create({
      data: {
        name,
        description: description || null,
        invitationCode,
        virtualBudget: virtualBudget || 100000,
        adminId: req.userId!,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    
    // Add creator as a member
    await prisma.leagueMember.create({
      data: {
        userId: req.userId!,
        leagueId: league.id,
      },
    });
    
    // Create portfolio for the creator
    await prisma.portfolio.create({
      data: {
        userId: req.userId!,
        leagueId: league.id,
        cashBalance: league.virtualBudget,
        totalValue: league.virtualBudget,
      },
    });
    
    res.status(201).json(league);
  } catch (error: any) {
    console.error('Create league error:', error);
    res.status(500).json({ error: 'Failed to create league' });
  }
});

// Join a league by invitation code
router.post('/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const { invitationCode } = req.body;
    
    if (!invitationCode) {
      return res.status(400).json({ error: 'Invitation code is required' });
    }
    
    const league = await prisma.league.findUnique({
      where: { invitationCode: invitationCode.toUpperCase() },
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Check if user is already a member
    const existingMember = await prisma.leagueMember.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId: league.id,
        },
      },
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this league' });
    }
    
    // Add user as member
    await prisma.leagueMember.create({
      data: {
        userId: req.userId!,
        leagueId: league.id,
      },
    });
    
    // Create portfolio for the user
    await prisma.portfolio.create({
      data: {
        userId: req.userId!,
        leagueId: league.id,
        cashBalance: league.virtualBudget,
        totalValue: league.virtualBudget,
      },
    });
    
    const updatedLeague = await prisma.league.findUnique({
      where: { id: league.id },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    res.json(updatedLeague);
  } catch (error: any) {
    console.error('Join league error:', error);
    res.status(500).json({ error: 'Failed to join league' });
  }
});

// Get user's leagues
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const leagues = await prisma.league.findMany({
      where: {
        members: {
          some: {
            userId: req.userId!,
          },
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    res.json(leagues);
  } catch (error: any) {
    console.error('Get leagues error:', error);
    res.status(500).json({ error: 'Failed to get leagues' });
  }
});

// Leave league (must be before /:id route to avoid route conflicts)
router.post('/:id/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    // Get league with members
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        members: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Check if user is a member
    const member = league.members.find(m => m.userId === req.userId);
    if (!member) {
      return res.status(400).json({ error: 'You are not a member of this league' });
    }
    
    const isAdmin = league.adminId === req.userId;
    const memberCount = league._count.members;
    
    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      if (isAdmin) {
        // If admin is leaving and there are other members, transfer admin to first other member
        if (memberCount > 1) {
          const otherMember = league.members.find(m => m.userId !== req.userId);
          if (otherMember) {
            await tx.league.update({
              where: { id },
              data: { adminId: otherMember.userId },
            });
          }
        } else {
          // If admin is the only member, delete the entire league
          // This will cascade delete all related data (members, portfolios, transactions, holdings)
          await tx.league.delete({
            where: { id },
          });
          return; // Early return since league is deleted
        }
      }
      
      // Delete user's portfolio (this will cascade delete holdings and transactions)
      const portfolio = await tx.portfolio.findUnique({
        where: {
          userId_leagueId: {
            userId: req.userId!,
            leagueId: id,
          },
        },
      });
      
      if (portfolio) {
        await tx.portfolio.delete({
          where: { id: portfolio.id },
        });
      }
      
      // Remove user from league members
      await tx.leagueMember.delete({
        where: {
          userId_leagueId: {
            userId: req.userId!,
            leagueId: id,
          },
        },
      });
    });
    
    res.json({ 
      message: isAdmin && memberCount === 1 
        ? 'League deleted successfully (you were the only member)' 
        : 'Successfully left the league' 
    });
  } catch (error: any) {
    console.error('Leave league error:', error);
    res.status(500).json({ error: 'Failed to leave league' });
  }
});

// Get league by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Check if user is a member
    const isMember = league.members.some(m => m.userId === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this league' });
    }
    
    res.json(league);
  } catch (error: any) {
    console.error('Get league error:', error);
    res.status(500).json({ error: 'Failed to get league' });
  }
});

// Update league (admin only)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, virtualBudget } = req.body;
    
    const league = await prisma.league.findUnique({
      where: { id },
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    if (league.adminId !== req.userId) {
      return res.status(403).json({ error: 'Only the admin can update the league' });
    }
    
    const updatedLeague = await prisma.league.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(virtualBudget !== undefined && { virtualBudget }),
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    res.json(updatedLeague);
  } catch (error: any) {
    console.error('Update league error:', error);
    res.status(500).json({ error: 'Failed to update league' });
  }
});

export default router;

