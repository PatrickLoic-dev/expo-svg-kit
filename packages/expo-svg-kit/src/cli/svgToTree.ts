import type { INode } from 'svgson';
import type { IconDefinition, SvgNode } from '../types';
import { computePathLength } from './pathLength';

const COLOR_ATTRS = ['fill', 'stroke'];
const KEEP_AS_IS = new Set(['none', 'transparent', 'currentcolor']);

function recolor(attributes: Record<string, string>): Record<string, string> {
  const result = { ...attributes };
  for (const attr of COLOR_ATTRS) {
    const value = result[attr];
    if (value && !KEEP_AS_IS.has(value.toLowerCase())) {
      result[attr] = 'currentColor';
    }
  }
  return result;
}

function toSvgNode(node: INode, recolorFills: boolean): SvgNode {
  const attributes = recolorFills ? recolor(node.attributes) : { ...node.attributes };
  return {
    tag: node.name,
    props: attributes,
    children: (node.children ?? []).map((child) => toSvgNode(child, recolorFills)),
    pathLength: computePathLength(node.name, node.attributes),
  };
}

/** Converts a sanitized svgson root <svg> node into the compiled IconDefinition. */
export function svgTreeToIconDefinition(root: INode, multicolor: boolean): IconDefinition {
  const viewBox = root.attributes.viewBox ?? '0 0 24 24';
  const tree = (root.children ?? []).map((child) => toSvgNode(child, !multicolor));
  return { viewBox, multicolor, tree };
}
