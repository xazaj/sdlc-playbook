// @ts-check
import { defineConfig } from 'astro/config';

// Project page on GitHub Pages: https://xazaj.github.io/sdlc-playbook
export default defineConfig({
  site: 'https://xazaj.github.io',
  base: '/sdlc-playbook',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    // Prompts are meant to be copied, not read as code: inline highlight
    // colours would fight the dark prompt block.
    syntaxHighlight: false,
  },
});
