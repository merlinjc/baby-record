# UI 设计系统文档 - Baby Care Tracker

## 概述

本文档定义了 Baby Care Tracker 项目的 UI 设计系统。项目采用"美拉德色系"设计风格，营造温暖、舒适的视觉体验。

**设计风格：** 美拉德色系（温暖棕色系）  
**目标用户：** 0-3 岁宝宝父母  
**设计原则：** 温暖、简洁、易用

---

## 1. 色彩系统

### 1.1 主色调（棕色系）

| 色阶 | 色值 | 用途 | 示例 |
|------|------|------|------|
| 主色-深 | `#8B4513` | 主按钮、导航栏、重要文字 | ![#8B4513](https://via.placeholder.com/20/8B4513/FFFFFF?text=+) |
| 主色-中 | `#D2691E` | 次要按钮、悬停状态 | ![#D2691E](https://via.placeholder.com/20/D2691E/FFFFFF?text=+) |
| 主色-浅 | `#F4A460` | 背景、边框 | ![#F4A460](https://via.placeholder.com/20/F4A460/000000?text=+) |

### 1.2 辅助色

| 色阶 | 色值 | 用途 | 示例 |
|------|------|------|------|
| 辅助色-深 | `#795548` | 次要文字、图标 | ![#795548](https://via.placeholder.com/20/795548/FFFFFF?text=+) |
| 辅助色-中 | `#A1887F` | 占位文字、禁用状态 | ![#A1887F](https://via.placeholder.com/20/A1887F/FFFFFF?text=+) |
| 辅助色-浅 | `#D7CCC8` | 分割线、背景 | ![#D7CCC8](https://via.placeholder.com/20/D7CCC8/000000?text=+) |

### 1.3 功能色

| 色阶 | 色值 | 用途 | 示例 |
|------|------|------|------|
| 成功色 | `#4CAF50` | 成功提示、确认按钮 | ![#4CAF50](https://via.placeholder.com/20/4CAF50/FFFFFF?text=+) |
| 警告色 | `#FF9800` | 警告提示、待处理状态 | ![#FF9800](https://via.placeholder.com/20/FF9800/FFFFFF?text=+) |
| 错误色 | `#F44336` | 错误提示、删除按钮 | ![#F44336](https://via.placeholder.com/20/F44336/FFFFFF?text=+) |
| 信息色 | `#2196F3` | 信息提示、链接 | ![#2196F3](https://via.placeholder.com/20/2196F3/FFFFFF?text=+) |

### 1.4 中性色

| 色阶 | 色值 | 用途 | 示例 |
|------|------|------|------|
| 背景色 | `#FFF8DC` | 页面背景 | ![#FFF8DC](https://via.placeholder.com/20/FFF8DC/000000?text=+) |
| 表面色 | `#FFFFFF` | 卡片、弹窗背景 | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/000000?text=+) |
| 文字主色 | `#3E2723` | 主要文字 | ![#3E2723](https://via.placeholder.com/20/3E2723/FFFFFF?text=+) |
| 文字次色 | `#5D4037` | 次要文字 | ![#5D4037](https://via.placeholder.com/20/5D4037/FFFFFF?text=+) |
| 边框色 | `#D7CCC8` | 边框、分割线 | ![#D7CCC8](https://via.placeholder.com/20/D7CCC8/000000?text=+) |

### 1.5 CSS 变量定义

```css
/* app.wxss - 全局样式变量 */

:root {
  /* 主色调 */
  --color-primary: #8B4513;
  --color-primary-medium: #D2691E;
  --color-primary-light: #F4A460;
  
  /* 辅助色 */
  --color-secondary: #795548;
  --color-secondary-medium: #A1887F;
  --color-secondary-light: #D7CCC8;
  
  /* 功能色 */
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #2196F3;
  
  /* 中性色 */
  --color-bg: #FFF8DC;
  --color-surface: #FFFFFF;
  --color-text-primary: #3E2723;
  --color-text-secondary: #5D4037;
  --color-border: #D7CCC8;
}
```

---

## 2. 字体排版

### 2.1 字体大小层级

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| H1 - 大标题 | `40rpx` | 700 | `52rpx` | 页面主标题 |
| H2 - 中标题 | `36rpx` | 700 | `48rpx` | 卡片标题、弹窗标题 |
| H3 - 小标题 | `32rpx` | 600 | `44rpx` | 列表标题、分组标题 |
| Body1 - 正文 | `28rpx` | 400 | `40rpx` | 正文内容 |
| Body2 - 辅助文字 | `24rpx` | 400 | `36rpx` | 辅助说明文字 |
| Caption - 说明文字 | `20rpx` | 400 | `28rpx` | 提示文字、脚注 |

### 2.2 CSS 类定义

```css
/* app.wxss - 字体排版类 */

.text-h1 {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 52rpx;
}

.text-h2 {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 48rpx;
}

.text-h3 {
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
}

.text-body1 {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 40rpx;
}

.text-body2 {
  font-size: 24rpx;
  font-weight: 400;
  line-height: 36rpx;
}

.text-caption {
  font-size: 20rpx;
  font-weight: 400;
  line-height: 28rpx;
}
```

---

## 3. 间距系统

### 3.1 8rpx 网格系统

项目采用 **8rpx 网格系统**，所有间距应为 8 的倍数。

| 级别 | 数值 | 用途 |
|------|------|------|
| XS - 最小间距 | `8rpx` | 图标与文字间距 |
| S - 小间距 | `16rpx` | 紧凑布局间距 |
| M - 中间距 | `24rpx` | 常规布局间距 |
| L - 大间距 | `32rpx` | 卡片内边距 |
| XL - 超大间距 | `48rpx` | 页面边距 |
| 2XL - 最大间距 | `64rpx` | 页面分区间距 |

### 3.2 CSS 类定义

```css
/* app.wxss - 间距类 */

.space-xs { padding: 8rpx; }
.space-s { padding: 16rpx; }
.space-m { padding: 24rpx; }
.space-l { padding: 32rpx; }
.space-xl { padding: 48rpx; }
.space-2xl { padding: 64rpx; }

.gap-xs { gap: 8rpx; }
.gap-s { gap: 16rpx; }
.gap-m { gap: 24rpx; }
.gap-l { gap: 32rpx; }
.gap-xl { gap: 48rpx; }
```

---

## 4. 圆角与阴影

### 4.1 圆角系统

| 级别 | 数值 | 用途 |
|------|------|------|
| 小圆角 | `8rpx` | 小按钮、标签 |
| 中圆角 | `16rpx` | 卡片、输入框 |
| 大圆角 | `24rpx` | 弹窗、大卡片 |
| 圆形 | `50%` | 头像、图标按钮 |

### 4.2 阴影系统

| 级别 | 数值 | 用途 |
|------|------|------|
| 轻微阴影 | `0 2rpx 12rpx rgba(139, 69, 19, 0.1)` | 卡片 |
| 中等阴影 | `0 4rpx 20rpx rgba(139, 69, 19, 0.15)` | 弹窗、悬浮按钮 |
| 重度阴影 | `0 8rpx 32rpx rgba(139, 69, 19, 0.2)` | 模态框 |

### 4.3 CSS 类定义

```css
/* app.wxss - 圆角与阴影类 */

.card {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(139, 69, 19, 0.1);
}

.card-elevated {
  box-shadow: 0 4rpx 20rpx rgba(139, 69, 19, 0.15);
}

.modal {
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(139, 69, 19, 0.2);
}
```

---

## 5. 按钮样式

### 5.1 主按钮（Primary Button）

**用途：** 主要操作按钮（如：确认、提交、保存）

**样式：**
```css
.btn-primary {
  background-color: #8B4513;
  color: #FFFFFF;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.btn-primary:active {
  background-color: #D2691E;
}
```

### 5.2 次要按钮（Secondary Button）

**用途：** 次要操作按钮（如：取消、返回）

**样式：**
```css
.btn-secondary {
  background-color: #D7CCC8;
  color: #5D4037;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

---

## 6. 图标体系

### 6.1 统一来源

当前小程序图标统一基于 `lucide-static` 生成，运行时不直接使用 SVG，而是使用预渲染 PNG。

- 生成脚本：`scripts/generate-lucide-icons.js`
- npm 命令：`npm run generate:icons`
- 输出目录：`miniprogram/assets/icons/lucide`
- 输出格式：`{icon-name}-{variant}.png`

### 6.2 设计约束

- 默认只使用 `active` 和 `inactive` 两个变体，避免任意扩散颜色。
- `active` 用于强调态、入口卡片、空状态主视觉。
- `inactive` 主要用于 tabbar 非选中态。
- 页面层优先传 `icon-name`，不要直接硬编码 `/assets/icons/lucide/...png` 路径。
- 仅在非常规资源或兼容老代码时，才回退到 `icon` 绝对路径字段。

### 6.3 当前推荐映射

| 语义 | icon-name | 典型场景 |
|------|-----------|----------|
| 首页 | `house` | Tabbar 首页 |
| 时间轴 | `calendar-range` | Tabbar、时间轴空状态 |
| 我的 | `circle-user-round` | Tabbar、个人资料 |
| 宝宝档案 | `baby` | 档案管理、建档 |
| 上传照片 | `image-plus` | 上传入口 |
| 照片流 | `images` | 照片浏览、空状态 |
| 家庭成员 | `users-round` | 协作入口 |
| 回收站 | `trash-2` | 风险操作、回收站 |
| 反馈 | `message-square-heart` | 反馈入口 |
| 新建/建档 | `badge-plus` | 建档空状态 |
| 编辑资料 | `user-round-pen` | 资料编辑 |
| 权限 | `shield-check` | 可见范围、角色 |
| 地点 | `map-pinned` | 地点字段 |
| 文本描述 | `text` | 描述字段 |
| 日期时间 | `clock-3` | 日期字段 |
| 下载 | `download` | 下载动作 |
| 身份/联系人 | `user-round-check` | 联系方式、关系备注 |

### 6.4 组件 API 约定

以下组件已经支持统一图标解析：

- `action-card`
- `empty-state-panel`
- `form-field`
- `metric-info-card`

推荐写法：

```xml
<action-card icon-name="images" title="浏览照片流" desc="按时间倒序快速翻看最近记录"></action-card>

<empty-state-panel icon-name="badge-plus" title="先创建一个宝宝档案" desc="创建后再继续当前流程。"></empty-state-panel>

<form-field icon-name="clock-3" label="拍摄日期">
  <picker mode="date">
    <view class="picker-field">2026-05-21</view>
  </picker>
</form-field>

<metric-info-card icon-name="map-pinned" label="地点" value="朝阳公园"></metric-info-card>
```

兼容字段如下：

- `icon-name`: 推荐，语义化图标名。
- `icon-variant`: 可选，默认 `active`。
- `icon`: 兼容旧写法，直接传完整图片路径。

### 6.5 维护原则

- 新增页面时，先复用现有 icon-name，不要为局部页面随意新增一套图标含义。
- 新增图标前，先确认是否能复用已有语义映射。
- 如果必须新增图标，先更新生成脚本，再执行 `npm run generate:icons`，最后更新本文档。

---

## 7. 组件收敛约定

### 7.1 页面层职责

- 页面只负责组织内容与状态，不直接定义图标资源路径和重复结构。
- 优先使用已有的 `ui-hero`、`section-header`、`action-card`、`empty-state-panel`、`form-field`、`metric-info-card`。
- 相同语义的卡片、空状态、表单标签应保持一致的图标和文案调性。

### 7.2 优先收敛顺序

做 UI 重构时，优先按以下顺序收敛：

1. 先收敛结构组件，再改页面细节。
2. 先收敛语义化 API，再处理资源路径。
3. 先解决高频入口，再处理长尾页面。

### 7.3 避免的问题

- 不要在页面里重复写一整套卡片结构，只差一个标题或图标。
- 不要直接把 PNG 路径散落到所有页面模板中。
- 不要在不同页面里给同一动作分配不同图标语义。

---

## 8. 文档同步要求

出现以下变更时，必须同步更新本文档：

- 新增或移除 lucide 图标。
- 组件新增图标相关属性。
- 图标语义映射发生调整。
- 组件收敛策略变化，影响页面写法。

.btn-secondary:active {
  background-color: #A1887F;
}
```

### 5.3 文字按钮（Text Button）

**用途：** 辅助操作（如：忘记密码、查看详情）

**样式：**
```css
.btn-text {
  background-color: transparent;
  color: #8B4513;
  font-size: 28rpx;
  border: none;
  padding: 0;
}

.btn-text:active {
  color: #D2691E;
}
```

### 5.4 危险按钮（Danger Button）

**用途：** 危险操作（如：删除、退出登录）

**样式：**
```css
.btn-danger {
  background-color: #F44336;
  color: #FFFFFF;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.btn-danger:active {
  background-color: #D32F2F;
}
```

---

## 6. 输入框样式

### 6.1 文本输入框

**样式：**
```css
.input {
  background-color: #FFF8DC;
  border: 2rpx solid #D7CCC8;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #3E2723;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  border-color: #8B4513;
}

.input-placeholder {
  color: #A1887F;
}
```

### 6.2 多行文本框

**样式：**
```css
.textarea {
  background-color: #FFF8DC;
  border: 2rpx solid #D7CCC8;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #3E2723;
  width: 100%;
  min-height: 200rpx;
  box-sizing: border-box;
}
```

---

## 7. 列表样式

### 7.1 列表项

**样式：**
```css
.list-item {
  background-color: #FFFFFF;
  padding: 24rpx;
  border-bottom: 2rpx solid #D7CCC8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item-text {
  font-size: 28rpx;
  color: #3E2723;
}

.list-item-arrow {
  color: #A1887F;
  font-size: 28rpx;
}
```

---

## 8. 头像样式

### 8.1 圆形头像

**样式：**
```css
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #D7CCC8;
  overflow: hidden;
}

.avatar-small {
  width: 60rpx;
  height: 60rpx;
}

.avatar-large {
  width: 120rpx;
  height: 120rpx;
}
```

---

## 9. 标签样式

### 9.1 状态标签

**样式：**
```css
.tag {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.tag-success {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.tag-warning {
  background-color: #FFF3E0;
  color: #FF9800;
}

.tag-error {
  background-color: #FFEBEE;
  color: #F44336;
}
```

---

## 10. 空状态样式

### 10.1 空状态容器

**样式：**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64rpx 48rpx;
  text-align: center;
}

.empty-state-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  color: #D7CCC8;
}

.empty-state-text {
  font-size: 28rpx;
  color: #A1887F;
  margin-bottom: 24rpx;
}
```

---

## 11. 加载状态样式

### 11.1 加载动画

**样式：**
```css
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #D7CCC8;
  border-top: 4rpx solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 12. 响应式断点

### 12.1 断点定义

| 断点 | 宽度 | 说明 |
|------|------|------|
| 小屏手机 | `< 375px` | iPhone SE 等 |
| 标准手机 | `375px - 414px` | iPhone 12/13 等 |
| 大屏手机 | `> 414px` | iPhone Pro Max 等 |

### 12.2 响应式策略

- 使用 `rpx` 单位自动适配不同屏幕宽度
- 关键信息在小屏上优先显示
- 使用 `flex-wrap` 允许内容换行

---

## 13. 图标使用规范

### 13.1 图标库

项目使用 **Lucide Icons**（1000+ 图标）作为图标库。

**使用方法：**
```bash
# 搜索图标
node ~/.codebuddy/skills/lucide-icons/scripts/lucide.js search <keyword>

# 下载图标（SVG 和/或 React 组件）
node ~/.codebuddy/skills/lucide-icons/scripts/lucide.js download <icon-name> --output ./src/icons/ --format svg,react
```

### 13.2 图标尺寸

| 用途 | 尺寸 |
|------|------|
| 导航栏图标 | `48rpx × 48rpx` |
| 列表项图标 | `40rpx × 40rpx` |
| 按钮图标 | `36rpx × 36rpx` |
| 提示图标 | `32rpx × 32rpx` |

---

## 14. 动画规范

### 14.1 过渡动画

| 属性 | 时长 | 缓动函数 |
|------|------|----------|
| 颜色变化 | `200ms` | `ease-in-out` |
| 位置变化 | `300ms` | `ease-out` |
| 透明度变化 | `200ms` | `ease-in-out` |

### 14.2 关键帧动画

```css
/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滑入动画 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

---

## 15. 无障碍设计

### 15.1 颜色对比度

- 文字与背景的对比度至少达到 **4.5:1**（WCAG AA 标准）
- 大字号文字（≥ 24rpx）对比度至少 **3:1**

### 15.2 触摸目标尺寸

- 所有可点击元素的最小触摸目标尺寸为 **88rpx × 88rpx**
- 按钮之间至少有 **16rpx** 的间距

---

**文档版本**：v1.0  
**最后更新**：2026-05-21  
**维护者**：开发团队
