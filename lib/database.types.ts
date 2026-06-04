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
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "member";
          admin_id: string | null;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "member";
          admin_id?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "member";
          admin_id?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      assignees: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          name: string;
          linked_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          name: string;
          linked_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          name?: string;
          linked_user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_niches: {
        Row: {
          id: string;
          workspace_id: string;
          message: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          message: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          message?: string;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string;
          created_by: string;
          title: string;
          color: string;
          locked: boolean;
          priority: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id: string;
          created_by: string;
          title: string;
          color?: string;
          locked?: boolean;
          priority?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string;
          created_by?: string;
          title?: string;
          color?: string;
          locked?: boolean;
          priority?: boolean;
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
          workspace_id: string;
          created_by: string;
          title: string;
          completed: boolean;
          position: number;
          created_at: string;
          deadline: string | null;
          assignee_id: string | null;
          completed_at: string | null;
          completed_by: string | null;
        };
        Insert: {
          id?: string;
          section_id: string;
          user_id: string;
          workspace_id: string;
          created_by: string;
          title: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
          deadline?: string | null;
          assignee_id?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
        };
        Update: {
          id?: string;
          section_id?: string;
          user_id?: string;
          workspace_id?: string;
          created_by?: string;
          title?: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
          deadline?: string | null;
          assignee_id?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "member";
    };
    CompositeTypes: Record<string, never>;
  };
}
