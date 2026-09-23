export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type DailyCheckInRow = {
  id: string; user_id: string; check_in_date: string; business_learning: string;
  judgment_made: string; crossed_legal_boundary: boolean; boundary_details: string | null;
  has_evidence: boolean; created_at: string; updated_at: string;
};
type CapabilityRow = {
  id: string; slug: string; name: string; core_question: string; display_order: number; created_at: string;
};
type EvidenceRow = {
  id: string; user_id: string; title: string; occurred_on: string; event: string; action: string;
  judgment: string; result: string; reflection: string; evidence_level: number;
  daily_check_in_id: string | null; external_url: string | null; created_at: string; updated_at: string;
};
type WeeklyReviewRow = {
  id: string; user_id: string; week_start: string; business_deep_dive: string; business_case: string;
  management_review: string; industry_input: string; industry_relevance: string;
  evidence_capability_id: string | null; evidence_summary: string; next_focus_capability_id: string | null;
  next_focus_plan: string; status: "draft" | "complete"; completed_at: string | null;
  created_at: string; updated_at: string;
};
type CareerAssetRow = {
  id: string; user_id: string; title: string; asset_type: string; asset_date: string;
  description: string; external_url: string | null; created_at: string; updated_at: string;
};
type CapabilityLevelHistoryRow = {
  id: string; user_id: string; capability_id: string; model_version_id: string;
  from_level: number | null; to_level: number; source: "initialization" | "human_approval";
  promotion_application_id: string | null; reason: string; effective_on: string; created_at: string;
};
type ResponsibilityLevelHistoryRow = {
  id: string; user_id: string; from_level: number | null; to_level: number;
  source: "initialization" | "self_approval"; evidence_summary: string;
  change_explanation: string; effective_on: string; created_at: string;
};
type CapabilityLevelDefinitionRow = { id: string; model_version_id: string; capability_id: string; level: number; name: string; summary: string; standard: string; promotion_statement: string; reviewer_perspective: string; display_order: number; created_at: string };
type JoinRow<T extends string> = {
  user_id: string; capability_id: string; created_at: string;
} & Record<T, string>;

export interface Database {
  public: {
    Tables: {
      daily_check_ins: {
        Row: DailyCheckInRow;
        Insert: Omit<DailyCheckInRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<DailyCheckInRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      capabilities: {
        Row: CapabilityRow;
        Insert: Omit<CapabilityRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<CapabilityRow, "id" | "created_at">>;
        Relationships: [];
      };
      evidence: {
        Row: EvidenceRow;
        Insert: Omit<EvidenceRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<EvidenceRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      evidence_capabilities: {
        Row: JoinRow<"evidence_id">;
        Insert: Omit<JoinRow<"evidence_id">, "created_at"> & { user_id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      weekly_reviews: {
        Row: WeeklyReviewRow;
        Insert: Omit<WeeklyReviewRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<WeeklyReviewRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      career_assets: {
        Row: CareerAssetRow;
        Insert: Omit<CareerAssetRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<CareerAssetRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      career_asset_capabilities: {
        Row: JoinRow<"career_asset_id">;
        Insert: Omit<JoinRow<"career_asset_id">, "created_at"> & { user_id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      career_asset_evidence: {
        Row: { user_id: string; career_asset_id: string; evidence_id: string; created_at: string };
        Insert: { user_id?: string; career_asset_id: string; evidence_id: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      capability_level_history: {
        Row: CapabilityLevelHistoryRow;
        Insert: Omit<CapabilityLevelHistoryRow, "id" | "created_at"> & { id?: string; user_id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      responsibility_level_history: {
        Row: ResponsibilityLevelHistoryRow;
        Insert: Omit<ResponsibilityLevelHistoryRow, "id" | "created_at"> & { id?: string; user_id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      capability_level_definitions: {
        Row: CapabilityLevelDefinitionRow;
        Insert: Omit<CapabilityLevelDefinitionRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      initialize_capability_state: { Args: Record<PropertyKey, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type DailyCheckIn = DailyCheckInRow;
export type Capability = CapabilityRow;
export type Evidence = EvidenceRow;
export type WeeklyReview = WeeklyReviewRow;
export type CareerAsset = CareerAssetRow;
export type CapabilityLevelHistory = CapabilityLevelHistoryRow;
export type ResponsibilityLevelHistory = ResponsibilityLevelHistoryRow;
