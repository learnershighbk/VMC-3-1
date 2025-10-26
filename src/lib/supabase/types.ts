export type Database = {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          naver_place_id: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['places']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          place_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
    };
  };
};

export type SupabaseUserMetadata = Record<string, unknown>;
