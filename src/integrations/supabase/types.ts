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
      audit_log: {
        Row: {
          campo_modificato: string | null
          id: string
          operazione: Database["public"]["Enums"]["operazione_audit"]
          record_id: string
          tabella: string
          timestamp: string
          utente_id: string | null
          valore_nuovo: string | null
          valore_precedente: string | null
        }
        Insert: {
          campo_modificato?: string | null
          id?: string
          operazione: Database["public"]["Enums"]["operazione_audit"]
          record_id: string
          tabella: string
          timestamp?: string
          utente_id?: string | null
          valore_nuovo?: string | null
          valore_precedente?: string | null
        }
        Update: {
          campo_modificato?: string | null
          id?: string
          operazione?: Database["public"]["Enums"]["operazione_audit"]
          record_id?: string
          tabella?: string
          timestamp?: string
          utente_id?: string | null
          valore_nuovo?: string | null
          valore_precedente?: string | null
        }
        Relationships: []
      }
      candidati: {
        Row: {
          cognome: string
          created_at: string
          created_by: string | null
          data_nascita: string | null
          email: string | null
          id: string
          lingua_madre: string | null
          luogo_nascita: string | null
          nome: string
          note_generali: string | null
          paese_origine: string | null
          telefono: string | null
          titolo_studi: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cognome: string
          created_at?: string
          created_by?: string | null
          data_nascita?: string | null
          email?: string | null
          id?: string
          lingua_madre?: string | null
          luogo_nascita?: string | null
          nome: string
          note_generali?: string | null
          paese_origine?: string | null
          telefono?: string | null
          titolo_studi?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cognome?: string
          created_at?: string
          created_by?: string | null
          data_nascita?: string | null
          email?: string | null
          id?: string
          lingua_madre?: string | null
          luogo_nascita?: string | null
          nome?: string
          note_generali?: string | null
          paese_origine?: string | null
          telefono?: string | null
          titolo_studi?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      iscrizioni: {
        Row: {
          abilita_recupero: string[] | null
          candidato_id: string
          cod_articolo: string | null
          codice_esame_roma: string | null
          created_at: string
          created_by: string | null
          giorno_orale: Database["public"]["Enums"]["giorno_orale"] | null
          id: string
          note: string | null
          orale_ok: boolean
          quota_totale: number | null
          sessione_id: string
          stato_portale: Database["public"]["Enums"]["stato_portale"]
          tipo_iscrizione: Database["public"]["Enums"]["tipo_iscrizione"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          abilita_recupero?: string[] | null
          candidato_id: string
          cod_articolo?: string | null
          codice_esame_roma?: string | null
          created_at?: string
          created_by?: string | null
          giorno_orale?: Database["public"]["Enums"]["giorno_orale"] | null
          id?: string
          note?: string | null
          orale_ok?: boolean
          quota_totale?: number | null
          sessione_id: string
          stato_portale?: Database["public"]["Enums"]["stato_portale"]
          tipo_iscrizione?: Database["public"]["Enums"]["tipo_iscrizione"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          abilita_recupero?: string[] | null
          candidato_id?: string
          cod_articolo?: string | null
          codice_esame_roma?: string | null
          created_at?: string
          created_by?: string | null
          giorno_orale?: Database["public"]["Enums"]["giorno_orale"] | null
          id?: string
          note?: string | null
          orale_ok?: boolean
          quota_totale?: number | null
          sessione_id?: string
          stato_portale?: Database["public"]["Enums"]["stato_portale"]
          tipo_iscrizione?: Database["public"]["Enums"]["tipo_iscrizione"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iscrizioni_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iscrizioni_sessione_id_fkey"
            columns: ["sessione_id"]
            isOneToOne: false
            referencedRelation: "sessioni"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamenti: {
        Row: {
          created_at: string
          created_by: string | null
          data_bonifico_banca: string | null
          data_ricevuta: string | null
          id: string
          importo: number
          iscrizione_id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          note: string | null
          numero_ricevuta: string | null
          operatrice_id: string | null
          verificato: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_bonifico_banca?: string | null
          data_ricevuta?: string | null
          id?: string
          importo: number
          iscrizione_id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          note?: string | null
          numero_ricevuta?: string | null
          operatrice_id?: string | null
          verificato?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_bonifico_banca?: string | null
          data_ricevuta?: string | null
          id?: string
          importo?: number
          iscrizione_id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          note?: string | null
          numero_ricevuta?: string | null
          operatrice_id?: string | null
          verificato?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pagamenti_iscrizione_id_fkey"
            columns: ["iscrizione_id"]
            isOneToOne: false
            referencedRelation: "iscrizioni"
            referencedColumns: ["id"]
          },
        ]
      }
      profili_operatrice: {
        Row: {
          created_at: string
          email: string
          id: string
          nome_visualizzato: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nome_visualizzato: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome_visualizzato?: string
        }
        Relationships: []
      }
      profilo_linguistico: {
        Row: {
          autoval_ascolto: number | null
          autoval_lettura: number | null
          autoval_parlato: number | null
          autoval_scrittura: number | null
          candidato_id: string
          conosce_facsimile: boolean | null
          corsi_frequentati: boolean | null
          created_at: string
          data_compilazione: string | null
          difficolta_percepite: string | null
          durata_corsi: string | null
          fascia_eta: string | null
          ha_libro_preparazione: boolean | null
          id: string
          livello_corsi: string | null
          motivazione_esame: string | null
          note: string | null
          num_corsi: string | null
        }
        Insert: {
          autoval_ascolto?: number | null
          autoval_lettura?: number | null
          autoval_parlato?: number | null
          autoval_scrittura?: number | null
          candidato_id: string
          conosce_facsimile?: boolean | null
          corsi_frequentati?: boolean | null
          created_at?: string
          data_compilazione?: string | null
          difficolta_percepite?: string | null
          durata_corsi?: string | null
          fascia_eta?: string | null
          ha_libro_preparazione?: boolean | null
          id?: string
          livello_corsi?: string | null
          motivazione_esame?: string | null
          note?: string | null
          num_corsi?: string | null
        }
        Update: {
          autoval_ascolto?: number | null
          autoval_lettura?: number | null
          autoval_parlato?: number | null
          autoval_scrittura?: number | null
          candidato_id?: string
          conosce_facsimile?: boolean | null
          corsi_frequentati?: boolean | null
          created_at?: string
          data_compilazione?: string | null
          difficolta_percepite?: string | null
          durata_corsi?: string | null
          fascia_eta?: string | null
          ha_libro_preparazione?: boolean | null
          id?: string
          livello_corsi?: string | null
          motivazione_esame?: string | null
          note?: string | null
          num_corsi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profilo_linguistico_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
        ]
      }
      sessioni: {
        Row: {
          created_at: string
          data_sessione: string
          id: string
          livello: Database["public"]["Enums"]["livello_esame"]
          note: string | null
          sede: string
          tipo_esame: Database["public"]["Enums"]["tipo_esame"]
        }
        Insert: {
          created_at?: string
          data_sessione: string
          id?: string
          livello: Database["public"]["Enums"]["livello_esame"]
          note?: string | null
          sede?: string
          tipo_esame: Database["public"]["Enums"]["tipo_esame"]
        }
        Update: {
          created_at?: string
          data_sessione?: string
          id?: string
          livello?: Database["public"]["Enums"]["livello_esame"]
          note?: string | null
          sede?: string
          tipo_esame?: Database["public"]["Enums"]["tipo_esame"]
        }
        Relationships: []
      }
      test_preliminari: {
        Row: {
          created_at: string
          data_test: string
          id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          data_test: string
          id?: string
          note?: string | null
        }
        Update: {
          created_at?: string
          data_test?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      test_preliminari_candidati: {
        Row: {
          candidato_id: string
          note: string | null
          presente: boolean
          test_id: string
        }
        Insert: {
          candidato_id: string
          note?: string | null
          presente?: boolean
          test_id: string
        }
        Update: {
          candidato_id?: string
          note?: string | null
          presente?: boolean
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_preliminari_candidati_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_preliminari_candidati_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "test_preliminari"
            referencedColumns: ["id"]
          },
        ]
      }
      urgenze: {
        Row: {
          id: string
          iscrizione_id: string
          pagato: boolean
          quota_nostra: number | null
          quota_plida: number | null
        }
        Insert: {
          id?: string
          iscrizione_id: string
          pagato?: boolean
          quota_nostra?: number | null
          quota_plida?: number | null
        }
        Update: {
          id?: string
          iscrizione_id?: string
          pagato?: boolean
          quota_nostra?: number | null
          quota_plida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "urgenze_iscrizione_id_fkey"
            columns: ["iscrizione_id"]
            isOneToOne: false
            referencedRelation: "iscrizioni"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_operatrice: { Args: never; Returns: boolean }
    }
    Enums: {
      giorno_orale: "lun" | "mar" | "mer" | "gio" | "ven" | "sab"
      livello_esame: "A2" | "B1" | "B2" | "C1"
      metodo_pagamento: "bonifico" | "contante"
      operazione_audit: "INSERT" | "UPDATE" | "DELETE"
      stato_portale: "da_inserire" | "inserito"
      tipo_esame: "PLIDA" | "CILS" | "CELI"
      tipo_iscrizione: "completo" | "recupero" | "urgenza"
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
      giorno_orale: ["lun", "mar", "mer", "gio", "ven", "sab"],
      livello_esame: ["A2", "B1", "B2", "C1"],
      metodo_pagamento: ["bonifico", "contante"],
      operazione_audit: ["INSERT", "UPDATE", "DELETE"],
      stato_portale: ["da_inserire", "inserito"],
      tipo_esame: ["PLIDA", "CILS", "CELI"],
      tipo_iscrizione: ["completo", "recupero", "urgenza"],
    },
  },
} as const
