# 服务层 API 文档 - Baby Care Tracker

## 概述

本文档定义了 Baby Care Tracker 项目的服务层 API。服务层封装了 CloudBase 云函数调用，提供统一的接口供小程序前端使用。

**服务层结构：**
```
miniprogram/services/
├── userService.js    # 用户相关服务
├── babyService.js    # 宝宝档案服务
└── photoService.js    # 照片服务
```

---

## 1. 用户服务（userService.js）

### 1.1 获取用户信息

**函数：** `getUserInfo()`

**功能描述：** 从全局数据或调用云函数获取用户信息

**参数：** 无

**返回值：** `Promise<UserInfo>`

**示例：**
```javascript
const userInfo = await userService.getUserInfo()
```

**UserInfo 结构：**
```typescript
interface UserInfo {
  _id: string
  _openid: string
  appId: string
  nickName: string
  avatarUrl: string
  babyProfiles: string[]  // 宝宝档案ID列表
  createTime: Date
  updateTime: Date
}
```

### 1.2 更新用户信息

**函数：** `updateUserInfo(userInfo: UserInfo)`

**功能描述：** 更新用户信息

**参数：**
- `userInfo: UserInfo` - 用户信息对象

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await userService.updateUserInfo({
  nickName: '新昵称',
  avatarUrl: 'https://...'
})
```

### 1.3 检查登录状态

**函数：** `checkLoginStatus()`

**功能描述：** 检查用户是否已登录

**参数：** 无

**返回值：** `boolean`

**示例：**
```javascript
const isLoggedIn = userService.checkLoginStatus()
if (isLoggedIn) {
  // 用户已登录
}
```

---

## 2. 宝宝档案服务（babyService.js）

### 2.1 获取宝宝档案列表

**函数：** `getBabyProfiles()`

**功能描述：** 获取当前用户的宝宝档案列表

**参数：** 无

**返回值：** `Promise<BabyProfile[]>`

**示例：**
```javascript
const babyProfiles = await babyService.getBabyProfiles()
```

**BabyProfile 结构：**
```typescript
interface BabyProfile {
  _id: string
  name: string
  birthday: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
  creatorId: string
  members: Member[]
  settings: Settings
  createTime: Date
  updateTime: Date
}

interface Member {
  userId: string
  role: 'creator' | 'admin' | 'member' | 'viewer'
  joinedAt: number
  nickname: string
}

interface Settings {
  allowDownload: boolean
  allowShare: boolean
  defaultPermission: 'public' | 'family' | 'private'
}
```

### 2.2 创建宝宝档案

**函数：** `createBabyProfile(data: CreateBabyProfileDto)`

**功能描述：** 创建新的宝宝档案

**参数：**
- `data: CreateBabyProfileDto` - 创建宝宝档案的数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.createBabyProfile({
  name: '小明',
  birthday: '2025-10-01',
  gender: 'male'
})
```

**CreateBabyProfileDto 结构：**
```typescript
interface CreateBabyProfileDto {
  name: string
  birthday: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
}
```

### 2.3 更新宝宝档案

**函数：** `updateBabyProfile(id: string, data: UpdateBabyProfileDto)`

**功能描述：** 更新宝宝档案信息

**参数：**
- `id: string` - 宝宝档案ID
- `data: UpdateBabyProfileDto` - 更新数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.updateBabyProfile('bp_001', {
  name: '小明',
  birthday: '2025-10-01'
})
```

### 2.4 删除宝宝档案

**函数：** `deleteBabyProfile(id: string)`

**功能描述：** 删除宝宝档案

**参数：**
- `id: string` - 宝宝档案ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.deleteBabyProfile('bp_001')
```

### 2.5 设置当前宝宝

**函数：** `setCurrentBaby(babyProfile: BabyProfile)`

**功能描述：** 设置当前选中的宝宝档案

**参数：**
- `babyProfile: BabyProfile` - 宝宝档案对象

**返回值：** `void`

**示例：**
```javascript
babyService.setCurrentBaby(babyProfiles[0])
```

### 2.6 获取当前宝宝

**函数：** `getCurrentBaby()`

**功能描述：** 获取当前选中的宝宝档案

**参数：** 无

**返回值：** `BabyProfile | null`

**示例：**
```javascript
const currentBaby = babyService.getCurrentBaby()
```

---

## 3. 照片服务（photoService.js）

### 3.1 上传照片

**函数：** `uploadPhoto(data: UploadPhotoDto)`

**功能描述：** 上传宝宝照片

**参数：**
- `data: UploadPhotoDto` - 上传照片的数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.uploadPhoto({
  babyId: 'bp_001',
  filePath: 'wxfile://...',
  description: '宝宝第一次微笑',
  location: {
    name: '北京市朝阳区',
    latitude: 39.9042,
    longitude: 116.4074
  }
})
```

**UploadPhotoDto 结构：**
```typescript
interface UploadPhotoDto {
  babyId: string
  filePath: string
  description?: string
  location?: Location
  permission?: 'public' | 'family' | 'private' | 'admin'
}

