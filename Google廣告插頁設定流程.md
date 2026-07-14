# Google 廣告插頁設定流程

目標：在「好抽工具箱」加入 Google AdSense 的插頁廣告。

目前建議使用 Google AdSense 的 Auto ads，並在 Auto ads 裡啟用 Vignette ads。Vignette ads 就是 Google AdSense 提供的全螢幕插頁廣告形式，通常會在頁面切換或合適時機由 Google 自動顯示。

## 目前網站

工具網站：

```text
https://free-lottery-tools.js128815ai01.chatgpt.site
```

WordPress 入口頁：

```text
https://toolteam6.wordpress.com/
```

## 建議放廣告的位置

優先放在工具網站：

```text
https://free-lottery-tools.js128815ai01.chatgpt.site
```

原因：

- 這是實際使用者操作抽獎工具的地方
- 可以直接修改 HTML 的 `<head>`
- 比 WordPress.com 免費站更適合放 AdSense script

WordPress.com 免費方案通常不適合直接放 AdSense script，因為 `<script>` 類型的自訂程式碼常會被限制或移除。

## 你需要先完成的事

1. 申請 Google AdSense：

```text
https://www.google.com/adsense/
```

2. 在 AdSense 新增網站：

```text
https://free-lottery-tools.js128815ai01.chatgpt.site
```

3. 等 Google 審核網站。

4. 在 AdSense 後台取得 Auto ads 程式碼。

程式碼格式大概會像這樣：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-你的發布商ID"
     crossorigin="anonymous"></script>
```

請注意：`ca-pub-你的發布商ID` 必須換成你自己的 AdSense 發布商 ID。

## 啟用插頁廣告

在 AdSense 後台：

1. 進入 Ads
2. 選擇網站
3. 開啟 Auto ads
4. 找到 Overlay formats
5. 開啟 Vignette ads
6. 儲存設定

## Codex 可協助的部分

當你取得 AdSense code 後，把這段貼給 Codex：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
     crossorigin="anonymous"></script>
```

Codex 會幫你：

1. 把 AdSense code 加到 `index.html` 的 `<head>`
2. 重新測試網站
3. 重新部署到正式網址
4. 確認正式頁面已包含 AdSense script

## 不建議做的事

- 不要自己做假的全螢幕彈窗廣告
- 不要誘導使用者點擊廣告
- 不要用測試或別人的 `ca-pub` ID
- 不要在 WordPress.com 免費方案裡硬塞 JavaScript
- 不要在 AdSense 審核前大量放空白廣告區塊

## 實作位置

AdSense Auto ads script 應放在：

```html
<head>
  ...
  <!-- AdSense code here -->
</head>
```

也就是目前專案的：

```text
index.html
```

放在 `<link rel="stylesheet" href="styles.css" />` 前後都可以，但必須在 `<head>` 裡。
