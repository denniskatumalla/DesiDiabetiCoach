/**
 * Supabase schema types.
 *
 * HAND-DERIVED from `supabase/migrations/*.sql` (001–003), because local
 * type generation needs a running database and Docker is unavailable in this
 * environment. The shape deliberately matches what the Supabase CLI emits, so
 * it can be replaced wholesale once a database exists:
 *
 *   supabase gen types typescript --linked > packages/shared/src/database.types.ts
 *   # or, against a local stack:
 *   supabase gen types typescript --local  > packages/shared/src/database.types.ts
 *
 * Conventions mirrored from the generator:
 *  - `Row` reflects a SELECT; nullable columns are `| null`.
 *  - `Insert` makes columns optional when they are nullable or have a DEFAULT.
 *  - `Update` makes every column optional.
 *  - Columns constrained by CHECK (rather than a Postgres ENUM) are typed
 *    `string` — the generator does not narrow them. The narrow domain unions
 *    live in this package's Zod schemas and apply at the API boundary.
 *  - `foods.gi_category` is GENERATED ALWAYS ... STORED, so it appears in
 *    `Row` only and cannot be inserted or updated.
 *
 * IMPORTANT: if you add a migration, regenerate (or update) this file.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          date_of_birth: string | null;
          gender: string | null;
          diabetes_type: string | null;
          diagnosis_year: number | null;
          ethnicity: string | null;
          language_pref: string | null;
          country: string | null;
          city: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          target_hba1c: number | null;
          daily_carb_goal: number | null;
          onboarded_at: string | null;
          subscription: string | null;
          created_at: string | null;
          updated_at: string | null;
          target_bg_fasting_min: number | null;
          target_bg_fasting_max: number | null;
          target_bg_post_meal_max: number | null;
          cuisine_preference: string | null;
          dietary_restriction: string | null;
          units_preference: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          diabetes_type?: string | null;
          diagnosis_year?: number | null;
          ethnicity?: string | null;
          language_pref?: string | null;
          country?: string | null;
          city?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          target_hba1c?: number | null;
          daily_carb_goal?: number | null;
          onboarded_at?: string | null;
          subscription?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          target_bg_fasting_min?: number | null;
          target_bg_fasting_max?: number | null;
          target_bg_post_meal_max?: number | null;
          cuisine_preference?: string | null;
          dietary_restriction?: string | null;
          units_preference?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          diabetes_type?: string | null;
          diagnosis_year?: number | null;
          ethnicity?: string | null;
          language_pref?: string | null;
          country?: string | null;
          city?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          target_hba1c?: number | null;
          daily_carb_goal?: number | null;
          onboarded_at?: string | null;
          subscription?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          target_bg_fasting_min?: number | null;
          target_bg_fasting_max?: number | null;
          target_bg_post_meal_max?: number | null;
          cuisine_preference?: string | null;
          dietary_restriction?: string | null;
          units_preference?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      foods: {
        Row: {
          id: string;
          name_en: string;
          name_regional: string | null;
          regional_lang: string | null;
          aliases: string[] | null;
          category: string;
          cuisine_region: string[] | null;
          is_vegetarian: boolean | null;
          is_vegan: boolean | null;
          serving_desc: string;
          serving_g: number | null;
          carbs_g: number;
          protein_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          calories: number | null;
          gi_score: number | null;
          /** GENERATED ALWAYS AS (...) STORED — read-only. */
          gi_category: string | null;
          gl_score: number | null;
          diabetic_notes: string | null;
          verified: boolean | null;
          source: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_regional?: string | null;
          regional_lang?: string | null;
          aliases?: string[] | null;
          category: string;
          cuisine_region?: string[] | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          serving_desc: string;
          serving_g?: number | null;
          carbs_g: number;
          protein_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          calories?: number | null;
          gi_score?: number | null;
          gl_score?: number | null;
          diabetic_notes?: string | null;
          verified?: boolean | null;
          source?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_regional?: string | null;
          regional_lang?: string | null;
          aliases?: string[] | null;
          category?: string;
          cuisine_region?: string[] | null;
          is_vegetarian?: boolean | null;
          is_vegan?: boolean | null;
          serving_desc?: string;
          serving_g?: number | null;
          carbs_g?: number;
          protein_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          calories?: number | null;
          gi_score?: number | null;
          gl_score?: number | null;
          diabetic_notes?: string | null;
          verified?: boolean | null;
          source?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_type: string | null;
          logged_at: string;
          bg_before: number | null;
          bg_after_1h: number | null;
          bg_after_2h: number | null;
          photo_url: string | null;
          ai_analysis: Json | null;
          total_carbs_g: number | null;
          total_calories: number | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type?: string | null;
          logged_at?: string;
          bg_before?: number | null;
          bg_after_1h?: number | null;
          bg_after_2h?: number | null;
          photo_url?: string | null;
          ai_analysis?: Json | null;
          total_carbs_g?: number | null;
          total_calories?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: string | null;
          logged_at?: string;
          bg_before?: number | null;
          bg_after_1h?: number | null;
          bg_after_2h?: number | null;
          photo_url?: string | null;
          ai_analysis?: Json | null;
          total_carbs_g?: number | null;
          total_calories?: number | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      meal_items: {
        Row: {
          id: string;
          meal_log_id: string;
          food_id: string | null;
          food_name_raw: string | null;
          quantity: number | null;
          serving_unit: string | null;
          carbs_g: number | null;
          calories: number | null;
        };
        Insert: {
          id?: string;
          meal_log_id: string;
          food_id?: string | null;
          food_name_raw?: string | null;
          quantity?: number | null;
          serving_unit?: string | null;
          carbs_g?: number | null;
          calories?: number | null;
        };
        Update: {
          id?: string;
          meal_log_id?: string;
          food_id?: string | null;
          food_name_raw?: string | null;
          quantity?: number | null;
          serving_unit?: string | null;
          carbs_g?: number | null;
          calories?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_items_meal_log_id_fkey';
            columns: ['meal_log_id'];
            isOneToOne: false;
            referencedRelation: 'meal_logs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meal_items_food_id_fkey';
            columns: ['food_id'];
            isOneToOne: false;
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
        ];
      };
      bg_logs: {
        Row: {
          id: string;
          user_id: string;
          value: number;
          logged_at: string;
          context: string | null;
          notes: string | null;
          device: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          value: number;
          logged_at?: string;
          context?: string | null;
          notes?: string | null;
          device?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          value?: number;
          logged_at?: string;
          context?: string | null;
          notes?: string | null;
          device?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bg_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      medication_logs: {
        Row: {
          id: string;
          user_id: string;
          medication_name: string;
          dose_mg: number | null;
          taken_at: string;
          scheduled_at: string | null;
          taken: boolean | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_name: string;
          dose_mg?: number | null;
          taken_at?: string;
          scheduled_at?: string | null;
          taken?: boolean | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_name?: string;
          dose_mg?: number | null;
          taken_at?: string;
          scheduled_at?: string | null;
          taken?: boolean | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          messages: Json;
          tokens_used: number | null;
          started_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          messages?: Json;
          tokens_used?: number | null;
          started_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          messages?: Json;
          tokens_used?: number | null;
          started_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_conversations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      a1c_logs: {
        Row: {
          id: string;
          user_id: string;
          test_date: string;
          value: number;
          lab_name: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_date: string;
          value: number;
          lab_name?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_date?: string;
          value?: number;
          lab_name?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'a1c_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dose_value: number;
          dose_unit: string;
          frequency: string;
          is_insulin: boolean | null;
          start_date: string;
          end_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dose_value: number;
          dose_unit: string;
          frequency: string;
          is_insulin?: boolean | null;
          start_date: string;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          dose_value?: number;
          dose_unit?: string;
          frequency?: string;
          is_insulin?: boolean | null;
          start_date?: string;
          end_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'medications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      medication_schedules: {
        Row: {
          id: string;
          medication_id: string;
          scheduled_time: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          medication_id: string;
          scheduled_time: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          medication_id?: string;
          scheduled_time?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_schedules_medication_id_fkey';
            columns: ['medication_id'];
            isOneToOne: false;
            referencedRelation: 'medications';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_limits: {
        Row: {
          bucket_key: string;
          window_start: string;
          hits: number;
        };
        Insert: {
          bucket_key: string;
          window_start?: string;
          hits?: number;
        };
        Update: {
          bucket_key?: string;
          window_start?: string;
          hits?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      consume_rate_limit: {
        Args: {
          p_action: string;
          p_max_hits: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

/** Convenience aliases mirroring the generator's helper exports. */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
