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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_interviews: {
        Row: {
          answers: Json | null
          archived: boolean
          candidate_id: string
          completed_at: string | null
          created_at: string
          evaluation: Json | null
          id: string
          interview_token: string
          questions: Json | null
          score: number | null
          started_at: string | null
          status: string
          updated_at: string
          video_analysis: Json | null
          video_url: string | null
        }
        Insert: {
          answers?: Json | null
          archived?: boolean
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          evaluation?: Json | null
          id?: string
          interview_token?: string
          questions?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          video_analysis?: Json | null
          video_url?: string | null
        }
        Update: {
          answers?: Json | null
          archived?: boolean
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          evaluation?: Json | null
          id?: string
          interview_token?: string
          questions?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          video_analysis?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_change_logs: {
        Row: {
          action: string
          candidate_email: string
          candidate_id: string
          changed_fields: Json | null
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          source: string
        }
        Insert: {
          action: string
          candidate_email: string
          candidate_id: string
          changed_fields?: Json | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          source?: string
        }
        Update: {
          action?: string
          candidate_email?: string
          candidate_id?: string
          changed_fields?: Json | null
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_change_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_stage_notes: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string
          id: string
          note: string
          stage: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by: string
          id?: string
          note: string
          stage: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string
          id?: string
          note?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_stage_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_match_analysis: Json | null
          ai_match_score: number | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          job_id: string | null
          phone: string | null
          resume_text: string | null
          resume_url: string | null
          skills: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          ai_match_analysis?: Json | null
          ai_match_score?: number | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          job_id?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          skills?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          ai_match_analysis?: Json | null
          ai_match_score?: number | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          job_id?: string | null
          phone?: string | null
          resume_text?: string | null
          resume_url?: string | null
          skills?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_templates: {
        Row: {
          billing_rate: string | null
          created_at: string
          currency: string | null
          department: string | null
          document_template: string | null
          expected_qualification: string | null
          experience: string | null
          id: string
          job_description: string | null
          job_type: string | null
          language: string | null
          mode_of_work: string | null
          pipeline_template: string | null
          placement_template: string | null
          position: string
          priority_level: string | null
          role_experience: string | null
          salary_max: string | null
          salary_min: string | null
          sector: string | null
          segments: string | null
          template_name: string
          updated_at: string
        }
        Insert: {
          billing_rate?: string | null
          created_at?: string
          currency?: string | null
          department?: string | null
          document_template?: string | null
          expected_qualification?: string | null
          experience?: string | null
          id?: string
          job_description?: string | null
          job_type?: string | null
          language?: string | null
          mode_of_work?: string | null
          pipeline_template?: string | null
          placement_template?: string | null
          position: string
          priority_level?: string | null
          role_experience?: string | null
          salary_max?: string | null
          salary_min?: string | null
          sector?: string | null
          segments?: string | null
          template_name: string
          updated_at?: string
        }
        Update: {
          billing_rate?: string | null
          created_at?: string
          currency?: string | null
          department?: string | null
          document_template?: string | null
          expected_qualification?: string | null
          experience?: string | null
          id?: string
          job_description?: string | null
          job_type?: string | null
          language?: string | null
          mode_of_work?: string | null
          pipeline_template?: string | null
          placement_template?: string | null
          position?: string
          priority_level?: string | null
          role_experience?: string | null
          salary_max?: string | null
          salary_min?: string | null
          sector?: string | null
          segments?: string | null
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          billing_rate: string | null
          branch: string | null
          closing_date: string | null
          closing_time: string | null
          created_at: string
          currency: string | null
          department: string | null
          document_template: string | null
          expected_qualification: string | null
          experience: string | null
          hod_approvers: string | null
          id: string
          include_other_locations: boolean | null
          interview_questions: Json | null
          job_description: string | null
          job_type: string | null
          language: string | null
          management_approvers: string | null
          mode_of_work: string | null
          pipeline_template: string | null
          placement_template: string | null
          position: string
          primary_locations: string | null
          priority_level: string | null
          reference_no: string | null
          role_experience: string | null
          salary_max: string | null
          salary_min: string | null
          secondary_locations: string | null
          sector: string | null
          segments: string | null
          state: string | null
          status: string | null
          updated_at: string
          vacancies: number
          zone: string | null
        }
        Insert: {
          billing_rate?: string | null
          branch?: string | null
          closing_date?: string | null
          closing_time?: string | null
          created_at?: string
          currency?: string | null
          department?: string | null
          document_template?: string | null
          expected_qualification?: string | null
          experience?: string | null
          hod_approvers?: string | null
          id?: string
          include_other_locations?: boolean | null
          interview_questions?: Json | null
          job_description?: string | null
          job_type?: string | null
          language?: string | null
          management_approvers?: string | null
          mode_of_work?: string | null
          pipeline_template?: string | null
          placement_template?: string | null
          position: string
          primary_locations?: string | null
          priority_level?: string | null
          reference_no?: string | null
          role_experience?: string | null
          salary_max?: string | null
          salary_min?: string | null
          secondary_locations?: string | null
          sector?: string | null
          segments?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          vacancies?: number
          zone?: string | null
        }
        Update: {
          billing_rate?: string | null
          branch?: string | null
          closing_date?: string | null
          closing_time?: string | null
          created_at?: string
          currency?: string | null
          department?: string | null
          document_template?: string | null
          expected_qualification?: string | null
          experience?: string | null
          hod_approvers?: string | null
          id?: string
          include_other_locations?: boolean | null
          interview_questions?: Json | null
          job_description?: string | null
          job_type?: string | null
          language?: string | null
          management_approvers?: string | null
          mode_of_work?: string | null
          pipeline_template?: string | null
          placement_template?: string | null
          position?: string
          primary_locations?: string | null
          priority_level?: string | null
          reference_no?: string | null
          role_experience?: string | null
          salary_max?: string | null
          salary_min?: string | null
          secondary_locations?: string | null
          sector?: string | null
          segments?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          vacancies?: number
          zone?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          related_candidate_id: string | null
          related_job_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          related_candidate_id?: string | null
          related_job_id?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          related_candidate_id?: string | null
          related_job_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_candidate_id_fkey"
            columns: ["related_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_activity_logs: {
        Row: {
          candidate_id: string | null
          candidate_name: string
          candidate_email: string | null
          interview_score: number | null
          interview_details: Json | null
          changed_by: string | null
          changed_by_name: string | null
          created_at: string
          id: string
          job_id: string | null
          job_position: string | null
          new_stage: string
          new_stage_label: string | null
          old_stage: string | null
          old_stage_label: string | null
        }
        Insert: {
          candidate_id?: string | null
          candidate_name: string
          candidate_email?: string | null
          interview_score?: number | null
          interview_details?: Json | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_position?: string | null
          new_stage: string
          new_stage_label?: string | null
          old_stage?: string | null
          old_stage_label?: string | null
        }
        Update: {
          candidate_id?: string | null
          candidate_name?: string
          candidate_email?: string | null
          interview_score?: number | null
          interview_details?: Json | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_position?: string | null
          new_stage?: string
          new_stage_label?: string | null
          old_stage?: string | null
          old_stage_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_activity_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_activity_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          attachment_url: string | null
          created_at: string
          department: string
          description: string
          id: string
          name: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          department: string
          description: string
          id?: string
          name: string
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          department?: string
          description?: string
          id?: string
          name?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_stage_label: { Args: { stage_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr_staff" | "user" | "recruiter"
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
      app_role: ["admin", "hr_staff", "user", "recruiter"],
    },
  },
} as const