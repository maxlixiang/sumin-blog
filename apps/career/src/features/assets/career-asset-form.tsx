"use client";

import { useActionState } from "react";

import { saveCareerAsset, type CareerAssetFormState } from "@/features/assets/actions";
import { ASSET_TYPES } from "@/lib/constants/growth-records";
import type { Capability, CareerAsset, Evidence } from "@/lib/supabase/database.types";

const INITIAL_STATE: CareerAssetFormState = {};
function FieldError({ errors }: { errors?: string[] }) { return errors?.length ? <p className="field-error">{errors[0]}</p> : null; }

export function CareerAssetForm({
  asset,
  capabilities,
  evidence,
  selectedCapabilityIds = [],
  selectedEvidenceIds = [],
  defaultDate,
}: {
  asset?: CareerAsset;
  capabilities: Capability[];
  evidence: Evidence[];
  selectedCapabilityIds?: string[];
  selectedEvidenceIds?: string[];
  defaultDate: string;
}) {
  const [state, action, pending] = useActionState(saveCareerAsset, INITIAL_STATE);
  return (
    <form className="record-form" action={action}>
      {asset ? <input type="hidden" name="id" value={asset.id} /> : null}
      <div className="form-grid form-grid--two">
        <div className="form-field form-field--wide">
          <label htmlFor="title">资产标题</label>
          <input id="title" name="title" defaultValue={asset?.title} required />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div className="form-field">
          <label htmlFor="assetType">资产类型</label>
          <select id="assetType" name="assetType" defaultValue={asset?.asset_type ?? "business_case"}>
            {ASSET_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="assetDate">形成日期</label>
          <input id="assetDate" name="assetDate" type="date" defaultValue={asset?.asset_date ?? defaultDate} required />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="description">说明</label>
        <p>这项成果解决了什么问题，为什么值得长期保留？</p>
        <textarea id="description" name="description" rows={5} defaultValue={asset?.description} required />
        <FieldError errors={state.fieldErrors?.description} />
      </div>
      <div className="form-field">
        <label htmlFor="externalUrl">外部链接（可选）</label>
        <input id="externalUrl" name="externalUrl" type="url" pattern="https?://.*" defaultValue={asset?.external_url ?? ""} placeholder="https://" />
        <FieldError errors={state.fieldErrors?.externalUrl} />
      </div>
      <fieldset className="choice-fieldset">
        <legend>关联能力（可多选）</legend>
        <div className="choice-grid">
          {capabilities.map((capability) => (
            <label key={capability.id}><input name="capabilityIds" type="checkbox" value={capability.id} defaultChecked={selectedCapabilityIds.includes(capability.id)} /><span>{capability.name}</span></label>
          ))}
        </div>
        <FieldError errors={state.fieldErrors?.capabilityIds} />
      </fieldset>
      <fieldset className="choice-fieldset">
        <legend>关联成长证据（可多选）</legend>
        {evidence.length ? (
          <div className="evidence-choice-list">
            {evidence.map((item) => (
              <label key={item.id}><input name="evidenceIds" type="checkbox" value={item.id} defaultChecked={selectedEvidenceIds.includes(item.id)} /><span><strong>{item.title}</strong><small>{item.occurred_on} · E{item.evidence_level}</small></span></label>
            ))}
          </div>
        ) : <p className="empty-inline">还没有可关联的成长证据。</p>}
      </fieldset>
      <div className="record-form__footer">
        <div aria-live="polite">{state.message ? <p className="form-message form-message--error">{state.message}</p> : null}</div>
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? "正在保存…" : asset ? "保存修改" : "保存职业资产"}</button>
      </div>
    </form>
  );
}
