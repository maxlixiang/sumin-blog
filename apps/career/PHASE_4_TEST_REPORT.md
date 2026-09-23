# Career OS Phase 4 测试报告

测试日期：2026年9月23日（Asia/Shanghai）
范围：能力发展、里程碑、发展项目、晋级申请与批准、责任成长。

## 1. What

Phase 4 将 Career OS 从“记录成长证据”扩展为“以证据支持的能力发展与责任成长”。能力等级不由积分自动变更；晋级需完成里程碑、满足证据门槛、人工核对，并由用户明确批准。

## 2. Database Changes

- 已应用 Capability Model V1、能力等级历史、里程碑进度、发展项目、晋级申请、责任等级历史等迁移。
- 已应用 `202609230008_harden_promotion_writes.sql`：
  - 普通登录用户不能直接写入 `capability_level_history`。
  - 普通登录用户不能更新或删除 `promotion_applications`。
  - 只有 `approve_promotion_application` RPC 可在明确批准时原子写入等级历史并更新申请状态。
  - 初始化函数与批准函数均检查 `auth.uid()`，并仅向 `authenticated` 授权执行。

## 3. Product Flows

| 流程 | 结果 | 证据 |
| --- | --- | --- |
| 能力页读取真实模型、历史、里程碑与证据门槛 | 通过 | 登录会话下六项能力均正常渲染；商业理解 L2 准备度显示真实缺口。 |
| 里程碑状态持久化 | 通过 | 已验证一个真实里程碑的“进行中”状态刷新后仍存在。 |
| 发展项目关联能力与成长证据 | 通过 | 已验证项目、能力关联与证据详情反向关联刷新后仍正确。 |
| 未达标时禁止晋级申请 | 通过 | 直接访问 `/capabilities/business/promotion` 显示“当前基础条件尚未满足”，没有申请表。 |
| 责任成长 | 通过 | 页面读取真实 R2，并只允许下一步 R3；表单要求证据、说明与明确确认。 |

## 4. Security / RLS Result

- 已通过匿名 Supabase 客户端读取检查：`daily_check_ins`、`evidence`、`capability_level_history`、`promotion_applications` 均返回 0 行。
- 数据库迁移限制等级历史与晋级申请状态的直接写入，阻止绕过“申请 → 批准”流程。
- 所有相关页面继续经服务器端 `requireUser()` 保护。

## 5. Mobile Result

- 320px：能力页、能力发展操作入口与六项底部导航均可见；已修复原先 6 个导航项按 5 列导致“职业资产”换行的问题。
- 375px：能力页显示两个操作入口（责任成长、发展项目），底部导航为 6 项，浏览器控制台无 error/warn。

## 6. Engineering Result

| 检查 | 结果 |
| --- | --- |
| `apps/career: npm run typecheck` | 通过 |
| `apps/career: npm run lint` | 通过 |
| `apps/career: npm run build` | 通过 |
| 原个人网站：`npm run build` | 通过 |
| 浏览器控制台（能力页，320px / 375px / 默认视口） | 无 error/warn |
| UTF-8 中文回读与替换字符检查 | 通过 |
| Git 凭据扫描 | 通过；`.env.local` 未被跟踪，未发现真实 API Key 或 Supabase 凭据模式。 |

## 7. Deliberately Untested

- 没有用真实职业数据完成一次“批准晋级”，因为这会不可逆地修改实际能力等级，且当前商业理解的客观门槛尚未满足。
- 已通过数据库权限迁移、Server Action 二次校验与未达标路由验证覆盖该流程的安全边界。待真实条件满足并由用户明确决定晋级时，可执行一次完整的申请与批准验收。

## 8. Final Verdict

Phase 4 的功能、访问控制、移动端关键路径与工程构建均已验收通过。晋级批准的真实写入保留到用户拥有足够真实证据并明确决定执行时，符合 Evidence First 与 Human Approval 原则。
