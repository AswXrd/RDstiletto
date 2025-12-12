/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}", // 여기가 중요합니다: app 폴더를 바라보게 설정
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: "#0a0a0a",
          surface: "#1a1a1a",
          primary: "#10b981",
        }
      },
    },
    plugins: [],
  }