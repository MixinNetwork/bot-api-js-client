---
sidebar_position: 3
---

# 用户相关

> 注意，本页面的所有方法，都需要用户授权然后服务端用 `code` 换取的 token 来初始化一个 `Client` 之后才能够获取正确的数据。

### 1. 权限介绍
通过用户的授权，我们可以便捷的获取用户信息。

| 权限               | 介绍                                                 |
| :----------------- | :--------------------------------------------------- |
| PROFILE:READ       | 获取用户基本信息，如用户ID、Mixin ID、姓名、头像等。 |
| PHONE:READ         | 获取用户的手机号码。                                 |
| ASSETS:READ        | 获取用户资产列表和余额。                             |
| COLLECTIBLES:READ  | 获取用户收藏列表和余额。                             |
| CONTACTS:READ      | 获取用户联系人列表、黑名单列表。                     |
| MESSAGES:REPRESENT | 允许机器人代表用户发送消息。                         |
| SNAPSHOTS:READ     | 访问用户的转账记录，包括存款和提现。                 |

### 2. 获取授权的 code
```js
const params = {
  client_id: 'uuid', // 指定授权的机器人 client_id
  return_to: '/', // 用户授权完了之后的回调页面路由() 
  state: '', // 
  useCDN: false // 是否使用 加速域名，默认开启
}

Mixin.toAuthPage(params)
```
> 1. `return_to` 和 `state` 会在回调页面的 url 中返回。
> 2. 回调页面会在 url 中返回 `code` ，可以传给后端，用于 token 的获取。

### 3. 获取用户的资产