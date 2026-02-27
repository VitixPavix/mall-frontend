# Spring Boot 商城系统 API 接口文档

## 文档说明

本文档描述了 Spring Boot 商城系统的所有 REST API 接口。

### 基础信息

- 基础路径：`http://localhost:8080`
- 认证方式：JWT Token（通过 Header 的 Authorization 字段传递）
- 响应格式：JSON

### 统一响应格式

```json
{
  "code": 0,           // 0-成功, 1-失败
  "message": "操作成功",
  "data": {}           // 响应数据
}
```

### 分页响应格式

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "total": 100,      // 总记录数
    "items": [],       // 当前页数据
    "page": 1,         // 当前页码
    "size": 10,        // 每页大小
    "pages": 10        // 总页数
  }
}
```

### 角色权限说明

系统包含三种角色：
- `user`：普通用户
- `shop`：商店/商家
- `admin`：管理员（包括超级管理员）

### 公开接口说明

部分接口无需登录即可访问（公开接口），主要包括：
- 商品查询接口（GET /product）
- 分类查询接口（GET /category）
- 轮播图查询接口（GET /carousel）
- 广告查询接口（GET /ad）

这些接口允许未登录用户浏览商城的基本信息，提升用户体验。

---

## 目录

1. [用户模块](#1-用户模块)
2. [管理员模块](#2-管理员模块)
3. [商店模块](#3-商店模块)
4. [商品模块](#4-商品模块)
5. [分类模块](#5-分类模块)
6. [订单模块](#6-订单模块)
7. [购物车模块](#7-购物车模块)
8. [地址模块](#8-地址模块)
9. [轮播图模块](#9-轮播图模块)
10. [广告模块](#10-广告模块)
11. [商品收藏模块](#11-商品收藏模块)
12. [店铺收藏模块](#12-店铺收藏模块)
13. [浏览记录模块](#13-浏览记录模块)
14. [文件上传模块](#14-文件上传模块)
15. [统计模块](#15-统计模块)

---

## 1. 用户模块

### 1.1 用户注册

**接口地址**：`POST /user/register`

**权限要求**：无需登录

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "password": "string",    // 密码，必填
  "phone": "string"        // 手机号，必填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

### 1.2 用户登录

**接口地址**：`POST /user/login`

**权限要求**：无需登录

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // JWT Token
}
```

**错误响应**：
```json
{
  "code": 1,
  "message": "该账号已被禁用，请联系管理员"
}
```

**说明**：
- 登录时会检查用户状态，如果账号被禁用则无法登录
- 登录成功后返回 JWT Token，有效期为 12 小时

---

### 1.3 获取用户信息

**接口地址**：`GET /user/userInfo`

**权限要求**：user

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "user001",
    "nickname": "张三",
    "phone": "13800138000",
    "email": "user@example.com",
    "userPic": "http://...",
    "balance": 1000.00,
    "state": "正常",
    "role": "user",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

---

### 1.4 更新用户信息

**接口地址**：`PUT /user/update`

**权限要求**：user

**请求参数**：
```json
{
  "id": 1,                 // 用户ID，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string"      // 头像URL，可选
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

### 1.5 修改密码

**接口地址**：`PATCH /user/updatePwd`

**权限要求**：user

**请求参数**：
```json
{
  "oldPwd": "string",      // 原密码，必填
  "newPwd": "string",      // 新密码，必填
  "rePwd": "string"        // 确认新密码，必填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

**注意**：修改密码后会删除 Redis 中的旧 Token，需要重新登录。

---

### 1.6 用户充值

**接口地址**：`PUT /user/recharge`

**权限要求**：user

**请求参数**：
```
amount=100.00    // 充值金额，必填，范围：0.01-10000
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": 1100.00  // 充值后的余额
}
```

---

## 2. 管理员模块

### 2.1 管理员登录

**接口地址**：`POST /admin/login`

**权限要求**：无需登录

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // JWT Token
}
```

**错误响应**：
```json
{
  "code": 1,
  "message": "该管理员账号已被禁用，请联系超级管理员"
}
```

**说明**：
- 登录时会检查管理员状态，如果账号被禁用则无法登录
- 登录成功后返回 JWT Token，有效期为 12 小时

---

### 2.2 获取管理员信息

**接口地址**：`GET /admin/adminInfo`

**权限要求**：admin

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "admin",
    "nickname": "管理员",
    "phone": "13800138000",
    "email": "admin@example.com",
    "userPic": "http://...",
    "state": "正常",
    "role": "super_admin",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

---

### 2.3 更新管理员信息

**接口地址**：`PUT /admin/update`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                 // 管理员ID，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string"      // 头像URL，可选
}
```

---

### 2.4 修改管理员密码

**接口地址**：`PATCH /admin/updatePwd`

**权限要求**：admin

**请求参数**：
```json
{
  "oldPwd": "string",      // 原密码，必填
  "newPwd": "string",      // 新密码，必填
  "rePwd": "string"        // 确认新密码，必填
}
```

---

### 2.5 获取管理员列表（超级管理员）

**接口地址**：`POST /admin/adminList`

**权限要求**：super_admin

**请求参数**：
```json
{
  "username": "string",    // 用户名，模糊查询，可选
  "nickname": "string",    // 昵称，模糊查询，可选
  "phone": "string",       // 手机号，精确查询，可选
  "state": "string",       // 状态，精确查询，可选
  "page": 1,               // 页码，可选
  "size": 10               // 每页大小，可选
}
```

**响应示例**（分页）：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "total": 10,
    "items": [
      {
        "id": 2,
        "username": "admin001",
        "nickname": "管理员1",
        "phone": "13800138001",
        "email": "admin1@example.com",
        "userPic": "http://...",
        "state": "正常",
        "role": "admin",
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ],
    "page": 1,
    "size": 10,
    "pages": 1
  }
}
```

---

### 2.6 获取管理员详情（超级管理员）

**接口地址**：`GET /admin/admin/{id}`

**权限要求**：super_admin

**路径参数**：
- `id`：管理员ID

---

### 2.7 添加管理员（超级管理员）

**接口地址**：`POST /admin/addAdmin`

**权限要求**：super_admin

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string",     // 头像URL，可选
  "state": "string"        // 状态，可选
}
```

**说明**：默认密码为 `123456`

---

### 2.8 修改管理员信息（超级管理员）

**接口地址**：`PUT /admin/updateAdmin`

**权限要求**：super_admin

**请求参数**：
```json
{
  "id": 2,                 // 管理员ID，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string",     // 头像URL，可选
  "state": "string"        // 状态，可选
}
```

**说明**：不能修改超级管理员（ID=1）的信息

---

### 2.9 重置管理员密码（超级管理员）

**接口地址**：`PATCH /admin/resetAdminPassword`

**权限要求**：super_admin

**请求参数**：
```json
{
  "id": 2,                 // 管理员ID，必填
  "newPassword": "string"  // 新密码，可选，不填则重置为123456
}
```

---

### 2.10 删除管理员（超级管理员）

**接口地址**：`DELETE /admin/deleteAdmin`

**权限要求**：super_admin

**请求参数**：
```json
{
  "ids": [2, 3, 4]         // 管理员ID列表，必填，支持单个或批量
}
```

**说明**：
- 不能删除超级管理员（ID=1）
- 不能删除自己
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

### 2.11 获取用户列表

**接口地址**：`POST /admin/userList`

**权限要求**：admin

