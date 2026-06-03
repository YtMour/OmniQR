# OmniQR UI 模块化说明

## 样式入口

App 端曾出现页面级 CSS 未注册，导致图片退回 `uni-image` 默认尺寸的问题。因此当前采用：

- `OmniQR-Uniapp/App.vue` 只导入全局样式模块。
- `OmniQR-Uniapp/common/styles/base.css` 负责基础重置、按钮默认边框清理、输入控件基础修复。
- `OmniQR-Uniapp/common/styles/layout.css` 负责通用布局、顶部栏、底部导航。
- `OmniQR-Uniapp/common/styles/components.css` 负责卡片、表单、按钮、记录列表、首页工具卡。

关键图片仍保留行内宽高兜底，避免 App 端页面 CSS 异常时出现大图堆叠。

## 组件拆分

- `OmniQR-Uniapp/components/AppTabBar.vue`：底部导航组件，已接入首页、生成页、记录页。
- `OmniQR-Uniapp/components/QrPreview.vue`：二维码预览组件。只接收已经生成的内容，空状态显示“点击生成后显示二维码”；已生成状态显示深青品牌边框和随机角落 `OmniQR` 水印。

后续建议继续抽取：

- `AppTopBar.vue`
- `ToolCard.vue`
- `RecordItem.vue`
- `QrPreviewPanel.vue`

## 生成页交互约束

生成页采用显式生成流程：

1. 用户输入内容时，只更新表单，不自动生成二维码。
2. 点击“生成”后才写入 `generatedContent` 并显示二维码预览。
3. 点击“生成”后自动写入本地记录。
4. “保存二维码图片”“复制内容”都基于 `generatedContent`，未生成时保持弱化状态并提示先生成。
5. 二维码图片导出由 `OmniQR-Uniapp/common/qrExport.ts` 负责，导出图包含深青外框和角落 `OmniQR` 水印。

注意：`QrPreview.vue` 内部样式使用 `omniqr-preview-*` 私有类名前缀，避免被页面级 `.qr-placeholder`、`.preview-icon` 等旧样式污染。

## 记录详情

- `OmniQR-Uniapp/pages/detail/detail.vue`：统一记录详情页。
- 记录页点击记录进入详情页，不再使用“详情待接入”提示。
- 首页扫码成功后保存扫码记录并进入详情页。
- 详情页显示真实二维码、原始内容、来源、复制、重新生成、收藏和删除操作。

## 设置与隐私

- `OmniQR-Uniapp/pages/settings/settings.vue`：设置页，负责默认记录标题、保存失败预览、二维码尺寸偏好、记录导出、记录清理和隐私入口。
- `OmniQR-Uniapp/pages/privacy/privacy.vue`：隐私政策页，负责说明本地生成、敏感信息、权限、数据管理、分享边界和免责声明。
- `OmniQR-Uniapp/common/settingsStore.ts`：设置存储模块，使用 `uni.setStorageSync` / `uni.getStorageSync` 保存本地偏好。
- `OmniQR-Uniapp/common/i18n.ts`：轻量国际化模块，集中管理简体中文、英文和主流语言覆盖、当前语言读取和记录类型展示翻译。

交互约束：

1. 隐私政策使用独立页面承载，不再只放在设置页内的一段说明。
2. 设置页只保留入口和简短说明，避免用户在设置操作中阅读过长文本。
3. 隐私政策中的免责声明需要保留“法律允许范围内”等限定表述，避免写成绝对免责。

## 国际化

- 当前支持 `zh-Hans`、`zh-Hant`、`en`、`es`、`fr`、`de`、`ja`、`ko`、`pt-BR`、`ru`、`ar`、`hi`。
- 语言偏好保存在 `settingsStore` 中，设置页通过 picker 切换。
- 语言 picker 只修改待保存设置；点击“保存设置”后写入本地设置、同步 i18n 内存语言，并通过设置页响应式版本号完成即时刷新。
- 设置页左上角返回按钮固定 `reLaunch('/pages/index/index')`，避免保存设置后导航栈变化导致停留在设置页。
- 页面内文案通过 `t(key)` 读取，记录类型仍保持现有存储枚举，展示层通过 `recordTypeLabel(type)` 翻译。
- 新增页面或功能时，应优先在 `common/i18n.ts` 补齐简中和英文基线 key，再在 `localeOverrides` / `localeComplements` 中补充主流语言覆盖，最后在页面中引用，避免再次散落硬编码文案。

## 真机验证点

- 按钮不应出现 uni-app 默认黑色或异常外框。
- 主按钮背景色应完整填充圆角区域。
- 输入框边界应为浅灰细线，不应有重阴影。
- 生成页底部按钮不能被底部导航遮挡，且未点击生成前不应出现真实二维码。
- 二维码预览空状态不应与旧占位模块重叠。
- 生成后的二维码应带 OmniQR 深青外框和角落水印。
- 启动图在自定义基座中不应出现主视觉明显横向或纵向拉伸。
