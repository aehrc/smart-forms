import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from 'path';

const config: Config = {
  title: 'Smart Forms',
  tagline: 'FHIR Questionnaire Form Renderer',
  favicon: 'img/logo-sf.svg',

  // Set the production url of your site here
  url: 'https://smartforms.csiro.au',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: '', // Usually your GitHub org/user name.
  projectName: '', // Usually your repo name.\

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'throw',

  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      {
        docs: {
          showLastUpdateTime: true,
          routeBasePath: '/',
          sidebarPath: './sidebars.ts'
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/aehrc/smart-forms/'
        },
        theme: {
          customCss: './src/css/custom.css'
        },
        sitemap: {}
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo-sf.svg',
    navbar: {
      logo: {
        alt: 'Smart Forms',
        src: 'img/logo-sf.svg',
        href: 'https://smartforms.csiro.au'
      },
      items: [
        {
          type: 'doc',
          position: 'left',
          docId: 'index',
          label: 'Overview'
        },
        {
          type: 'docSidebar',
          sidebarId: 'componentsSidebar',
          position: 'left',
          label: 'Components'
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdcSidebar',
          position: 'left',
          label: 'SDC'
        },
        {
          type: 'docSidebar',
          sidebarId: 'devSidebar',
          position: 'left',
          label: 'Developer Usage'
        },
        {
          type: 'docSidebar',
          sidebarId: 'operationsSidebar',
          position: 'left',
          label: 'FHIR Operations'
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API'
        },
        {
          href: 'https://smartforms.csiro.au/ig/',
          label: 'FHIR IG',
          position: 'right'
        },
        {
          href: 'https://smartforms.csiro.au/storybook/',
          label: 'Storybook',
          position: 'right'
        },
        {
          href: 'https://github.com/aehrc/smart-forms',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      links: [
        {
          title: 'Tools',
          items: [
            {
              label: 'App Dashboard',
              href: 'https://smartforms.csiro.au/'
            },
            {
              label: 'Playground',
              href: 'https://smartforms.csiro.au/playground'
            },
            {
              label: 'Storybook',
              href: 'https://smartforms.csiro.au/storybook/'
            },
            {
              label: 'Forms Server FHIR API',
              href: 'https://smartforms.csiro.au/api/fhir/Questionnaire'
            }
          ]
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'FHIR Implementation Guide',
              to: 'https://smartforms.csiro.au/ig/'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Commonwealth Scientific and Industrial Research
  - Organisation (CSIRO).`
    },
    // Refer to https://docusaurus.io/docs/search#connecting-algolia
    algolia: {
      // The application ID provided by Algolia
      appId: 'SL7YXI16RH',

      // Public API key: it is safe to commit it
      apiKey: 'a4c401a7bac65bc81b7dd7efe958b951',

      indexName: 'smartforms-csiro',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  } satisfies Preset.ThemeConfig,

  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    () => ({
      name: 'resolve-react',
      configureWebpack() {
        return {
          resolve: {
            alias: {
              // assuming root node_modules is up from "./packages/<your-docusaurus>
              react: path.resolve('../node_modules/react')
            }
          }
        };
      }
    }),
    [
      'docusaurus-plugin-typedoc',
      // Options
      {
        id: 'smart-forms-renderer',
        entryPoints: '../packages/smart-forms-renderer/src/index.ts',
        tsconfig: '../packages/smart-forms-renderer/tsconfig.json',
        out: 'docs/api/smart-forms-renderer',
        excludeTags: ['@author'],
        sidebar: {
          autoConfiguration: true,
          pretty: true
        },
        plugin: ['typedoc-plugin-frontmatter'],
        indexFormat: 'table',
        disableSources: true,
        parametersFormat: 'table',
        enumMembersFormat: 'table',
        readme: 'none'
      }
    ],
    [
      'docusaurus-plugin-typedoc',
      // Options
      {
        id: 'sdc-populate',
        entryPoints: '../packages/sdc-populate/src/index.ts',
        tsconfig: '../packages/sdc-populate/tsconfig.json',
        out: 'docs/api/sdc-populate',
        excludeTags: ['@author'],
        sidebar: {
          autoConfiguration: true,
          pretty: true
        },
        plugin: ['typedoc-plugin-frontmatter'],
        indexFormat: 'table',
        disableSources: true,
        parametersFormat: 'table',
        enumMembersFormat: 'table',
        readme: 'none'
      }
    ],
    [
      'docusaurus-plugin-typedoc',
      // Options
      {
        id: 'sdc-assemble',
        entryPoints: '../packages/sdc-assemble/src/index.ts',
        tsconfig: '../packages/sdc-assemble/tsconfig.json',
        out: 'docs/api/sdc-assemble',
        excludeTags: ['@author'],
        sidebar: {
          autoConfiguration: true,
          pretty: true
        },
        plugin: ['typedoc-plugin-frontmatter'],
        indexFormat: 'table',
        disableSources: true,
        parametersFormat: 'table',
        enumMembersFormat: 'table',
        readme: 'none'
      }
    ]
  ]
};

export default config;