**请求参数**：
```json
{
  "username": "string",    // 用户名，模糊查询，可选
  "nickname": "string",    // 昵称，模糊查询，可选
  "phone": "string",       // 手机号，精确查询，可选
  "state": "string",       // 状态，精确查询，可选
  "page": 1,               // 页码，可选
  "size": 10               // 每页大小，可选
}
```

---

### 2.12 添加用户

**接口地址**：`POST /admin/addUser`

**权限要求**：admin

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string",     // 头像URL，可选
  "balance": 0.00          // 余额，可选
}
```

**说明**：默认密码为 `123456`

---

### 2.13 修改用户信息

**接口地址**：`PUT /admin/updateUser`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                 // 用户ID，必填
  "nickname": "string",    // 昵称，可选
  "phone": "string",       // 手机号，可选
  "email": "string",       // 邮箱，可选
  "userPic": "string",     // 头像URL，可选
  "balance": 0.00,         // 余额，可选
  "state": "string"        // 状态，可选
}
```

---

### 2.14 重置用户密码

**接口地址**：`PATCH /admin/resetUserPassword`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                 // 用户ID，必填
  "newPassword": "string"  // 新密码，可选，不填则重置为123456
}
```

---

### 2.15 删除用户

**接口地址**：`DELETE /admin/deleteUser`

**权限要求**：admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 用户ID列表，必填，支持单个或批量
}
```

**说明**：支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

### 2.16 获取商店列表

**接口地址**：`POST /admin/shopList`

**权限要求**：admin

**请求参数**：
```json
{
  "username": "string",    // 用户名，模糊查询，可选
  "shopname": "string",    // 店铺名称，模糊查询，可选
  "phone": "string",       // 手机号，精确查询，可选
  "state": "string",       // 状态，精确查询，可选
  "page": 1,               // 页码，可选
  "size": 10               // 每页大小，可选
}
```

---

### 2.17 添加商店

**接口地址**：`POST /admin/addShop`

**权限要求**：admin

**请求参数**：
```json
{
  "username": "string",         // 用户名，必填
  "shopname": "string",         // 店铺名称，必填
  "phone": "string",            // 手机号，可选
  "email": "string",            // 邮箱，可选
  "userPic": "string",          // 头像URL，可选
  "qualificationPic": "string"  // 资质图片URL，可选
}
```

**说明**：默认密码为 `123456`

---

### 2.18 修改商店信息

**接口地址**：`PUT /admin/updateShop`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                      // 商店ID，必填
  "shopname": "string",         // 店铺名称，可选
  "phone": "string",            // 手机号，可选
  "email": "string",            // 邮箱，可选
  "userPic": "string",          // 头像URL，可选
  "qualificationPic": "string", // 资质图片URL，可选
  "state": "string"             // 状态，可选
}
```

---

### 2.19 重置商店密码

**接口地址**：`PATCH /admin/resetShopPassword`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                 // 商店ID，必填
  "newPassword": "string"  // 新密码，可选，不填则重置为123456
}
```

---

### 2.20 删除商店

**接口地址**：`DELETE /admin/deleteShop`

**权限要求**：admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 商店ID列表，必填，支持单个或批量
}
```

**说明**：支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 3. 商店模块

### 3.1 商店注册

**接口地址**：`POST /shop/register`

**权限要求**：无需登录

**请求参数**：
```json
{
  "username": "string",         // 用户名，必填
  "password": "string",         // 密码，必填
  "shopname": "string",         // 店铺名称，必填
  "phone": "string",            // 手机号，必填
  "qualificationPic": "string"  // 资质图片URL，必填
}
```

---

### 3.2 商店登录

**接口地址**：`POST /shop/login`

**权限要求**：无需登录

**请求参数**：
```json
{
  "username": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // JWT Token
}
```

**错误响应**：
```json
{
  "code": 1,
  "message": "该店铺已被禁用，请联系管理员"
}
```

**说明**：
- 登录时会检查店铺状态，如果账号被禁用则无法登录
- 登录成功后返回 JWT Token，有效期为 12 小时

---

### 3.3 获取商店信息

**接口地址**：`GET /shop/shopInfo`

**权限要求**：shop

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "shop001",
    "shopName": "张三的店铺",
    "phone": "13800138000",
    "email": "shop@example.com",
    "userPic": "http://...",
    "qualificationPic": "http://...",
    "state": "正常",
    "role": "shop",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

---

### 3.4 更新商店信息

**接口地址**：`PUT /shop/update`

**权限要求**：shop

**请求参数**：
```json
{
  "id": 1,                      // 商店ID，必填
  "shopname": "string",         // 店铺名称，可选
  "phone": "string",            // 手机号，可选
  "email": "string",            // 邮箱，可选
  "userPic": "string",          // 头像URL，可选
  "qualificationPic": "string"  // 资质图片URL，可选
}
```

---

### 3.5 修改商店密码

**接口地址**：`PATCH /shop/updatePwd`

**权限要求**：shop

**请求参数**：
```json
{
  "oldPwd": "string",      // 原密码，必填
  "newPwd": "string",      // 新密码，必填
  "rePwd": "string"        // 确认新密码，必填
}
```

---

### 3.6 根据ID获取店铺信息

**接口地址**：`GET /shop/{shopId}`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `shopId`：店铺ID

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "shop001",
    "shopName": "张三的店铺",
    "phone": "13800138000",
    "email": "shop@example.com",
    "userPic": "http://...",
    "qualificationPic": "http://...",
    "fansNum": 100,
    "state": "正常",
    "role": "shop",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

**说明**：
- 此接口用于店铺详情页面展示
- 无需登录即可访问
- 密码字段不会返回

---

## 4. 商品模块

### 4.1 查询商品列表

**接口地址**：`GET /product`

**权限要求**：无需登录（公开接口）

**请求参数**（Query String）：
```
categoryId=1           // 分类ID，可选
name=苹果              // 商品名称，模糊查询，可选
createUserId=1         // 创建人ID，可选
type=hot               // 特殊类型：hot(热销)、new(新品)，可选
limit=10               // 特殊类型查询的数量限制，可选
page=1                 // 页码，可选
size=10                // 每页大小，可选
```

**响应示例**（分页）：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "total": 100,
    "items": [
      {
        "id": 1,
        "name": "新鲜苹果",
        "coverImg": "http://...",
        "price": 10.50,
        "stock": 100,
        "sales": 50,
        "detailImg": "[\"http://...\", \"http://...\"]",
        "detailHtml": "<p>商品详情</p>",
        "categoryId": 1,
        "categoryName": "水果",
        "state": "上架",
        "createUserId": 1,
        "createUserName": "shop001",
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ],
    "page": 1,
    "size": 10,
    "pages": 10
  }
}
```

**支持的查询组合**：
1. 基础查询：`GET /product?page=1&size=10`
2. 分类查询：`GET /product?categoryId=1`
3. 名称搜索：`GET /product?name=苹果`
4. 创建人查询：`GET /product?createUserId=1`
5. 分类+名称：`GET /product?categoryId=1&name=苹果`
6. 热销商品：`GET /product?type=hot&limit=10`
7. 新品：`GET /product?type=new&limit=10`

---

### 4.2 查询商品详情

**接口地址**：`GET /product/{id}`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `id`：商品ID

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "新鲜苹果",
    "coverImg": "http://...",
    "price": 10.50,
    "stock": 100,
    "sales": 50,
    "detailImg": "[\"http://...\", \"http://...\"]",
    "detailHtml": "<p>商品详情</p>",
    "categoryId": 1,
    "categoryName": "水果",
    "state": "上架",
    "createUserId": 1,
    "createUserName": "shop001",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

