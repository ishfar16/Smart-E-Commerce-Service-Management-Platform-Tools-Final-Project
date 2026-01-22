import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        coffee: {
          primary: "#A67C58",
          secondary: "#807666",
          accent: "#20161F",
          neutral: "#3d4451",
          "base-100": "#ffffff",
          "base-200": "#f5f5f5",
          "base-300": "#e5e5e5",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
  },
};
