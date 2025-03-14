export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          anonymous_id: string
          created_at: string | null
          event_name: string
          event_properties: Json | null
          id: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          anonymous_id: string
          created_at?: string | null
          event_name: string
          event_properties?: Json | null
          id?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string
          created_at?: string | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_sessions: {
        Row: {
          anonymous_id: string
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string
          duration: number | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_first_visit: boolean | null
          os: string | null
          session_id: string
          started_at: string
          user_id: string | null
        }
        Insert: {
          anonymous_id: string
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_first_visit?: boolean | null
          os?: string | null
          session_id: string
          started_at?: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_first_visit?: boolean | null
          os?: string | null
          session_id?: string
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          reps: number
          sets: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reps: number
          sets: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reps?: number
          sets?: number
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          current_exercise_index: number
          current_set: number
          exercises: Json | null
          id: string
          is_active: boolean
          last_updated_at: string
          started_at: string
          stopwatch_time: number
          user_id: string
        }
        Insert: {
          current_exercise_index?: number
          current_set?: number
          exercises?: Json | null
          id?: string
          is_active?: boolean
          last_updated_at?: string
          started_at?: string
          stopwatch_time?: number
          user_id: string
        }
        Update: {
          current_exercise_index?: number
          current_set?: number
          exercises?: Json | null
          id?: string
          is_active?: boolean
          last_updated_at?: string
          started_at?: string
          stopwatch_time?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
