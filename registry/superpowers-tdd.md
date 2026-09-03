---
name: superpowers-tdd
origin: marketplace
provider: superpowers@superpowers-marketplace
asset: superpowers:test-driven-development
repo: obra/superpowers-marketplace
updated_at: "2026-09-03"
---

# superpowers — test-driven-development

## 何时用

`stages/30-coding/DECIDE.md` 判定该走 TDD 之后，用它执行具体循环。

它管的是"怎么做"，不是"要不要做"。决策仍由 DECIDE.md 负责，不要跳过决策直接调它。

## 安装

**Claude Code**：由 plugin 机制管理。

```
/plugin install superpowers@superpowers-marketplace
```

**Codex / pi**：上游是 Claude Code plugin 格式，跨 agent 使用需手工提取其中的 SKILL.md。尚未验证，用到再补。

## 版本

**不在本库记录版本号。** 由 Claude Code 的 plugin 机制管理，实际版本查：

```bash
python3 -c "import json;d=json.load(open('$HOME/.claude/plugins/installed_plugins.json'));print([k for k in d['plugins'] if 'superpowers' in k])"
```

在本库复制一份版本号只会漂移成假数据。
