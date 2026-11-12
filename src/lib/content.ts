// Loads the site content.
//  - Public (GitHub Pages) build: reads src/content/site.json directly. `tf` returns nothing,
//    so the HTML is identical to a site with no CMS.
//  - Editor build (TINA_EDITOR=true): reads through TinaCMS so elements carry `data-tina-field`
//    attributes, which is what makes click-to-edit in the visual editor work.
import raw from '../content/site.json';

declare const __TINA_EDITOR__: boolean;

type Site = typeof raw;
type TinaFieldFn = (obj: unknown, prop?: string, index?: number) => string | undefined;

export async function getSite(): Promise<{ data: Site; tf: TinaFieldFn }> {
  if (!__TINA_EDITOR__) return { data: raw, tf: () => undefined };

  const { requestWithMetadata, tinaField } = await import('@tinacms/astro');
  const client = (await import('@tina-client')).default as any;
  const res = await requestWithMetadata(client.queries.site({ relativePath: 'site.json' }));
  return { data: (res as any).data.site as Site, tf: tinaField as TinaFieldFn };
}
