/** @type {import('tailwindcss').Config} */
export default {
    content: ["./login.html"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "brand-bg": "#292635",
                "brand-input": "#383546",
                "brand-border": "#474358",
                "brand-primary": "#755cb4",
                "brand-primary-hover": "#634aa1",
                "brand-text": "#f3f2f5",
                "brand-muted": "#9ca3af",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                "btn": "0.5rem",
                "input": "0.5rem"
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
