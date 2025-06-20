# 订阅管理功能

这个项目现在包含了完整的订阅管理功能，允许Premium用户查看和管理他们的订阅。

## 功能特性

### 1. 订阅状态查看
- 查看当前订阅状态（活跃、取消中等）
- 显示计费周期（月付或年付）
- 显示下次计费日期
- 显示订阅计划详情

### 2. 订阅取消
- 用户可以取消订阅（在当前计费周期结束时生效）
- 同时更新Stripe和本地数据库
- 显示取消确认和说明信息

### 3. 订阅恢复
- 如果用户在当前计费周期内取消了订阅，可以重新激活
- 支持在订阅到期前恢复

## 技术实现

### API端点

#### `/api/subscription` 
- **GET**: 获取用户订阅详情
- **DELETE**: 取消订阅（在计费周期结束时）
- **POST**: 恢复订阅（传入 `{action: "reactivate"}`）

### 组件

#### `SubscriptionModal`
- 主要的订阅管理模态框
- 显示订阅详情、状态和操作按钮
- 处理取消和恢复操作

#### `SubscriptionButton`
- 触发订阅管理模态框的按钮
- 仅对Premium用户显示

### 数据库集成

订阅管理功能使用现有的Prisma数据库模型：
- `User` - 存储用户计划信息
- `Subscription` - 存储订阅详情
- `StripeLog` - 存储Stripe事件日志

### Stripe集成

API会尝试与Stripe同步操作：
- 通过StripeLog查找实际的Stripe订阅ID
- 同时更新Stripe和本地数据库
- 即使Stripe操作失败，也会更新本地状态

## 在Header中的集成

订阅管理按钮已集成到Header组件中：

- **桌面端**: 在Premium按钮旁边显示"Manage"按钮
- **移动端**: 在用户菜单中显示订阅管理选项
- **仅对Premium用户显示**: 非Premium用户看到"Premium"升级按钮

## 使用示例

### 对于Premium用户
1. 登录后，在Header中会看到"Manage"按钮（带皇冠图标）
2. 点击按钮打开订阅管理模态框
3. 可以查看订阅详情、取消或恢复订阅

### 对于免费用户
1. 在Header中看到"Premium"按钮
2. 点击按钮打开升级到Premium的模态框

## 演示页面

访问 `/subscription-demo` 查看订阅管理功能的完整演示，包括：
- 用户信息显示
- 订阅状态详情
- 功能对比表
- 操作按钮演示

## 安全性

- 所有API端点都需要用户认证
- 使用Next.js的auth函数验证用户身份
- Stripe操作使用服务器端密钥，确保安全性
- 错误处理确保即使部分操作失败，系统仍能正常工作

## 注意事项

1. **环境变量**: 确保设置了正确的Stripe密钥和webhook密钥
2. **数据库**: 订阅数据主要存储在本地数据库中，Stripe作为支付处理
3. **错误处理**: API包含完善的错误处理，确保用户友好的错误信息
4. **UI/UX**: 使用了Shadcn UI组件，确保一致的设计风格

## 扩展功能

未来可以考虑添加：
- 更改计费周期（月付 ↔ 年付）
- 订阅历史记录
- 发票下载
- 付款方式管理
- 订阅暂停功能 