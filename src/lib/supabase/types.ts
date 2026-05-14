// Database types for Surface
// In production, generate these with: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuotePermission = 'anonymous' | 'synthesize_only' | 'attributed';
export type UserRole = 'contributor' | 'leadership' | 'cos' | 'admin';
export type SynthesisStatus = 'pending' | 'clustered' | 'used' | 'excluded';
export type ReadStatus = 'draft' | 'review' | 'published';
export type ResponseType = 'acknowledged' | 'action_planned' | 'wont_act' | 'needs_discussion';
export type NotificationType = 'signal_used' | 'read_published' | 'response_received';

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain_whitelist: string[];
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain_whitelist?: string[];
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain_whitelist?: string[];
          settings?: Json;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          display_name: string | null;
          role: UserRole;
          default_quote_preference: QuotePermission;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          display_name?: string | null;
          role?: UserRole;
          default_quote_preference?: QuotePermission;
          onboarded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tenant_id?: string;
          display_name?: string | null;
          role?: UserRole;
          default_quote_preference?: QuotePermission;
          onboarded_at?: string | null;
          updated_at?: string;
        };
      };
      signals: {
        Row: {
          id: string;
          tenant_id: string;
          raw_content: string;
          contribution_card: Json | null;
          themes: string[];
          quote_permission: QuotePermission;
          attributed_name: string | null;
          used_in_read_id: string | null;
          synthesis_status: SynthesisStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          raw_content: string;
          contribution_card?: Json | null;
          themes?: string[];
          quote_permission?: QuotePermission;
          attributed_name?: string | null;
          used_in_read_id?: string | null;
          synthesis_status?: SynthesisStatus;
          created_at?: string;
        };
        Update: {
          tenant_id?: string;
          raw_content?: string;
          contribution_card?: Json | null;
          themes?: string[];
          quote_permission?: QuotePermission;
          attributed_name?: string | null;
          used_in_read_id?: string | null;
          synthesis_status?: SynthesisStatus;
        };
      };
      signal_links: {
        Row: {
          signal_id: string;
          contribution_token: string;
          created_at: string;
        };
        Insert: {
          signal_id: string;
          contribution_token: string;
          created_at?: string;
        };
        Update: {
          signal_id?: string;
          contribution_token?: string;
        };
      };
      contribution_identities: {
        Row: {
          contribution_token: string;
          user_id: string;
          tenant_id: string;
          created_at: string;
        };
        Insert: {
          contribution_token: string;
          user_id: string;
          tenant_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          tenant_id?: string;
        };
      };
      reads: {
        Row: {
          id: string;
          tenant_id: string;
          period_start: string;
          period_end: string;
          narrative: string | null;
          top_tensions: Json;
          emerging_patterns: Json;
          recommendations: Json;
          mood: Json | null;
          blind_spots: Json;
          status: ReadStatus;
          editor_notes: string | null;
          created_at: string;
          published_at: string | null;
          signal_count: number | null;
          contributor_count: number | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          period_start: string;
          period_end: string;
          narrative?: string | null;
          top_tensions?: Json;
          emerging_patterns?: Json;
          recommendations?: Json;
          mood?: Json | null;
          blind_spots?: Json;
          status?: ReadStatus;
          editor_notes?: string | null;
          created_at?: string;
          published_at?: string | null;
          signal_count?: number | null;
          contributor_count?: number | null;
        };
        Update: {
          tenant_id?: string;
          period_start?: string;
          period_end?: string;
          narrative?: string | null;
          top_tensions?: Json;
          emerging_patterns?: Json;
          recommendations?: Json;
          mood?: Json | null;
          blind_spots?: Json;
          status?: ReadStatus;
          editor_notes?: string | null;
          published_at?: string | null;
          signal_count?: number | null;
          contributor_count?: number | null;
        };
      };
      read_responses: {
        Row: {
          id: string;
          read_id: string;
          tension_index: number;
          responder_id: string;
          response_type: ResponseType;
          response_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          read_id: string;
          tension_index: number;
          responder_id: string;
          response_type: ResponseType;
          response_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          response_type?: ResponseType;
          response_text?: string | null;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          messages: Json;
          contributed: boolean;
          contributed_signal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          messages?: Json;
          contributed?: boolean;
          contributed_signal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          messages?: Json;
          contributed?: boolean;
          contributed_signal_id?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          read_id: string | null;
          signal_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          read_id?: string | null;
          signal_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
      };
    };
    Functions: {
      create_contribution: {
        Args: {
          p_tenant_id: string;
          p_user_id: string;
          p_raw_content: string;
          p_contribution_card: Json;
          p_themes: string[];
          p_quote_permission: string;
          p_attributed_name?: string | null;
        };
        Returns: string;
      };
      get_signal_contributor: {
        Args: {
          p_signal_id: string;
        };
        Returns: string;
      };
      delete_user_data: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
    };
  };
}

// Convenience types
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Signal = Database['public']['Tables']['signals']['Row'];
export type Read = Database['public']['Tables']['reads']['Row'];
export type ReadResponse = Database['public']['Tables']['read_responses']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Contribution card structure
export interface ContributionCard {
  summary: string;
  themes: string[];
  originalExcerpt?: string;
}

// Tension structure for reads
export interface Tension {
  id: string;
  title: string;
  synthesis: string;
  observedAcross: string[];
  momentum: 'emerging' | 'growing' | 'sustained' | 'declining';
  intensity: 'low' | 'moderate' | 'high' | 'critical';
  repeatedPhrases: string[];
  blindSpot?: string;
  suggestedAction?: string;
  signalCount: number;
}

// Mood structure
export interface Mood {
  overall: 'optimistic' | 'concerned' | 'frustrated' | 'energized' | 'uncertain';
  shifts: string[];
}
