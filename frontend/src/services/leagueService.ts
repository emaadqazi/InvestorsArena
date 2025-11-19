// ============================================
// LEAGUE SERVICE - SUPABASE DATABASE OPERATIONS
// ============================================

import { supabase } from './supabase';
import {
  LeagueWithStats,
  LeagueMemberWithUser,
  CreateLeagueFormData,
  LeagueApiResponse,
  LeaguesApiResponse,
  LeagueMemberApiResponse,
  LeagueMembersApiResponse,
} from '../types/league.types';
import { calculateEndDate } from '../utils/leagueUtils';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converts Firebase UID to Supabase user UUID
 * This is REQUIRED because the database uses users.id (UUID) for foreign keys
 */
async function getUserIdFromFirebaseUid(firebaseUid: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      console.error('Error fetching user by firebase_uid:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return null;
  }
}

// ============================================
// LEAGUE CRUD OPERATIONS
// ============================================

/**
 * Creates a new league
 * @param firebaseUid Current user's Firebase UID
 * @param formData League creation form data
 * @returns Created league or error
 */
export async function createLeague(
  firebaseUid: string,
  formData: CreateLeagueFormData
): Promise<LeagueApiResponse> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        data: null,
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    // Calculate end date if needed
    let endDate: Date | null = null;
    if (formData.start_date && formData.duration !== 'ongoing') {
      endDate = calculateEndDate(new Date(formData.start_date), formData.duration);
    }

    // Use the database function to create league (automatically adds creator as member)
    const { data, error } = await supabase.rpc('create_league', {
      p_name: formData.name.trim(),
      p_description: formData.description?.trim() || null,
      p_created_by: userId, // UUID, not firebase_uid
      p_is_public: formData.is_public,
      p_max_players: formData.max_players,
      p_starting_cash: formData.starting_cash,
      p_max_stocks: formData.max_stocks_per_portfolio,
      p_trade_frequency: formData.trade_frequency,
      p_duration: formData.duration,
      p_start_date: formData.start_date || new Date().toISOString(),
      p_allow_fractional: formData.allow_fractional,
    });

    if (error) {
      console.error('Error creating league:', error);
      return { data: null, error };
    }

    if (!data || !data.success) {
      return {
        data: null,
        error: new Error(data?.message || 'Failed to create league')
      };
    }

    console.log('✅ League created successfully:', data.league_id);

    // Return the created league data
    const { data: leagueData, error: fetchError } = await supabase
      .from('league_stats')
      .select('*')
      .eq('id', data.league_id)
      .single();

    if (fetchError) {
      console.error('Error fetching created league:', fetchError);
      return { data: null, error: fetchError };
    }

    return { data: leagueData, error: null };
  } catch (error: any) {
    console.error('Error in createLeague:', error);
    return { data: null, error };
  }
}

/**
 * Gets all public leagues
 * @param firebaseUid Current user's Firebase UID
 * @returns Array of public leagues with stats
 */
export async function getPublicLeagues(firebaseUid: string): Promise<LeaguesApiResponse> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        data: null,
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    // Get public leagues with member count (league_stats view includes creator info)
    const { data, error } = await supabase
      .from('league_stats')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public leagues:', error);
      return { data: null, error };
    }

    // Check if user is a member of each league
    const leaguesWithMembership = await Promise.all(
      (data || []).map(async (league) => {
        const { data: memberData } = await supabase
          .from('league_members')
          .select('id')
          .eq('league_id', league.id)
          .eq('user_id', userId) // Use user_id (UUID), not firebase_uid
          .single();

        return {
          ...league,
          is_member: !!memberData,
          is_creator: league.creator_firebase_uid === firebaseUid,
          is_full: league.member_count >= league.max_players,
        } as LeagueWithStats;
      })
    );

    return { data: leaguesWithMembership, error: null };
  } catch (error: any) {
    console.error('Error in getPublicLeagues:', error);
    return { data: null, error };
  }
}

/**
 * Gets all leagues the user is a member of
 * @param firebaseUid Current user's Firebase UID
 * @returns Array of user's leagues with stats
 */