---

### 4.3 添加商品

**接口地址**：`POST /product`

**权限要求**：admin、shop

**请求参数**：
```json
{
  "name": "string",            // 商品名称，必填
  "coverImg": "string",        // 封面图片URL，必填
  "price": 10.50,              // 价格，必填
  "stock": 100,                // 库存，必填
  "sales": 0,                  // 销量，可选
  "detailImg": ["url1", "url2"], // 详细图片列表，可选
  "detailHtml": "string",      // 富文本详情，可选
  "categoryId": 1,             // 分类ID，必填
  "state": "上架",             // 状态，可选
  "createUserId": 1            // 创建人ID，管理员必填，商店自动使用当前用户
}
```

**说明**：
- 商店身份：自动使用当前登录用户ID作为创建人
- 管理员身份：必须手动指定 `createUserId`

---

### 4.4 更新商品

**接口地址**：`PUT /product`

**权限要求**：admin、shop（商店只能修改自己创建的商品）

**请求参数**：
```json
{
  "id": 1,                     // 商品ID，必填
  "name": "string",            // 商品名称，可选
  "coverImg": "string",        // 封面图片URL，可选
  "price": 10.50,              // 价格，可选
  "stock": 100,                // 库存，可选
  "sales": 50,                 // 销量，可选
  "detailImg": ["url1", "url2"], // 详细图片列表，可选
  "detailHtml": "string",      // 富文本详情，可选
  "categoryId": 1,             // 分类ID，可选
  "state": "上架"              // 状态，可选
}
```

---

### 4.5 删除商品

**接口地址**：`DELETE /product`

**权限要求**：admin、shop（商店只能删除自己创建的商品）

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 商品ID列表，必填，支持单个或批量
}
```

**说明**：支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

### 4.6 获取商品评论

**接口地址**：`GET /product/{id}/reviews`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `id`：商品ID

**请求参数**（Query String）：
```
page=1                 // 页码，可选，默认1
size=10                // 每页大小，可选，默认10
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "total": 50,
    "items": [
      {
        "id": 1,
        "orderNo": "202401010001",
        "productId": 1,
        "productName": "新鲜苹果",
        "productCoverImg": "http://...",
        "num": 2,
        "unitPrice": 10.50,
        "reviewStar": 5,
        "review": "非常好吃，很新鲜！",
        "reviewTime": "2024-01-05 10:00:00",
        "createUserName": "user001",
        "createUserPic": "http://..."
      }
    ],
    "page": 1,
    "size": 10,
    "pages": 5
  }
}
```

**说明**：
- 只返回已评价的订单明细（reviewStar不为空）
- 按评价时间倒序排列
- 包含评论者的用户名和头像信息

---

## 5. 分类模块

### 5.1 查询分类列表

**接口地址**：`GET /category`

**权限要求**：无需登录（公开接口）

**请求参数**（Query String）：
```
categoryName=水果      // 分类名称，模糊查询，可选
page=1                 // 页码，可选
size=10                // 每页大小，可选
```

**响应示例**（非分页）：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "categoryName": "水果",
      "categoryNote": "新鲜水果",
      "createTime": "2024-01-01 10:00:00",
      "updateTime": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### 5.2 查询分类详情

**接口地址**：`GET /category/{id}`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `id`：分类ID

---

### 5.3 添加分类

**接口地址**：`POST /category`

**权限要求**：admin

**请求参数**：
```json
{
  "categoryName": "string",    // 分类名称，必填，唯一
  "categoryNote": "string"     // 分类备注，可选
}
```

---

### 5.4 更新分类

**接口地址**：`PUT /category/{id}`

**权限要求**：admin

**路径参数**：
- `id`：分类ID

**请求参数**：
```json
{
  "categoryName": "string",    // 分类名称，必填，唯一
  "categoryNote": "string"     // 分类备注，可选
}
```

---

### 5.5 删除分类（单个）

**接口地址**：`DELETE /category/{id}`

**权限要求**：admin

**路径参数**：
- `id`：分类ID

**说明**：如果分类下有商品，删除会失败

---

### 5.6 批量删除分类

**接口地址**：`DELETE /category`

**权限要求**：admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 分类ID列表，必填
}
```

---

## 6. 订单模块

### 6.1 创建订单（从购物车）

**接口地址**：`POST /order/cart`

**权限要求**：user

**请求参数**：
```json
{
  "cartIds": [1, 2, 3],        // 购物车ID列表，必填
  "addressId": 1,              // 收货地址ID，必填
  "remark": "string",           // 订单备注，可选
  "payMethod" : "余额"			//选填
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "orderNos": ["202401010001", "202401010002"],
    "count": 2,
    "message": "订单创建成功，共生成2个订单"
  }
}
```

**说明**：系统会按店铺自动拆分订单

---

### 6.2 创建订单（立即购买）

**接口地址**：`POST /order/direct`

**权限要求**：user

**请求参数**：
```json
{
  "items": [
    {
      "productId": 1,          // 商品ID，必填
      "num": 2                 // 购买数量，必填
    }
  ],
  "addressId": 1,              // 收货地址ID，必填
  "remark": "string"           // 订单备注，可选
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "orderNos": ["202401010003"],
    "count": 1,
    "message": "订单创建成功，共生成1个订单"
  }
}
```

---

### 6.3 支付订单

**接口地址**：`PUT /order/pay`

**权限要求**：user

**请求参数**：
```json
{
  "orderNo": "202401010001",   // 订单号，必填
  "payMethod": "余额支付"      // 支付方式，必填
}
```

**说明**：
- 验证用户余额是否充足
- 扣除用户余额
- 订单状态从"待支付"变为"待发货"

---

### 6.4 取消订单

**接口地址**：`PUT /order/cancel/{orderNo}`

**权限要求**：user

**路径参数**：
- `orderNo`：订单号

**说明**：
- 只能取消"待支付"或"待发货"状态的订单
- 如果已支付，会退款到用户余额

---

### 6.5 发货

**接口地址**：`PUT /order/ship`

**权限要求**：shop

**请求参数**：
```json
{
  "orderNo": "202401010001",       // 订单号，必填
  "trackingNumber": "SF123456",    // 物流单号，必填
  "logisticsCompany": "顺丰速运"   // 物流公司，必填
}
```

**说明**：
- 只能发货"待发货"状态的订单
- 订单状态变为"已发货"

---

### 6.6 确认收货

**接口地址**：`PUT /order/receive/{orderNo}`

**权限要求**：user

**路径参数**：
- `orderNo`：订单号

**说明**：
- 只能确认"已发货"状态的订单
- 订单状态变为"已签收"

---

### 6.7 评价订单明细

**接口地址**：`PUT /order/review`

**权限要求**：user

**请求参数**：
```json
{
  "orderItemId": 1,            // 订单明细ID，必填
  "rating": 5,                 // 评分，1-5，必填
  "comment": "string"          // 评价内容，可选
}
```

**说明**：
- 只能评价"已签收"状态的订单
- 所有订单明细都评价后，订单状态变为"已完成"

---

### 6.8 查询订单详情

**接口地址**：`GET /order/{orderNo}`

**权限要求**：user、shop、admin

