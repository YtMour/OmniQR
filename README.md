# OmniQR

OmniQR 是一个面向移动端的二维码工具箱 App，当前技术栈采用 `uni-app`，目标是同时覆盖 Android App、H5 和后续小程序端。

## 核心功能

- 二维码生成：输入文本、链接或自定义内容后生成二维码，生成后自动保存记录，支持复制内容和导出图片。
- WiFi 二维码：录入 WiFi 名称、密码、加密方式和隐藏网络选项，生成可扫码连接的二维码。
- 名片二维码：录入姓名、电话、公司、职位、邮箱、网址、地址和备注等信息，生成 vCard 名片二维码。
- 扫码记录：保存扫码结果、生成记录和常用二维码，方便再次查看、复制、分享或删除。
- 设置与隐私：支持默认记录标题、保存失败预览、记录导出、数据清理、隐私政策和免责声明。
- 国际化：设置页支持简体中文、繁體中文、English、Español、Français、Deutsch、日本語、한국어、Português、Русский、العربية、हिन्दी 等主流语言切换，主流程页面会按语言偏好显示。

## 项目结构

```text
OmniQR/
├─ OmniQR-Uniapp/       uni-app 应用源码
│  ├─ pages/            页面目录
│  ├─ static/           静态资源
│  ├─ App.vue           应用入口
│  ├─ main.ts           uni-app 启动文件
│  ├─ manifest.json     应用与平台配置
│  └─ pages.json        页面路由配置
└─ docs/
   ├─ IMPLEMENTATION_STATUS.md 当前实现状态与验证清单
   ├─ PRODUCT_PLAN.md         产品规划
   ├─ ROADMAP.md              版本路线
   └─ UI_ARCHITECTURE.md      UI 与组件说明
```

## 运行方式

推荐使用 HBuilderX 打开 `OmniQR-Uniapp` 目录运行和打包，也可以使用 CLI 预览 H5。

```powershell
cd OmniQR-Uniapp
npm install
npm run dev:h5
npm run build:h5
```

当前 H5 开发服务默认绑定 `0.0.0.0:48917`，本机访问地址为 `http://localhost:48917`。

## 当前阶段

当前仓库已完成 OmniQR 工具箱 MVP 的主要本地闭环：普通文本/链接、WiFi、名片二维码均可在 H5/App 基础链路中本地生成，生成后自动保存记录，并支持二维码预览、复制内容和图片导出回退；记录页支持搜索、筛选、收藏、详情、删除；设置页支持生成偏好、语言切换、数据导出、清理记录、隐私政策和免责声明。

仍需在 Android 真机上继续验证相机扫码、相册保存权限和二维码识别兼容性。

详细完成度和待验证项见 [docs/IMPLEMENTATION_STATUS.md](./docs/IMPLEMENTATION_STATUS.md)。
