
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
      addresses: {
        Row: {
          city: string
          contact_name: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          postcode: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          postcode: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string
          contact_name?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          postcode?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      menu: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          image_id: string | null
          is_popular: boolean | null
          is_vegetarian: boolean | null
          name: string
          price: number
          spice_level: number | null
          spicy: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_id?: string | null
          is_popular?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          price: number
          spice_level?: number | null
          spicy?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_id?: string | null
          is_popular?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          price?: number
          spice_level?: number | null
          spicy?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string | null
          display_order: number
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_item_spice_levels: {
        Row: {
          created_at: string | null
          id: number
          menu_item_id: number
          session_id: string | null
          spice_level: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          menu_item_id: number
          session_id?: string | null
          spice_level?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          menu_item_id?: number
          session_id?: string | null
          spice_level?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_spice_levels_new_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          menu_item_name: string
          menu_item_price: number
          order_id: string
          quantity: number
          spice_level: number | null
          subtotal: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          menu_item_name: string
          menu_item_price: number
          order_id: string
          quantity: number
          spice_level?: number | null
          subtotal: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          menu_item_name?: string
          menu_item_price?: number
          order_id?: string
          quantity?: number
          spice_level?: number | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          contact_phone: string | null
          created_at: string | null
          delivery_address_id: string | null
          delivery_address_text: string | null
          delivery_fee: number | null
          discount: number | null
          id: string
          order_type: string
          payment_method_id: string | null
          payment_type: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string | null
          delivery_address_id?: string | null
          delivery_address_text?: string | null
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          order_type: string
          payment_method_id?: string | null
          payment_type?: string | null
          special_instructions?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string | null
          delivery_address_id?: string | null
          delivery_address_text?: string | null
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          order_type?: string
          payment_method_id?: string | null
          payment_type?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string | null
          expiry_month: string | null
          expiry_year: string | null
          holder_name: string | null
          id: string
          is_default: boolean | null
          last4: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          expiry_month?: string | null
          expiry_year?: string | null
          holder_name?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          expiry_month?: string | null
          expiry_year?: string | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          name: string
          password_hash: string
          phone: string | null
          phone_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          name: string
          password_hash: string
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string
          password_hash?: string
          phone?: string | null
          phone_verified?: boolean | null
          updated_at?: string | null
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
    Enums: {},
  },
} as const