interface Location {
  name: string
  latitude: number
  longitude: number
}
```

### 3.2 获取照片列表

**函数：** `getPhotos(params: GetPhotosParams)`

**功能描述：** 获取照片列表（分页）

**参数：**
- `params: GetPhotosParams` - 查询参数

**返回值：** `Promise<PhotoListResult>`

**示例：**
```javascript
const result = await photoService.getPhotos({
  babyId: 'bp_001',
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

**GetPhotosParams 结构：**
```typescript
interface GetPhotosParams {
  babyId: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
  startDate?: string
  endDate?: string
}
```

**PhotoListResult 结构：**
```typescript
interface PhotoListResult {
  list: Photo[]
  total: number
  page: number
  pageSize: number
}

interface Photo {
  _id: string
  babyId: string
  uploaderId: string
  fileId: string
  thumbnailId: string
  description: string
  location?: Location
  tags: string[]
  isFavorite: boolean
  permission: string
  auditStatus: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 获取照片详情

**函数：** `getPhotoDetail(photoId: string)`

**功能描述：** 获取照片详情

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Photo>`

**示例：**
```javascript
const photo = await photoService.getPhotoDetail('photo_001')
```

### 3.4 更新照片信息

**函数：** `updatePhoto(photoId: string, data: UpdatePhotoDto)`

**功能描述：** 更新照片信息（描述、标签等）

**参数：**
- `photoId: string` - 照片ID
- `data: UpdatePhotoDto` - 更新数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.updatePhoto('photo_001', {
  description: '更新后的描述',
  tags: ['微笑', '百天']
})
```

**UpdatePhotoDto 结构：**
```typescript
interface UpdatePhotoDto {
  description?: string
  tags?: string[]
  permission?: string
  isFavorite?: boolean
}
```

### 3.5 删除照片

**函数：** `deletePhoto(photoId: string)`

**功能描述：** 删除照片（移入回收站）

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.deletePhoto('photo_001')
```

### 3.6 获取已删除照片

**函数：** `getDeletedPhotos(babyId: string)`

**功能描述：** 获取已删除的照片列表（回收站）

**参数：**
- `babyId: string` - 宝宝档案ID

**返回值：** `Promise<Photo[]>`

**示例：**
```javascript
const deletedPhotos = await photoService.getDeletedPhotos('bp_001')
```

### 3.7 恢复照片

**函数：** `restorePhoto(photoId: string)`

**功能描述：** 恢复已删除的照片

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.restorePhoto('photo_001')
```

### 3.8 按时间获取照片

**函数：** `getPhotosByTime(params: GetPhotosByTimeParams)`

**功能描述：** 按年/月/日分组获取照片

**参数：**
- `params: GetPhotosByTimeParams` - 查询参数

**返回值：** `Promise<PhotoTimeGroupResult>`

**示例：**
```javascript
const result = await photoService.getPhotosByTime({
  babyId: 'bp_001',
  groupBy: 'month',
  year: 2026
})
```

**GetPhotosByTimeParams 结构：**
```typescript
interface GetPhotosByTimeParams {
  babyId: string
  groupBy: 'year' | 'month' | 'day'
  year?: number
  month?: number
}
```

**PhotoTimeGroupResult 结构：**
```typescript
interface PhotoTimeGroupResult {
  groups: PhotoTimeGroup[]
}

interface PhotoTimeGroup {
  key: string  // 年份或月份或日期
  count: number
  photos: Photo[]
}
```

---

## 4. 工具层 API（utils/）

### 4.1 云函数调用工具（cloudUtil.js）

#### 4.1.1 调用云函数

**函数：** `callCloudFunction(name: string, data?: object, showLoading?: boolean)`

**功能描述：** 调用 CloudBase 云函数

**参数：**
- `name: string` - 云函数名称
- `data: object` - 传递给云函数的数据（可选，默认 `{}`）
- `showLoading: boolean` - 是否显示加载提示（可选，默认 `true`）

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await cloudUtil.callCloudFunction('getUserInfo', {
  userId: 'user_001'
})
```

#### 4.1.2 静默调用云函数

**函数：** `callCloudFunctionSilent(name: string, data?: object)`

**功能描述：** 调用云函数（不显示加载提示）

**参数：**
- `name: string` - 云函数名称
- `data: object` - 传递给云函数的数据（可选，默认 `{}`）

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await cloudUtil.callCloudFunctionSilent('getUserInfo')
```

#### 4.1.3 上传文件

**函数：** `uploadFile(filePath: string, cloudPath: string, onProgress?: function)`

**功能描述：** 上传文件到 CloudBase 存储

**参数：**
- `filePath: string` - 本地文件路径
- `cloudPath: string` - 云端文件路径
- `onProgress: function` - 进度回调函数（可选）

**返回值：** `Promise<UploadResult>`

**示例：**
```javascript
const result = await cloudUtil.uploadFile(
  'wxfile://temp/xxx.jpg',
  'baby_photos/bp_001/2026/05/photo_001.jpg',
  (progress) => console.log('上传进度:', progress)
)
```

#### 4.1.4 下载文件

**函数：** `downloadFile(fileID: string)`

**功能描述：** 下载 CloudBase 存储文件

**参数：**
- `fileID: string` - 云文件ID

**返回值：** `Promise<DownloadResult>`

**示例：**
```javascript
const result = await cloudUtil.downloadFile('cloudbase://...')
```

#### 4.1.5 获取临时文件 URL

**函数：** `getTempFileURL(fileID: string)`

**功能描述：** 获取云文件的临时访问 URL

**参数：**
- `fileID: string` - 云文件ID

**返回值：** `Promise<string>`

**示例：**
```javascript
const tempURL = await cloudUtil.getTempFileURL('cloudbase://...')
```

### 4.2 错误处理工具（errorUtil.js）

#### 4.2.1 处理云函数错误

**函数：** `handleCloudFunctionError(error: Error, defaultMessage?: string)`

**功能描述：** 统一处理云函数错误，显示用户友好的错误提示

**参数：**
- `error: Error` - 错误对象
- `defaultMessage: string` - 默认错误提示（可选）

**返回值：** `void`

**示例：**
```javascript
try {
  const result = await cloudUtil.callCloudFunction('getUserInfo')
} catch (error) {
  errorUtil.handleCloudFunctionError(error, '获取用户信息失败')
}
```

### 4.3 日期处理工具（dateUtil.js）

#### 4.3.1 格式化日期

**函数：** `formatDate(date: Date, format?: string)`

**功能描述：** 格式化日期为字符串

**参数：**
- `date: Date` - 日期对象
- `format: string` - 格式字符串（可选，默认 `'YYYY-MM-DD'`）

**返回值：** `string`

**示例：**
```javascript
const dateStr = dateUtil.formatDate(new Date(), 'YYYY-MM-DD')
// 输出: "2026-05-21"
```

#### 4.3.2 计算年龄

**函数：** `calculateAge(birthday: string)`

**功能描述：** 根据生日计算年龄（年月日）

**参数：**
- `birthday: string` - 生日字符串（格式：`'YYYY-MM-DD'`）

**返回值：** `string`

**示例：**
```javascript
const age = dateUtil.calculateAge('2025-10-01')
// 输出: "7个月20天"
```

### 4.4 文件处理工具（fileUtil.js）

#### 4.4.1 压缩图片

**函数：** `compressImage(filePath: string, quality?: number)`

**功能描述：** 压缩图片文件

**参数：**
- `filePath: string` - 图片文件路径
- `quality: number` - 压缩质量 0-100（可选，默认 `80`）

**返回值：** `Promise<string>` - 压缩后的文件路径

**示例：**
```javascript
const compressedPath = await fileUtil.compressImage('wxfile://temp/xxx.jpg', 80)
```

#### 4.4.2 生成云路径

**函数：** `generateCloudPath(babyId: string, photoId: string)`

**功能描述：** 生成云端存储路径

**参数：**
- `babyId: string` - 宝宝档案ID
- `photoId: string` - 照片ID

**返回值：** `string`

**示例：**
```javascript
const cloudPath = fileUtil.generateCloudPath('bp_001', 'photo_001')
// 输出: "baby_photos/bp_001/2026/05/photo_001.jpg"
```

---

## 5. 云函数 API

### 5.1 checkAuthStatus

**功能：** 检查用户认证状态，获取或创建用户信息

**输入：** 无（从云函数上下文中获取 OPENID）

**输出：**
```json
{
  "code": 0,
  "message": "获取用户信息成功",
  "data": {
    "_id": "user_001",
    "_openid": "oXXXX",
    "appId": "wxXXXX",
    "nickName": "",
    "avatarUrl": "",
    "babyProfiles": [],
    "createTime": "2026-05-21T10:00:00.000Z",
    "updateTime": "2026-05-21T10:00:00.000Z"
  }
}
```

### 5.2 createBabyProfile

**功能：** 创建宝宝档案

**输入：**
```json
{
  "name": "小明",
  "birthday": "2025-10-01",
  "gender": "male",
  "avatar": "cloudbase://..."
}
```

**输出：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "_id": "bp_001",
    "name": "小明",
    "birthday": "2025-10-01",
    "gender": "male",
    "creatorId": "user_001",
    "members": [...],
    "createTime": "2026-05-21T10:00:00.000Z",
    "updateTime": "2026-05-21T10:00:00.000Z"
  }
}
```

### 5.3 uploadPhoto

**功能：** 上传照片

**输入：**
```json
{
  "babyId": "bp_001",
  "filePath": "wxfile://...",
  "description": "宝宝第一次微笑",
  "location": {
    "name": "北京市朝阳区",
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "permission": "family"
}
```

**输出：**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "_id": "photo_001",
    "babyId": "bp_001",
    "uploaderId": "user_001",
    "fileId": "cloudbase://...",
    "thumbnailId": "cloudbase://...",
    "description": "宝宝第一次微笑",
    "auditStatus": "pending",
    "createTime": "2026-05-21T10:00:00.000Z"
  }
}
```

---

**文档版本**：v1.0  
**最后更新**：2026-05-21  
**维护者**：开发团队
