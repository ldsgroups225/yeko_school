export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attendances: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string | null
          created_date: string | null
          ends_at: string
          id: string
          is_excused: boolean
          reason: string | null
          starts_at: string
          status: string
          student_id: string
          subject_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          ends_at: string
          id?: string
          is_excused?: boolean
          reason?: string | null
          starts_at: string
          status: string
          student_id: string
          subject_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          created_date?: string | null
          ends_at?: string
          id?: string
          is_excused?: boolean
          reason?: string | null
          starts_at?: string
          status?: string
          student_id?: string
          subject_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'attendances_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendances_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendances_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendances_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendances_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          created_by: string | null
          grade_id: number
          id: string
          main_teacher_id: string | null
          name: string
          school_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          grade_id: number
          id?: string
          main_teacher_id?: string | null
          name: string
          school_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          grade_id?: number
          id?: string
          main_teacher_id?: string | null
          name?: string
          school_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'classes_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_grade_id_fkey'
            columns: ['grade_id']
            isOneToOne: false
            referencedRelation: 'grades'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'classes_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string | null
          created_by: string | null
          cycle_id: string
          description: string
          id: number
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cycle_id: string
          description: string
          id?: number
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cycle_id?: string
          description?: string
          id?: number
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'grades_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'grades_cycle_id_foreign'
            columns: ['cycle_id']
            isOneToOne: false
            referencedRelation: 'cycles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'grades_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      homeworks: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          is_graded: boolean
          max_score: number | null
          subject_id: string
          teacher_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_graded?: boolean
          max_score?: number | null
          subject_id: string
          teacher_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_graded?: boolean
          max_score?: number | null
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'homeworks_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homeworks_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homeworks_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homeworks_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'homeworks_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      link_student_parent: {
        Row: {
          created_at: string
          created_by: string | null
          expired_at: string
          id: string
          is_used: boolean
          otp: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expired_at?: string
          id?: string
          is_used?: boolean
          otp: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expired_at?: string
          id?: string
          is_used?: boolean
          otp?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'link_student_parent_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'link_student_parent_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'link_student_parent_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
        ]
      }
      notes: {
        Row: {
          class_id: string
          created_at: string | null
          date: string | null
          id: string
          is_published: boolean | null
          note: number | null
          publish_date: string | null
          student_id: string
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_published?: boolean | null
          note?: number | null
          publish_date?: string | null
          student_id: string
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          date?: string | null
          id?: string
          is_published?: boolean | null
          note?: number | null
          publish_date?: string | null
          student_id?: string
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notes_class_id_foreign'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notes_student_id_foreign'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notes_subject_id_foreign'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fk_user'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      participations: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string | null
          id: string
          student_id: string
          subject_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          student_id: string
          subject_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          student_id?: string
          subject_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'participations_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participations_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participations_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participations_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'participations_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          class_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'schedules_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schedules_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schedules_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          created_by: string | null
          cycle_id: string
          email: string
          id: string
          image_url: string | null
          is_technical_education: boolean | null
          name: string
          phone: string
          state_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          cycle_id: string
          email: string
          id?: string
          image_url?: string | null
          is_technical_education?: boolean | null
          name: string
          phone: string
          state_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          cycle_id?: string
          email?: string
          id?: string
          image_url?: string | null
          is_technical_education?: boolean | null
          name?: string
          phone?: string
          state_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'schools_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_cycle_id_foreign'
            columns: ['cycle_id']
            isOneToOne: false
            referencedRelation: 'cycles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_state_id_foreign'
            columns: ['state_id']
            isOneToOne: false
            referencedRelation: 'states'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      schools_teachers: {
        Row: {
          created_at: string | null
          created_by: string | null
          school_id: string
          status: Database['public']['Enums']['status_enum']
          teacher_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          school_id: string
          status?: Database['public']['Enums']['status_enum']
          teacher_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          school_id?: string
          status?: Database['public']['Enums']['status_enum']
          teacher_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'schools_teachers_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_teachers_school_id_foreign'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_teachers_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schools_teachers_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      states: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          avatar_url: string | null
          class_id: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          first_name: string
          gender: string | null
          id: string
          id_number: string
          last_name: string
          parent_id: string | null
          school_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          first_name: string
          gender?: string | null
          id?: string
          id_number: string
          last_name: string
          parent_id: string | null
          school_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          id_number?: string
          last_name?: string
          parent_id?: string | null
          school_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'students_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'students_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_class_assignments: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_main_teacher: boolean
          school_id: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_main_teacher?: boolean
          school_id: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_main_teacher?: boolean
          school_id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'teacher_class_assignments_class_id_fkey'
            columns: ['class_id']
            isOneToOne: false
            referencedRelation: 'classes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teacher_class_assignments_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teacher_class_assignments_school_id_fkey'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teacher_class_assignments_subject_id_fkey'
            columns: ['subject_id']
            isOneToOne: false
            referencedRelation: 'subjects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teacher_class_assignments_teacher_id_fkey'
            columns: ['teacher_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teacher_class_assignments_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_school_id: string
          status: Database['public']['Enums']['status_enum']
          student_id: string
          to_school_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_school_id: string
          status?: Database['public']['Enums']['status_enum']
          student_id: string
          to_school_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_school_id?: string
          status?: Database['public']['Enums']['status_enum']
          student_id?: string
          to_school_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_from_school_id_foreign'
            columns: ['from_school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_student_id_foreign'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_to_school_id_foreign'
            columns: ['to_school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      user_roles: {
        Row: {
          role_id: number
          user_id: string
        }
        Insert: {
          role_id: number
          user_id: string
        }
        Update: {
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          push_token: string | null
          school_id: string | null
          state_id: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          push_token?: string | null
          school_id?: string | null
          state_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          push_token?: string | null
          school_id?: string | null
          state_id?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_created_by_foreign'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_id_foreign'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_school_id_foreign'
            columns: ['school_id']
            isOneToOne: false
            referencedRelation: 'schools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_state_id_foreign'
            columns: ['state_id']
            isOneToOne: false
            referencedRelation: 'states'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_updated_by_foreign'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_attendance_and_participator_and_homework: {
        Args: {
          attendances: Json
          participators: Json
          homework?: Json
        }
        Returns: string
      }
      get_classes_by_school: {
        Args: {
          school_id: string
        }
        Returns: {
          grade_name: string
          count: number
          subclasses: Json[]
        }[]
      }
      get_group_label: {
        Args: {
          group_date: string
          grouping_level: string
        }
        Returns: string
      }
      get_last_five_inactive_schools: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          email: string
          phone: string
        }[]
      }
      get_monthly_attendance_summary: {
        Args: {
          start_date?: string
          end_date?: string
          grouping_level?: string
          sort_col?: string
        }
        Returns: {
          month_label: string
          attendance_count: number
        }[]
      }
      get_statistics: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          school_count: number
          student_count: number
          new_account_count: number
          reconnection_rate: number
        }[]
      }
      get_student_info: {
        Args: {
          parent_user_id: string
        }
        Returns: {
          student_id: string
          first_name: string
          last_name: string
          id_number: string
          class_id: string
          class_name: string
          school_id: string
          school_name: string
          school_image_url: string
        }[]
      }
      get_teacher_data: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      get_unique_notes_by_date: {
        Args: {
          p_subject_id: string
          p_class_id: string
        }
        Returns: {
          id: string
          date: string
          is_published: boolean
          publish_date: string
        }[]
      }
      update_published_notes: {
        Args: {
          p_date: string
        }
        Returns: undefined
      }
    }
    Enums: {
      status_enum: 'pending' | 'accepted' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
    PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
      PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never
