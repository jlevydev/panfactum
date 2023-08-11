// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'panfactum',
  tagline: 'Know your worth.',
  favicon: 'img/pan.svg',

  // Set the production url of your site here
  url: 'https://panfactum.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'panfactum (Alpha Launch Soon)',
        logo: {
          alt: 'panfactum Logo',
          src: 'img/pan.svg',
        },
        items: [],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Legal',
            items: [
              {
                label: 'Terms of Service',
                to: '/docs/tos',
              },
              {
                label: 'Privacy Policy',
                to: '/docs/privacy',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} panfactum LLC.`,
      },
    }),
  plugins: [
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
  ]
};

module.exports = config;
