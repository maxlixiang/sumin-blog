export const CAPABILITY_SLUGS = [
  "business",
  "finance",
  "strategy",
  "execution",
  "leadership",
  "influence",
] as const;

export type CapabilitySlug = (typeof CAPABILITY_SLUGS)[number];
export type CapabilityLevel = 1 | 2 | 3 | 4 | 5;
export type EvidenceLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type ResponsibilityLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CapabilityDefinition {
  slug: CapabilitySlug;
  name: string;
  coreQuestion: string;
}

export interface ResponsibilityDefinition {
  level: ResponsibilityLevel;
  name: string;
  shortDefinition: string;
  definition: string;
}

export const CAPABILITY_DEFINITIONS: readonly CapabilityDefinition[] = [
  {
    slug: "business",
    name: "商业理解",
    coreQuestion: "我是否真正理解公司是怎么赚钱的？",
  },
  {
    slug: "finance",
    name: "财务与经营数字",
    coreQuestion: "我能否用经营数字解释业务？",
  },
  {
    slug: "strategy",
    name: "战略与决策",
    coreQuestion: "我能否判断应该做什么，以及不做什么？",
  },
  {
    slug: "execution",
    name: "执行与项目管理",
    coreQuestion: "我能否推动复杂事情真正落地？",
  },
  {
    slug: "leadership",
    name: "领导力",
    coreQuestion: "我能否通过别人完成结果？",
  },
  {
    slug: "influence",
    name: "影响力",
    coreQuestion: "即使没有行政权力，我能否推动别人行动？",
  },
] as const;

export const RESPONSIBILITY_DEFINITIONS: readonly ResponsibilityDefinition[] = [
  {
    level: 1,
    name: "专业任务",
    shortDefinition: "对自己的专业任务负责。",
    definition: "对自己的专业任务负责。",
  },
  {
    level: 2,
    name: "完整问题",
    shortDefinition: "对一个完整问题从分析到解决负责。",
    definition: "对一个完整问题从分析到解决负责。",
  },
  {
    level: 3,
    name: "跨部门项目",
    shortDefinition: "对跨部门项目的最终结果负责。",
    definition: "对跨部门项目的最终结果负责。",
  },
  {
    level: 4,
    name: "团队责任",
    shortDefinition: "对一个团队或持续工作单元的整体结果负责。",
    definition:
      "对一个持续存在的团队或跨职能工作单元的整体结果承担明确责任，通过授权、协调、反馈、冲突处理和能力建设，让团队而不是仅依靠个人产出结果。拥有正式直属下属可以作为证据，但不是达到 R4 的必要条件。",
  },
  {
    level: 5,
    name: "业务结果",
    shortDefinition: "对收入、成本、市场或运营等业务结果负责。",
    definition: "对收入、成本、市场或运营等业务结果负责。",
  },
  {
    level: 6,
    name: "P&L 经营责任",
    shortDefinition: "对完整的收入、成本和利润负责。",
    definition: "对完整的收入、成本和利润负责。",
  },
] as const;

export const CAPABILITY_LEVEL_DEFINITIONS: Readonly<Record<CapabilityLevel, string>> = {
  1: "知识",
  2: "理解",
  3: "应用",
  4: "独立负责",
  5: "组织放大",
};