**路径参数**：
- `orderNo`：订单号

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "orderNo": "202401010001",
    "totalAmount": 100.00,
    "payMethod": "余额支付",
    "state": "待发货",
    "remark": "尽快发货",
    "trackingNumber": null,
    "logisticsCompany": null,
    "recipient": "张三",
    "phone": "13800138000",
    "address": "北京市朝阳区...",
    "createUserId": 1,
    "createUserName": "user001",
    "shopId": 2,
    "shopName": "张三的店铺",
    "orderItems": [
      {
        "id": 1,
        "productId": 1,
        "productName": "新鲜苹果",
        "productImg": "http://...",
        "price": 10.50,
        "num": 2,
        "subtotal": 21.00,
        "rating": null,
        "comment": null
      }
    ],
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

**权限说明**：
- 用户只能查看自己的订单
- 商店只能查看自己店铺的订单
- 管理员可以查看所有订单

---

### 6.9 查询订单列表

**接口地址**：`GET /order`

**权限要求**：user、shop、admin

**请求参数**（Query String）：
```
orderNo=202401010001       // 订单号，精确查询，可选
state=待发货               // 订单状态，精确查询，可选
createUserName=user001     // 创建用户名，模糊查询，管理员可用，可选
shopName=张三的店铺        // 店铺名称，模糊查询，管理员可用，可选
recipient=张三             // 收货人，模糊查询，可选
phone=138                  // 收货人电话，模糊查询，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**权限说明**：
- 用户只能查询自己的订单
- 商店只能查询自己店铺的订单
- 管理员可以查询所有订单

**订单状态**：
- 待支付
- 待发货
- 已发货
- 已签收
- 已完成
- 已取消

---

### 6.10 删除订单

**接口地址**：`DELETE /order`

**权限要求**：admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 订单ID列表，必填，支持单个或批量
}
```

**说明**：
- 使用订单的数字 ID 进行删除
- 删除订单会同时删除订单明细（通过外键级联删除）
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 7. 购物车模块

### 7.1 添加购物车

**接口地址**：`POST /cart`

**权限要求**：user

**请求参数**：
```json
{
  "productId": 1,              // 商品ID，必填
  "num": 2                     // 数量，必填
}
```

---

### 7.2 更新购物车数量

**接口地址**：`PUT /cart`

**权限要求**：user

**请求参数**：
```json
{
  "id": 1,                     // 购物车ID，必填
  "num": 3                     // 新数量，必填
}
```

---

### 7.3 查询购物车列表

**接口地址**：`GET /cart`

**权限要求**：user、admin

**请求参数**（Query String）：
```
shopUserName=shop001       // 店铺用户名，模糊查询，可选
createUserName=user001     // 创建用户名，模糊查询，管理员可用，可选
productName=苹果           // 商品名称，模糊查询，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "total": 5,
    "items": [
      {
        "id": 1,
        "num": 2,
        "productId": 1,
        "createUserId": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00",
        "shopUserName": "shop001",
        "createUserName": "user001",
        "productPrice": 10.50,
        "coverImg": "http://...",
        "productName": "新鲜苹果"
      }
    ],
    "page": 1,
    "size": 10,
    "pages": 1
  }
}
```

**权限说明**：
- 用户只能查询自己的购物车
- 管理员可以查询所有购物车

---

### 7.4 删除购物车

**接口地址**：`DELETE /cart`

**权限要求**：user、admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 购物车ID列表，必填，支持单个或批量
}
```

**权限说明**：
- 用户只能删除自己的购物车
- 管理员可以删除任何购物车
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 8. 地址模块

### 8.1 添加地址

**接口地址**：`POST /address`

**权限要求**：user

**请求参数**：
```json
{
  "name": "string",            // 收货人姓名，必填
  "phone": "string",           // 联系电话，必填
  "province": "string",        // 省份，必填
  "city": "string",            // 城市，必填
  "district": "string",        // 区县，必填
  "address": "string",         // 详细地址，必填
  "isDefault": 0               // 是否默认地址，0-否，1-是，可选
}
```

---

### 8.2 更新地址

**接口地址**：`PUT /address`

**权限要求**：user

**请求参数**：
```json
{
  "id": 1,                     // 地址ID，必填
  "name": "string",            // 收货人姓名，可选
  "phone": "string",           // 联系电话，可选
  "province": "string",        // 省份，可选
  "city": "string",            // 城市，可选
  "district": "string",        // 区县，可选
  "address": "string",         // 详细地址，可选
  "isDefault": 0               // 是否默认地址，可选
}
```

---

### 8.3 查询地址列表

**接口地址**：`GET /address`

**权限要求**：user、admin

**请求参数**（Query String）：
```
name=张三                  // 收货人姓名，模糊查询，可选
phone=138                  // 联系电话，模糊查询，可选
address=朝阳区             // 详细地址，模糊查询，可选
userName=user001           // 用户名，模糊查询，管理员可用，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "address": "某某街道123号",
      "isDefault": 1,
      "createUserId": 1,
      "createUserName": "user001",
      "createTime": "2024-01-01 10:00:00",
      "updateTime": "2024-01-01 10:00:00"
    }
  ]
}
```

**权限说明**：
- 用户只能查询自己的地址
- 管理员可以查询所有地址

---

### 8.4 删除地址

**接口地址**：`DELETE /address`

**权限要求**：user、admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 地址ID列表，必填，支持单个或批量
}
```

**权限说明**：
- 用户只能删除自己的地址
- 管理员可以删除任何地址
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 9. 轮播图模块

### 9.1 添加轮播图

**接口地址**：`POST /carousel`

**权限要求**：admin

**请求参数**：
```json
{
  "title": "string",           // 轮播图标题，必填
  "coverImg": "string",        // 图片URL，必填
  "link": "string",            // 跳转链接，可选
  "sort": 1                    // 排序，可选
}
```

---

### 9.2 更新轮播图

**接口地址**：`PUT /carousel`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                     // 轮播图ID，必填
  "title": "string",           // 轮播图标题，可选
  "coverImg": "string",        // 图片URL，可选
  "link": "string",            // 跳转链接，可选
  "sort": 1                    // 排序，可选
}
```

---

### 9.3 查询轮播图列表

**接口地址**：`GET /carousel`

**权限要求**：无需登录（公开接口）

**请求参数**（Query String）：
```
title=春节活动             // 轮播图标题，模糊查询，可选
id=1                       // 轮播图ID，精确查询，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "title": "春节大促销",
      "coverImg": "http://...",
      "link": "http://...",
      "sort": 1,
      "createTime": "2024-01-01 10:00:00",
      "updateTime": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### 9.4 查询轮播图详情

**接口地址**：`GET /carousel/{id}`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `id`：轮播图ID

---

### 9.5 删除轮播图

**接口地址**：`DELETE /carousel`

