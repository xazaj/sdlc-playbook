// @ts-check
import { defineConfig } from 'astro/config';

// Served at the root of the custom domain bound to this repository.
// Changing the domain means changing `site` here and the Pages setting together.
export default defineConfig({
  site: 'https://aibrev.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    // Prompts are meant to be copied, not read as code: inline highlight
    // colours would fight the dark prompt block.
    syntaxHighlight: false,
  },
});
