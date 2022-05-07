const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

const config = {
  title: 'Mixin JS SDK',
  tagline: 'Mixin JS SDK Documents',
  url: 'https://mixin-web.docs.mixinbots.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Mixin',
  projectName: '@mixin.dev/web',

  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['en', 'zh-CN'],
    localeConfigs: {
      'en': {
        label: 'English',
      },
      'zh-CN': {
        label: '简体中文',
      }
    }
  },
  themeConfig:
    ({
      navbar: {
        title: 'Mixin JS SDK',
        logo: {
          alt: 'Mixin JS SDK',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'server/test',
            position: 'left',
            label: 'Server',
          },
          {
            type: 'doc',
            docId: 'web/intro',
            position: 'left',
            label: 'Web',
          },
          {
            type: "localeDropdown",
            position: 'right',
          },
          {
            href: 'https://github.com/MixinNetwork/bot-api-js-client',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: '快速开始',
                to: '/docs/server/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Mixin Developers',
                href: 'https://developers.mixin.one',
              },
              {
                label: 'Mixin HomePage',
                href: 'https://mixin.one',
              },
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Mixin, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
}

module.exports = config
