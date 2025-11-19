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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join Private League</DialogTitle>
          <DialogDescription>
            Enter the 8-character code shared by the league creator
          </DialogDescription>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Join Code Input */}
          <div>
            <Label htmlFor="joinCode">Join Code</Label>
            <div className="relative mt-1">
              <Input
                id="joinCode"
                type="text"
                placeholder="e.g., ABCD1234"
                value={formatJoinCode(joinCode)}
                onChange={(e) => handleCodeChange(e.target.value)}
                onPaste={handlePaste}
                className={`text-center text-lg font-mono tracking-wider uppercase ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : isValid
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }`}
                maxLength={9} // 8 characters + 1 dash
                autoComplete="off"
                autoFocus
              />
              {isValid && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>

            {/* Character Counter */}
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                {joinCode.length}/{LEAGUE_CONSTANTS.JOIN_CODE_LENGTH} characters
              </p>
              {isValid && <p className="text-xs text-green-600">Valid code format</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How to get a join code:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Ask the league creator to share their private league code</li>
              <li>Codes are 8 characters long (letters and numbers)</li>
              <li>Codes are case-insensitive</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
