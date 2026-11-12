// Tiny, safe inline formatting for text typed into the CMS.
//   **bold**   *italic*   __display accent__   [link text](mailto:x@y.com or https://...)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function inline(text: string): string {
  let h = esc(text);
  h = h.replace(/\[([^\]]+)\]\((mailto:[^)\s]+|https?:\/\/[^)\s]+|#[\w-]+)\)/g, '<a href="$2">$1</a>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 700">$1</strong>');
  h = h.replace(
    /__(.+?)__/g,
    `<strong style="font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 1.3em; font-weight: 600; color: #4E2B22">$1</strong>`,
  );
  h = h.replace(/\*(?!\s)(.+?)\*/g, '<em>$1</em>');
  return h;
}

// The founder sign-off shows the "mamasays" wordmark treatment.
export function signature(text: string): string {
  return esc(text).replace(
    'mamasays',
    '<span style="font-style: normal; font-weight: 700">mama</span>says',
  );
}
