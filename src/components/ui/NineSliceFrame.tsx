import goldPanelTexture from './assets/panel-skin-gold.webp';

const SLICES = [
  'tl',
  't',
  'tr',
  'l',
  'c',
  'r',
  'bl',
  'b',
  'br',
] as const;

export interface NineSliceFrameProps {
  className?: string;
  texture?: string;
}

/**
 * Seam-safe gold frame rendered as nine explicit regions.
 *
 * The regions intentionally overlap through --opfg-nine-slice-overlap so
 * Chromium never has to rasterize two independently stretched regions edge
 * to edge. All nine regions use the same source texture.
 */
export function NineSliceFrame({
  className,
  texture = goldPanelTexture,
}: NineSliceFrameProps) {
  const rootClassName = className
    ? `opfg-nine-slice ${className}`
    : 'opfg-nine-slice';

  return (
    <span aria-hidden="true" className={rootClassName}>
      {SLICES.map((slice) => (
        <span
          key={slice}
          className="opfg-nine-slice__slice"
          data-slice={slice}
        >
          <img
            alt=""
            draggable={false}
            src={texture}
          />
        </span>
      ))}
    </span>
  );
}
