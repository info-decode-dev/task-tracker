export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sections: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          section_id: string;
          user_id: string;
          title: string;
          completed: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          user_id: string;
          title: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          user_id?: string;
          title?: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
