# 组件库文档 - Baby Care Tracker

## 概述

本文档定义了 Baby Care Tracker 项目的组件库。组件库提供可复用的 UI 组件，确保界面一致性和开发效率。

**当前状态：** 项目处于早期阶段，暂未提取可复用组件，组件内联在各页面中。  
**目标：** 逐步提取通用组件到 `miniprogram/components/` 目录，建立组件库。

---

## 1. 组件库结构

### 1.1 目录结构

```
miniprogram/components/
├── baby-card/           # 宝宝卡片组件
├── photo-card/         # 照片卡片组件
├── photo-uploader/     # 照片上传组件
├── date-picker/        # 日期选择器组件
├── empty-state/        # 空状态组件
├── loading/            # 加载状态组件
├── navbar/             # 导航栏组件
├── tabbar/             # 标签栏组件
├── button/             # 按钮组件
├── input/              # 输入框组件
├── textarea/           # 多行文本框组件
├── picker/             # 选择器组件
├── modal/              # 模态框组件
├── toast/              # 提示框组件
├── avatar/             # 头像组件
├── tag/                # 标签组件
└── icon/               # 图标组件
```

### 1.2 组件文件结构

每个组件包含以下文件：

```
components/component-name/
├── component-name.js     # 组件逻辑
├── component-name.json   # 组件配置
├── component-name.wxml   # 组件模板
└── component-name.wxss   # 组件样式
```

---

## 2. 基础组件（Base Components）

### 2.1 Button（按钮）

**状态：** 规划中

**功能描述：** 通用按钮组件，支持多种样式和状态。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | String | `'primary'` | 按钮类型：`primary` / `secondary` / `text` / `danger` |
| `size` | String | `'normal'` | 按钮尺寸：`small` / `normal` / `large` |
| `disabled` | Boolean | `false` | 是否禁用 |
| `loading` | Boolean | `false` | 是否显示加载状态 |
| `plain` | Boolean | `false` | 是否镂空按钮 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindtap` | 点击按钮 | - |

**使用示例：**

```xml
<button type="primary" size="normal" bindtap="handleClick">确认</button>
<button type="secondary" disabled="{{true}}">取消</button>
<button type="danger" loading="{{isLoading}}">删除</button>
```

---

### 2.2 Input（输入框）

**状态：** 规划中

**功能描述：** 通用文本输入框组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | String | `''` | 输入框初始值 |
| `placeholder` | String | `''` | 占位文字 |
| `disabled` | Boolean | `false` | 是否禁用 |
| `password` | Boolean | `false` | 是否为密码框 |
| `type` | String | `'text'` | 键盘类型：`text` / `number` / `idcard` / `digit` |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindinput` | 输入时触发 | `value` |
| `bindblur` | 失焦时触发 | `value` |
| `bindconfirm` | 点击确认时触发 | `value` |

**使用示例：**

```xml
<input placeholder="请输入宝宝姓名" value="{{name}}" bindinput="onNameInput" />
```

---

### 2.3 Textarea（多行文本框）

**状态：** 规划中

**功能描述：** 通用多行文本框组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | String | `''` | 文本框初始值 |
| `placeholder` | String | `''` | 占位文字 |
| `disabled` | Boolean | `false` | 是否禁用 |
| `maxlength` | Number | `140` | 最大输入长度 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindinput` | 输入时触发 | `value` |
| `bindblur` | 失焦时触发 | `value` |

**使用示例：**

```xml
<textarea placeholder="添加照片描述" value="{{description}}" maxlength="500" bindinput="onDescInput" />
```

---

### 2.4 Picker（选择器）

**状态：** 规划中

**功能描述：** 通用选择器组件，支持日期、时间、地区等选择。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `mode` | String | `'selector'` | 选择器类型：`selector` / `date` / `time` / `region` |
| `range` | Array | `[]` | 选项列表（mode=selector 时） |
| `value` | String | `''` | 选中值 |
| `start` | String | `''` | 开始日期（mode=date 时） |
| `end` | String | `''` | 结束日期（mode=date 时） |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindchange` | 选择变化时触发 | `value`, `index` |

**使用示例：**

```xml
<picker mode="date" value="{{birthday}}" start="2020-01-01" end="2026-12-31" bindchange="onDateChange">
  <view>选择日期：{{birthday}}</view>
</picker>
```

---

## 3. 业务组件（Business Components）

### 3.1 BabyCard（宝宝卡片）

**状态：** 规划中

