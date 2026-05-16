import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          title: string
          model: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          model?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          model?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
    }
  }
}
