// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Panfactum Documentation',
  tagline: 'Documentation is cool',
  url: 'https://internal.panfactum.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'panfactum', // Usually your GitHub org/user name.
  projectName: 'panfactum', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'business',
        path: 'business',
        routeBasePath: 'business',
        sidebarPath: require.resolve('./sidebars.js'),
        remarkPlugins: [math],
        rehypePlugins: [katex]
      }
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'engineering',
        path: 'engineering',
        routeBasePath: 'engineering',
        sidebarPath: require.resolve('./sidebars.js'),
        remarkPlugins: [math],
        rehypePlugins: [katex],
      },
    ],

    // This is required to allow users to download
    // non-standard file extensions directly from the docs site
    () => ({
      configureWebpack() {
        return {
          module: {
            rules: [
              {
                test: /\.(socket|service|conf|rsc|exe)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {name: 'assets/files/[name].[ext]'},
                  },
                ],
              },
            ],
          },
        };
      },
    }),

    // This is required because the dev server websocket for HMR
    // does not respect the baseURL param
    () =>  ({
      name: "custom-ws-route",
      configureWebpack() {
        return {
          mergeStrategy: {"devServer.proxy": "replace"},
          devServer: {
            client: {
              webSocketURL: {
                hostname: '0.0.0.0',
                pathname: '/ws',
                port: 443,
                protocol: 'ws',
              },
            },
          },
        };
      }
    })
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Panfactum Documentation',
        items: [
          {
            to: '/business/overview',
            label: 'Business',
            position: 'left',
            activeBaseRegex: `/business/`,
          },
          {
            to: '/engineering/overview',
            label: 'Engineering',
            position: 'left',
            activeBaseRegex: `/engineering/`,
          }
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} Panfactum, LLC`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
