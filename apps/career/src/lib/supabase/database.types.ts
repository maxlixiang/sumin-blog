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
type MilestoneDefinitionRow = { id: string; capability_level_definition_id: string; code: string; title: string; description: string; completion_criteria: string; evidence_hint: string; display_order: number; is_active: boolean; created_at: string };
type UserMilestoneProgressRow = { id: string; user_id: string; milestone_definition_id: string; status: "not_started" | "in_progress" | "completed"; completion_note: string; supporting_evidence_id: string | null; development_project_id: string | null; completed_at: string | null; created_at: string; updated_at: string };
type DevelopmentProjectRow = { id: string; user_id: string; title: string; project_type: string; status: "planned" | "active" | "on_hold" | "completed" | "archived"; objective: string; context: string; target_date: string | null; completed_on: string | null; external_url: string | null; created_at: string; updated_at: string };
type EvidenceRequirementDefinitionRow = { id: string; capability_level_definition_id: string; minimum_total: number; minimum_evidence_level: number | null; minimum_e1_plus: number; minimum_e2_plus: number; minimum_e3_plus: number; minimum_e4_plus: number; minimum_e5: number; minimum_distinct_scenarios: number; minimum_real_world_uses: number; special_requirements: Json; created_at: string };
type PromotionApplicationRow = { id: string; user_id: string; capability_id: string; model_version_id: string; current_level: number; target_level: number; status: "not_eligible" | "eligible" | "under_review" | "review_completed" | "approved" | "held"; applicant_statement: string; manual_requirement_confirmations: Json; submitted_at: string | null; decided_at: string | null; decision_reason: string; created_at: string; updated_at: string };
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
      milestone_definitions: {
        Row: MilestoneDefinitionRow;
        Insert: Omit<MilestoneDefinitionRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      user_milestone_progress: {
        Row: UserMilestoneProgressRow;
        Insert: Omit<UserMilestoneProgressRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<UserMilestoneProgressRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      development_projects: {
        Row: DevelopmentProjectRow;
        Insert: Omit<DevelopmentProjectRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<DevelopmentProjectRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      evidence_requirement_definitions: {
        Row: EvidenceRequirementDefinitionRow;
        Insert: Omit<EvidenceRequirementDefinitionRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      promotion_applications: {
        Row: PromotionApplicationRow;
        Insert: Omit<PromotionApplicationRow, "id" | "created_at" | "updated_at"> & { id?: string; user_id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<PromotionApplicationRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      development_project_capabilities: {
        Row: JoinRow<"development_project_id">;
        Insert: Omit<JoinRow<"development_project_id">, "created_at"> & { user_id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      evidence_project_links: {
        Row: { user_id: string; evidence_id: string; development_project_id: string; development_project_section_id: string | null; created_at: string };
        Insert: { user_id?: string; evidence_id: string; development_project_id: string; development_project_section_id?: string | null; created_at?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      initialize_capability_state: { Args: Record<PropertyKey, never>; Returns: undefined };
      approve_promotion_application: { Args: { application_id: string; approval_reason: string }; Returns: undefined };
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
export type MilestoneDefinition = MilestoneDefinitionRow;
export type UserMilestoneProgress = UserMilestoneProgressRow;
export type DevelopmentProject = DevelopmentProjectRow;
export type EvidenceRequirementDefinition = EvidenceRequirementDefinitionRow;
export type PromotionApplication = PromotionApplicationRow;
