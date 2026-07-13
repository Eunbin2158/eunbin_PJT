# 은빈의 방 MPA 분리본

## 폴더 구조

```text
.
├── index.html
├── about.html
├── english.html
└── assets
    ├── css
    │   └── style.css
    └── js
        └── main.js
```

## 실행

`index.html`을 브라우저에서 직접 열거나, VS Code Live Server 같은 정적 웹 서버로 실행합니다.

- Home: `index.html`
- About Me: `about.html`
- English: `english.html`

## 분리 원칙

- 원본 `<style>` 내부 CSS를 `assets/css/style.css`로 그대로 이동했습니다.
- 원본 JavaScript는 `assets/js/main.js`로 이동했습니다.
- 중복 실행을 막기 위해 원본 `window.onload`만 제거하고, 각 HTML 하단에서 필요한 함수만 한 번 호출합니다.
- SPA 화면 전환 함수 `switchPage()`만 MPA 파일 이동 방식으로 변경했습니다.
