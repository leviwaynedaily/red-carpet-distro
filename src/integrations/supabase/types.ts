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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          categories: string[] | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          media: Json | null
          name: string
          potency: string | null
          primary_media_type: string | null
          regular_price: number | null
          shipping_price: number | null
          stock: number | null
          strain: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media?: Json | null
          name: string
          potency?: string | null
          primary_media_type?: string | null
          regular_price?: number | null
          shipping_price?: number | null
          stock?: number | null
          strain?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          media?: Json | null
          name?: string
          potency?: string | null
          primary_media_type?: string | null
          regular_price?: number | null
          shipping_price?: number | null
          stock?: number | null
          strain?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          admin_password: string | null
          created_at: string
          favicon_url: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_url: string | null
          primary_color: string | null
          pwa_background_color: string | null
          pwa_description: string | null
          pwa_desktop_screenshot: string | null
          pwa_display: string | null
          pwa_icons: Json | null
          pwa_mobile_screenshot: string | null
          pwa_name: string | null
          pwa_orientation: string | null
          pwa_scope: string | null
          pwa_short_name: string | null
          pwa_start_url: string | null
          pwa_theme_color: string | null
          secondary_color: string | null
          storefront_password: string | null
          updated_at: string
        }
        Insert: {
          admin_password?: string | null
          created_at?: string
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_url?: string | null
          primary_color?: string | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_desktop_screenshot?: string | null
          pwa_display?: string | null
          pwa_icons?: Json | null
          pwa_mobile_screenshot?: string | null
          pwa_name?: string | null
          pwa_orientation?: string | null
          pwa_scope?: string | null
          pwa_short_name?: string | null
          pwa_start_url?: string | null
          pwa_theme_color?: string | null
          secondary_color?: string | null
          storefront_password?: string | null
          updated_at?: string
        }
        Update: {
          admin_password?: string | null
          created_at?: string
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_url?: string | null
          primary_color?: string | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_desktop_screenshot?: string | null
          pwa_display?: string | null
          pwa_icons?: Json | null
          pwa_mobile_screenshot?: string | null
          pwa_name?: string | null
          pwa_orientation?: string | null
          pwa_scope?: string | null
          pwa_short_name?: string | null
          pwa_start_url?: string | null
          pwa_theme_color?: string | null
          secondary_color?: string | null
          storefront_password?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
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
      app_role: "admin" | "user"
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
