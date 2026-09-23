"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveDailyCheckIn, type DailyCheckInState } from "@/features/check-ins/actions";
import type { DailyCheckIn } from "@/lib/supabase/database.types";

const INITIAL_STATE: DailyCheckInState = {};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="field-error">{errors[0]}</p> : null;
}

export function DailyCheckInForm({ date, record }: { date: string; record: DailyCheckIn | null }) {
  const [state, action, pending] = useActionState(saveDailyCheckIn, INITIAL_STATE);
  const [crossedBoundary, setCrossedBoundary] = useState(record?.crossed_legal_boundary ?? false);
  const [hasEvidence, setHasEvidence] = useState(record?.has_evidence ?? false);

  return (
    <form className="daily-form" action={action}>
      <input type="hidden" name="checkInDate" value={date} />

      <section className="question-card" aria-labelledby="question-1">
        <span className="question-number">Q1</span>
        <label id="question-1" htmlFor="businessLearning">今天最大的业务学习是什么？</label>
        <p>今天有什么事情让你对公司、客户、渠道、产品或商业模式理解得更深？</p>
        <textarea id="businessLearning" name="businessLearning" rows={4} defaultValue={record?.business_learning} required />
        <FieldError errors={state.fieldErrors?.businessLearning} />
      </section>

      <section className="question-card" aria-labelledby="question-2">
        <span className="question-number">Q2</span>
        <label id="question-2" htmlFor="judgmentMade">今天做出了什么重要判断？</label>
        <p>记录“判断”，而不是简单工作流水账。</p>
        <textarea id="judgmentMade" name="judgmentMade" rows={4} defaultValue={record?.judgment_made} required />
        <FieldError errors={state.fieldErrors?.judgmentMade} />
      </section>

      <section className="question-card" aria-labelledby="question-3">
        <span className="question-number">Q3</span>
        <fieldset>
          <legend id="question-3">今天有没有跨出传统法务工作的边界？</legend>
          <div className="binary-options">
            <label><input name="crossedLegalBoundary" type="radio" value="true" checked={crossedBoundary} onChange={() => setCrossedBoundary(true)} />有</label>
            <label><input name="crossedLegalBoundary" type="radio" value="false" checked={!crossedBoundary} onChange={() => setCrossedBoundary(false)} />没有</label>
          </div>
        </fieldset>
        {crossedBoundary ? (
          <div className="conditional-field">
            <label htmlFor="boundaryDetails">具体做了什么？</label>
            <textarea id="boundaryDetails" name="boundaryDetails" rows={3} defaultValue={record?.boundary_details ?? ""} required />
            <FieldError errors={state.fieldErrors?.boundaryDetails} />
          </div>
        ) : <input type="hidden" name="boundaryDetails" value="" />}
      </section>

      <section className="question-card" aria-labelledby="question-4">
        <span className="question-number">Q4</span>
        <fieldset>
          <legend id="question-4">今天有没有形成值得长期保留的成长证据？</legend>
          <div className="binary-options">
            <label><input name="hasEvidence" type="radio" value="true" checked={hasEvidence} onChange={() => setHasEvidence(true)} />有</label>
            <label><input name="hasEvidence" type="radio" value="false" checked={!hasEvidence} onChange={() => setHasEvidence(false)} />没有</label>
          </div>
        </fieldset>
        {hasEvidence ? (
          <Link className="evidence-continuation" href={`/evidence/new?source=daily&date=${date}${record ? `&daily=${record.id}` : ""}`}>
            创建成长证据
            <span>{record ? "日期与今日记录关联会自动带入" : "请先保存今日记录，再创建证据"}</span>
          </Link>
        ) : null}
      </section>

      <div className="daily-form__footer">
        <div aria-live="polite">
          {state.message ? <p className={`form-message form-message--${state.status}`}>{state.message}</p> : null}
        </div>
        <button className="button button--primary save-button" type="submit" disabled={pending}>
          {pending ? "正在保存…" : record ? "保存修改" : "保存今日记录"}
        </button>
      </div>
    </form>
  );
}
