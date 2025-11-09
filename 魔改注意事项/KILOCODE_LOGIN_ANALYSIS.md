# KiloCode 登录接口和数据结构详细分析

## 1. 登录流程和接口

### 1.1 登录入口

登录通过 OAuth 流程实现，用户点击登录按钮后跳转到后端登录页面：

**登录 URL 生成** (`webview-ui/src/components/kilocode/helpers.ts`):

```typescript
export function getKiloCodeBackendSignInUrl(
	uriScheme: string = "vscode",
	uiKind: string = "Desktop",
	kiloCodeWrapperProperties?: KiloCodeWrapperProperties,
) {
	const source = uiKind === "Web" ? "web" : getKiloCodeSource(uriScheme, kiloCodeWrapperProperties)
	return getAppUrl(`/sign-in-to-editor?source=${source}`)
}
```

**注册 URL 生成**:

```typescript
export function getKiloCodeBackendSignUpUrl(...) {
    const source = uiKind === "Web" ? "web" : getKiloCodeSource(uriScheme, kiloCodeWrapperProperties)
    return getAppUrl(`/users/sign_up?source=${source}`)
}
```

### 1.2 登录回调处理

登录成功后，后端通过 URI scheme 回调到扩展：

**回调 URI 格式** (`src/activate/handleUri.ts`):

```
vscode://publisher.name/kilocode?token=<JWT_TOKEN>
```

**回调处理** (`src/core/webview/ClineProvider.ts:1608-1626`):

```typescript
async handleKiloCodeCallback(token: string) {
    const kilocode: ProviderName = "kilocode"
    let { apiConfiguration, currentApiConfigName = "default" } = await this.getState()

    await this.upsertProviderProfile(currentApiConfigName, {
        ...apiConfiguration,
        apiProvider: "kilocode",
        kilocodeToken: token,  // JWT Token 被保存
    })

    vscode.window.showInformationMessage("Kilo Code successfully configured!")

    // 更新当前任务的 API 处理器
    if (this.getCurrentTask()) {
        this.getCurrentTask()!.api = buildApiHandler({
            apiProvider: kilocode,
            kilocodeToken: token,
        })
    }
}
```

### 1.3 登录接口参数

**请求参数**：

- 无直接 API 调用参数
- 通过浏览器 OAuth 流程完成
- 回调时通过 URI query 参数传递 `token`

**返回值**：

- 成功：通过 URI scheme 回调，传递 JWT token
- 失败：无回调或显示错误信息

## 2. 登录机制（Token 认证）

### 2.1 Token 类型

**JWT (JSON Web Token)** - 从代码中可以看出 token 是 JWT 格式：

```typescript
// packages/types/src/kilocode/kilocode.ts:47-63
export function getKiloBaseUriFromToken(kilocodeToken?: string) {
	if (kilocodeToken) {
		try {
			const payload_string = kilocodeToken.split(".")[1] // 提取 JWT payload
			if (!payload_string) return "https://api.kilocode.ai"

			const payload_json =
				typeof atob !== "undefined" ? atob(payload_string) : Buffer.from(payload_string, "base64").toString()
			const payload = JSON.parse(payload_json)

			// 从 JWT payload 中读取环境信息
			if (payload.env === "development") return "http://localhost:3000"
		} catch (_error) {
			console.warn("Failed to get base URL from Kilo Code token")
		}
	}
	return "https://api.kilocode.ai"
}
```

### 2.2 Token 存储

Token 存储在扩展的配置中：

- **存储位置**: `apiConfiguration.kilocodeToken`
- **存储方式**: 通过 `upsertProviderProfile` 保存到 VSCode 的配置存储
- **Token 格式**: JWT 字符串

### 2.3 Token 使用

所有 API 请求都使用 Bearer Token 认证：

```typescript
// src/core/webview/webviewMessageHandler.ts:2605-2608
const headers: Record<string, string> = {
	Authorization: `Bearer ${kilocodeToken}`,
	"Content-Type": "application/json",
}
```

### 2.4 环境识别

Token 的 JWT payload 中包含环境信息：

- `payload.env === "development"` → 使用 `http://localhost:3000`
- 其他情况 → 使用 `https://api.kilocode.ai`

## 3. 个人页面数据结构

### 3.1 ProfileData（个人资料数据）

**类型定义** (`src/shared/WebviewMessage.ts:422-431`):

```typescript
export type ProfileData = {
	kilocodeToken: string // JWT Token
	user: {
		id: string // 用户 ID
		name: string // 用户名称
		email: string // 用户邮箱
		image: string // 用户头像 URL
	}
	organizations?: UserOrganizationWithApiKey[] // 组织列表（可选）
}
```

**组织数据结构** (`src/shared/WebviewMessage.ts:414-420`):

```typescript
export type UserOrganizationWithApiKey = {
	id: string // 组织 ID
	name: string // 组织名称
	balance: number // 组织余额
	role: OrganizationRole // 用户在组织中的角色
	apiKey: string // 组织的 API Key
}

export type OrganizationRole = "owner" | "admin" | "member"
```

### 3.2 ProfileDataResponsePayload（个人资料响应）

**类型定义** (`src/shared/WebviewMessage.ts:433-437`):

```typescript
export interface ProfileDataResponsePayload {
	success: boolean // 请求是否成功
	data?: ProfileData // 个人资料数据
	error?: string // 错误信息（如果失败）
}
```

### 3.3 BalanceData（余额数据）

**类型定义** (`cli/src/state/atoms/profile.ts:27-29`):

```typescript
export interface BalanceData {
	balance: number // 余额（美元）
}
```

