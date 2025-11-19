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
import { Select, SelectItem } from "../ui/select";
import { Switch } from "../ui/switch";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  Loader2,
} from "lucide-react";
import {
  CreateLeagueFormData,
  LEAGUE_CONSTANTS,
  DURATION_LABELS,
  TRADE_FREQUENCY_LABELS,
  LeagueDuration,
  TradeFrequency,
} from "../../types/league.types";
import { validateLeagueForm, getDefaultLeagueFormValues, formatCurrency } from "../../utils/leagueUtils";
import { Badge } from "../ui/badge";

interface CreateLeagueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeagueFormData) => Promise<void>;
}

type Step = 1 | 2 | 3;

export function CreateLeagueModal({ open, onOpenChange, onSubmit }: CreateLeagueModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<CreateLeagueFormData>(getDefaultLeagueFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setFormData(getDefaultLeagueFormValues());
      setErrors({});
      setIsSubmitting(false);
      setShowAdvanced(false);
    }
  }, [open]);

  const updateField = <K extends keyof CreateLeagueFormData>(
    field: K,
    value: CreateLeagueFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    const validationErrors = validateLeagueForm(formData);
    const errorMap: Record<string, string> = {};

    validationErrors.forEach((err) => {
      errorMap[err.field] = err.message;
    });

    // Check step-specific fields
    if (currentStep === 1) {
      const step1Fields = ["name", "description"];
      const step1Errors = Object.keys(errorMap).filter((key) => step1Fields.includes(key));
      if (step1Errors.length > 0) {
        setErrors(errorMap);
        return false;
      }
    }

    if (currentStep === 2) {
      const step2Fields = [
        "max_players",
        "starting_cash",
        "max_stocks_per_portfolio",
        "trade_frequency",
        "trade_limit",
        "duration",
        "start_date",
      ];
      const step2Errors = Object.keys(errorMap).filter((key) => step2Fields.includes(key));
      if (step2Errors.length > 0) {
        setErrors(errorMap);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3) as Step);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    const validationErrors = validateLeagueForm(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating league:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Minimum: tomorrow
    return today.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New League</DialogTitle>
          <DialogDescription>
            Set up your fantasy stock league in {step === 3 ? "3" : "a few"} steps
          </DialogDescription>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  s === step
                    ? "border-blue-600 bg-blue-600 text-white"
                    : s < step
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    s < step ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <p className="text-sm text-gray-600">Give your league a name and description</p>
              </div>

              <div>
                <Label htmlFor="name">
                  League Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Stock Masters"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  maxLength={LEAGUE_CONSTANTS.NAME_MAX_LENGTH}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.name.length}/{LEAGUE_CONSTANTS.NAME_MAX_LENGTH} characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  placeholder="Describe your league..."
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  maxLength={LEAGUE_CONSTANTS.DESCRIPTION_MAX_LENGTH}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/{LEAGUE_CONSTANTS.DESCRIPTION_MAX_LENGTH} characters
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <Label htmlFor="is_public" className="font-semibold">
                    League Visibility
                  </Label>
                  <p className="text-xs text-gray-600">
                    {formData.is_public
                      ? "Public - Anyone can find and join"
                      : "Private - Invite-only with a unique code"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Private</span>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => updateField("is_public", checked)}
                  />
                  <span className="text-sm text-gray-600">Public</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Rules Configuration */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <Settings className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">League Rules</h3>
                <p className="text-sm text-gray-600">Configure your league settings</p>
              </div>

              {/* Basic Rules */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_players">Max Players</Label>
                  <Input
                    id="max_players"
                    type="number"
                    min={LEAGUE_CONSTANTS.MIN_PLAYERS}
                    max={LEAGUE_CONSTANTS.MAX_PLAYERS}
                    value={formData.max_players}
                    onChange={(e) => updateField("max_players", parseInt(e.target.value))}
                    className={errors.max_players ? "border-red-500" : ""}
                  />
                  {errors.max_players && (
                    <p className="text-xs text-red-500 mt-1">{errors.max_players}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="starting_cash">Starting Cash</Label>
                  <Input
                    id="starting_cash"
                    type="number"
                    min={LEAGUE_CONSTANTS.MIN_STARTING_CASH}
                    max={LEAGUE_CONSTANTS.MAX_STARTING_CASH}
                    step={10000}
                    value={formData.starting_cash}
                    onChange={(e) => updateField("starting_cash", parseInt(e.target.value))}
                    className={errors.starting_cash ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(formData.starting_cash)}
                  </p>
                  {errors.starting_cash && (
                    <p className="text-xs text-red-500 mt-1">{errors.starting_cash}</p>
                  )}
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label htmlFor="max_stocks">Max Stocks per Portfolio</Label>
                    <Input
                      id="max_stocks"
                      type="number"
                      min={LEAGUE_CONSTANTS.MIN_STOCKS}
                      max={LEAGUE_CONSTANTS.MAX_STOCKS}
                      value={formData.max_stocks_per_portfolio}
                      onChange={(e) =>
                        updateField("max_stocks_per_portfolio", parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="trade_frequency">Trade Frequency</Label>
                    <Select
                      value={formData.trade_frequency}
                      onValueChange={(value) =>
                        updateField("trade_frequency", value as TradeFrequency)
                      }
                    >
                      {Object.entries(TRADE_FREQUENCY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {formData.trade_frequency !== "unlimited" && (
                    <div>
                      <Label htmlFor="trade_limit">
                        {formData.trade_frequency === "daily" ? "Daily" : "Weekly"} Trade Limit
                      </Label>
                      <Input
                        id="trade_limit"
                        type="number"
                        min={
                          formData.trade_frequency === "daily"
                            ? LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_DAILY
                            : LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_WEEKLY
                        }
                        max={
                          formData.trade_frequency === "daily"
                            ? LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_DAILY
                            : LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_WEEKLY
                        }
                        value={formData.trade_limit || ""}
                        onChange={(e) =>
                          updateField("trade_limit", parseInt(e.target.value) || null)
                        }
                        className={errors.trade_limit ? "border-red-500" : ""}
                      />
                      {errors.trade_limit && (
                        <p className="text-xs text-red-500 mt-1">{errors.trade_limit}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="duration">League Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => updateField("duration", value as LeagueDuration)}
                    >
                      {Object.entries(DURATION_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {formData.duration !== "ongoing" && (
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        min={getMinDate()}
                        value={formData.start_date || ""}
                        onChange={(e) => updateField("start_date", e.target.value || null)}
                        className={errors.start_date ? "border-red-500" : ""}
                      />
                      {errors.start_date && (
                        <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                    <Label htmlFor="allow_fractional">Allow Fractional Shares</Label>
                    <Switch
                      checked={formData.allow_fractional}
                      onCheckedChange={(checked) => updateField("allow_fractional", checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">Review & Create</h3>
                <p className="text-sm text-gray-600">Double-check your league settings</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{formData.name}</h4>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge className={formData.is_public ? "bg-green-600" : "bg-orange-600"}>
                      {formData.is_public ? "Public" : "Private"}
                    </Badge>
                    {!formData.is_public && (
                      <Badge className="bg-blue-600">Join code will be generated</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Max Players</span>
                    </div>
                    <div className="font-semibold">{formData.max_players}</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Starting Cash</span>
                    </div>
                    <div className="font-semibold">{formatCurrency(formData.starting_cash)}</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Max Stocks</span>
                    </div>
                    <div className="font-semibold">{formData.max_stocks_per_portfolio}</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Duration</span>
                    </div>
                    <div className="font-semibold">{DURATION_LABELS[formData.duration]}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Trade Frequency:</span>{" "}
                      <span className="font-medium">
                        {TRADE_FREQUENCY_LABELS[formData.trade_frequency]}
                      </span>
                    </div>
                    {formData.trade_limit && (
                      <div>
                        <span className="text-gray-600">Trade Limit:</span>{" "}
                        <span className="font-medium">{formData.trade_limit}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Fractional Shares:</span>{" "}
                      <span className="font-medium">
                        {formData.allow_fractional ? "Allowed" : "Not Allowed"}
                      </span>
                    </div>
                    {formData.start_date && (
                      <div>
                        <span className="text-gray-600">Start Date:</span>{" "}
                        <span className="font-medium">
                          {new Date(formData.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create League
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
