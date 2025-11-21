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
import { Key, Loader2, AlertCircle, Check } from "lucide-react";
import { validateJoinCode, cleanJoinCode, formatJoinCode } from "../../utils/leagueUtils";
import { LEAGUE_CONSTANTS } from "../../types/league.types";

interface JoinLeagueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (joinCode: string) => Promise<void>;
}

export function JoinLeagueModal({ open, onOpenChange, onSubmit }: JoinLeagueModalProps) {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setJoinCode("");
      setError("");
      setIsSubmitting(false);
      setIsValid(false);
    }
  }, [open]);

  const handleCodeChange = (value: string) => {
    // Clean and format the input
    const cleaned = cleanJoinCode(value);

    // Only allow up to 8 characters
    if (cleaned.length <= LEAGUE_CONSTANTS.JOIN_CODE_LENGTH) {
      setJoinCode(cleaned);
      setError("");

      // Validate if length is correct
      if (cleaned.length === LEAGUE_CONSTANTS.JOIN_CODE_LENGTH) {
        const valid = validateJoinCode(cleaned);
        setIsValid(valid);
        if (!valid) {
          setError("Invalid join code format");
        }
      } else {
        setIsValid(false);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    handleCodeChange(pastedText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError("Please enter a valid 8-character join code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(joinCode);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to join league. Please check the code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-8">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">Join Private League</DialogTitle>
          <DialogDescription className="text-base text-slate-600">
            Enter the 8-character code shared by the league creator
          </DialogDescription>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Icon */}
          <div className="flex justify-center pt-2">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <Key className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          {/* Join Code Input */}
          <div>
            <Label htmlFor="joinCode" className="text-base font-semibold text-slate-900">Join Code</Label>
            <div className="relative mt-2.5">
              <Input
                id="joinCode"
                type="text"
                placeholder="e.g., ABCD1234"
                value={formatJoinCode(joinCode)}
                onChange={(e) => handleCodeChange(e.target.value)}
                onPaste={handlePaste}
                className={`text-center text-xl font-mono tracking-wider uppercase h-14 ${
                  error
                    ? "border-rose-500 focus:ring-rose-500"
                    : isValid
                    ? "border-emerald-500 focus:ring-emerald-500"
                    : "border-slate-300"
                }`}
                maxLength={9} // 8 characters + 1 dash
                autoComplete="off"
                autoFocus
              />
              {isValid && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-emerald-600" />
              )}
            </div>

            {/* Character Counter */}
            <div className="flex justify-between mt-2.5">
              <p className="text-sm text-slate-500 font-medium">
                {joinCode.length}/{LEAGUE_CONSTANTS.JOIN_CODE_LENGTH} characters
              </p>
              {isValid && <p className="text-sm text-emerald-600 font-semibold">Valid code format ✓</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 mt-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h4 className="text-base font-semibold text-slate-900 mb-3">How to get a join code:</h4>
            <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
              <li>Ask the league creator to share their private league code</li>
              <li>Codes are 8 characters long (letters and numbers)</li>
              <li>Codes are case-insensitive</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-6 pt-4">
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="flex-1 border-slate-300 hover:bg-slate-50 text-slate-700 font-medium h-12"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-sm h-12"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join League"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
