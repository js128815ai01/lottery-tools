# 網站測試與上線流程

這個資料夾已經整理成可重複使用的網站流程：

1. 自動測試網站檔案
2. 測試通過後打包成 `site-dist/`
3. 由 Codex Sites 儲存版本
4. 部署到正式網址

## 一鍵測試與打包

在這個資料夾執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-site.ps1
```

這會先執行 `test-site.ps1`，確認：

- 必要檔案存在：`index.html`、`styles.css`、`script.js`
- HTML 和 CSS 引用的本機檔案存在
- 沒有引用 `C:\...` 或 `file://...` 這類只能在自己電腦使用的路徑
- 基本手機版設定存在

測試通過後，會自動建立：

```text
site-dist/
```

## 上線條件

這個網站已綁定 Codex Sites 專案：

```text
appgprj_6a55a4a79f788191921c79d42c3d8cea
```

目前 Sites 專案狀態：

- 專案名稱：好抽工具箱
- 網站代稱：free-lottery-tools
- 存取權限：custom，目前只有擁有者可查看
- 正式網址：尚未部署產生
- 已儲存版本：0

Codex Sites 的正式部署需要先把目前原始碼推送到 Sites 的來源倉庫，並取得對應的 `commit_sha`。這台環境目前找不到 Git，因此已完成本機自動測試與打包，但尚不能直接完成 Sites 版本儲存與正式部署。

## 完整自動上線方式

當 Git 可用後，可以請 Codex 執行：

```text
上線這個網站
```

Codex 會接著：

1. 執行 `publish-site.ps1`
2. 推送目前網站原始碼到 Sites 來源倉庫
3. 用該次推送的 `commit_sha` 儲存 Sites 版本
4. 部署該版本到正式網址
5. 檢查部署狀態
6. 回報正式網站連結

## 是否公開

目前網站不是公開網站。若你希望任何人拿到連結都能看，需要另外將 Sites 存取權改成 public。

建議上線順序：

1. 先部署 owner-only 或 custom 版本測試
2. 確認正式網址內容正常
3. 再把存取權改成 public
