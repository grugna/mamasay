// TinaCMS configuration. Only used by the *editor build* (see README: "Editing with TinaCMS").
// The public GitHub Pages build never imports this file.
//
// The schema below mirrors src/content/site.json, in the same top-to-bottom order as the page.
import { defineConfig } from 'tinacms';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.CF_PAGES_BRANCH || // Cloudflare Pages
  process.env.HEAD || // Netlify
  'main';

// ---- small helpers to keep the schema readable ----------------------------------------------
type Field = Record<string, any>;
const str = (name: string, label?: string, extra: Field = {}): Field => ({ type: 'string', name, label: label ?? name, ...extra });
const text = (name: string, label?: string, description?: string): Field => ({
  type: 'string', name, label: label ?? name, description, ui: { component: 'textarea' },
});
const list = (f: Field, extra: Field = {}): Field => ({ ...f, list: true, ...extra });
const obj = (name: string, label: string, fields: Field[], extra: Field = {}): Field => ({ type: 'object', name, label, fields, ...extra });
const image = (name = 'image', label = 'Image'): Field => ({ type: 'image', name, label });
const photo = (name: string, label: string): Field =>
  obj(name, label, [image(), str('alt', 'Photo description (for screen readers)')]);
const hex = (name: string, label: string): Field => str(name, label, { description: 'Hex color like #E1BED4' });
const FORMAT = 'Formatting: **bold**, *italic*';

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: 'images', publicFolder: 'public' } },

  schema: {
    collections: [
      {
        name: 'site',
        label: 'Website',
        path: 'src/content',
        format: 'json',
        match: { include: 'site' },
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/', // open the live page next to the form
        },
        fields: [
          obj('nav', 'Top menu labels', [
            str('how', 'How it works'),
            str('memories', 'Core memories'),
            str('firsts', 'Your firsts'),
            str('story', 'My story'),
          ]),
          obj('hero', 'Top of page (hero)', [
            str('badge', 'Small badge above headline'),
            str('headline1', 'Headline'),
            str('headline2', 'Headline (second line)'),
            text('lead', 'Intro sentence'),
            text('sub', 'Sub-line'),
            str('emailPlaceholder', 'Email box placeholder'),
            str('button', 'Sign-up button text'),
            list(str('perks', 'Three small perks under the form')),
            photo('photo', 'Hero photo'),
          ]),
          obj('today', '"Today" card on the hero photo', [
            str('title', 'Title'),
            str('morningLabel', 'Morning label'), str('morningText', 'Morning text'),
            str('eveningLabel', 'Evening label'), str('eveningText', 'Evening text'),
            str('memoryLabel', 'Memory label'), str('memoryText', 'Memory text'),
          ]),
          obj('how', 'How it works', [
            str('eyebrow', 'Small heading'),
            str('title', 'Title'),
            list(obj('steps', 'Steps (keep exactly 3)', [str('title', 'Title'), text('text', 'Text')]), {
              ui: { itemProps: (item: any) => ({ label: item?.title }) },
            }),
          ]),
          obj('memories', 'Core memories', [
            str('eyebrow', 'Small heading'),
            str('title', 'Title'),
            text('body', 'Paragraph', FORMAT),
            list(obj('items', 'Example memory cards', [
              str('date', 'Date'),
              str('text', 'Memory'),
              photo('photo', 'Photo (optional)'),
            ]), { ui: { itemProps: (item: any) => ({ label: item?.text }) } }),
          ]),
          obj('story', 'Founder story', [
            str('eyebrow', 'Small heading'),
            str('title', 'Title'),
            list(text('paragraphs', 'Story paragraphs', FORMAT)),
            str('signature', 'Sign-off', { description: 'The word "mamasays" gets the logo styling automatically' }),
            photo('photo', 'Photo'),
          ]),
          obj('blur', '"Beauty in the blur" section', [
            str('title', 'Title'),
            text('body1', 'Paragraph 1', `${FORMAT}, __big accent__`),
            text('body2', 'Paragraph 2', `${FORMAT}, __big accent__`),
            list(str('moments', 'Floating moments (best with 8-12)')),
          ]),
          obj('firsts', 'Your firsts', [
            str('eyebrow', 'Small heading'),
            str('titleA', 'Headline (regular)'),
            str('titleB', 'Headline (italic)'),
            text('body1', 'Paragraph 1'),
            text('body2', 'Paragraph 2', FORMAT),
            list(obj('pairs', 'Their first / your first', [str('hers', 'Hers'), str('yours', 'Yours')]), {
              ui: { itemProps: (item: any) => ({ label: item?.hers }) },
            }),
            str('cta', 'Button text'),
          ]),
          obj('night', 'Middle-of-the-night section', [
            str('eyebrow', 'Small heading'),
            str('title', 'Title'),
            text('body', 'Paragraph', FORMAT),
          ]),
          obj('name', 'Why "mamasays" (blue section)', [
            str('eyebrow', 'Small heading'),
            text('body1', 'Paragraph 1'),
            text('body2', 'Paragraph 2'),
            str('saidLabel', 'Left column heading'),
            list(str('said', 'What she said')),
            str('sayLabel', 'Right column heading'),
            list(str('say', 'What I say (after the "mamasays" logo)')),
            str('closing1', 'Closing line'),
            str('closing2', 'Closing line (italic)'),
          ]),
          obj('join', 'Sign-up section', [
            str('title', 'Title'),
            text('intro', 'Intro'),
            list(str('perks', 'Three perks')),
            str('nameLabel', 'First-name label'),
            str('emailLabel', 'Email label'),
            str('emailPlaceholder', 'Email placeholder'),
            str('button', 'Button text'),
          ]),
          obj('signup', 'Sign-up messages', [
            text('successMessage', 'After a successful sign-up'),
            text('errorMessage', 'If something goes wrong'),
          ]),
          obj('privacy', 'Privacy text (footer)', [
            str('title', 'Title'),
            list(text('paragraphs', 'Paragraphs', 'Links: [text](mailto:you@example.com)')),
          ]),
          obj('terms', 'Terms text (footer)', [
            str('title', 'Title'),
            list(text('paragraphs', 'Paragraphs')),
          ]),
          obj('footer', 'Footer', [
            str('copyright', 'Copyright line'),
            str('contactEmail', 'Contact email'),
            str('pauseLabel', 'Pause-animations label'),
            str('playLabel', 'Play-animations label'),
          ]),
          obj('consent', 'Cookie banner text (shown only in EU/UK/California)', [
            str('title', 'Title'), text('text', 'Text'),
            str('accept', 'Accept button'), str('decline', 'Decline button'),
            str('manageLabel', 'Footer "cookie preferences" link'),
          ]),
          obj('palette', 'Colors', [
            hex('highlight', 'Headline highlight'),
            hex('bandA', 'Top stripe 1'), hex('bandB', 'Top stripe 2'),
            hex('bandC', 'Bottom stripe 1'), hex('bandD', 'Bottom stripe 2'),
          ]),
          obj('settings', 'Page settings', [
            { type: 'boolean', name: 'showStory', label: 'Show the founder story' },
            str('motion', 'Animation speed', { options: ['calm', 'lively', 'still'] }),
          ]),
          obj('seo', 'Search & sharing', [
            str('title', 'Browser tab / Google title'),
            text('description', 'Google / social description'),
          ]),
          str('skipLabel', '"Skip to sign up" link (accessibility)'),
          obj('tracking', 'Tracking & integrations (ask a developer before changing)', [
            str('ga4MeasurementId', 'Google Analytics 4 Measurement ID (G-...)'),
            str('customerIoWritePublicKey', 'Customer.io public write key (pk_...)'),
            str('customerIoRegion', 'Customer.io data center', { options: ['us', 'eu'] }),
            list(str('consentCountries', 'Countries that see the cookie banner (2-letter codes)')),
            list(str('consentUsStates', 'US states that see the cookie banner (2-letter codes)')),
          ]),
        ],
      },
    ],
  },
});
