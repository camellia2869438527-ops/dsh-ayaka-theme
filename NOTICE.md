# 第三方素材与授权 / Third-party assets and licensing

本仓库的**代码**是 MIT（见 [`LICENSE`](LICENSE)）。仓库里带有**不属于代码作者**的美术素材，
这一页说明它们在哪、从哪来、怎么用。

The **code** in this repository is MIT (see [`LICENSE`](LICENSE)). Any artwork shipped alongside it
is **not** covered by that grant; this page is about that material.

## 1. 《原神》/ Genshin Impact

神里绫华（Kamisato Ayaka）及其相关角色形象、服装、纹章、文字的商标与著作权归
**miHoYo / HoYoverse** 所有。

The character, costume, crest and any related marks belong to **miHoYo / HoYoverse**.

本主题是**非商业同人作品**，与米哈游无关联、未获其背书。

This theme is **non-commercial fan work**, not affiliated with or endorsed by miHoYo.

### 1.1 素材来源登记

| 文件 | 内容 | 来源 / 授权 |
| --- | --- | --- |
| `assets/video.mp4` | 动态壁纸视频 | **待填**：由用户提供；发布前需登记绘制者/来源与是否允许再分发 |
| `assets/poster.jpg` | 壁纸封面（视频同帧静图） | 同上 |
| `assets/stickers/0..10.webp` | 十一款 Q 版表情（原为白底 PNG，本仓库脚本抠白为透明 WebP） | 同上 |

发布前必须把「待填」换成真实的来源链（官方原作 → 绘制/加工者 → 本仓库），
并确认授权允许**再分发**（不只是允许使用）。若素材来自他人，请附授权说明链接。

### 1.2 商用

需要商用请自行替换 `video.mp4` / `poster.jpg` / `assets/stickers/*` 为拥有完整权利的作品。
代码路径不依赖这些文件的具体内容，只要文件名与约定不变即可。

## 2. DeepSeek Harness

本插件是 DSH 的第三方插件，**不是** DeepSeek 官方项目。它只使用 DSH 公开的插件机制
（`dsh.bundle.patch` 清单、`dsh.client` 客户端声明、`webServer.register` 路由、ThemeRuntime
token 覆盖接口）。DSH 自身的包以 MIT 发布。

## 3. 字体

本仓库不附带任何字体文件；界面使用系统字体栈。若后续加入字体，必须是可再分发的
（SIL OFL 等），并随包附许可全文。
