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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          category: Database["public"]["Enums"]["blog_category"]
          content: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          post_date: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["blog_category"]
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          post_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["blog_category"]
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          post_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cows: {
        Row: {
          age: string | null
          breed: string | null
          cow_number: number
          created_at: string
          health_status: Database["public"]["Enums"]["health_status"]
          id: string
          is_adopted: boolean
          milk_yield_litres: number | null
          name: string
          notes: string | null
          photo_url: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          cow_number: number
          created_at?: string
          health_status?: Database["public"]["Enums"]["health_status"]
          id?: string
          is_adopted?: boolean
          milk_yield_litres?: number | null
          name: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          cow_number?: number
          created_at?: string
          health_status?: Database["public"]["Enums"]["health_status"]
          id?: string
          is_adopted?: boolean
          milk_yield_litres?: number | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          awb_number: string | null
          city: string
          courier_partner: string | null
          created_at: string
          customer_email: string | null
          customer_mobile: string
          customer_name: string
          delivery_charge: number
          discount: number
          expected_delivery: string | null
          id: string
          internal_notes: string | null
          items: Json
          landmark: string | null
          order_id: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          pincode: string
          state: string
          status_history: Json
          subtotal: number
          total_amount: number
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          awb_number?: string | null
          city: string
          courier_partner?: string | null
          created_at?: string
          customer_email?: string | null
          customer_mobile: string
          customer_name: string
          delivery_charge?: number
          discount?: number
          expected_delivery?: string | null
          id?: string
          internal_notes?: string | null
          items?: Json
          landmark?: string | null
          order_id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode: string
          state: string
          status_history?: Json
          subtotal?: number
          total_amount?: number
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          awb_number?: string | null
          city?: string
          courier_partner?: string | null
          created_at?: string
          customer_email?: string | null
          customer_mobile?: string
          customer_name?: string
          delivery_charge?: number
          discount?: number
          expected_delivery?: string | null
          id?: string
          internal_notes?: string | null
          items?: Json
          landmark?: string | null
          order_id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pincode?: string
          state?: string
          status_history?: Json
          subtotal?: number
          total_amount?: number
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          mrp: number | null
          name: string
          order_link: string | null
          price: number
          quantity_available: number
          stock_status: Database["public"]["Enums"]["stock_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          mrp?: number | null
          name: string
          order_link?: string | null
          price?: number
          quantity_available?: number
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          mrp?: number | null
          name?: string
          order_link?: string | null
          price?: number
          quantity_available?: number
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          landmark: string | null
          mobile: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          mobile: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          mobile?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_order_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      blog_category: "new_born_calf" | "program" | "function" | "general_update"
      health_status: "healthy" | "under_treatment" | "pregnant" | "new_born"
      order_status:
        | "order_placed"
        | "payment_verified"
        | "packing"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "upi" | "bank_transfer" | "cod"
      payment_status: "pending" | "verified" | "failed"
      stock_status: "in_stock" | "low_stock" | "out_of_stock"
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
      app_role: ["admin", "user"],
      blog_category: ["new_born_calf", "program", "function", "general_update"],
      health_status: ["healthy", "under_treatment", "pregnant", "new_born"],
      order_status: [
        "order_placed",
        "payment_verified",
        "packing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["upi", "bank_transfer", "cod"],
      payment_status: ["pending", "verified", "failed"],
      stock_status: ["in_stock", "low_stock", "out_of_stock"],
    },
  },
} as const
