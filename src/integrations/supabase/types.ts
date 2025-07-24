export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          revenue: string | null
          size: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          revenue?: string | null
          size?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          revenue?: string | null
          size?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_egnyte_link: string | null
          account_name: string | null
          account_name_id: string | null
          average_time_spent_minutes: number | null
          change_log_time: string | null
          city: string | null
          company_id: string | null
          conferences_organizations_attended: string | null
          contact_name: string | null
          contact_owner: string | null
          contact_owner_id: string | null
          country: string | null
          county: string | null
          created_at: string
          created_by: string | null
          created_by_id: string | null
          created_time: string | null
          days_visited: number | null
          department: string | null
          description: string | null
          direct_phone: string | null
          email: string | null
          email_opt_out: boolean | null
          enrich_status: string | null
          first_name: string
          first_page_visited: string | null
          first_visit: string | null
          general_phone: string | null
          id: string
          industry_fb_group_memberships: string | null
          last_activity_time: string | null
          last_enriched_time: string | null
          last_name: string
          lead_source: string | null
          linkedin_connection: string | null
          locked: boolean | null
          mobile: string | null
          modified_by: string | null
          modified_by_id: string | null
          modified_time: string | null
          most_recent_visit: string | null
          name_pronunciation: string | null
          notes: string | null
          number_of_chats: number | null
          phone: string | null
          record_id: string | null
          reference_egnyte_link: string | null
          reference_services_products: string | null
          reference_subject_matter: string | null
          reference_type: string | null
          referrer: string | null
          reporting_to: string | null
          reporting_to_id: string | null
          role_in_deals: string | null
          salutation: string | null
          state: string | null
          street: string | null
          tag: string | null
          title: string | null
          unsubscribed_mode: string | null
          unsubscribed_time: string | null
          updated_at: string
          user_id: string
          vendor_name: string | null
          vendor_name_id: string | null
          visitor_score: number | null
          zip_code: string | null
        }
        Insert: {
          account_egnyte_link?: string | null
          account_name?: string | null
          account_name_id?: string | null
          average_time_spent_minutes?: number | null
          change_log_time?: string | null
          city?: string | null
          company_id?: string | null
          conferences_organizations_attended?: string | null
          contact_name?: string | null
          contact_owner?: string | null
          contact_owner_id?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          created_by_id?: string | null
          created_time?: string | null
          days_visited?: number | null
          department?: string | null
          description?: string | null
          direct_phone?: string | null
          email?: string | null
          email_opt_out?: boolean | null
          enrich_status?: string | null
          first_name: string
          first_page_visited?: string | null
          first_visit?: string | null
          general_phone?: string | null
          id?: string
          industry_fb_group_memberships?: string | null
          last_activity_time?: string | null
          last_enriched_time?: string | null
          last_name: string
          lead_source?: string | null
          linkedin_connection?: string | null
          locked?: boolean | null
          mobile?: string | null
          modified_by?: string | null
          modified_by_id?: string | null
          modified_time?: string | null
          most_recent_visit?: string | null
          name_pronunciation?: string | null
          notes?: string | null
          number_of_chats?: number | null
          phone?: string | null
          record_id?: string | null
          reference_egnyte_link?: string | null
          reference_services_products?: string | null
          reference_subject_matter?: string | null
          reference_type?: string | null
          referrer?: string | null
          reporting_to?: string | null
          reporting_to_id?: string | null
          role_in_deals?: string | null
          salutation?: string | null
          state?: string | null
          street?: string | null
          tag?: string | null
          title?: string | null
          unsubscribed_mode?: string | null
          unsubscribed_time?: string | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
          vendor_name_id?: string | null
          visitor_score?: number | null
          zip_code?: string | null
        }
        Update: {
          account_egnyte_link?: string | null
          account_name?: string | null
          account_name_id?: string | null
          average_time_spent_minutes?: number | null
          change_log_time?: string | null
          city?: string | null
          company_id?: string | null
          conferences_organizations_attended?: string | null
          contact_name?: string | null
          contact_owner?: string | null
          contact_owner_id?: string | null
          country?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          created_by_id?: string | null
          created_time?: string | null
          days_visited?: number | null
          department?: string | null
          description?: string | null
          direct_phone?: string | null
          email?: string | null
          email_opt_out?: boolean | null
          enrich_status?: string | null
          first_name?: string
          first_page_visited?: string | null
          first_visit?: string | null
          general_phone?: string | null
          id?: string
          industry_fb_group_memberships?: string | null
          last_activity_time?: string | null
          last_enriched_time?: string | null
          last_name?: string
          lead_source?: string | null
          linkedin_connection?: string | null
          locked?: boolean | null
          mobile?: string | null
          modified_by?: string | null
          modified_by_id?: string | null
          modified_time?: string | null
          most_recent_visit?: string | null
          name_pronunciation?: string | null
          notes?: string | null
          number_of_chats?: number | null
          phone?: string | null
          record_id?: string | null
          reference_egnyte_link?: string | null
          reference_services_products?: string | null
          reference_subject_matter?: string | null
          reference_type?: string | null
          referrer?: string | null
          reporting_to?: string | null
          reporting_to_id?: string | null
          role_in_deals?: string | null
          salutation?: string | null
          state?: string | null
          street?: string | null
          tag?: string | null
          title?: string | null
          unsubscribed_mode?: string | null
          unsubscribed_time?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
          vendor_name_id?: string | null
          visitor_score?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_name_id_fkey"
            columns: ["account_name_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_reporting_to_id_fkey"
            columns: ["reporting_to_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_reporting_to_id_fkey"
            columns: ["reporting_to_id"]
            isOneToOne: false
            referencedRelation: "contacts_export_view"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          close_date: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          probability: number | null
          stage: Database["public"]["Enums"]["deal_stage"]
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_export_view"
            referencedColumns: ["id"]
          },
        ]
      }
      import_audit_log: {
        Row: {
          created_at: string
          data_type: string
          file_name: string
          file_size: number
          id: string
          import_status: string
          ip_address: unknown | null
          records_imported: number
          records_processed: number
          security_flags: string[] | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data_type: string
          file_name: string
          file_size: number
          id?: string
          import_status?: string
          ip_address?: unknown | null
          records_imported: number
          records_processed: number
          security_flags?: string[] | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data_type?: string
          file_name?: string
          file_size?: number
          id?: string
          import_status?: string
          ip_address?: unknown | null
          records_imported?: number
          records_processed?: number
          security_flags?: string[] | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_export_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      contacts_export_view: {
        Row: {
          "Account Egnyte Link": string | null
          "Account Name": string | null
          City: string | null
          "Conferences & Organizations Attended": string | null
          "Contact Name": string | null
          "Contact Owner": string | null
          Country: string | null
          County: string | null
          "Created By": string | null
          created_at: string | null
          Department: string | null
          Description: string | null
          "Direct Phone": string | null
          Email: string | null
          "Email Opt Out": boolean | null
          "Enrich Status": string | null
          "First Name": string | null
          "First Page Visited": string | null
          "General Phone": string | null
          id: string | null
          "Industry & FB Group Memberships": string | null
          "Last Name": string | null
          "Lead Source": string | null
          "LinkedIn Connection": string | null
          Mobile: string | null
          "Modified By": string | null
          "Name Pronunciation": string | null
          notes: string | null
          Phone: string | null
          "Record Id": string | null
          "Reference Egnyte Link": string | null
          "Reference Services Products & Solutions": string | null
          "Reference Subject Matter, Use Case & Department": string | null
          "Reference Type": string | null
          Referrer: string | null
          "Reporting To": string | null
          "Role in deals": string | null
          Salutation: string | null
          State: string | null
          Street: string | null
          Tag: string | null
          Title: string | null
          "Unsubscribed Mode": string | null
          "Unsubscribed Time": string | null
          updated_at: string | null
          user_id: string | null
          "Vendor Name": string | null
          "Zip Code": string | null
        }
        Insert: {
          "Account Egnyte Link"?: string | null
          "Account Name"?: string | null
          City?: string | null
          "Conferences & Organizations Attended"?: string | null
          "Contact Name"?: string | null
          "Contact Owner"?: string | null
          Country?: string | null
          County?: string | null
          "Created By"?: string | null
          created_at?: string | null
          Department?: string | null
          Description?: string | null
          "Direct Phone"?: string | null
          Email?: string | null
          "Email Opt Out"?: boolean | null
          "Enrich Status"?: string | null
          "First Name"?: string | null
          "First Page Visited"?: string | null
          "General Phone"?: string | null
          id?: string | null
          "Industry & FB Group Memberships"?: string | null
          "Last Name"?: string | null
          "Lead Source"?: string | null
          "LinkedIn Connection"?: string | null
          Mobile?: string | null
          "Modified By"?: string | null
          "Name Pronunciation"?: string | null
          notes?: string | null
          Phone?: string | null
          "Record Id"?: string | null
          "Reference Egnyte Link"?: string | null
          "Reference Services Products & Solutions"?: string | null
          "Reference Subject Matter, Use Case & Department"?: string | null
          "Reference Type"?: string | null
          Referrer?: string | null
          "Reporting To"?: string | null
          "Role in deals"?: string | null
          Salutation?: string | null
          State?: string | null
          Street?: string | null
          Tag?: string | null
          Title?: string | null
          "Unsubscribed Mode"?: string | null
          "Unsubscribed Time"?: string | null
          updated_at?: string | null
          user_id?: string | null
          "Vendor Name"?: string | null
          "Zip Code"?: string | null
        }
        Update: {
          "Account Egnyte Link"?: string | null
          "Account Name"?: string | null
          City?: string | null
          "Conferences & Organizations Attended"?: string | null
          "Contact Name"?: string | null
          "Contact Owner"?: string | null
          Country?: string | null
          County?: string | null
          "Created By"?: string | null
          created_at?: string | null
          Department?: string | null
          Description?: string | null
          "Direct Phone"?: string | null
          Email?: string | null
          "Email Opt Out"?: boolean | null
          "Enrich Status"?: string | null
          "First Name"?: string | null
          "First Page Visited"?: string | null
          "General Phone"?: string | null
          id?: string | null
          "Industry & FB Group Memberships"?: string | null
          "Last Name"?: string | null
          "Lead Source"?: string | null
          "LinkedIn Connection"?: string | null
          Mobile?: string | null
          "Modified By"?: string | null
          "Name Pronunciation"?: string | null
          notes?: string | null
          Phone?: string | null
          "Record Id"?: string | null
          "Reference Egnyte Link"?: string | null
          "Reference Services Products & Solutions"?: string | null
          "Reference Subject Matter, Use Case & Department"?: string | null
          "Reference Type"?: string | null
          Referrer?: string | null
          "Reporting To"?: string | null
          "Role in deals"?: string | null
          Salutation?: string | null
          State?: string | null
          Street?: string | null
          Tag?: string | null
          Title?: string | null
          "Unsubscribed Mode"?: string | null
          "Unsubscribed Time"?: string | null
          updated_at?: string | null
          user_id?: string | null
          "Vendor Name"?: string | null
          "Zip Code"?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args: {
          target_user_id: string
          new_role: string
          reason?: string
          expires_at?: string
        }
        Returns: boolean
      }
      check_import_rate_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      validate_csv_data: {
        Args: { data_type: string; row_data: Json }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "sales_rep"
      deal_stage:
        | "prospect"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      task_status: "pending" | "completed" | "cancelled"
      task_type: "call" | "email" | "meeting" | "follow_up" | "demo" | "other"
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
      app_role: ["admin", "manager", "sales_rep"],
      deal_stage: [
        "prospect",
        "qualified",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      task_status: ["pending", "completed", "cancelled"],
      task_type: ["call", "email", "meeting", "follow_up", "demo", "other"],
    },
  },
} as const
