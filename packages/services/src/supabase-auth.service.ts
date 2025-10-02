import { createClient, Session, SupabaseClient } from "@supabase/supabase-js";
import { inject, injectable } from "inversify";

import { AppConfig, appConfigSymbol } from "./config";
import { UnauthorizedError } from "./utils/exceptions";

@injectable()
export class SupabaseAuthService {
  private supabase: SupabaseClient;
  private session: Session | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(@inject(appConfigSymbol) private config: AppConfig) {
    const { url, anonKey } = this.config.supabase;

    this.supabase = createClient(url, anonKey) as SupabaseClient;
    this.setupAuthListener();
  }

  private setupAuthListener() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        this.session = session;
        this.scheduleTokenRefresh();
      } else if (event === "SIGNED_OUT") {
        this.session = null;
        this.clearRefreshTimer();
      }
    });
  }

  private scheduleTokenRefresh() {
    this.clearRefreshTimer();

    if (!this.session?.expires_at) return;

    // Refresh 5 minutes before expiry
    const expiresAt = this.session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const refreshIn = expiresAt - now - 5 * 60 * 1000; // 5 minutes before expiry

    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(() => {
        void this.refreshToken();
      }, refreshIn);
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  async initialize(): Promise<void> {
    // Try to restore existing session
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (session) {
      this.session = session;
      this.scheduleTokenRefresh();
    } else {
      // Sign in with service account
      await this.signIn();
    }
  }

  async signIn(): Promise<void> {
    const { serviceEmail, servicePassword } = this.config.supabase;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: serviceEmail,
      password: servicePassword,
    });

    if (error) {
      throw new UnauthorizedError(
        `Supabase authentication failed: ${error.message}`,
      );
    }

    this.session = data.session;
    this.scheduleTokenRefresh();
  }

  async refreshToken(): Promise<void> {
    const { data, error } = await this.supabase.auth.refreshSession();

    if (error) {
      // If refresh fails, try to sign in again
      await this.signIn();
    } else if (data.session) {
      this.session = data.session;
      this.scheduleTokenRefresh();
    }
  }

  async getAccessToken(): Promise<string> {
    if (!this.session) {
      await this.signIn();
    }

    if (!this.session?.access_token) {
      throw new UnauthorizedError("No valid access token available");
    }

    // Check if token is about to expire (within 1 minute)
    const expiresAt = this.session.expires_at! * 1000;
    const now = Date.now();

    if (expiresAt - now < 60000) {
      await this.refreshToken();

      if (!this.session.access_token) {
        throw new UnauthorizedError("Failed to refresh access token");
      }
    }

    return this.session.access_token;
  }

  async signOut(): Promise<void> {
    this.clearRefreshTimer();
    await this.supabase.auth.signOut();
    this.session = null;
  }

  // Clean up on service destruction
  destroy(): void {
    this.clearRefreshTimer();
  }
}
