/** A single node of the lightweight SVG tree produced by the CLI. */
export interface SvgNode {
  tag: string;
  props: Record<string, string>;
  children: SvgNode[];
  /** Precomputed total length of a <path>/<line>/<circle>/... "d" geometry, used by future animations. */
  pathLength?: number;
}

/** One compiled icon: the root tag's viewBox plus its node tree. */
export interface IconDefinition {
  viewBox: string;
  multicolor: boolean;
  tree: SvgNode[];
}

/** Shape of the generated svg-registry.ts default export. */
export type IconRegistry = Record<string, IconDefinition>;

/** User-facing theme: named color tokens an <Icon color="primary" /> can reference. */
export type SvgKitTheme = Record<string, string>;

export interface SvgKitConfig {
  input?: string;
  output?: string;
  /** SVGO options passed through, merged over the kit's defaults. */
  svgo?: Record<string, unknown>;
}
