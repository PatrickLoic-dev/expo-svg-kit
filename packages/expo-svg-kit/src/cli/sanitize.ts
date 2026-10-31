import type { INode } from 'svgson';

const DANGEROUS_TAGS = new Set(['script', 'foreignobject', 'iframe', 'style']);

function isExternalHref(value: string): boolean {
  return /^(https?:)?\/\//i.test(value.trim()) || value.trim().startsWith('javascript:');
}

/** Recursively strips <script>, on* handlers and external href/xlink:href references. */
export function sanitizeSvgTree(node: INode): INode {
  const children = (node.children ?? [])
    .filter((child) => !DANGEROUS_TAGS.has(child.name.toLowerCase()))
    .map((child) => sanitizeSvgTree(child));

  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node.attributes ?? {})) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.startsWith('on')) continue;
    if ((lowerKey === 'href' || lowerKey === 'xlink:href') && isExternalHref(value)) continue;
    attributes[key] = value;
  }

  return { ...node, attributes, children };
}
