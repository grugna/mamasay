// Prefixes root-relative links in Markdown (e.g. [Privacy](/privacy)) with the site's base path,
// so they work on GitHub Pages (/mamasay) as well as on a custom domain (/).
export default function rehypeBaseLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    if (!prefix) return;
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
          node.properties.href = prefix + href;
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
