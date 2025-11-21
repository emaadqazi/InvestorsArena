import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Search, Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { searchStocks, addStockToPortfolio } from "../../services/fantasyService";
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from "../../utils/toastUtils";
import type { SlotWithUsage, Stock } from "../../types/fantasy.types";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: SlotWithUsage;
  leagueId: string;
  onStockAdded: () => void;
}

export function AddStockModal({
  open,
  onOpenChange,
  slot,
  leagueId,
  onStockAdded,
}: AddStockModalProps) {
  const auth = useAuth() as any;
  const user = auth?.user;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedStock(null);
      setQuantity(1);
    }
  }, [open]);

  // Search stocks with debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearching(true);

    // Apply slot constraints to search
    const { data, error } = await searchStocks(
      searchQuery,
      slot.constraint_type === "sector" ? slot.constraint_value : null,
      slot.constraint_type === "market_cap" ? slot.constraint_value : null
    );

    if (error) {
      console.error("Error searching stocks:", error);
      showErrorToast("Failed to search stocks");
    } else {
      setSearchResults(data || []);
    }

    setSearching(false);
  };

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const handleSubmit = async () => {
    if (!user || !selectedStock) return;

    setSubmitting(true);
    const loadingToast = showLoadingToast("Adding stock to portfolio...");

    try {
      const { data, error } = await addStockToPortfolio(user.uid, {
        league_id: leagueId,
        user_id: user.uid,
        stock_id: selectedStock.id,
        slot_name: slot.slot_name,
        quantity,
      });

      dismissToast(loadingToast);

      if (error || !data?.success) {
        showErrorToast(data?.message || "Failed to add stock to portfolio");
      } else {
        showSuccessToast(data.message || "Stock added successfully!");
        onStockAdded();
      }
    } catch (err: any) {
      dismissToast(loadingToast);
      console.error("Error adding stock:", err);
      showErrorToast("An error occurred while adding the stock");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Add Stock to {slot.slot_name}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600">
            {slot.constraint_type === "wildcard"
              ? "This is a flex slot - choose any stock you'd like to add to your portfolio"
              : slot.constraint_type === "market_cap"
              ? `Search for and select a ${slot.constraint_value} stock to fill this slot`
              : `Search for and select a stock from the ${slot.constraint_value} sector to fill this slot`}
          </DialogDescription>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-6">
          {/* Slot Info */}
          <div className={`rounded-xl p-5 border ${
            slot.constraint_type === "wildcard"
              ? "bg-purple-50 border-purple-200"
              : slot.constraint_type === "market_cap"
              ? "bg-blue-50 border-blue-200"
              : "bg-indigo-50 border-indigo-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  {slot.constraint_type === "wildcard" ? "🎯" : slot.constraint_type === "market_cap" ? "📊" : "🏢"}
                  <span>Slot Requirements</span>
                </h4>
                {slot.description && (
                  <p className="text-sm text-slate-700 mb-3">{slot.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge className={`${
                    slot.constraint_type === "wildcard"
                      ? "bg-purple-100 text-purple-800"
                      : slot.constraint_type === "market_cap"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-indigo-100 text-indigo-800"
                  } border-0 font-semibold`}>
                    {slot.constraint_type === "wildcard"
                      ? "Any stock"
                      : `${slot.constraint_value} only`}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 border-0">
                    {slot.slots_remaining} slot{slot.slots_remaining !== 1 ? "s" : ""} remaining
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div>
            <Label htmlFor="search" className="text-base font-semibold text-slate-900">
              Search Stocks
            </Label>
            <div className="relative mt-2.5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-12"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-400" />
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div>
              <Label className="text-sm font-semibold text-slate-900 mb-3 block">
                Search Results ({searchResults.length})
              </Label>
              {searchResults.length === 0 && !searching ? (
                <Card className="p-6 text-center border-slate-200">
                  <p className="text-slate-600 mb-2">
                    No stocks found matching "{searchQuery}"
                    {slot.constraint_type !== "wildcard" && ` in the ${slot.constraint_value} ${slot.constraint_type === "market_cap" ? "category" : "sector"}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    Try a different search term or check if the stock meets the slot requirements
                  </p>
                </Card>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2">
                  {searchResults.map((stock) => (
                    <Card
                      key={stock.id}
                      className={`p-4 cursor-pointer transition-all border ${
                        selectedStock?.id === stock.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900">{stock.symbol}</p>
                            {stock.market_cap_tier && (
                              <Badge className="bg-slate-100 text-slate-700 text-xs border-0">
                                {stock.market_cap_tier}
                              </Badge>
                            )}
                            {stock.sector_tag && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
                                {stock.sector_tag}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(stock.current_price)}
                          </p>
                          {stock.daily_change_percent !== null && (
                            <p
                              className={`text-sm font-medium flex items-center gap-1 ${
                                stock.daily_change_percent >= 0
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {stock.daily_change_percent >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {formatPercent(stock.daily_change_percent)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quantity Input */}
          {selectedStock && (
            <div>
              <Label htmlFor="quantity" className="text-base font-semibold text-slate-900">
                Number of Shares
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-2.5 bg-white border-slate-200 h-12"
              />
              <p className="text-sm text-slate-600 mt-2">
                Total Cost: {formatCurrency(selectedStock.current_price * quantity)}
              </p>
            </div>
          )}

          {/* Constraint Warning */}
          {selectedStock && slot.constraint_type !== "wildcard" && (
            <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">Constraint Check</p>
                <p className="text-sm text-amber-700">
                  This stock will be validated against the slot's {slot.constraint_type} requirement
                  ({slot.constraint_value}) before being added.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
          <Button
            size="lg"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1 border-slate-300 hover:bg-slate-50 text-slate-700 h-12"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedStock || submitting || quantity < 1}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Portfolio"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
