import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, basename } from 'path';

dotenv.config();

// Get detailed git info with fallbacks
const getGitInfo = () => {
  try {
    return {
      commitHash: execSync('git rev-parse --short HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
      commitTime: execSync('git log -1 --format=%cd').toString().trim(),
      author: execSync('git log -1 --format=%an').toString().trim(),
      email: execSync('git log -1 --format=%ae').toString().trim(),
      remoteUrl: execSync('git config --get remote.origin.url').toString().trim(),
      repoName: execSync('git config --get remote.origin.url')
        .toString()
        .trim()
        .replace(/^.*github.com[:/]/, '')
        .replace(/\.git$/, ''),
    };
  } catch {
    return {
      commitHash: 'no-git-info',
      branch: 'unknown',
      commitTime: 'unknown',
      author: 'unknown',
      email: 'unknown',
      remoteUrl: 'unknown',
      repoName: 'unknown',
    };
  }
};

// Read package.json with detailed dependency info
const getPackageJson = () => {
  try {
    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    return {
      name: pkg.name,
      description: pkg.description,
      license: pkg.license,
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      peerDependencies: pkg.peerDependencies || {},
      optionalDependencies: pkg.optionalDependencies || {},
    };
  } catch {
    return {
      name: 'bolt.diy',
      description: 'A DIY LLM interface',
      license: 'MIT',
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
      optionalDependencies: {},
    };
  }
};

const pkg = getPackageJson();
const gitInfo = getGitInfo();

export default defineConfig((config) => {
  return {
    define: {
      __COMMIT_HASH: JSON.stringify(gitInfo.commitHash),
      __GIT_BRANCH: JSON.stringify(gitInfo.branch),
      __GIT_COMMIT_TIME: JSON.stringify(gitInfo.commitTime),
      __GIT_AUTHOR: JSON.stringify(gitInfo.author),
      __GIT_EMAIL: JSON.stringify(gitInfo.email),
      __GIT_REMOTE_URL: JSON.stringify(gitInfo.remoteUrl),
      __GIT_REPO_NAME: JSON.stringify(gitInfo.repoName),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),
      __PKG_NAME: JSON.stringify(pkg.name),
      __PKG_DESCRIPTION: JSON.stringify(pkg.description),
      __PKG_LICENSE: JSON.stringify(pkg.license),
      __PKG_DEPENDENCIES: JSON.stringify(pkg.dependencies),
      __PKG_DEV_DEPENDENCIES: JSON.stringify(pkg.devDependencies),
      __PKG_PEER_DEPENDENCIES: JSON.stringify(pkg.peerDependencies),
      __PKG_OPTIONAL_DEPENDENCIES: JSON.stringify(pkg.optionalDependencies),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          format: 'esm',
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-remix': ['@remix-run/react', '@remix-run/node'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip', '@radix-ui/react-tabs', '@radix-ui/react-popover', '@radix-ui/react-scroll-area', '@radix-ui/react-separator', '@radix-ui/react-switch', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-collapsible', '@radix-ui/react-checkbox', '@radix-ui/react-context-menu'],
            'vendor-codemirror': ['@codemirror/view', '@codemirror/state', '@codemirror/language', '@codemirror/autocomplete', '@codemirror/commands', '@codemirror/search', '@lezer/highlight'],
            'vendor-ai': ['ai', '@ai-sdk/anthropic', '@ai-sdk/openai', '@ai-sdk/google', '@ai-sdk/mistral', '@ai-sdk/cohere', '@ai-sdk/deepseek', '@ai-sdk/amazon-bedrock', '@openrouter/ai-sdk-provider', 'ollama-ai-provider'],
            'vendor-utils': ['zustand', 'nanostores', '@nanostores/react', 'clsx', 'tailwind-merge', 'date-fns', 'diff', 'zod'],
            'vendor-icons': ['lucide-react', '@heroicons/react', '@phosphor-icons/react', 'react-icons'],
            'vendor-webcontainer': ['@webcontainer/api'],
            'vendor-terminal': ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
            'vendor-motion': ['framer-motion'],
            'vendor-dnd': ['react-dnd', 'react-dnd-html5-backend', '@tanstack/react-virtual', 'react-window', 'react-beautiful-dnd'],
            'vendor-markdown': ['react-markdown', 'rehype-raw', 'rehype-sanitize', 'remark-gfm', 'shiki'],
            'vendor-other': ['@octokit/rest', '@octokit/types', 'isomorphic-git', 'jszip', 'file-saver', 'chart.js', 'react-chartjs-2', 'jspdf', 'react-qrcode-logo', 'react-resizable-panels', 'react-toastify', 'use-debounce', 'jose', 'mime', 'ignore'],
          },
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules\/@octokit\/types/, /node_modules\/istextorbinary/],
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
      include: ['@octokit/types', 'istextorbinary', 'path-browserify', 'react', 'react-dom', 'react/jsx-runtime'],
    },
    resolve: {
      alias: {
        buffer: 'vite-plugin-node-polyfills/polyfills/buffer',
        path: 'path-browserify',
        cookie: '/cookie-shim',
        'set-cookie-parser': '/set-cookie-parser-shim',
        react: '/react-shim',
      },
    },
    plugins: [
      nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream'],
        globals: {
          Buffer: true,
          process: true,
          global: true,
        },
        protocolImports: true,
        exclude: ['child_process', 'fs', 'path'],
      }),
      {
        name: 'path-basename-polyfill',
        resolveId(source) {
          if (source === 'path' || source === 'path-browserify') {
            return { id: 'path-browserify', external: false };
          }
          return null;
        },
      },
      {
        name: 'buffer-polyfill',
        transform(code, id) {
          if (id.includes('env.mjs')) {
            return {
              code: `import { Buffer } from 'buffer';\n${code}`,
              map: null,
            };
          }

          return null;
        },
      },
      {
        name: 'cookie-shim',
        resolveId(source) {
          if (source === 'cookie' || source === '/cookie-shim') {
            return { id: '/cookie-shim', external: false };
          }
          return null;
        },
        load(id) {
          if (id === '/cookie-shim') {
            return `
              // cookie@0.5+ removed parse, add it back
              const parse = (str, options) => {
                if (typeof str !== 'string') return {};
                const obj = {};
                const pairs = str.split(/; */);
                for (const pair of pairs) {
                  const eqIdx = pair.indexOf('=');
                  if (eqIdx < 0) continue;
                  const key = pair.slice(0, eqIdx).trim();
                  let val = pair.slice(eqIdx + 1).trim();
                  if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                  }
                  if (key) obj[key] = decodeURIComponent(val);
                }
                return obj;
              };
              const serialize = (name, val, options) => {
                const opt = options || {};
                const pairs = [name + '=' + encodeURIComponent(val)];
                if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
                if (opt.domain) pairs.push('Domain=' + opt.domain);
                if (opt.path) pairs.push('Path=' + opt.path);
                if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
                if (opt.httpOnly) pairs.push('HttpOnly');
                if (opt.secure) pairs.push('Secure');
                if (opt.sameSite) pairs.push('SameSite=' + opt.sameSite);
                return pairs.join('; ');
              };
              export { parse, serialize };
            `;
          }
          return null;
        },
      },
      {
        name: 'set-cookie-parser-shim',
        resolveId(source) {
          if (source === 'set-cookie-parser' || source === '/set-cookie-parser-shim') {
            return { id: '/set-cookie-parser-shim', external: false };
          }
          return null;
        },
        load(id) {
          if (id === '/set-cookie-parser-shim') {
            return `
              // set-cookie-parser@2.7+ removed splitCookiesString, add it back
              const splitCookiesString = (str) => {
                if (typeof str !== 'string') return [];
                return str.split(',').map(s => s.trim());
              };
              const parse = (str, options) => {
                if (typeof str !== 'string') return [];
                const cookies = str.split(';').map(s => s.trim());
                return cookies.map(cookie => {
                  const [name, ...valueParts] = cookie.split('=');
                  const value = valueParts.join('=');
                  const result = { name: name.trim(), value: value.trim() };
                  if (options?.map) {
                    return options.map(result);
                  }
                  return result;
                });
              };
              export { parse, splitCookiesString };
            `;
          }
          return null;
        },
      },
      {
        name: 'react-shim',
        resolveId(source) {
          if (source === 'react' || source === '/react-shim') {
            return { id: '/react-shim', external: false };
          }
          return null;
        },
        load(id) {
          if (id === '/react-shim') {
            return `
              import * as React from 'react';
              import { 
                startTransition, 
                useId, 
                useSyncExternalStore, 
                useInsertionEffect, 
                useDeferredValue,
                useOptimistic,
                useActionState
              } from 'react';
              export const createElement = React.createElement;
              export const Fragment = React.Fragment;
              export const useState = React.useState;
              export const useEffect = React.useEffect;
              export const useLayoutEffect = React.useLayoutEffect;
              export const useRef = React.useRef;
              export const useCallback = React.useCallback;
              export const useMemo = React.useMemo;
              export const useContext = React.useContext;
              export const useReducer = React.useReducer;
              export const useImperativeHandle = React.useImperativeHandle;
              export const useDebugValue = React.useDebugValue;
              export const useTransition = React.useTransition;
              export const useSyncExternalStore = React.useSyncExternalStore || useSyncExternalStore;
              export const useInsertionEffect = React.useInsertionEffect || useInsertionEffect;
              export const useDeferredValue = React.useDeferredValue || useDeferredValue;
              export const useOptimistic = React.useOptimistic || useOptimistic;
              export const useActionState = React.useActionState || useActionState;
              export const startTransition = startTransition;
              export const useId = useId;
              export const useSyncExternalStore = useSyncExternalStore;
              export const useInsertionEffect = useInsertionEffect;
              export const useDeferredValue = useDeferredValue;
              export const useOptimistic = useOptimistic;
              export const useActionState = useActionState;
              export const version = React.version;
              export const Children = React.Children;
              export const isValidElement = React.isValidElement;
              export const cloneElement = React.cloneElement;
              export const createFactory = React.createFactory;
              export const createRef = React.createRef;
              export const forwardRef = React.forwardRef;
              export const memo = React.memo;
              export const lazy = React.lazy;
              export const Suspense = React.Suspense;
              export const Profiler = React.Profiler;
              export const StrictMode = React.StrictMode;
              export const unstable_act = React.unstable_act;
              export const unstable_useCacheRefresh = React.unstable_useCacheRefresh;
              export const unstable_useMemoCache = React.unstable_useMemoCache;
            `;
          }
          return null;
        },
      },
      config.mode !== 'test' && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      chrome129IssuePlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
    envPrefix: [
      'VITE_',
      'OPENAI_LIKE_API_BASE_URL',
      'OLLAMA_API_BASE_URL',
      'LMSTUDIO_API_BASE_URL',
      'TOGETHER_API_BASE_URL',
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  };
});

function chrome129IssuePlugin() {
  return {
    name: 'chrome129IssuePlugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);

        if (raw) {
          const version = parseInt(raw[2], 10);

          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end(
              '<body><h1>Please use Chrome Canary for testing.</h1><p>Chrome 129 has an issue with JavaScript modules & Vite local development, see <a href="https://github.com/stackblitz/bolt.new/issues/86#issuecomment-2395519258">for more information.</a></p><p><b>Note:</b> This only impacts <u>local development</u>. `pnpm run build` and `pnpm run start` will work fine in this browser.</p></body>',
            );

            return;
          }
        }

        next();
      });
    },
  };
}