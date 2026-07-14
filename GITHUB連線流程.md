# GitHub 連線流程

這份流程接在 `GIT建立流程.md` 後面使用。目標是把目前這個網站資料夾推送到 GitHub，之後才能更穩定地接上自動上線流程。

## 1. 登入 GitHub

開啟：

```text
https://github.com
```

登入你的 GitHub 帳號。

如果還沒有帳號，先註冊一個。

## 2. 建立新的 Repository

在 GitHub 右上角點：

```text
+  →  New repository
```

建議設定：

```text
Repository name: lottery-tools
Description: Free online lottery tools website
Visibility: Public 或 Private 都可以
```

重要：建立時先不要勾選這些選項：

```text
Add a README file
Add .gitignore
Choose a license
```

因為本機資料夾已經有檔案了，GitHub 那邊保持空白最乾淨。

建立完成後，GitHub 會顯示 repository 網址，格式大概像：

```text
https://github.com/js128815ai01/lottery-tools.git
```

## 3. 確認本機已經有第一個 commit

在 PowerShell 進入網站資料夾：

```powershell
cd "C:\Users\js128\OneDrive\Documents\課程工具"
```

查看狀態：

```powershell
git status
```

如果還沒 commit，先執行：

```powershell
git add .
git commit -m "Initial website workflow"
```

## 4. 連接 GitHub 遠端

這個專案使用的 GitHub repository：

```powershell
git remote add origin https://github.com/js128815ai01/lottery-tools.git
```

確認遠端設定：

```powershell
git remote -v
```

## 5. 第一次推送到 GitHub

設定主要分支名稱：

```powershell
git branch -M main
```

推送到 GitHub：

```powershell
git push -u origin main
```

如果 GitHub 跳出登入視窗，照畫面登入並授權。

## 6. 之後每次更新網站

每次修改網站後，照這個順序：

```powershell
powershell -ExecutionPolicy Bypass -File .\publish-site.ps1
git status
git add .
git commit -m "Update website"
git push
```

## 7. 常見狀況

### 顯示 remote origin already exists

代表你已經設定過 GitHub 遠端。可以先查看：

```powershell
git remote -v
```

如果網址錯了，改成新的：

```powershell
git remote set-url origin https://github.com/js128815ai01/lottery-tools.git
```

### 推送時要求密碼但失敗

GitHub 現在通常不接受帳號密碼直接推送。建議使用跳出的瀏覽器登入授權。

如果沒有跳出登入視窗，可以改用 GitHub Desktop 登入一次，或建立 GitHub Personal Access Token。

### 顯示 main 分支不存在

先確認有 commit：

```powershell
git log --oneline -5
```

如果沒有任何紀錄，先做第一次提交：

```powershell
git add .
git commit -m "Initial website workflow"
git branch -M main
git push -u origin main
```

## 8. 推送完成後

回到 GitHub repository 頁面，重新整理。如果看得到：

- `index.html`
- `styles.css`
- `script.js`
- `assets/`
- `.openai/hosting.json`

就代表 GitHub 連線成功。

接下來可以請 Codex：

```text
上線這個網站
```
