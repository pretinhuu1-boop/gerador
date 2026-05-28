export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      badge_unlocks: {
        Row: { badge_id: string; unlocked_at: string; user_id: string };
        Insert: { badge_id: string; unlocked_at?: string; user_id: string };
        Update: { badge_id?: string; unlocked_at?: string; user_id?: string };
        Relationships: [];
      };
      crew_radio: {
        Row: {
          author_name: string;
          author_user_id: string;
          created_at: string;
          crew_slug: string;
          expires_at: number;
          id: string;
          posted_at: number;
          text: string;
        };
        Insert: {
          author_name: string;
          author_user_id: string;
          created_at?: string;
          crew_slug: string;
          expires_at: number;
          id: string;
          posted_at: number;
          text: string;
        };
        Update: {
          author_name?: string;
          author_user_id?: string;
          created_at?: string;
          crew_slug?: string;
          expires_at?: number;
          id?: string;
          posted_at?: number;
          text?: string;
        };
        Relationships: [];
      };
      friends: {
        Row: {
          add_method: string;
          added_at: number;
          friend_user_id: string;
          runner_name: string;
          user_id: string;
        };
        Insert: {
          add_method: string;
          added_at: number;
          friend_user_id: string;
          runner_name?: string;
          user_id: string;
        };
        Update: {
          add_method?: string;
          added_at?: number;
          friend_user_id?: string;
          runner_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      identity_events: {
        Row: {
          id: string;
          kind: string;
          payload: Json;
          timestamp: number;
          user_id: string;
        };
        Insert: {
          id: string;
          kind: string;
          payload?: Json;
          timestamp: number;
          user_id: string;
        };
        Update: {
          id?: string;
          kind?: string;
          payload?: Json;
          timestamp?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      map_layer_settings: {
        Row: { settings: Json; updated_at: string; user_id: string };
        Insert: { settings?: Json; updated_at?: string; user_id: string };
        Update: { settings?: Json; updated_at?: string; user_id?: string };
        Relationships: [];
      };
      run_history_stats: {
        Row: {
          captain_weeks: number;
          invasions_succeeded: number;
          km_this_week: number;
          night_runs: number;
          solo_territory_km: number;
          total_km: number;
          total_runs: number;
          unique_spots_touched: string[];
          updated_at: string;
          user_id: string;
          weekly_top_three_count: number;
        };
        Insert: {
          captain_weeks?: number;
          invasions_succeeded?: number;
          km_this_week?: number;
          night_runs?: number;
          solo_territory_km?: number;
          total_km?: number;
          total_runs?: number;
          unique_spots_touched?: string[];
          updated_at?: string;
          user_id: string;
          weekly_top_three_count?: number;
        };
        Update: {
          captain_weeks?: number;
          invasions_succeeded?: number;
          km_this_week?: number;
          night_runs?: number;
          solo_territory_km?: number;
          total_km?: number;
          total_runs?: number;
          unique_spots_touched?: string[];
          updated_at?: string;
          user_id?: string;
          weekly_top_three_count?: number;
        };
        Relationships: [];
      };
      runner_progress: {
        Row: {
          freezes_available: number;
          ink_per_zone: Json;
          ink_updated_at: number;
          last_run_at: number;
          level: number;
          patches_owned: string[];
          runs_this_week: number;
          streak_weeks: number;
          updated_at: string;
          user_id: string;
          week_key: string;
          xp: number;
        };
        Insert: {
          freezes_available?: number;
          ink_per_zone?: Json;
          ink_updated_at?: number;
          last_run_at?: number;
          level?: number;
          patches_owned?: string[];
          runs_this_week?: number;
          streak_weeks?: number;
          updated_at?: string;
          user_id: string;
          week_key?: string;
          xp?: number;
        };
        Update: {
          freezes_available?: number;
          ink_per_zone?: Json;
          ink_updated_at?: number;
          last_run_at?: number;
          level?: number;
          patches_owned?: string[];
          runs_this_week?: number;
          streak_weeks?: number;
          updated_at?: string;
          user_id?: string;
          week_key?: string;
          xp?: number;
        };
        Relationships: [];
      };
      runners: {
        Row: {
          created_at: string;
          height_cm: number;
          name: string;
          personality: string;
          runner_type_id: string | null;
          saved_character: Json | null;
          self_user_id: string | null;
          sex: string;
          updated_at: string;
          user_id: string;
          weight_kg: number;
        };
        Insert: {
          created_at?: string;
          height_cm?: number;
          name?: string;
          personality?: string;
          runner_type_id?: string | null;
          saved_character?: Json | null;
          self_user_id?: string | null;
          sex?: string;
          updated_at?: string;
          user_id: string;
          weight_kg?: number;
        };
        Update: {
          created_at?: string;
          height_cm?: number;
          name?: string;
          personality?: string;
          runner_type_id?: string | null;
          saved_character?: Json | null;
          self_user_id?: string | null;
          sex?: string;
          updated_at?: string;
          user_id?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
      runs: {
        Row: {
          closed_loop: boolean;
          created_at: string;
          crew_slug: string | null;
          elapsed_ms: number;
          home_zone_id: string | null;
          id: string;
          meters_in_territory: number;
          points: Json;
          started_at: number;
          total_meters: number;
          touched_spot_ids: string[];
          user_id: string;
        };
        Insert: {
          closed_loop?: boolean;
          created_at?: string;
          crew_slug?: string | null;
          elapsed_ms: number;
          home_zone_id?: string | null;
          id?: string;
          meters_in_territory?: number;
          points?: Json;
          started_at: number;
          total_meters: number;
          touched_spot_ids?: string[];
          user_id: string;
        };
        Update: {
          closed_loop?: boolean;
          created_at?: string;
          crew_slug?: string | null;
          elapsed_ms?: number;
          home_zone_id?: string | null;
          id?: string;
          meters_in_territory?: number;
          points?: Json;
          started_at?: number;
          total_meters?: number;
          touched_spot_ids?: string[];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
