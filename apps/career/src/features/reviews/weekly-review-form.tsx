"use client";

import { useActionState } from "react";

import { saveWeeklyReview, type WeeklyReviewState } from "@/features/reviews/actions";
import type { Capability, WeeklyReview } from "@/lib/supabase/database.types";

const INITIAL_STATE: WeeklyReviewState = {};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="field-error">{errors[0]}</p> : null;
}

export function WeeklyReviewForm({ review, weekStart, capabilities }: { review: WeeklyReview | null; weekStart: string; capabilities: Capability[] }) {
  const [state, action, pending] = useActionState(saveWeeklyReview, INITIAL_STATE);
  const questions = [
    ["businessDeepDive", "1. 本周完成了什么业务深挖？", "销售、财务、市场、供应链或产品中的一个真实问题。", review?.business_deep_dive],
    ["businessCase", "2. 本周是否分析了一个真实 Business Case？", "简述业务、财务、运营、法律与风险之间的关键关系。", review?.business_case],
    ["managementReview", "3. 本周有什么管理或协作事件值得复盘？", "授权、协调、冲突、反馈或团队能力建设。", review?.management_review],
    ["industryInput", "4. 本周有哪些行业输入？", "记录真正改变你理解的信息，而不是阅读清单。", review?.industry_input],
    ["industryRelevance", "这些信息与当前业务有什么关系？", "说清它可能影响的客户、渠道、竞争或决策。", review?.industry_relevance],
  ] as const;

  return (
    <form className="record-form weekly-form" action={action}>
      <input type="hidden" name="weekStart" value={weekStart} />
      {questions.map(([name, label, hint, value]) => (
        <section className="review-question" key={name}>
          <label htmlFor={name}>{label}</label>
          <p>{hint}</p>
          <textarea id={name} name={name} rows={3} defaultValue={value} />
          <FieldError errors={state.fieldErrors?.[name]} />
        </section>
      ))}

      <section className="review-question review-question--split">
        <div>
          <label htmlFor="evidenceCapabilityId">5. 本周哪项能力产生了最有效的成长证据？</label>
          <select id="evidenceCapabilityId" name="evidenceCapabilityId" defaultValue={review?.evidence_capability_id ?? ""}>
            <option value="">请选择</option>
            {capabilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <FieldError errors={state.fieldErrors?.evidenceCapabilityId} />
        </div>
        <div>
          <label htmlFor="evidenceSummary">为什么是它？</label>
          <textarea id="evidenceSummary" name="evidenceSummary" rows={3} defaultValue={review?.evidence_summary} />
          <FieldError errors={state.fieldErrors?.evidenceSummary} />
        </div>
      </section>

      <section className="review-question review-question--split">
        <div>
          <label htmlFor="nextFocusCapabilityId">6. 下周重点训练哪项能力？</label>
          <select id="nextFocusCapabilityId" name="nextFocusCapabilityId" defaultValue={review?.next_focus_capability_id ?? ""}>
            <option value="">请选择</option>
            {capabilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <FieldError errors={state.fieldErrors?.nextFocusCapabilityId} />
        </div>
        <div>
          <label htmlFor="nextFocusPlan">7. 下周准备如何训练？</label>
          <textarea id="nextFocusPlan" name="nextFocusPlan" rows={3} defaultValue={review?.next_focus_plan} />
          <FieldError errors={state.fieldErrors?.nextFocusPlan} />
        </div>
      </section>

      <div className="record-form__footer record-form__footer--dual">
        <div aria-live="polite">{state.message ? <p className={`form-message form-message--${state.status}`}>{state.message}</p> : null}</div>
        <div className="form-actions">
          <button className="button button--secondary" name="intent" value="draft" type="submit" disabled={pending}>保存草稿</button>
          <button className="button button--primary" name="intent" value="complete" type="submit" disabled={pending}>完成本周复盘</button>
        </div>
      </div>
    </form>
  );
}
