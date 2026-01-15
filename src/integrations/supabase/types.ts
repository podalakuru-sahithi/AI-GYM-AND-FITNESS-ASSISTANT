export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_type: string
          description: string | null
          earned_at: string
          id: string
          name: string
          points: number | null
          user_id: string
        }
        Insert: {
          badge_type: string
          description?: string | null
          earned_at?: string
          id?: string
          name: string
          points?: number | null
          user_id: string
        }
        Update: {
          badge_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          name?: string
          points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          name: string
          reward_points: number | null
          start_date: string
          status: string | null
          target_value: number
          user_id: string
        }
        Insert: {
          challenge_type: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          reward_points?: number | null
          start_date?: string
          status?: string | null
          target_value: number
          user_id: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          reward_points?: number | null
          start_date?: string
          status?: string | null
          target_value?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_type: string
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          chat_type?: string
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          chat_type?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          created_at: string
          daily_calories: number | null
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          meals: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_calories?: number | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          meals?: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_calories?: number | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          meals?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grocery_lists: {
        Row: {
          created_at: string
          diet_plan_id: string | null
          id: string
          is_completed: boolean | null
          items: Json
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diet_plan_id?: string | null
          id?: string
          is_completed?: boolean | null
          items?: Json
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          diet_plan_id?: string | null
          id?: string
          is_completed?: boolean | null
          items?: Json
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_lists_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed_at: string
          habit_id: string
          id: string
          notes: string | null
          streak_count: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          frequency: string
          id: string
          is_active: boolean | null
          name: string
          reminder_time: string | null
          target_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name: string
          reminder_time?: string | null
          target_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          name?: string
          reminder_time?: string | null
          target_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          fat_g: number | null
          fiber_g: number | null
          food_name: string
          id: string
          log_date: string
          meal_type: string
          notes: string | null
          protein_g: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name: string
          id?: string
          log_date?: string
          meal_type: string
          notes?: string | null
          protein_g?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_name?: string
          id?: string
          log_date?: string
          meal_type?: string
          notes?: string | null
          protein_g?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          allergies: string[] | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          dietary_preference:
            | Database["public"]["Enums"]["dietary_preference"]
            | null
          fitness_goal: Database["public"]["Enums"]["fitness_goal"] | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          medical_conditions: string[] | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preference?:
            | Database["public"]["Enums"]["dietary_preference"]
            | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string[] | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          allergies?: string[] | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preference?:
            | Database["public"]["Enums"]["dietary_preference"]
            | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          medical_conditions?: string[] | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          body_fat_percentage: number | null
          created_at: string
          id: string
          log_date: string
          measurements: Json | null
          muscle_mass_kg: number | null
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string
          id?: string
          log_date?: string
          measurements?: Json | null
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string
          id?: string
          log_date?: string
          measurements?: Json | null
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      workout_schedule: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_schedule_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories_burned: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          is_template: boolean | null
          name: string
          user_id: string
          workout_type: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          is_template?: boolean | null
          name: string
          user_id: string
          workout_type: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          is_template?: boolean | null
          name?: string
          user_id?: string
          workout_type?: string
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
      activity_level:
        | "sedentary"
        | "lightly_active"
        | "moderately_active"
        | "very_active"
        | "extremely_active"
      dietary_preference:
        | "none"
        | "vegetarian"
        | "vegan"
        | "keto"
        | "paleo"
        | "mediterranean"
        | "gluten_free"
      fitness_goal:
        | "weight_loss"
        | "muscle_gain"
        | "maintenance"
        | "endurance"
        | "flexibility"
        | "general_health"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_level: [
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extremely_active",
      ],
      dietary_preference: [
        "none",
        "vegetarian",
        "vegan",
        "keto",
        "paleo",
        "mediterranean",
        "gluten_free",
      ],
      fitness_goal: [
        "weight_loss",
        "muscle_gain",
        "maintenance",
        "endurance",
        "flexibility",
        "general_health",
      ],
    },
  },
} as const