export async function getUserLeagues(firebaseUid: string): Promise<LeaguesApiResponse> {
  try {
    // Use the user_league_memberships view which already has everything we need
    const { data, error } = await supabase
      .from('user_league_memberships')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching user leagues:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    // Get full league details from league_stats for each membership
    const leagueIds = data.map((m) => m.league_id);
    const { data: leaguesData, error: leaguesError } = await supabase
      .from('league_stats')
      .select('*')
      .in('id', leagueIds)
      .order('created_at', { ascending: false });

    if (leaguesError) {
      console.error('Error fetching league details:', leaguesError);
      return { data: null, error: leaguesError };
    }

    const leaguesWithMembership = (leaguesData || []).map((league) => ({
      ...league,
      is_member: true,
      is_creator: league.creator_firebase_uid === firebaseUid,
      is_full: league.member_count >= league.max_players,
    })) as LeagueWithStats[];

    return { data: leaguesWithMembership, error: null };
  } catch (error: any) {
    console.error('Error in getUserLeagues:', error);
    return { data: null, error };
  }
}

/**
 * Gets a league by ID
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID
 * @returns League details with stats
 */
export async function getLeagueById(firebaseUid: string, leagueId: string): Promise<LeagueApiResponse> {
  try {
    const { data, error } = await supabase
      .from('league_stats')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (error) {
      console.error('Error fetching league:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in getLeagueById:', error);
    return { data: null, error };
  }
}

/**
 * Gets a league by join code
 * @param firebaseUid Current user's Firebase UID
 * @param joinCode League join code
 * @returns League details or error
 */
export async function getLeagueByJoinCode(firebaseUid: string, joinCode: string): Promise<LeagueApiResponse> {
  try {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('join_code', joinCode.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching league by join code:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error in getLeagueByJoinCode:', error);
    return { data: null, error };
  }
}

/**
 * Updates a league (only creator can update)
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID to update
 * @param updates Fields to update
 * @returns Updated league or error
 */
export async function updateLeague(
  firebaseUid: string,
  leagueId: string,
  updates: Partial<CreateLeagueFormData>
): Promise<LeagueApiResponse> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        data: null,
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    const { data, error } = await supabase
      .from('leagues')
      .update(updates)
      .eq('id', leagueId)
      .eq('created_by', userId) // Use created_by (UUID), not creator_firebase_uid
      .select()
      .single();

    if (error) {
      console.error('Error updating league:', error);
      return { data: null, error };
    }

    console.log('✅ League updated successfully');
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in updateLeague:', error);
    return { data: null, error };
  }
}

/**
 * Deletes a league (only creator can delete, only if no members)
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID to delete
 * @returns Success or error
 */
export async function deleteLeague(firebaseUid: string, leagueId: string): Promise<{ error: Error | null }> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', leagueId)
      .eq('created_by', userId); // Use created_by (UUID), not creator_firebase_uid

    if (error) {
      console.error('Error deleting league:', error);
      return { error };
    }

    console.log('✅ League deleted successfully');
    return { error: null };
  } catch (error: any) {
    console.error('Error in deleteLeague:', error);
    return { error };
  }
}

// ============================================
// LEAGUE MEMBERSHIP OPERATIONS
// ============================================

/**
 * Joins a league by league ID (for public leagues)
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID to join
 * @returns Membership data or error
 */
export async function joinLeague(firebaseUid: string, leagueId: string): Promise<LeagueMemberApiResponse> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        data: null,
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    // Use the database function to join league (handles all validation)
    const { data, error } = await supabase.rpc('join_league', {
      p_league_id: leagueId,
      p_user_id: userId // UUID, not firebase_uid
    });

    if (error) {
      console.error('Error joining league:', error);
      return { data: null, error };
    }

    if (!data || !data.success) {
      return {
        data: null,
        error: new Error(data?.message || 'Failed to join league')
      };
    }

    console.log('✅ Successfully joined league');

    // Fetch the membership data
    const { data: memberData, error: fetchError } = await supabase
      .from('league_members')
      .select('*')
      .eq('id', data.member_id)
      .single();

    if (fetchError) {
      console.error('Error fetching member data:', fetchError);
      return { data: null, error: fetchError };
    }

    return { data: memberData, error: null };
  } catch (error: any) {
    console.error('Error in joinLeague:', error);
    return { data: null, error };
  }
}

/**
 * Joins a league by join code (for private leagues)
 * @param firebaseUid Current user's Firebase UID
 * @param joinCode League join code
 * @returns Membership data or error
 */
