/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Global fallback for html2pdf.js to resolve duplicate identifiers
declare module 'html2pdf.js';