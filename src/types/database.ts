export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "tenant" | "student";

// Simplified type definitions for development
// These will be regenerated from Supabase once the schema is deployed

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  lesson_id: string;
  title: string;
  type: "link" | "file" | "document";
  url: string;
  order_index: number;
  created_at: string;
}

export interface Task {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  expires_at: string | null;
  status: "active" | "expired" | "cancelled";
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Database interface for Supabase client
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Partial<Organization> & Pick<Organization, "name" | "slug">;
        Update: Partial<Organization>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email">;
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & Pick<Course, "org_id" | "title">;
        Update: Partial<Course>;
      };
      modules: {
        Row: Module;
        Insert: Partial<Module> & Pick<Module, "course_id" | "title">;
        Update: Partial<Module>;
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson> & Pick<Lesson, "module_id" | "title">;
        Update: Partial<Lesson>;
      };
      resources: {
        Row: Resource;
        Insert: Partial<Resource> & Pick<Resource, "lesson_id" | "title" | "type" | "url">;
        Update: Partial<Resource>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> & Pick<Task, "lesson_id" | "title">;
        Update: Partial<Task>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment> & Pick<Enrollment, "user_id" | "course_id">;
        Update: Partial<Enrollment>;
      };
      task_completions: {
        Row: TaskCompletion;
        Insert: Partial<TaskCompletion> & Pick<TaskCompletion, "user_id" | "task_id">;
        Update: Partial<TaskCompletion>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress> & Pick<LessonProgress, "user_id" | "lesson_id">;
        Update: Partial<LessonProgress>;
      };
      notes: {
        Row: Note;
        Insert: Partial<Note> & Pick<Note, "user_id" | "lesson_id" | "content">;
        Update: Partial<Note>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      resource_type: "link" | "file" | "document";
      enrollment_status: "active" | "expired" | "cancelled";
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