**权限要求**：admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 轮播图ID列表，必填，支持单个或批量
}
```

**说明**：支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 10. 广告模块

### 10.1 更新广告

**接口地址**：`PUT /ad`

**权限要求**：admin

**请求参数**：
```json
{
  "id": 1,                     // 广告ID，必填
  "title": "string",           // 广告标题，必填
  "coverImg": "string",        // 图片URL，必填
  "link": "string"             // 跳转链接，必填
}
```

**说明**：
- 广告模块没有新增和删除接口，只能修改现有广告
- position 字段为只读字段，不能通过接口修改

---

### 10.2 查询广告列表

**接口地址**：`GET /ad`

**权限要求**：无需登录（公开接口）

**请求参数**（Query String）：
```
title=新年活动             // 广告标题，模糊查询，可选
id=1                       // 广告ID，精确查询，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "position": "首页顶部",
      "title": "新年大促",
      "coverImg": "http://...",
      "link": "http://...",
      "createTime": "2024-01-01 10:00:00",
      "updateTime": "2024-01-01 10:00:00"
    }
  ]
}
```

**字段说明**：
- `position`：广告位置，用于标识广告展示的位置（如：首页顶部、首页中部、侧边栏等）

---

### 10.3 查询广告详情

**接口地址**：`GET /ad/{id}`

**权限要求**：无需登录（公开接口）

**路径参数**：
- `id`：广告ID

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 1,
    "position": "首页顶部",
    "title": "新年大促",
    "coverImg": "http://...",
    "link": "http://...",
    "createTime": "2024-01-01 10:00:00",
    "updateTime": "2024-01-01 10:00:00"
  }
}
```

---

## 11. 商品收藏模块

### 11.1 添加收藏

**接口地址**：`POST /productCollection`

**权限要求**：user

**请求参数**：
```json
{
  "productId": 1               // 商品ID，必填
}
```

---

### 11.2 查询收藏列表

**接口地址**：`GET /productCollection`

**权限要求**：user、admin

**请求参数**（Query String）：
```
productName=苹果           // 商品名称，模糊查询，可选
userName=user001           // 用户名，模糊查询，管理员可用，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      	"id": 19,
        "shopId": 3,
        "createUserId": 3,
        "createTime": "2026-01-07 19:26:28",
        "updateTime": "2026-01-07 19:26:28",
        "shopName": "shop1",
        "createUserName": "user1",
        "shopUserPic": "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/c832d482-c003-49ac-975a-73e6cd44988c.jpeg",
        "fansNum": 1,
        "productCount": 32
    }
  ]
}
```

**权限说明**：
- 用户只能查询自己的收藏
- 管理员可以查询所有收藏

---

### 11.3 删除收藏

**接口地址**：`DELETE /productCollection`

**权限要求**：user、admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 收藏记录ID列表，必填，支持单个或批量
}
```

**权限说明**：
- 用户只能删除自己的收藏
- 管理员可以删除任何收藏
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 12. 店铺收藏模块

### 12.1 添加收藏

**接口地址**：`POST /shopCollection`

**权限要求**：user

**请求参数**：
```json
{
  "shopId": 1                  // 店铺ID，必填
}
```

**说明**：
- 添加收藏成功后，店铺的粉丝数（fansNum）会自动加1
- 如果已经收藏过该店铺，会返回错误提示

---

### 12.2 查询收藏列表

**接口地址**：`GET /shopCollection`

**权限要求**：user、admin

**请求参数**（Query String）：
```
shopName=张三的店铺        // 店铺名称，模糊查询，可选
createUserName=user001     // 用户名，模糊查询，管理员可用，可选
shopId=1                   // 店铺ID，精确查询，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "shopId": 1,
      "shopName": "张三的店铺",
      "shopUserPic": "http://...",
      "createUserId": 1,
      "createUserName": "user001",
      "createTime": "2024-01-01 10:00:00",
      "updateTime": "2024-01-01 10:00:00"
    }
  ]
}
```

**权限说明**：
- 用户只能查询自己的收藏
- 管理员可以查询所有收藏

---

### 12.3 删除收藏

**接口地址**：`DELETE /shopCollection`

**权限要求**：user、admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 收藏记录ID列表，必填，支持单个或批量
}
```

**说明**：
- 删除收藏成功后，店铺的粉丝数（fansNum）会自动减1
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

**权限说明**：
- 用户只能删除自己的收藏
- 管理员可以删除任何收藏

---

## 13. 浏览记录模块

### 13.1 添加浏览记录

**接口地址**：`POST /browsingRecord`

**权限要求**：user

**请求参数**：
```json
{
  "productId": 1               // 商品ID，必填
}
```

**说明**：用户浏览商品时自动记录

---

### 13.2 查询浏览记录列表

**接口地址**：`GET /browsingRecord`

**权限要求**：user、admin

**请求参数**（Query String）：
```
productName=苹果           // 商品名称，模糊查询，可选
userName=user001           // 用户名，模糊查询，管理员可用，可选
page=1                     // 页码，可选
size=10                    // 每页大小，可选
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "productName": "新鲜苹果",
      "productImg": "http://...",
      "price": 10.50,
      "createUserId": 1,
      "createUserName": "user001",
      "createTime": "2024-01-01 10:00:00"
    }
  ]
}
```

**权限说明**：
- 用户只能查询自己的浏览记录
- 管理员可以查询所有浏览记录

---

### 13.3 删除浏览记录

**接口地址**：`DELETE /browsingRecord`

**权限要求**：user、admin

**请求参数**：
```json
{
  "ids": [1, 2, 3]         // 浏览记录ID列表，必填，支持单个或批量
}
```

**权限说明**：
- 用户只能删除自己的浏览记录
- 管理员可以删除任何浏览记录
- 支持单个删除（传入一个ID）或批量删除（传入多个ID）

---

## 14. 文件上传模块

### 14.1 上传文件

**接口地址**：`POST /upload`

**权限要求**：所有登录用户

**请求类型**：`multipart/form-data`

**请求参数**：
```
file: 文件对象（必填）
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "https://your-oss-bucket.oss-cn-beijing.aliyuncs.com/uuid-filename.jpg"
}
```

**说明**：
- 文件会上传到阿里云 OSS
- 文件名会自动添加 UUID 前缀，防止重名
- 返回的 URL 可以直接用于其他接口的图片字段

---

## 附录

### A. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 操作成功 |
| 1 | 操作失败 |

### B. 订单状态流转图

```
待支付 → 待发货 → 已发货 → 已签收 → 已完成
  ↓        ↓
已取消   已取消
```

**状态说明**：
- **待支付**：订单已创建，等待用户支付
- **待发货**：用户已支付，等待商家发货
- **已发货**：商家已发货，等待用户确认收货
- **已签收**：用户已确认收货，可以进行评价
- **已完成**：用户已评价，订单完成
- **已取消**：订单已取消（可以在待支付或待发货状态下取消）

### C. 用户角色权限矩阵

| 模块 | user | shop | admin | super_admin |
|------|------|------|-------|-------------|
| 用户管理 | 自己 | - | 全部 | 全部 |
| 管理员管理 | - | - | - | 全部 |
| 商店管理 | - | 自己 | 全部 | 全部 |
| 商品管理 | 查看 | 自己的商品 | 全部 | 全部 |
| 分类管理 | 查看 | 查看 | 全部 | 全部 |
| 订单管理 | 自己的订单 | 自己店铺的订单 | 全部 | 全部 |
| 购物车 | 自己 | - | 全部 | 全部 |
| 地址管理 | 自己 | - | 全部 | 全部 |
| 轮播图 | 查看 | 查看 | 全部 | 全部 |
| 广告 | 查看 | 查看 | 修改 | 修改 |
| 商品收藏 | 自己 | - | 全部 | 全部 |
| 店铺收藏 | 自己 | - | 全部 | 全部 |
| 浏览记录 | 自己 | - | 全部 | 全部 |

### D. 常见问题

**Q1: Token 如何传递？**

A: 在请求头中添加 `Authorization: Bearer <token>`

**Q2: 分页参数如何使用？**

A: 在查询接口中添加 `page` 和 `size` 参数即可启用分页。如果不传这两个参数，则返回所有数据（不分页）。

**Q3: 如何进行模糊查询？**

