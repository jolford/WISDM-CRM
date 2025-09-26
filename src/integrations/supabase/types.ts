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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      accounts: {
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
      automation_actions: {
        Row: {
          action_type: string
          config: Json | null
          id: string
          rule_id: string | null
        }
        Insert: {
          action_type: string
          config?: Json | null
          id?: string
          rule_id?: string | null
        }
        Update: {
          action_type?: string
          config?: Json | null
          id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_conditions: {
        Row: {
          field: string
          id: string
          operator: string
          rule_id: string | null
          value: string
        }
        Insert: {
          field: string
          id?: string
          operator: string
          rule_id?: string | null
          value: string
        }
        Update: {
          field?: string
          id?: string
          operator?: string
          rule_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_conditions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          id: string
          message: string | null
          rule_id: string | null
          status: string | null
          triggered_at: string | null
        }
        Insert: {
          id?: string
          message?: string | null
          rule_id?: string | null
          status?: string | null
          triggered_at?: string | null
        }
        Update: {
          id?: string
          message?: string | null
          rule_id?: string | null
          status?: string | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_egnyte_link: string | null
          account_id: string | null
          account_name: string | null
          account_name_id: string | null
          average_time_spent_minutes: number | null
          change_log_time: string | null
          city: string | null
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
          account_id?: string | null
          account_name?: string | null
          account_name_id?: string | null
          average_time_spent_minutes?: number | null
          change_log_time?: string | null
          city?: string | null
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
          account_id?: string | null
          account_name?: string | null
          account_name_id?: string | null
          average_time_spent_minutes?: number | null
          change_log_time?: string | null
          city?: string | null
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
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
      dashboard_widgets: {
        Row: {
          created_at: string
          dashboard_id: string
          data_source: string
          height: number
          id: string
          position_x: number
          position_y: number
          updated_at: string
          widget_config: Json
          widget_title: string | null
          widget_type: string
          width: number
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          data_source: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          widget_config: Json
          widget_title?: string | null
          widget_type: string
          width?: number
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          data_source?: string
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          widget_config?: Json
          widget_title?: string | null
          widget_type?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_invoices: {
        Row: {
          amount: number
          created_at: string
          deal_id: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid_amount: number
          paid_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          deal_id: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deal_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal_collections_summary"
            referencedColumns: ["deal_id"]
          },
          {
            foreignKeyName: "deal_invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          account_id: string | null
          account_name: string | null
          close_date: string | null
          contact_id: string | null
          contact_name: string | null
          created_at: string
          deal_owner_name: string | null
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
          account_id?: string | null
          account_name?: string | null
          close_date?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          deal_owner_name?: string | null
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
          account_id?: string | null
          account_name?: string | null
          close_date?: string | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          deal_owner_name?: string | null
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
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
      forecasts: {
        Row: {
          actual_amount: number | null
          created_at: string
          forecast_type: string
          id: string
          notes: string | null
          period: string
          probability: number | null
          target_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          created_at?: string
          forecast_type?: string
          id?: string
          notes?: string | null
          period: string
          probability?: number | null
          target_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          created_at?: string
          forecast_type?: string
          id?: string
          notes?: string | null
          period?: string
          probability?: number | null
          target_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      maintenance_notifications: {
        Row: {
          created_at: string
          email_sent: boolean
          id: string
          maintenance_record_id: string | null
          notification_type: string
          sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean
          id?: string
          maintenance_record_id?: string | null
          notification_type: string
          sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean
          id?: string
          maintenance_record_id?: string | null
          notification_type?: string
          sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_notifications_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          account_id: string | null
          cost: number | null
          created_at: string
          end_date: string | null
          id: string
          income: number | null
          license_key: string | null
          margin_percent: number | null
          notes: string | null
          product_name: string
          product_type: string
          profit: number | null
          purchase_date: string | null
          renewal_reminder_days: number | null
          serial_number: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          account_id?: string | null
          cost?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          income?: number | null
          license_key?: string | null
          margin_percent?: number | null
          notes?: string | null
          product_name: string
          product_type: string
          profit?: number | null
          purchase_date?: string | null
          renewal_reminder_days?: number | null
          serial_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          account_id?: string | null
          cost?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          income?: number | null
          license_key?: string | null
          margin_percent?: number | null
          notes?: string | null
          product_name?: string
          product_type?: string
          profit?: number | null
          purchase_date?: string | null
          renewal_reminder_days?: number | null
          serial_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_company_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: number
          name: string
          user_id: string | null
        }
        Insert: {
          id?: number
          name: string
          user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          enable_maintenance_notifications: boolean | null
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          notification_email: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          enable_maintenance_notifications?: boolean | null
          first_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          notification_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          enable_maintenance_notifications?: boolean | null
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          notification_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      report_charts: {
        Row: {
          aggregate_function: string | null
          chart_config: Json | null
          chart_title: string | null
          chart_type: string
          created_at: string
          height: number | null
          id: string
          position_x: number | null
          position_y: number | null
          report_id: string
          updated_at: string
          width: number | null
          x_axis_field: string | null
          y_axis_field: string | null
        }
        Insert: {
          aggregate_function?: string | null
          chart_config?: Json | null
          chart_title?: string | null
          chart_type: string
          created_at?: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          report_id: string
          updated_at?: string
          width?: number | null
          x_axis_field?: string | null
          y_axis_field?: string | null
        }
        Update: {
          aggregate_function?: string | null
          chart_config?: Json | null
          chart_title?: string | null
          chart_type?: string
          created_at?: string
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          report_id?: string
          updated_at?: string
          width?: number | null
          x_axis_field?: string | null
          y_axis_field?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_charts_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_filters: {
        Row: {
          created_at: string
          field_name: string
          filter_group: number | null
          id: string
          logical_operator: string | null
          operator: string
          report_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          field_name: string
          filter_group?: number | null
          id?: string
          logical_operator?: string | null
          operator: string
          report_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          field_name?: string
          filter_group?: number | null
          id?: string
          logical_operator?: string | null
          operator?: string
          report_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "report_filters_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          aggregate_functions: Json | null
          chart_config: Json | null
          created_at: string
          created_by_name: string | null
          dashboard_layout: Json | null
          data_sources: string[] | null
          description: string | null
          folder_name: string | null
          group_by_fields: string[] | null
          id: string
          is_active: boolean | null
          is_dashboard: boolean | null
          is_public: boolean | null
          last_accessed_at: string | null
          last_run: string | null
          name: string
          next_run: string | null
          report_type: string
          selected_fields: Json | null
          shared_with: string[] | null
          sort_fields: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aggregate_functions?: Json | null
          chart_config?: Json | null
          created_at?: string
          created_by_name?: string | null
          dashboard_layout?: Json | null
          data_sources?: string[] | null
          description?: string | null
          folder_name?: string | null
          group_by_fields?: string[] | null
          id?: string
          is_active?: boolean | null
          is_dashboard?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          last_run?: string | null
          name: string
          next_run?: string | null
          report_type?: string
          selected_fields?: Json | null
          shared_with?: string[] | null
          sort_fields?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aggregate_functions?: Json | null
          chart_config?: Json | null
          created_at?: string
          created_by_name?: string | null
          dashboard_layout?: Json | null
          data_sources?: string[] | null
          description?: string | null
          folder_name?: string | null
          group_by_fields?: string[] | null
          id?: string
          is_active?: boolean | null
          is_dashboard?: boolean | null
          is_public?: boolean | null
          last_accessed_at?: string | null
          last_run?: string | null
          name?: string
          next_run?: string | null
          report_type?: string
          selected_fields?: Json | null
          shared_with?: string[] | null
          sort_fields?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          trigger: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          trigger: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          trigger?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          customer_name: string
          id: string
          product: string | null
          region: string | null
          rep_name: string
          stage: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name: string
          id?: string
          product?: string | null
          region?: string | null
          rep_name: string
          stage?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string
          id?: string
          product?: string | null
          region?: string | null
          rep_name?: string
          stage?: string | null
          status?: string | null
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          format: string
          id: string
          is_active: boolean | null
          last_sent: string | null
          next_send: string | null
          recipients: string[]
          report_id: string
          schedule_config: Json
          schedule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format?: string
          id?: string
          is_active?: boolean | null
          last_sent?: string | null
          next_send?: string | null
          recipients: string[]
          report_id: string
          schedule_config: Json
          schedule_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          is_active?: boolean | null
          last_sent?: string | null
          next_send?: string | null
          recipients?: string[]
          report_id?: string
          schedule_config?: Json
          schedule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          account_id: string | null
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
          account_id?: string | null
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
          account_id?: string | null
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
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
            referencedRelation: "deal_collections_summary"
            referencedColumns: ["deal_id"]
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
      ticket_messages: {
        Row: {
          created_at: string | null
          id: number
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          attachment_url: string | null
          company: string | null
          created_at: string | null
          customer_name: string | null
          description: string | null
          email: string | null
          id: string
          priority: string | null
          product: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          company?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          email?: string | null
          id?: string
          priority?: string | null
          product?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          company?: string | null
          created_at?: string | null
          customer_name?: string | null
          description?: string | null
          email?: string | null
          id?: string
          priority?: string | null
          product?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      contacts_export_view: {
        Row: {
          "Account Egnyte Link": string | null
          "Account Name": string | null
          city: string | null
          "Conferences & Organizations Attended": string | null
          "Contact Name": string | null
          "Contact Owner": string | null
          country: string | null
          county: string | null
          "Created By": string | null
          created_at: string | null
          department: string | null
          description: string | null
          "Direct Phone": string | null
          email: string | null
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
          mobile: string | null
          "Modified By": string | null
          "Name Pronunciation": string | null
          notes: string | null
          phone: string | null
          "Record Id": string | null
          "Reference Egnyte Link": string | null
          "Reference Services Products & Solutions": string | null
          "Reference Subject Matter, Use Case & Department": string | null
          "Reference Type": string | null
          referrer: string | null
          "Role in deals": string | null
          salutation: string | null
          state: string | null
          street: string | null
          Tag: string | null
          title: string | null
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
          city?: string | null
          "Conferences & Organizations Attended"?: string | null
          "Contact Name"?: string | null
          "Contact Owner"?: string | null
          country?: string | null
          county?: string | null
          "Created By"?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          "Direct Phone"?: string | null
          email?: string | null
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
          mobile?: string | null
          "Modified By"?: string | null
          "Name Pronunciation"?: string | null
          notes?: string | null
          phone?: string | null
          "Record Id"?: string | null
          "Reference Egnyte Link"?: string | null
          "Reference Services Products & Solutions"?: string | null
          "Reference Subject Matter, Use Case & Department"?: string | null
          "Reference Type"?: string | null
          referrer?: string | null
          "Role in deals"?: string | null
          salutation?: string | null
          state?: string | null
          street?: string | null
          Tag?: string | null
          title?: string | null
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
          city?: string | null
          "Conferences & Organizations Attended"?: string | null
          "Contact Name"?: string | null
          "Contact Owner"?: string | null
          country?: string | null
          county?: string | null
          "Created By"?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          "Direct Phone"?: string | null
          email?: string | null
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
          mobile?: string | null
          "Modified By"?: string | null
          "Name Pronunciation"?: string | null
          notes?: string | null
          phone?: string | null
          "Record Id"?: string | null
          "Reference Egnyte Link"?: string | null
          "Reference Services Products & Solutions"?: string | null
          "Reference Subject Matter, Use Case & Department"?: string | null
          "Reference Type"?: string | null
          referrer?: string | null
          "Role in deals"?: string | null
          salutation?: string | null
          state?: string | null
          street?: string | null
          Tag?: string | null
          title?: string | null
          "Unsubscribed Mode"?: string | null
          "Unsubscribed Time"?: string | null
          updated_at?: string | null
          user_id?: string | null
          "Vendor Name"?: string | null
          "Zip Code"?: string | null
        }
        Relationships: []
      }
      deal_collections_summary: {
        Row: {
          account_name: string | null
          contact_name: string | null
          deal_id: string | null
          deal_name: string | null
          deal_owner_name: string | null
          expected_value: number | null
          stage: Database["public"]["Enums"]["deal_stage"] | null
          total_sales: number | null
        }
        Insert: {
          account_name?: string | null
          contact_name?: string | null
          deal_id?: string | null
          deal_name?: string | null
          deal_owner_name?: string | null
          expected_value?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          total_sales?: number | null
        }
        Update: {
          account_name?: string | null
          contact_name?: string | null
          deal_id?: string | null
          deal_name?: string | null
          deal_owner_name?: string | null
          expected_value?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          total_sales?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_user_role: {
        Args:
          | {
              expires_at?: string
              new_role: string
              reason?: string
              target_user_id: string
            }
          | { new_role: string; reason?: string; target_user_id: string }
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
      handle_new_ticket_message: {
        Args:
          | Record<PropertyKey, never>
          | { message_text: string; ticket_id: string }
          | { p_message_text: string; p_sender_id: string; p_ticket_id: number }
        Returns: undefined
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