**响应类型** (`src/shared/WebviewMessage.ts:439-444`):

```typescript
export interface BalanceDataResponsePayload {
	success: boolean // 请求是否成功
	data?: any // 实际为 { balance: number }
	error?: string // 错误信息（如果失败）
}
```

### 3.4 API 端点

#### 3.4.1 获取个人资料

**请求**:

- **端点**: `GET /api/profile`
- **URL**: `https://api.kilocode.ai/api/profile` (或根据 token 解析的环境)
- **Headers**:
    ```typescript
    {
        "Authorization": "Bearer <kilocodeToken>",
        "Content-Type": "application/json",
        "X-KILOCODE-TESTER": "SUPPRESS"  // 可选，如果禁用了测试警告
    }
    ```

**响应**:

```typescript
{
    user: {
        id: string
        name: string
        email: string
        image: string
    },
    organizations?: [
        {
            id: string
            name: string
            balance: number
            role: "owner" | "admin" | "member"
            apiKey: string
        }
    ]
}
```

**处理逻辑** (`src/core/webview/webviewMessageHandler.ts:2590-2680`):

1. 检查 token 是否存在
2. 构建请求头（包含 Bearer token）
3. 发送 GET 请求到 `/api/profile`
4. 检查当前组织是否仍然存在（如果用户被移出组织，自动切换回个人账户）
5. 自动切换到第一个组织（如果用户有组织但未选择）
6. 返回数据给前端

#### 3.4.2 获取余额

**请求**:

- **端点**: `GET /api/profile/balance`
- **URL**: `https://api.kilocode.ai/api/profile/balance` (或根据 token 解析的环境)
- **Headers**:
    ```typescript
    {
        "Authorization": "Bearer <kilocodeToken>",
        "Content-Type": "application/json",
        "X-KiloCode-OrganizationId": "<organizationId>",  // 可选，如果选择了组织
        "X-KILOCODE-TESTER": "SUPPRESS"  // 可选
    }
    ```

**响应**:

```typescript
{
	balance: number // 余额（美元，浮点数）
}
```

**处理逻辑** (`src/core/webview/webviewMessageHandler.ts:2683-2729`):

1. 检查 token 是否存在
2. 构建请求头（包含 Bearer token 和可选的 OrganizationId）
3. 发送 GET 请求到 `/api/profile/balance`
4. 返回余额数据给前端

### 3.5 前端数据获取流程

**ProfileView 组件** (`webview-ui/src/components/kilocode/profile/ProfileView.tsx`):

1. **发送请求**:

    ```typescript
    useEffect(() => {
    	vscode.postMessage({ type: "fetchProfileDataRequest" })
    	vscode.postMessage({ type: "fetchBalanceDataRequest" })
    }, [apiConfiguration?.kilocodeToken, organizationId])
    ```

2. **接收响应**:
    ```typescript
    useEffect(() => {
    	const handleMessage = (event: MessageEvent<WebviewMessage>) => {
    		if (message.type === "profileDataResponse") {
    			const payload = message.payload as ProfileDataResponsePayload
    			if (payload.success) {
    				setProfileData(payload.data) // 设置个人资料数据
    			}
    		} else if (message.type === "balanceDataResponse") {
    			const payload = message.payload as BalanceDataResponsePayload
    			if (payload.success) {
    				setBalance(payload.data?.balance || 0) // 设置余额
    			}
    		}
    	}
    	window.addEventListener("message", handleMessage)
    }, [profileData])
    ```

## 4. 关键特性

### 4.1 组织切换

- 用户可以选择不同的组织
- 选择组织后，余额和 API 调用会使用组织的配置
- 如果用户被移出当前组织，会自动切换回个人账户

### 4.2 自动组织切换

- 如果用户有组织但未选择任何组织，会自动切换到第一个组织
- 只会在首次登录时自动切换（通过 `hasPerformedOrganizationAutoSwitch` 全局状态控制）

### 4.3 Token 环境识别

- Token 的 JWT payload 中包含环境信息
- 开发环境的 token 会自动使用 `http://localhost:3000`
- 生产环境的 token 使用 `https://api.kilocode.ai`

### 4.4 退出登录

退出登录时清除 token 和组织 ID：

```typescript
function handleLogout(): void {
	vscode.postMessage({
		type: "upsertApiConfiguration",
		text: currentApiConfigName,
		apiConfiguration: {
			...apiConfiguration,
			kilocodeToken: "",
			kilocodeOrganizationId: undefined,
		},
	})
}
```

## 5. 数据流图

```
用户点击登录
    ↓
跳转到后端登录页面 (OAuth)
    ↓
用户完成认证
    ↓
后端回调: vscode://.../kilocode?token=<JWT>
    ↓
handleKiloCodeCallback(token)
    ↓
保存 token 到 apiConfiguration.kilocodeToken
    ↓
前端发送 fetchProfileDataRequest
    ↓
后端调用 GET /api/profile (Bearer token)
    ↓
返回 ProfileData (user + organizations)
    ↓
前端发送 fetchBalanceDataRequest
    ↓
后端调用 GET /api/profile/balance (Bearer token + OrganizationId)
    ↓
返回 BalanceData (balance)
    ↓
前端显示个人资料页面
```

## 6. 总结

- **登录方式**: OAuth 流程，通过 URI scheme 回调传递 JWT token
- **认证机制**: JWT Bearer Token 认证
- **Token 格式**: JWT，包含环境信息（development/production）
- **个人资料**: 包含用户信息（id, name, email, image）和组织列表
- **余额数据**: 单独的 API 端点，支持个人和组织两种模式
- **组织管理**: 支持多组织切换，自动处理组织变更