A: 在查询接口中传递相应的字段即可，系统会自动进行模糊匹配。例如：`GET /product?name=苹果`

**Q4: 批量删除和单个删除有什么区别？**

A: 批量删除使用 `DELETE` 方法，请求体包含 ID 列表；单个删除使用 `DELETE /{id}` 路径参数。

**Q5: 商店和管理员有什么区别？**

A: 
- 商店（shop）：可以管理自己的商品，查看自己店铺的订单
- 管理员（admin）：可以管理所有用户、商店、商品、订单等
- 超级管理员（super_admin）：可以管理其他管理员

---

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本
- 完成所有基础功能模块

---

**文档生成时间**：2024-01-01

**文档版本**：v1.0.0

**联系方式**：如有疑问，请联系开发团队

---

## OSS图片管理接口

### 功能说明

OSS图片自动清理功能，用于清理阿里云OSS中的孤儿图片（数据库中已删除但OSS中仍存在的图片）。

**工作原理：**
1. 定时任务每天凌晨3点自动执行
2. 扫描数据库所有表的图片字段
3. 对比OSS中的文件列表
4. 删除不在数据库中的孤儿图片

**扫描范围：**
- product表：cover_img, detail_img(JSON), detail_html(HTML)
- shop表：user_pic, qualification_pic
- carousel表：cover_img
- ad表：cover_img
- user表：user_pic
- admin表：user_pic

### 1. 测试OSS连接

**接口地址：** `GET /admin/oss/test-connection`

**权限要求：** 超级管理员

**请求示例：**
```http
GET /admin/oss/test-connection
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "success": true,
    "endpoint": "https://oss-cn-shenzhen.aliyuncs.com",
    "bucketName": "zhy-web",
    "region": "cn-shenzhen",
    "clientCreated": true,
    "createClientTime": "236ms",
    "bucketExists": true,
    "checkBucketTime": "357ms",
    "sampleFileCount": 100,
    "listFilesTime": "73ms",
    "isTruncated": true,
    "sampleFiles": [
      "001.png",
      "image1.jpeg",
      "image2.jpeg"
    ],
    "message": "OSS连接测试成功"
  }
}
```

### 2. 手动触发清理任务

**接口地址：** `POST /admin/oss/cleanup`

**权限要求：** 超级管理员

**请求示例：**
```http
POST /admin/oss/cleanup
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "清理任务执行完成，请查看日志了解详情"
}
```

**后端日志示例：**
```
========== 开始执行OSS孤儿图片清理任务 ==========
步骤1: 扫描数据库中所有图片URL...
商品表: 150 个图片
店铺表: 累计 180 个图片
轮播图表: 累计 185 个图片
广告表: 累计 189 个图片
用户表: 累计 195 个图片
管理员表: 累计 198 个图片
数据库中共有 198 个图片URL

步骤2: 扫描OSS中所有图片...
正在获取第 1 页...
本页获取到 100 个文件
正在获取第 2 页...
本页获取到 50 个文件
OSS文件列表获取完成，共 250 个文件

步骤3: 对比查找孤儿图片...
发现 52 个孤儿图片

步骤4: 开始删除孤儿图片...
✓ 删除成功: image1.jpg
✓ 删除成功: image2.jpg
...

========== 清理任务完成 ==========
成功删除: 52 个
删除失败: 0 个
预计节省空间: 约 26 MB
```

### 3. 查看数据库中的图片

**接口地址：** `GET /admin/oss/db-images`

**权限要求：** 超级管理员

**请求示例：**
```http
GET /admin/oss/db-images
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/image1.jpg",
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/image2.jpg",
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/image3.jpg"
  ]
}
```

### 4. 查看OSS中的图片

**接口地址：** `GET /admin/oss/oss-images`

**权限要求：** 超级管理员

**请求示例：**
```http
GET /admin/oss/oss-images
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/file1.jpg",
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/file2.jpg",
    "https://zhy-web.oss-cn-shenzhen.aliyuncs.com/file3.jpg"
  ]
}
```

**注意：** 如果OSS中文件很多，此接口可能需要10-60秒返回。

### 5. 立即删除指定图片

**接口地址：** `DELETE /admin/oss/delete-now`

**权限要求：** 超级管理员

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| imageUrl | String | 是 | 要删除的图片URL |

**请求示例：**
```http
DELETE /admin/oss/delete-now?imageUrl=https://zhy-web.oss-cn-shenzhen.aliyuncs.com/test.jpg
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 0,
  "message": "操作成功",
  "data": "图片删除成功"
}
```

### 定时任务配置

**执行时间：** 每天凌晨3点自动执行

**修改方法：** 编辑 `src/main/java/org/springboot/mall/task/OssCleanupTask.java`

```java
// 每天凌晨3点（默认）
@Scheduled(cron = "0 0 3 * * ?")

// 每天中午12点
@Scheduled(cron = "0 0 12 * * ?")

// 每周日凌晨2点
@Scheduled(cron = "0 0 2 ? * SUN")
```

### 使用建议

1. **首次使用前**：先调用测试接口确认OSS连接正常
2. **查看效果**：调用 `/admin/oss/db-images` 和 `/admin/oss/oss-images` 对比
3. **手动清理**：首次可手动触发清理，查看日志确认效果
4. **日常使用**：之后无需操作，定时任务会自动清理

### 注意事项

- 清理任务会删除OSS中不在数据库的文件，请确保数据库数据准确
- 建议首次运行前备份重要的OSS数据
- 定时任务执行时会在日志中输出详细信息
- 删除操作不可恢复，请谨慎使用立即删除接口

---

## 15. 统计模块

### 15.1 管理员概览数据

**接口地址**：`GET /admin/statistics/overview`

**权限要求**：admin

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "totalUsers": 1250,
    "totalShops": 85,
    "totalOrders": 3420,
    "totalSales": 125680.50
  }
}
```

**字段说明**：
- `totalUsers`：总用户数（role = 'user'）
- `totalShops`：总店铺数
- `totalOrders`：总订单数
- `totalSales`：总销售额（排除已取消订单）

---

### 15.2 订单状态分布

**接口地址**：`GET /admin/statistics/order-status`

**权限要求**：admin

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    { "name": "待支付", "value": 120 },
    { "name": "待发货", "value": 85 },
    { "name": "待收货", "value": 200 },
    { "name": "已完成", "value": 350 },
    { "name": "已取消", "value": 20 }
  ]
}
```

**字段说明**：
- `name`：订单状态名称
- `value`：该状态的订单数量
- 结果按订单数量降序排列

---

### 15.3 店铺概览数据

**接口地址**：`GET /shop/statistics/overview`

