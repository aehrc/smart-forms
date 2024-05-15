import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as path from 'path';

const config: Config = {
  title: 'Smart Forms',
  tagline: 'FHIR Questionnaire Form Renderer',
  favicon: 'img/logo-sf.svg',

  // Set the production url of your site here
  url: 'https://aehrc.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/smart-forms/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'aehrc', // Usually your GitHub org/user name.
  projectName: 'smart-forms', // Usually your repo name.\
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/aehrc/smart-forms/'
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
      title: 'Smart Forms',
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
          sidebarId: 'devUsageSidebar',
          position: 'left',
          label: 'Developer Usage'
        },
        {
          href: 'https://smartforms.csiro.au/ig/',
          label: 'FHIR IG',
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
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  } satisfies Preset.ThemeConfig,

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
    })
  ]
};

export default config;