**功能描述：** 展示宝宝信息的卡片组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `baby` | Object | `{}` | 宝宝信息对象 |
| `showActions` | Boolean | `false` | 是否显示操作按钮 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindtap` | 点击卡片 | `baby` |
| `bindedit` | 点击编辑按钮 | `baby` |
| `binddelete` | 点击删除按钮 | `baby` |

**使用示例：**

```xml
<baby-card baby="{{baby}}" showActions="{{true}}" bindtap="onBabyTap" bindedit="onEditBaby" binddelete="onDeleteBaby" />
```

---

### 3.2 PhotoCard（照片卡片）

**状态：** 规划中

**功能描述：** 展示照片缩略图的卡片组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `photo` | Object | `{}` | 照片信息对象 |
| `showActions` | Boolean | `false` | 是否显示操作按钮 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindtap` | 点击卡片 | `photo` |
| `bindlongpress` | 长按卡片 | `photo` |

**使用示例：**

```xml
<photo-card photo="{{photo}}" bindtap="onPhotoTap" bindlongpress="onPhotoLongPress" />
```

---

### 3.3 PhotoUploader（照片上传）

**状态：** 规划中

**功能描述：** 照片上传组件，支持多选和预览。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `maxCount` | Number | `9` | 最多可选照片数 |
| `sizeType` | Array | `['compressed']` | 图片类型：`original` / `compressed` |
| `sourceType` | Array | `['album', 'camera']` | 图片来源：`album` / `camera` |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindsuccess` | 上传成功 | `tempFilePaths` |
| `bindfail` | 上传失败 | `err` |

**使用示例：**

```xml
<photo-uploader maxCount="{{9}}" bindsuccess="onUploadSuccess" bindfail="onUploadFail" />
```

---

### 3.4 DatePicker（日期选择器）

**状态：** 规划中

**功能描述：** 日期选择器组件，支持年月日选择。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `value` | String | `''` | 选中日期（格式：YYYY-MM-DD） |
| `start` | String | `''` | 开始日期 |
| `end` | String | `''` | 结束日期 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindchange` | 选择变化时触发 | `value` |

**使用示例：**

```xml
<date-picker value="{{birthday}}" start="2020-01-01" end="2026-12-31" bindchange="onDateChange" />
```

---

## 4. 反馈组件（Feedback Components）

### 4.1 EmptyState（空状态）

**状态：** 规划中

**功能描述：** 空状态提示组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `icon` | String | `'default'` | 图标名称 |
| `text` | String | `''` | 提示文字 |
| `showAction` | Boolean | `false` | 是否显示操作按钮 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindactiontap` | 点击操作按钮 | - |

**使用示例：**

```xml
<empty-state icon="photo" text="暂无照片，快来上传吧" showAction="{{true}}" bindactiontap="goToUpload" />
```

---

### 4.2 Loading（加载状态）

**状态：** 规划中

**功能描述：** 加载状态提示组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `show` | Boolean | `false` | 是否显示加载状态 |
| `text` | String | `'加载中...'` | 加载提示文字 |

**使用示例：**

```xml
<loading show="{{isLoading}}" text="上传中..." />
```

---

## 5. 导航组件（Navigation Components）

### 5.1 NavBar（导航栏）

**状态：** 规划中

**功能描述：** 自定义导航栏组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | String | `''` | 导航栏标题 |
| `showBack` | Boolean | `true` | 是否显示返回按钮 |
| `backgroundColor` | String | `'#8B4513'` | 背景颜色 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindbacktap` | 点击返回按钮 | - |

**使用示例：**

```xml
<nav-bar title="宝宝档案" showBack="{{true}}" bindbacktap="goBack" />
```

---

### 5.2 TabBar（标签栏）

**状态：** 规划中

**功能描述：** 自定义标签栏组件（替代原生 TabBar）。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `active` | Number | `0` | 当前选中标签索引 |
| `list` | Array | `[]` | 标签列表 |

**事件（Events）：**

| 事件名 | 说明 | 返回值 |
|--------|------|--------|
| `bindchange` | 标签切换时触发 | `index` |

**使用示例：**

```xml
<tab-bar active="{{0}}" list="{{tabList}}" bindchange="onTabChange" />
```

---

## 6. 展示组件（Display Components）

### 6.1 Avatar（头像）

**状态：** 规划中

**功能描述：** 头像展示组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `src` | String | `''` | 头像图片地址 |
| `size` | String | `'normal'` | 尺寸：`small` / `normal` / `large` |
| `shape` | String | `'circle'` | 形状：`circle` / `square` |

**使用示例：**

```xml
<avatar src="{{userInfo.avatarUrl}}" size="normal" shape="circle" />
```

---

### 6.2 Tag（标签）

**状态：** 规划中

