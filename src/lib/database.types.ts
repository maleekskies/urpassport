// Hand-written to match supabase/migrations/0001_init.sql.
// If you have the Supabase CLI set up, you can replace this with a generated
// version: `supabase gen types typescript --local > src/lib/database.types.ts`
//
// Every table below declares `Relationships` (even when empty) because
// @supabase/postgrest-js's GenericTable type requires it. Omitting it means
// the table doesn't satisfy GenericTable, and the whole schema silently
// degrades to `never` for every query — the cause of "Object literal may
// only specify known properties... does not exist in type 'never[]'" build
// errors on `.insert()`/`.update()` calls.

export type ApplicationStatus =
  | "not_started"
  | "in_progress"
  | "action_needed"
  | "on_track"
  | "submitted"
  | "approved"
  | "rejected";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          nin_hash: string | null;
          auth_provider: string;
          created_at: string;
          updated_at: string;
          notify_email: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          file_url: string;
          file_name: string;
          file_size_bytes: number | null;
          verification_status: "pending" | "verified" | "rejected";
          linked_application_id: string | null;
          uploaded_at: string;
          expiry_date: string | null;
          reminder_sent_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]> & {
          user_id: string;
          document_type: string;
          file_url: string;
          file_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_linked_application_id_fkey";
            columns: ["linked_application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          }
        ];
      };
      application_types: {
        Row: {
          id: string;
          category: "passport" | "visa";
          destination: string | null;
          visa_subtype: string | null;
          display_name: string;
          fee_amount: number | null;
          fee_currency: string | null;
          processing_time_min_days: number | null;
          processing_time_max_days: number | null;
          document_requirements: { key: string; label: string; description: string; required: boolean }[];
          process_steps: { step_number: number; title: string; description: string }[];
          common_pitfalls: string[] | null;
          last_verified_date: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["application_types"]["Row"]> & {
          category: "passport" | "visa";
          display_name: string;
          document_requirements: unknown;
          process_steps: unknown;
          last_verified_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["application_types"]["Row"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          application_type_id: string;
          status: ApplicationStatus;
          current_step: number;
          completion_percent: number;
          checklist_state: Record<string, boolean>;
          reference_number: string | null;
          submitted_at: string | null;
          decision_at: string | null;
          created_at: string;
          updated_at: string;
          family_member_id: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["applications"]["Row"]> & {
          user_id: string;
          application_type_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_application_type_id_fkey";
            columns: ["application_type_id"];
            isOneToOne: false;
            referencedRelation: "application_types";
            referencedColumns: ["id"];
          }
        ];
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          event_type: string;
          event_label: string;
          occurred_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["application_events"]["Row"]> & {
          application_id: string;
          event_type: string;
          event_label: string;
        };
        Update: Partial<Database["public"]["Tables"]["application_events"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          }
        ];
      };
      itineraries: {
        Row: {
          id: string;
          user_id: string;
          linked_application_id: string | null;
          destination: string;
          start_date: string | null;
          end_date: string | null;
          budget_ngn: number | null;
          purpose: string | null;
          plan_json: unknown;
          ai_model_version: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["itineraries"]["Row"]> & {
          user_id: string;
          destination: string;
          plan_json: unknown;
        };
        Update: Partial<Database["public"]["Tables"]["itineraries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "itineraries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "itineraries_linked_application_id_fkey";
            columns: ["linked_application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          linked_itinerary_id: string | null;
          booking_type: "flight" | "hotel";
          provider: string | null;
          origin: string | null;
          destination: string | null;
          depart_date: string | null;
          return_date: string | null;
          price_ngn: number | null;
          status: "searched" | "held" | "booked" | "cancelled";
          provider_reference: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          user_id: string;
          booking_type: "flight" | "hotel";
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_linked_itinerary_id_fkey";
            columns: ["linked_itinerary_id"];
            isOneToOne: false;
            referencedRelation: "itineraries";
            referencedColumns: ["id"];
          }
        ];
      };
      family_members: {
        Row: {
          id: string;
          owner_user_id: string;
          full_name: string;
          relationship: string | null;
          date_of_birth: string | null;
          nin_hash: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["family_members"]["Row"]> & {
          owner_user_id: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_members"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "family_members_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      ai_usage_log: {
        Row: { id: string; user_id: string; feature: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["ai_usage_log"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["ai_usage_log"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "ai_usage_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_log: {
        Row: {
          id: string;
          user_id: string;
          channel: string;
          subject: string;
          related_type: string | null;
          related_id: string | null;
          sent_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notification_log"]["Row"]> & {
          user_id: string;
          subject: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_log"]["Row"]>;
        Relationships: [];
      };
      visa_requirements_cache: {
        Row: {
          id: string;
          passport_code: string;
          destination_code: string;
          data: unknown;
          fetched_at: string;
          expires_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["visa_requirements_cache"]["Row"]> & {
          passport_code: string;
          destination_code: string;
          data: unknown;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["visa_requirements_cache"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          linked_application_id: string | null;
          linked_booking_id: string | null;
          amount: number;
          currency: string;
          purpose: string;
          paystack_reference: string | null;
          status: "pending" | "success" | "failed";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          user_id: string;
          amount: number;
          purpose: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_linked_application_id_fkey";
            columns: ["linked_application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_linked_booking_id_fkey";
            columns: ["linked_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationTypeRow = Database["public"]["Tables"]["application_types"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