**权限要求**：shop

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "totalProducts": 45,
    "todayOrders": 12,
    "monthSales": 18900.00,
    "shopFavorites": 230
  }
}
```

**字段说明**：
- `totalProducts`：商品总数
- `todayOrders`：今日订单数
- `monthSales`：本月销售额（排除已取消订单）
- `shopFavorites`：店铺收藏数

**权限说明**：
- 自动从 token 中获取当前登录的 shopId
- 只能查询自己店铺的数据

---

### 15.4 商品销售排行

**接口地址**：`GET /shop/statistics/product-rank`

**权限要求**：shop

**请求头**：
```
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    { "name": "有机苹果", "value": 85 },
    { "name": "新鲜蔬菜", "value": 72 },
    { "name": "土鸡蛋", "value": 65 },
    { "name": "草莓", "value": 58 },
    { "name": "蜂蜜", "value": 45 }
  ]
}
```

**字段说明**：
- `name`：商品名称
- `value`：销售数量（所有订单中该商品的总销量，排除已取消订单）
- 返回前5名销售商品
- 结果按销售数量降序排列

**权限说明**：
- 自动从 token 中获取当前登录的 shopId
- 只能查询自己店铺的商品

---

### 统计模块说明

**性能优化建议**：

1. **数据库索引**：
```sql
CREATE INDEX idx_order_state ON `order`(state);
CREATE INDEX idx_order_shop_id ON `order`(shop_id);
CREATE INDEX idx_order_create_time ON `order`(create_time);
CREATE INDEX idx_product_create_user_id ON product(create_user_id);
```

2. **缓存策略**：
- 建议使用 Redis 缓存统计数据
- 缓存过期时间：5-10分钟
- 在订单状态变更时清除相关缓存

3. **数据准确性**：
- 所有金额字段使用 `BigDecimal` 类型
- 使用 `COALESCE()` 处理 NULL 值，确保返回 0 而不是 NULL
- 统计销售额时排除"已取消"状态的订单

---

---


## 16. AI 聊天模块

### 概述

系统提供两套 AI 接口，基于 **Spring AI** 框架实现：

| 接口类型 | 路径前缀 | 定位 | 特点 | 适用场景 |
|---------|---------|------|------|---------|
| **商城客服** | `/ai/*` | 助农商城智能客服 | 无状态、单轮对话 | 商品咨询、快速问答 |
| **通用对话** | `/conversation/*` | 独立通用 AI 助手 | 持久化、多轮对话 | 学习辅导、深度交流 |

**核心特性**：
- ✅ 多服务商支持：ModelScope、Moonshot AI、OpenAI、DeepSeek
- ✅ 动态切换：通过 `model` 参数切换模型
- ✅ 流式输出：支持 NDJSON 格式实时逐字返回（完美保留换行、缩进、Markdown 格式）
- ✅ 灵活配置：支持自定义模型参数（temperature、maxTokens 等）

**支持的 AI 模型**：

| 模型标识 | 服务商 | 默认模型 | 描述 |
|--------|--------|---------|------|
| `modelscope-deepseek` | ModelScope | `deepseek-ai/DeepSeek-V3.2` | 擅长代码和推理 |
| `modelscope-kimi` | ModelScope | `moonshotai/Kimi-K2.5` | 支持超长上下文 |
| `moonshot-8k` | Moonshot AI | `kimi-k2-turbo-preview` | Kimi 8K 上下文模型 |

---

### 16.1 商城 AI 客服接口（`/ai/*`）

#### 16.1.1 查询可用模型

**接口地址**：`GET /ai/models`

**权限要求**：无需登录

**响应示例**：
```json
{
    "code": 0,
    "message": "操作成功",
    "data": {
        "count": 3,
        "models": {
            "modelscope-deepseek": {
                "key": "modelscope-deepseek",
                "baseUrl": "https://api-inference.modelscope.cn/v1",
                "model": "deepseek-ai/DeepSeek-V3",
                "description": "ModelScope - DeepSeek V3 模型，擅长代码和推理"
            },
            "modelscope-kimi": {
                "key": "modelscope-kimi",
                "baseUrl": "https://api-inference.modelscope.cn/v1",
                "model": "moonshotai/Kimi-K2.5",
                "description": "ModelScope - Kimi K2.5 模型，支持超长上下文"
            },
            "moonshot-8k": {
                "key": "moonshot-8k",
                "baseUrl": "https://api.moonshot.cn/v1",
                "model": "moonshot-v1-8k",
                "description": "Moonshot AI - Kimi 8K 上下文模型"
            }
        }
    }
}
```

**响应字段说明**：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| count | Integer | 可用模型数量 |
| models | Object | 模型列表（key 为模型标识） |
| models[key].key | String | 模型标识，用于 API 调用时指定模型 |
| models[key].baseUrl | String | API 基础 URL |
| models[key].model | String | 实际的模型名称 |
| models[key].description | String | 模型描述信息 |

---

#### 16.1.2 标准聊天

**接口地址**：`POST /ai/chat`

**权限要求**：无需登录

**请求参数**：
```json
{
  "model": "modelscope-deepseek",
  "messages": [
    {
      "role": "system",
      "content": "你是助农商城的智能客服助手"
    },
    {
      "role": "user",
      "content": "你好，1+1等于多少？"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 2000,
  "topP": 0.9
}
```

**参数说明**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| model | String | 否 | 模型标识（如 modelscope-deepseek），不填则使用默认模型 |
| messages | Array | 是 | 消息列表，包含对话历史 |
| messages[].role | String | 是 | 角色：system/user/assistant |
| messages[].content | String | 是 | 消息内容 |
| temperature | Double | 否 | 温度参数（0.0-2.0），会覆盖配置文件中的默认值 |
| maxTokens | Integer | 否 | 最大生成 token 数，会覆盖配置文件中的默认值 |
| topP | Double | 否 | Top-p 采样参数（0.0-1.0），会覆盖配置文件中的默认值 |

**响应示例**：
```json
{
  "code": 0,
  "data": {
    "choices": [{
      "message": {
        "role": "assistant",
        "content": "你好！1+1等于2。"
      },
      "finishReason": "stop"
    }],
    "usage": {
      "promptTokens": 50,
      "completionTokens": 20,
      "totalTokens": 70
    }
  }
}
```

---

#### 16.1.3 简化聊天

**接口地址**：`POST /ai/chat/simple`

**权限要求**：无需登录

**请求参数**：
```
userMessage=你好，1+1等于多少？
```

**响应示例**：
```json
{
  "code": 0,
  "data": "你好！1+1等于2。"
}
```

---

#### 16.1.4 流式聊天（简化版）

**接口地址**：`GET /ai/chat/stream`

**权限要求**：无需登录

**请求参数**：
```
userMessage=介绍一下你们的农产品
```

**响应格式**：`application/x-ndjson`（NDJSON，实时逐字返回，保留所有格式）

**前端调用示例**（使用 Fetch API）：
```javascript
async function streamChat(userMessage) {
    const response = await fetch(`/ai/chat/stream?userMessage=${encodeURIComponent(userMessage)}`);
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullMessage += chunk;
        
        // 实时显示（保留所有格式：换行、缩进、Markdown）
        document.getElementById('output').textContent = fullMessage;
    }
}

// 使用
streamChat('介绍一下你们的农产品');
```

**重要说明**：
- ⚠️ 不能使用 EventSource（EventSource 只支持 SSE 格式）
- ✅ 必须使用 Fetch API + ReadableStream
- ✅ 完美保留所有格式（换行、缩进、Markdown、代码块）
- ✅ CSS 需要设置 `white-space: pre-wrap` 来正确显示格式

---

#### 16.1.5 流式聊天（完整版）

**接口地址**：`POST /ai/chat/stream`

**权限要求**：无需登录

**请求参数**：同标准聊天接口

**响应格式**：`application/x-ndjson`（NDJSON，保留所有格式）

**前端调用示例**：
```javascript
async function fullStreamChat(messages, options = {}) {
    const response = await fetch('/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: messages,
            model: options.model || 'modelscope-deepseek',
            temperature: options.temperature || 0.7
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullMessage += chunk;
        document.getElementById('output').textContent = fullMessage;
    }
}

// 使用
fullStreamChat([
    { role: 'system', content: '你是助农商城的智能客服' },
    { role: 'user', content: '介绍一下你们的农产品' }
]);
```

---

### 16.2 通用 AI 对话接口（`/conversation/*`）

**特点**：
- ✅ 持久化对话历史
- ✅ 多轮上下文记忆
- ✅ 需要登录（JWT Token）
- ✅ 独立数据库表

---

#### 16.2.1 发送消息

**接口地址**：`POST /conversation/send`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "conversationId": 1,
  "userMessage": "如何学习 Python？",
  "title": "编程学习",
  "model": "modelscope-deepseek",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**参数说明**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversationId | Long | 否 | 会话 ID，不传则创建新会话 |
| userMessage | String | 是 | 用户消息内容 |
| title | String | 否 | 会话标题，仅新会话时有效 |
| model | String | 否 | 模型标识（如 modelscope-deepseek），不传则使用默认模型 |
| temperature | Double | 否 | 温度参数，会覆盖配置文件中的默认值 |
| maxTokens | Integer | 否 | 最大 token 数，会覆盖配置文件中的默认值 |

**响应示例**：
```json
{
  "code": 0,
  "data": {
    "conversationId": 1,
    "choices": [{
      "message": {
        "role": "assistant",
        "content": "学习 Python 可以从以下几个方面入手..."
      }
    }],
    "usage": {
      "totalTokens": 150
    }
  }
}
```

---

#### 16.2.2 流式发送消息

**接口地址**：`POST /conversation/send/stream`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**请求参数**：同发送消息接口

**响应格式**：`application/x-ndjson`（NDJSON，保留所有格式）

**前端调用示例**：
```javascript
async function conversationStream(conversationId, userMessage) {
    const response = await fetch('/conversation/send/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            conversationId: conversationId,
            userMessage: userMessage
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullMessage = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullMessage += chunk;
        
        // 实时显示（保留所有格式）
        document.getElementById('output').textContent = fullMessage;
    }
}

// 使用
conversationStream(1, '如何学习 Python？');
```

**重要说明**：
- ⚠️ 不能使用 EventSource
- ✅ 必须使用 Fetch API + ReadableStream
- ✅ 完美保留所有格式（换行、缩进、Markdown、代码块）

---

#### 16.2.3 获取会话列表

**接口地址**：`GET /conversation/list`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 0,
  "data": [
    {
      "conversationId": 1,
      "title": "编程学习",
      "lastMessage": "学习 Python 可以从...",
      "lastMessageTime": "2024-02-06T10:30:00"
    }
  ]
}
```

---

#### 16.2.4 获取会话详情

**接口地址**：`GET /conversation/{conversationId}`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**路径参数**：
- `conversationId`：会话 ID

**响应示例**：
```json
{
  "code": 0,
  "data": {
    "conversationId": 1,
    "title": "编程学习",
    "lastMessage": "可以从官方文档开始学习",
    "lastMessageTime": "2024-02-06T10:35:00",
    "messages": [
      {
        "id": 1,
        "role": "user",
        "content": "如何学习 Spring Boot？",
        "createTime": "2024-02-06T10:30:00"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "学习 Spring Boot 可以从以下几个方面入手...",
        "createTime": "2024-02-06T10:30:05"
      }
    ]
  }
}
```

---

#### 16.2.5 删除会话

**接口地址**：`DELETE /conversation/{conversationId}`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**路径参数**：
- `conversationId`：会话 ID

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

#### 16.2.6 更新会话标题

**接口地址**：`PUT /conversation/{conversationId}/title`

**权限要求**：user

**请求头**：`Authorization: Bearer {token}`

**路径参数**：
- `conversationId`：会话 ID

**请求参数**：
```json
{
  "title": "Spring Boot 深度学习"
}
```

**响应示例**：
```json
{
  "code": 0,
  "message": "操作成功",
  "data": null
}
```

---

### 16.3 配置说明

#### 16.3.1 多服务商配置

在 `application.yml` 中配置多个 AI 服务商：

```yaml
ai:
  providers:
    modelscope:
      api-key: ${MODELSCOPE_API_KEY:your-key}
      base-url: https://api-inference.modelscope.cn
      model: deepseek-ai/DeepSeek-V3.2
    
    moonshot:
      api-key: ${MOONSHOT_API_KEY:your-key}
      base-url: https://api.moonshot.cn
      model: moonshot-v1-8k
    
    openai:
      api-key: ${OPENAI_API_KEY:your-key}
      base-url: https://api.openai.com
      model: gpt-3.5-turbo
```

**配置说明**：
- 可同时配置多个服务商
- 第一个配置的服务商为默认服务商
- 建议使用环境变量管理 API Key

---

#### 16.3.2 环境变量配置

```bash
# Linux/Mac
export MODELSCOPE_API_KEY=your-key
export MOONSHOT_API_KEY=your-key
export OPENAI_API_KEY=your-key

# Windows
set MODELSCOPE_API_KEY=your-key
set MOONSHOT_API_KEY=your-key
set OPENAI_API_KEY=your-key
```

---

### 16.4 使用示例

#### 场景 1：创建新会话并对话

```javascript
// 1. 发送第一条消息（创建新会话）
POST /conversation/send
{
  "userMessage": "如何学习 Python？",
  "title": "编程学习"
}
// 响应包含 conversationId: 1

// 2. 继续对话（使用相同的 conversationId）
POST /conversation/send
{
  "conversationId": 1,
  "userMessage": "推荐一些学习资源"
}
```

---

#### 场景 2：切换 AI 模型

```javascript
// 使用 ModelScope DeepSeek 模型
POST /ai/chat
{
  "model": "modelscope-deepseek",
  "messages": [{"role": "user", "content": "你好"}]
}

// 使用 Moonshot 8K 模型
POST /ai/chat
{
  "model": "moonshot-8k",
  "messages": [{"role": "user", "content": "你好"}]
}

// 使用 Moonshot 32K 模型（长上下文）
POST /ai/chat
{
  "model": "moonshot-32k",
  "messages": [{"role": "user", "content": "分析这篇长文档..."}]
}
```

---

### 16.5 注意事项

1. **上下文管理**：
   - 每个会话自动保存完整的对话历史
   - AI 会根据历史上下文生成回复
   - 单个会话的消息数量建议控制在 50 条以内

2. **权限控制**：
   - 商城客服接口（`/ai/*`）无需登录
   - 通用对话接口（`/conversation/*`）需要登录
   - 用户只能访问自己的会话

3. **性能优化**：
   - 建议定期清理不需要的历史会话
   - 使用流式接口提供更好的用户体验
   - 设置合理的 `maxTokens` 限制

4. **前端格式显示**：
   - 流式接口使用 NDJSON 格式，不是 SSE
   - 必须使用 Fetch API + ReadableStream，不能使用 EventSource
   - CSS 需要设置 `white-space: pre-wrap` 来保留换行和缩进
   - 示例：`.message { white-space: pre-wrap; word-wrap: break-word; }`

5. **错误处理**：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| 未配置任何 AI 服务商 | 配置文件中没有有效的服务商配置 | 检查 `application.yml` 中的 `ai.providers` 配置 |
| 未找到服务商: xxx | 请求的 provider 未配置 | 使用 `/ai/providers` 接口查询可用服务商 |
| 401 Unauthorized | API Key 无效 | 检查对应服务商的 API Key 是否正确 |
| 消息列表不能为空 | 未传递 messages 参数 | 确保请求包含 messages 数组 |

---
