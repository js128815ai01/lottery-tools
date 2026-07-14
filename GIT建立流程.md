# Git 建立流程

這份流程用來讓目前的網站資料夾可以接上 Codex Sites 的自動上線流程。目標是完成三件事：

1. 電腦可以使用 Git
2. 目前資料夾成為 Git 專案
3. 可以把網站版本推送到遠端來源

## 1. 安裝 Git

到 Git 官方網站下載 Windows 版：

```text
https://git-scm.com/download/win
```

安裝時大多數選項可以使用預設值。建議確認這個選項有啟用：

```text
Git from the command line and also from 3rd-party software
```

安裝完成後，重新開啟 PowerShell，再檢查：

```powershell
git --version
```

如果看到版本號，例如 `git version 2.x.x`，代表安裝成功。

## 2. 設定 Git 使用者資訊

第一次使用 Git 時，需要設定名稱與 Email：

```powershell
git config --global user.name "你的名稱"
git config --global user.email "你的Email"
```

例如：

```powershell
git config --global user.name "Js"
git config --global user.email "js128815ai01@gmail.com"
```

檢查設定：

```powershell
git config --global --list
```

## 3. 初始化目前網站資料夾

進入網站資料夾：

```powershell
cd "C:\Users\js128\OneDrive\Documents\課程工具"
```

建立 Git 專案：

```powershell
git init
```

檢查狀態：

```powershell
git status
```

如果中文檔名在 `git status` 裡顯示成 `\345\...` 這類編碼，執行：

```powershell
git config --global core.quotepath false
```

再重新查看：

```powershell
git status
```

## 4. 建立忽略清單

建議新增 `.gitignore`，避免把不需要的暫存檔放進版本：

```text
site-dist/
.DS_Store
Thumbs.db
*.tmp
*.log
```

注意：如果你希望 `site-dist/` 也被版本管理，可以不要忽略它。不過一般網站上線流程會從原始檔重新打包，所以通常不用提交 `site-dist/`。

目前專案已經建立好 `.gitignore`，預設會忽略 `site-dist/`。

## 5. 建立第一個版本

加入所有需要管理的檔案：

```powershell
git add .
```

確認這次要提交的檔案：

```powershell
git status
```

建立提交：

```powershell
git commit -m "Initial website workflow"
```

檢查目前版本：

```powershell
git log --oneline -5
```

## 6. 連接遠端倉庫

如果你使用 GitHub，可以先在 GitHub 建立一個空白 repository，然後把遠端網址加進來：

```powershell
git remote add origin https://github.com/你的帳號/你的repo名稱.git
```

第一次推送：

```powershell
git branch -M main
git push -u origin main
```

之後更新網站時：

```powershell
git add .
git commit -m "Update website"
git push
```

## 7. 接上 Codex Sites 上線流程

目前這個資料夾已經有 Sites 設定：

```text
.openai/hosting.json
```

當 Git 可以正常使用後，就可以請 Codex 執行：

```text
上線這個網站
```

Codex 會接著：

1. 執行 `publish-site.ps1`
2. 確認測試通過
3. 推送目前網站原始碼
4. 取得 `commit_sha`
5. 儲存 Sites 版本
6. 部署正式網址
7. 檢查部署狀態

## 8. 日常更新流程

每次修改網站後，建議照這個順序：

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-site.ps1
git status
git add .
git commit -m "Update website"
git push
```

如果要上線，接著請 Codex：

```text
上線這個網站
```

## 9. 常見問題

如果 `git` 顯示找不到：

1. 確認 Git 已安裝
2. 關掉 PowerShell 重新打開
3. 重新執行 `git --version`
4. 若仍失敗，重新安裝 Git，並確認有選擇命令列可使用的選項

如果推送時要求登入：

1. 依照 GitHub 跳出的登入流程完成授權
2. 若使用密碼失敗，改用 GitHub Personal Access Token
3. 或改用 GitHub Desktop 先完成登入

如果不知道遠端倉庫網址：

```powershell
git remote -v
```

如果要查看目前有哪些檔案尚未提交：

```powershell
git status
```