export async function joinLeagueByCode(firebaseUid: string, joinCode: string): Promise<LeagueMemberApiResponse> {
  try {
    // Get league by join code
    const { data: league, error: leagueError } = await getLeagueByJoinCode(firebaseUid, joinCode);

    if (leagueError || !league) {
      return {
        data: null,
        error: new Error('Invalid join code or league not found'),
      };
    }

    // Use the regular join function
    return joinLeague(firebaseUid, league.id);
  } catch (error: any) {
    console.error('Error in joinLeagueByCode:', error);
    return { data: null, error };
  }
}

/**
 * Leaves a league
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID to leave
 * @returns Success or error
 */
export async function leaveLeague(firebaseUid: string, leagueId: string): Promise<{ error: Error | null }> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return {
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId); // Use user_id (UUID), not firebase_uid

    if (error) {
      console.error('Error leaving league:', error);
      return { error };
    }

    console.log('✅ Successfully left league');
    return { error: null };
  } catch (error: any) {
    console.error('Error in leaveLeague:', error);
    return { error };
  }
}

/**
 * Gets all members of a league
 * @param firebaseUid Current user's Firebase UID
 * @param leagueId League ID
 * @returns Array of league members with user details
 */
export async function getLeagueMembers(
  firebaseUid: string,
  leagueId: string
): Promise<LeagueMembersApiResponse> {
  try {
    // Get league members with user details via JOIN
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        *,
        users:user_id (
          firebase_uid,
          email,
          display_name,
          first_name,
          last_name
        )
      `)
      .eq('league_id', leagueId)
      .order('rank', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching league members:', error);
      return { data: null, error };
    }

    // Transform data to include user details at top level
    const membersWithUser = (data || []).map((member: any) => ({
      ...member,
      firebase_uid: member.users?.firebase_uid,
      email: member.users?.email,
      display_name: member.users?.display_name || `${member.users?.first_name || ''} ${member.users?.last_name || ''}`.trim(),
    })) as LeagueMemberWithUser[];

    return { data: membersWithUser, error: null };
  } catch (error: any) {
    console.error('Error in getLeagueMembers:', error);
    return { data: null, error };
  }
}

/**
 * Removes a member from a league (creator only)
 * @param firebaseUid Current user's Firebase UID (must be creator)
 * @param leagueId League ID
 * @param memberFirebaseUid Firebase UID of member to remove
 * @returns Success or error
 */
export async function removeMember(
  firebaseUid: string,
  leagueId: string,
  memberFirebaseUid: string
): Promise<{ error: Error | null }> {
  try {
    // Get user UUIDs from firebase_uids
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    const memberUserId = await getUserIdFromFirebaseUid(memberFirebaseUid);

    if (!userId || !memberUserId) {
      return {
        error: new Error('User not found. Please ensure you are logged in.')
      };
    }

    // Verify user is the creator (use league_stats view)
    const { data: league, error: leagueError } = await supabase
      .from('league_stats')
      .select('creator_firebase_uid')
      .eq('id', leagueId)
      .single();

    if (leagueError || !league) {
      return { error: new Error('League not found') };
    }

    if (league.creator_firebase_uid !== firebaseUid) {
      return { error: new Error('Only the league creator can remove members') };
    }

    // Remove the member
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', memberUserId); // Use user_id (UUID), not firebase_uid

    if (error) {
      console.error('Error removing member:', error);
      return { error };
    }

    console.log('✅ Member removed successfully');
    return { error: null };
  } catch (error: any) {
    console.error('Error in removeMember:', error);
    return { error };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Checks if a league name is available for the user
 * @param firebaseUid Current user's Firebase UID
 * @param leagueName League name to check
 * @returns True if available, false if taken
 */
export async function isLeagueNameAvailable(firebaseUid: string, leagueName: string): Promise<boolean> {
  try {
    // Get user UUID from firebase_uid
    const userId = await getUserIdFromFirebaseUid(firebaseUid);
    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('created_by', userId) // Use created_by (UUID), not creator_firebase_uid
      .eq('name', leagueName.trim())
      .single();

    // Name is available if no league found
    return !data && error?.code === 'PGRST116';
  } catch (error) {
    console.error('Error checking league name:', error);
    return false;
  }
}

/**
 * Updates league statuses (call this periodically or via cron)
 * @returns Success or error
 */
export async function updateLeagueStatuses(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.rpc('update_league_status');

    if (error) {
      console.error('Error updating league statuses:', error);
      return { error };
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error in updateLeagueStatuses:', error);
    return { error };
  }
}
