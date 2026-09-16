
### 1. Lệnh build bản Release (Phát hành chính thức)
```powershell
.\android\gradlew.bat -p android assembleRelease
```
*File APK đầu ra:* `android/app/build/outputs/apk/release/app-release-unsigned.apk` (hoặc `app-release.apk`)

---

### 2. Lệnh build bản Debug (Chạy server Dev Railway)
```powershell
.\android\gradlew.bat -p android assembleDebug
```
*File APK đầu ra:* `android/app/build/outputs/apk/debug/app-debug.apk`

---