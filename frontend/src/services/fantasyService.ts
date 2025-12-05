// ============================================
// FANTASY PORTFOLIO SERVICE
// ============================================

import { supabase } from "./supabase";
import type {
  SlotWithUsage,
  PortfolioHolding,
  AddStockRequest,
  AddStockResponse,
  RemoveStockResponse,
  UserLeagueMember,
  Stock,
} from "../types/fantasy.types";

/**
 * Get user's leagues (with membership data)
 */
export async function getUserLeagues(firebaseUid: string) {
  try {
    // First get the user_id from firebase_uid
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    // Get league memberships with league details
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        id,
        league_id,
        user_id,
        current_cash,
        portfolio_value,
        total_value,
        rank,
        joined_at,
        league:league_id (
          id,
          name,
          is_public,
          starting_cash,
          max_stocks_per_portfolio
        )
      `)
      .eq("user_id", userData.id);

    if (error) throw error;

    return { data: data as unknown as UserLeagueMember[], error: null };
  } catch (err: any) {
    console.error("Error fetching user leagues:", err);
    return { data: null, error: err };
  }
}

/**
 * Seed default slots for a league (if none exist)
 */
export async function seedLeagueSlots(leagueId: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.rpc("add_default_slots_to_league", {
      p_league_id: leagueId,
    });

    if (error) throw error;

    console.log("✅ Default slots seeded for league:", leagueId);
    return { success: true, error: null };
  } catch (err: any) {
    console.error("Error seeding league slots:", err);
    return { success: false, error: err };
  }
}

/**
 * Get available slots for a league with usage information
 */
export async function getAvailableSlots(
  firebaseUid: string,
  leagueId: string
): Promise<{ data: SlotWithUsage[] | null; error: any }> {
  try {
    // Get user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    // Call the RPC function
    const { data, error } = await supabase.rpc("get_available_slots", {
      p_league_id: leagueId,
      p_user_id: userData.id,
    });

    if (error) throw error;

    return { data: data as SlotWithUsage[], error: null };
  } catch (err: any) {
    console.error("Error fetching available slots:", err);
    return { data: null, error: err };
  }
}

/**
 * Get user's portfolio holdings for a league
 */
export async function getPortfolioHoldings(
  firebaseUid: string,
  leagueId: string
): Promise<{ data: PortfolioHolding[] | null; error: any }> {
  try {
    // Get user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    // Get holdings with stock details
    const { data, error } = await supabase
      .from("portfolio_holdings")
      .select(`
        id,
        user_id,
        league_id,
        stock_id,
        slot_name,
        quantity,
        purchase_price,
        purchased_at,
        updated_at,
        stocks:stock_id (
          id,
          symbol,
          name,
          current_price,
          sector_tag,
          market_cap_tier,
          daily_change,
          daily_change_percent
        )
      `)
      .eq("user_id", userData.id)
      .eq("league_id", leagueId)
      .gt("quantity", 0)
      .order("slot_name", { ascending: true });

    if (error) throw error;

    // Calculate current value and P/L
    const holdingsWithCalc = (data as any[]).map((holding) => {
      const currentValue = holding.stocks.current_price * holding.quantity;
      const purchaseValue = holding.purchase_price * holding.quantity;
      const profitLoss = currentValue - purchaseValue;
      const profitLossPercent = ((profitLoss / purchaseValue) * 100);

      return {
        ...holding,
        stock: holding.stocks,
        current_value: currentValue,
        profit_loss: profitLoss,
        profit_loss_percent: profitLossPercent,
      };
    });

    return { data: holdingsWithCalc as PortfolioHolding[], error: null };
  } catch (err: any) {
    console.error("Error fetching portfolio holdings:", err);
    return { data: null, error: err };
  }
}

/**
 * Add a stock to the portfolio
 */
export async function addStockToPortfolio(
  firebaseUid: string,
  request: AddStockRequest
): Promise<{ data: AddStockResponse | null; error: any }> {
  try {
    // Get user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    // Call the RPC function
    const { data, error } = await supabase.rpc("add_stock_to_portfolio", {
      p_league_id: request.league_id,
      p_user_id: userData.id,
      p_stock_id: request.stock_id,
      p_slot_name: request.slot_name,
      p_quantity: request.quantity,
    });

    if (error) throw error;

    return { data: data as AddStockResponse, error: null };
  } catch (err: any) {
    console.error("Error adding stock to portfolio:", err);
    return { data: null, error: err };
  }
}

/**
 * Remove a stock from the portfolio
 */
export async function removeStockFromPortfolio(
  firebaseUid: string,
  leagueId: string,
  stockId: string
): Promise<{ data: RemoveStockResponse | null; error: any }> {
  try {
    // Get user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    // Call the RPC function
    const { data, error } = await supabase.rpc("remove_stock_from_portfolio", {
      p_league_id: leagueId,
      p_user_id: userData.id,
      p_stock_id: stockId,
    });

    if (error) throw error;

    return { data: data as RemoveStockResponse, error: null };
  } catch (err: any) {
    console.error("Error removing stock from portfolio:", err);
    return { data: null, error: err };
  }
}

/**
 * Search stocks with optional filters
 */
export async function searchStocks(
  query: string,
  sectorTag?: string | null,
  marketCapTier?: string | null
): Promise<{ data: Stock[] | null; error: any }> {
  try {
    let queryBuilder = supabase
      .from("stocks")
      .select("*")
      .or(`ticker.ilike.%${query}%,name.ilike.%${query}%`);

    if (sectorTag) {
      queryBuilder = queryBuilder.eq("sector_tag", sectorTag);
    }

    if (marketCapTier) {
      queryBuilder = queryBuilder.eq("market_cap_tier", marketCapTier);
    }

    const { data, error } = await queryBuilder.limit(50);

    if (error) throw error;

    return { data: data as Stock[], error: null };
  } catch (err: any) {
    console.error("Error searching stocks:", err);
    return { data: null, error: err };
  }
}

/**
 * Get league member info (cash, portfolio value, etc.)
 */
export async function getLeagueMemberInfo(
  firebaseUid: string,
  leagueId: string
) {
  try {
    // Get user_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    const { data, error } = await supabase
      .from("league_members")
      .select("*")
      .eq("user_id", userData.id)
      .eq("league_id", leagueId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err: any) {
    console.error("Error fetching league member info:", err);
    return { data: null, error: err };
  }
}
