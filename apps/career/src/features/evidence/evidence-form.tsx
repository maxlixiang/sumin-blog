"use client";

import { useActionState } from "react";

import { saveEvidence, type EvidenceFormState } from "@/features/evidence/actions";
import { EVIDENCE_LEVELS } from "@/lib/constants/growth-records";
import type { Capability, DailyCheckIn, Evidence } from "@/lib/supabase/database.types";

const INITIAL_STATE: EvidenceFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="field-error">{errors[0]}</p> : null;
}

export function EvidenceForm({
  capabilities,
  evidence,
  selectedCapabilityIds = [],
  dailyCheckIn,
  defaultDate,
}: {
  capabilities: Capability[];
  evidence?: Evidence;
  selectedCapabilityIds?: string[];
  dailyCheckIn?: DailyCheckIn | null;
  defaultDate: string;
}) {
  const [state, action, pending] = useActionState(saveEvidence, INITIAL_STATE);

  return (
    <form className="record-form" action={action}>
      {evidence ? <input type="hidden" name="id" value={evidence.id} /> : null}
      {dailyCheckIn ? <input type="hidden" name="dailyCheckInId" value={dailyCheckIn.id} /> : null}

      {dailyCheckIn ? (
        <aside className="source-context">
          <strong>来自 {dailyCheckIn.check_in_date} 的今日记录</strong>
          <p>{dailyCheckIn.business_learning}</p>
          <span>只作为写作提示，不会自动复制进成长证据。</span>
        </aside>
      ) : null}

      <div className="form-grid form-grid--two">
        <div className="form-field form-field--wide">
          <label htmlFor="title">证据标题</label>
          <input id="title" name="title" defaultValue={evidence?.title} placeholder="用一句话说清这项成长" required />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div className="form-field">
          <label htmlFor="occurredOn">发生日期</label>
          <input id="occurredOn" name="occurredOn" type="date" defaultValue={evidence?.occurred_on ?? defaultDate} required />
          <FieldError errors={state.fieldErrors?.occurredOn} />
        </div>
        <div className="form-field">
          <label htmlFor="evidenceLevel">证据等级</label>
          <select id="evidenceLevel" name="evidenceLevel" defaultValue={evidence?.evidence_level ?? 3}>
            {EVIDENCE_LEVELS.map((level) => <option key={level.value} value={level.value}>E{level.value} · {level.label}</option>)}
          </select>
        </div>
      </div>

      <fieldset className="choice-fieldset">
        <legend>关联能力（可多选）</legend>
        <div className="choice-grid">
          {capabilities.map((capability) => (
            <label key={capability.id}>
              <input type="checkbox" name="capabilityIds" value={capability.id} defaultChecked={selectedCapabilityIds.includes(capability.id)} />
              <span>{capability.name}</span>
            </label>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.capabilityIds} />
      </fieldset>

      <div className="structured-fields">
        {([
          { name: "event", label: "发生了什么？", hint: "只写关键背景与问题。", value: evidence?.event },
          { name: "action", label: "我采取了什么行动？", hint: "写清你真正做了什么。", value: evidence?.action },
          { name: "judgment", label: "我做出了什么判断？", hint: "记录取舍、假设或决策。", value: evidence?.judgment },
          { name: "result", label: "产生了什么结果？", hint: "优先记录可观察的变化。", value: evidence?.result },
        ] as const).map(({ name, label, hint, value }) => (
          <div className="form-field" key={name}>
            <label htmlFor={name}>{label}</label>
            <p>{hint}</p>
            <textarea id={name} name={name} rows={3} defaultValue={value} required />
            <FieldError errors={state.fieldErrors?.[name]} />
          </div>
        ))}
      </div>

      <div className="form-field">
        <label htmlFor="reflection">反思</label>
        <p>这次经历改变了什么？下次会保留或调整什么？</p>
        <textarea id="reflection" name="reflection" rows={5} defaultValue={evidence?.reflection} required />
        <FieldError errors={state.fieldErrors?.reflection} />
      </div>
      <div className="form-field">
        <label htmlFor="externalUrl">外部链接（可选）</label>
        <input id="externalUrl" name="externalUrl" type="url" pattern="https?://.*" defaultValue={evidence?.external_url ?? ""} placeholder="https://" />
        <FieldError errors={state.fieldErrors?.externalUrl} />
      </div>

      <div className="record-form__footer">
        <div aria-live="polite">{state.message ? <p className="form-message form-message--error">{state.message}</p> : null}</div>
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? "正在保存…" : evidence ? "保存修改" : "保存成长证据"}</button>
      </div>
    </form>
  );
}
