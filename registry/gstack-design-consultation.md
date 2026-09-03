---
name: gstack-design-consultation
origin: external
provider: gstack
asset: design-consultation
install_path: ~/.claude/skills/design-consultation
updated_at: "2026-09-03"
---

# gstack — design-consultation

## 何时用

`stages/20-design/DECIDE.md` 判定需要完整设计系统（长期演进、需要品牌辨识度）之后，用它产出具体方案：美学方向、字体、色彩、布局、间距、动效，并生成预览。

判定只需要 AI 直接生成视觉时，不要调它 —— 它的产出规模远超一次性界面所需。

## 安装

gstack 自带安装与升级机制，技能实体复制在 `~/.claude/skills/` 下。

```bash
# 升级由 gstack 自己负责
# 见 gstack-upgrade 技能，或 ~/.gstack/last-update-check
```

## 版本

**不在本库记录版本号。** gstack 自带更新检查（`~/.gstack/last-update-check`）与 `gstack-upgrade` 技能。
