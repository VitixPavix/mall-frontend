# AI接口更新说明

## 更新内容

后端已将 `provider` 和 `model` 参数合并为单一的 `model` 参数，前端已同步更新。

## 主要变更

### 1. API接口变更

**旧版本：**
```javascript
{
  "provider": "modelscope",
  "model": "deepseek-ai/DeepSeek-V3.2",
  "messages": [...]
}
```

**新版本：**
```javascript
{
  "model": "modelscope-deepseek",  // 合并后的模型标识
  "messages": [...]
}
```

### 2. 获取可用模型接口

**接口地址：** `GET /ai/models`

**响应示例：**
```json
{
  "code": 0,
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

## 前端更新文件

### 1. `src/api/ai.js`
- 更新 `getAiProvidersService` → `getAiModelsService`
- 接口路径从 `/ai/providers` 改为 `/ai/models`

### 2. `src/api/conversation.js`
- 更新 `getAiProvidersService` → `getAiModelsService`
- 接口路径从 `/ai/providers` 改为 `/ai/models`

### 3. `src/views/ai/AiChat.vue` (独立AI对话页面)
- 移除 `providers` 和 `selectedProvider` 变量
- 使用 `models` 和 `selectedModel` 变量
- 更新 `loadProviders()` → `loadModels()`
- 更新模型选择下拉框，直接显示模型描述
- 发送消息时只传递 `model` 参数（如果选择了模型）

### 4. `src/components/AiChat.vue` (悬浮窗AI助手)
- 移除 `providers`、`modelOptions` 和 `selectedProvider` 变量
- 使用 `models` 和 `selectedModel` 变量
- 更新 `loadProviders()` → `loadModels()`
- 更新模型选择下拉框
- 发送消息时只传递 `model` 参数（如果选择了模型）

## 使用说明

### 选择模型

用户可以在设置面板中选择不同的AI模型：

1. 点击设置按钮
2. 在"选择模型"下拉框中选择想要使用的模型
3. 如果不选择，系统将使用后端配置的默认模型

### 可用模型示例

- `modelscope-deepseek` - ModelScope DeepSeek V3 模型
- `modelscope-kimi` - ModelScope Kimi K2.5 模型
- `moonshot-8k` - Moonshot AI Kimi 8K 上下文模型
- `moonshot-32k` - Moonshot AI Kimi 32K 上下文模型（如果配置）

## 优势

1. **简化参数**：不再需要同时传递 provider 和 model
2. **统一标识**：每个模型有唯一的标识符（如 `modelscope-deepseek`）
3. **更灵活**：后端可以自由配置模型映射关系
4. **向后兼容**：不选择模型时使用默认模型

## 测试建议

1. 测试不选择模型时的默认行为
2. 测试选择不同模型后的对话效果
3. 测试模型列表加载失败的容错处理
4. 测试会话持久化功能是否正常
