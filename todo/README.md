# Todo App

Firebase Realtime Database를 사용하는 할 일 관리 애플리케이션입니다.

## ⚠️ 왜 파일을 직접 열면 안 되나요?

### CORS 정책 오류

현재 코드는 ES6 모듈 시스템(`import`/`export`)을 사용하고 있습니다:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "...";
```

**문제점:**
1. **브라우저 보안 정책 (CORS)**
   - ES6 모듈은 `file://` 프로토콜(파일을 직접 열기)에서 차단됩니다
   - 크로스 오리진 요청은 `http://` 또는 `https://` 프로토콜에서만 허용됩니다
   - 이는 브라우저의 보안 기능으로, 악성 코드 실행을 방지하기 위함입니다

2. **에러 메시지**
   ```
   Access to script at 'file:///E:/vibe_coding/todo/js/script.js' 
   from origin 'null' has been blocked by CORS policy
   ```

### 해결 방법

**옵션 1: 모듈 시스템 제거 (간단한 방법)**
- `import` 문을 제거하고 `<script>` 태그로 직접 Firebase SDK를 로드
- 이 경우 `file://` 프로토콜에서도 작동 가능

**옵션 2: 웹 서버 사용 (권장)**
- HTTP 프로토콜을 통해 파일을 제공
- 예: Live Server 확장, Python의 `http.server`, Node.js의 `http-server` 등
- 프로덕션 환경과 유사한 환경에서 테스트 가능

## 주요 기능

- ✅ 할 일 추가
- ✅ 할 일 완료 표시
- ✅ 할 일 수정 (완료된 항목 제외)
- ✅ 할 일 삭제
- ✅ Firebase Realtime Database 실시간 동기화

## 기술 스택

- HTML/CSS/JavaScript (Vanilla)
- Firebase Realtime Database
