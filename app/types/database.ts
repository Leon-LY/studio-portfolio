// Placeholder for generated Supabase types
// Run `npx supabase gen types typescript --linked > app/types/database.ts` after Supabase project setup
// Or manually update this with your table types

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      styles: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          content: string | null
          category_id: string | null
          status: 'draft' | 'published' | 'archived'
          completion_date: string | null
          location: string | null
          client: string | null
          area_sqm: number | null
          cover_image_url: string | null
          sort_order: number
          is_featured: boolean
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          content?: string | null
          category_id?: string | null
          status?: 'draft' | 'published' | 'archived'
          completion_date?: string | null
          location?: string | null
          client?: string | null
          area_sqm?: number | null
          cover_image_url?: string | null
          sort_order?: number
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          content?: string | null
          category_id?: string | null
          status?: 'draft' | 'published' | 'archived'
          completion_date?: string | null
          location?: string | null
          client?: string | null
          area_sqm?: number | null
          cover_image_url?: string | null
          sort_order?: number
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
      }
      project_styles: {
        Row: { project_id: string; style_id: string }
        Insert: { project_id: string; style_id: string }
        Update: { project_id?: string; style_id?: string }
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          storage_path: string
          alt_text: string | null
          caption: string | null
          sort_order: number
          is_cover: boolean
          width: number | null
          height: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          storage_path: string
          alt_text?: string | null
          caption?: string | null
          sort_order?: number
          is_cover?: boolean
          width?: number | null
          height?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          storage_path?: string
          alt_text?: string | null
          caption?: string | null
          sort_order?: number
          is_cover?: boolean
          width?: number | null
          height?: number | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'editor'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor'
          created_at?: string
        }
      }
      site_settings: {
        Row: { key: string; value: any; updated_at: string }
        Insert: { key: string; value?: any; updated_at?: string }
        Update: { key?: string; value?: any; updated_at?: string }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      project_status: 'draft' | 'published' | 'archived'
    }
  }
}
