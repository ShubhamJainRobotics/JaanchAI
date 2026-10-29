import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import { apiClient } from "../lib/apiClient";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { User, Settings as SettingsIcon, Shield, Trash2, Check, KeyRound } from "lucide-react";

export function Settings() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [college, setCollege] = useState("");
  const [defaultSaveHistory, setDefaultSaveHistory] = useState(true);
  const [defaultAiConsent, setDefaultAiConsent] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Password management (allows setting a password for Google or Email accounts)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
      // Load profile if exists
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            if (data.display_name) setDisplayName(data.display_name);
            if (data.college) setCollege(data.college);
            setDefaultSaveHistory(data.default_save_history);
            setDefaultAiConsent(data.default_ai_consent);
          }
        });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName.trim(),
        college: college.trim(),
        default_save_history: defaultSaveHistory,
        default_ai_consent: defaultAiConsent,
      });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      await apiClient.deleteAllAnalyses();
      setShowDeleteAllDialog(false);
      setMessage("All verification history and associated items have been permanently deleted.");
    } catch (err) {
      console.error("Failed to delete all data:", err);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-8 h-8 text-primary" strokeWidth={1.75} aria-hidden="true" />
          Settings & Privacy Controls
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account profile, default analysis preferences, and data retention.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-status-verified-bg border border-status-verified-border rounded-md text-xs font-semibold text-status-verified-fg">
          {message}
        </div>
      )}

      {/* Profile & Defaults Form */}
      <form onSubmit={handleSaveProfile} className="bg-surface rounded-md border border-border shadow-elevation-1 p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Profile Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface-raised border border-border rounded-md text-sm text-muted-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                maxLength={80}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              College / Institution (Optional)
            </label>
            <input
              type="text"
              value={college}
              maxLength={120}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. Delhi Technological University"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
        </div>

        {/* Default Preferences */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
            Analysis Defaults
          </h2>

          <div className="space-y-3">
            <label className="min-h-[44px] flex items-start gap-3 cursor-pointer p-3 rounded-md border border-border hover:bg-surface-raised">
              <input
                type="checkbox"
                checked={defaultSaveHistory}
                onChange={(e) => setDefaultSaveHistory(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Always save analyses to my private history by default
                </span>
                <span className="text-[11px] text-muted-foreground">
                  You can still toggle this off for individual runs.
                </span>
              </div>
            </label>

            <label className="min-h-[44px] flex items-start gap-3 cursor-pointer p-3 rounded-md border border-border hover:bg-surface-raised">
              <input
                type="checkbox"
                checked={defaultAiConsent}
                onChange={(e) => setDefaultAiConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Enable Google Gemini AI context by default
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Sends PII-redacted text to Gemini to identify supplementary context.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border">
          {saveSuccess && (
            <span className="text-xs font-semibold text-status-verified-fg flex items-center gap-1.5">
              <Check className="w-4 h-4 text-status-verified-icon" strokeWidth={2} aria-hidden="true" />
              Preferences saved successfully!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto min-h-[44px] px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>

      {/* Security & Password Management */}
      <form onSubmit={handleUpdatePassword} className="bg-surface rounded-md border border-border shadow-elevation-1 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
          Security & Password
        </h2>
        <p className="text-xs text-muted-foreground">
          Set or update your account password. If you originally signed up with Google, setting a password allows you to log in either via Google or with your email + password.
        </p>

        {passwordError && (
          <div className="p-3.5 bg-status-high-risk-bg text-status-high-risk-fg text-xs rounded-md border border-status-high-risk-border">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="p-3.5 bg-status-verified-bg text-status-verified-fg text-xs rounded-md border border-status-verified-border flex items-center gap-2">
            <Check className="w-4 h-4 text-status-verified-icon shrink-0" strokeWidth={2} aria-hidden="true" />
            <span>Password updated successfully! You can now log in using this password.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              minLength={6}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Confirm New Password
            </label>
            <input
              type="password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-surface border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving}
            className="min-h-[44px] px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {passwordSaving ? "Updating..." : "Set / Update Password"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-surface rounded-md border border-destructive/40 shadow-elevation-1 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-destructive border-b border-border pb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" strokeWidth={1.75} aria-hidden="true" />
          Danger Zone
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Delete All My Verification Data
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently purges all your saved analysis reports, checklist items, and link inspections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteAllDialog(true)}
            className="min-h-[44px] px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs rounded-md transition-colors shadow-xs shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Delete All Data
          </button>
        </div>
      </div>

      {/* Confirm Purge Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        title="Permanently Delete All Your Data"
        message="Are you completely sure? This will permanently delete all your analysis reports, checklists, and link inspection history from our database. This action is irreversible."
        confirmLabel="Yes, Delete All Data"
        isDestructive={true}
        onConfirm={handleDeleteAllData}
        onCancel={() => setShowDeleteAllDialog(false)}
      />
    </div>
  );
}