**功能描述：** 标签展示组件。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `text` | String | `''` | 标签文字 |
| `type` | String | `'default'` | 类型：`default` / `success` / `warning` / `error` |

**使用示例：**

```xml
<tag text="已审核" type="success" />
<tag text="待审核" type="warning" />
```

---

### 6.3 Icon（图标）

**状态：** 规划中

**功能描述：** 图标组件，使用 Lucide Icons。

**属性（Properties）：**

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `name` | String | `''` | 图标名称（Lucide Icons） |
| `size` | Number | `24` | 图标尺寸（px） |
| `color` | String | `'#3E2723'` | 图标颜色 |

**使用示例：**

```xml
<icon name="camera" size="32" color="#8B4513" />
```

---

## 7. 组件开发规范

### 7.1 组件命名规范

- 组件名使用驼峰命名法（camelCase）
- 组件目录名使用短横线命名法（kebab-case）
- 组件文件名与目录名一致

**示例：**
```
components/
├── baby-card/           # 目录名：短横线命名
│   ├── baby-card.js     # 文件名：短横线命名
│   ├── baby-card.json
│   ├── baby-card.wxml
│   └── baby-card.wxss
```

### 7.2 组件属性规范

- 属性名使用驼峰命名法（camelCase）
- 提供详细的属性说明和默认值
- 复杂类型的属性应有详细的子属性说明

**示例：**
```javascript
Component({
  properties: {
    // 宝宝信息对象
    baby: {
      type: Object,
      value: {}
    },
    
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      value: false
    }
  }
})
```

### 7.3 组件事件规范

- 事件名使用小写字母，单词间用连字符分隔（kebab-case）
- 事件对象应包含必要的返回值
- 事件处理函数命名以 `on` 开头，后接事件名（首字母大写）

**示例：**
```javascript
Component({
  methods: {
    // 点击卡片
    onCardTap: function() {
      this.triggerEvent('tap', { baby: this.data.baby })
    },
    
    // 点击编辑按钮
    onEditTap: function() {
      this.triggerEvent('edit', { baby: this.data.baby })
    }
  }
})
```

---

## 8. 组件使用示例

### 8.1 在页面中引入组件

**步骤 1：** 在页面 JSON 文件中注册组件

```json
{
  "usingComponents": {
    "baby-card": "/components/baby-card/baby-card",
    "empty-state": "/components/empty-state/empty-state"
  }
}
```

**步骤 2：** 在页面 WXML 文件中使用组件

```xml
<view class="baby-list">
  <baby-card 
    wx:for="{{babyList}}" 
    wx:key="_id"
    baby="{{item}}" 
    showActions="{{true}}"
    bindtap="onBabyTap"
    bindedit="onEditBaby"
    binddelete="onDeleteBaby"
  />
  
  <empty-state 
    wx:if="{{babyList.length === 0}}"
    icon="baby"
    text="暂无宝宝档案，快来创建吧"
    showAction="{{true}}"
    bindactiontap="goToCreate"
  />
</view>
```

**步骤 3：** 在页面 JS 文件中处理组件事件

```javascript
Page({
  data: {
    babyList: []
  },
  
  onLoad: function() {
    this.loadBabyList()
  },
  
  loadBabyList: function() {
    // 加载宝宝列表
  },
  
  onBabyTap: function(e) {
    const baby = e.detail.baby
    // 跳转到宝宝详情
  },
  
  onEditBaby: function(e) {
    const baby = e.detail.baby
    // 跳转到编辑页面
  },
  
  onDeleteBaby: function(e) {
    const baby = e.detail.baby
    // 删除宝宝档案
  },
  
  goToCreate: function() {
    wx.navigateTo({
      url: '/pages/baby-edit/baby-edit'
    })
  }
})
```

---

## 9. 组件库路线图

### 9.1 第一阶段（MVP v0.1）- 当前阶段

- [x] 完成项目架构设计
- [x] 实现基础页面（首页、宝宝档案、照片上传、照片浏览）
- [ ] 提取基础组件（Button、Input、Textarea）
- [ ] 提取业务组件（BabyCard、PhotoCard）

### 9.2 第二阶段（MVP v1.0）

- [ ] 提取反馈组件（EmptyState、Loading）
- [ ] 提取导航组件（NavBar、TabBar）
- [ ] 提取展示组件（Avatar、Tag、Icon）
- [ ] 完善组件文档和示例

### 9.3 第三阶段（V1.1+）

- [ ] 组件性能优化
- [ ] 组件单元测试
- [ ] 组件可视化文档（Storybook）

---

**文档版本**：v1.0  
**最后更新**：2026-05-21  
**维护者**：开发团队
