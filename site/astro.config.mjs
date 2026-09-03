// @ts-check
import { defineConfig } from 'astro/config';

// Served under the repository path of an account-wide Pages custom domain:
// https://aibrev.com/sdlc-playbook. The domain is set in the account's Pages
// settings, not on this repository, so no CNAME file ships with the build.
export default defineConfig({
  site: 'https://aibrev.com',
  base: '/sdlc-playbook',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  markdown: {
    // Prompts are meant to be copied, not read as code: inline highlight
    // colours would fight the dark prompt block.
    syntaxHighlight: false,
  },
});
