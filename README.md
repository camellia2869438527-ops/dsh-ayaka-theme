# 神里绫华主题 / dsh-ayaka-theme

为 DeepSeek Harness Desktop 制作的非官方、非商业同人主题插件。霜蓝与雪白配色、
全窗口动态壁纸、十一款 Q 版表情。

> 非官方、非商业。角色与相关美术版权归 miHoYo / HoYoverse；MIT 只覆盖本插件代码，
> 素材权利见 [NOTICE.md](NOTICE.md)。

## 功能

- **动态壁纸**：`assets/video.mp4` 静音循环铺满整个窗口，`assets/poster.jpg` 作封面；
  左深右浅的遮罩保证正文可读。关闭壁纸后只保留配色。
- **明暗配色**：默认 / 浅色 / 深色 / 跟随系统 四档；通过官方 ThemeRuntime 的 token
  覆盖接口改写侧栏、阅读区、输入区、按钮、菜单、链接、代码块等平台配色变量。
- **按钮表情**：十一款 Q 版表情（白底自动抠成透明 WebP），接入新会话、欢迎区、
  文件入口、正负评价与发送按钮；其余表情在设置卡片画廊展示。功能文字与事件保留。
- **设置卡片**：设置 → 通用 → 神里绫华主题，可切换配色、开关壁纸与表情、浏览画廊。
  选择保存在本机（localStorage），恢复默认即撤下配色与壁纸。

## 安装

从 GitHub Releases 下载 `dsh-ayaka-theme-*.tgz`，在 **DeepSeek Harness Desktop →
插件 → 添加插件** 中选择它，然后点击启用。桌面端的 profile 归应用插件管理器所有，
请走应用的插件页面，不要用全局 CLI 修改 Desktop 配置。

## 开发与构建

```sh
node scripts/build.mjs          # 打包 lib/client.js
python tools/prepare_assets.py  # 从原始素材重新生成 assets/（视频、封面、抠白表情）
```

源码在 `src/`，预构建产物在 `lib/`，素材在 `assets/`。图片由宿主路由
`/dsh-ayaka-theme/assets/*` 提供，视频不内嵌进 bundle。

## 素材

| 文件 | 说明 |
| --- | --- |
| `assets/video.mp4` | 动态壁纸（720p，H.264，静音循环） |
| `assets/poster.jpg` | 壁纸封面 / 兜底 |
| `assets/stickers/0..10.webp` | 十一款表情（透明 WebP） |

替换素材时保持文件名不变即可；表情源图放在桌面「绫华主题」目录、视频源在「1」目录，
重跑 `tools/prepare_assets.py` 即可重新抠白、压图。

## 表情映射

| 索引 | 表情 | 位置 |
| --- | --- | --- |
| 0 | 好耶 | 新会话 |
| 1 | 收到 | 欢迎区 |
| 2 | 咦？ | 文件入口悬停 |
| 3 | 不要 | 负面评价悬停 |
| 4 | 加油 | 正面评价悬停 |
| 5 | 谢谢 | 发送按钮 |
| 6–10 | 呜呜 / 害羞 / 晚安 / 哼 / 啊？ | 画廊（待接线） |

## 许可

代码：MIT。角色美术：非商业同人，见 [NOTICE.md](NOTICE.md)。
