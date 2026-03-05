import { cn } from '@/lib/utils';

interface IELogoProps {
  className?: string;
  /** Color of the logo paths. Defaults to currentColor so parent text-color applies. */
  color?: string;
}

/**
 * IntegrityEngine "IE" mark — extracted from IE.svg.
 * Drop it inside any sized container; use `className` for sizing (e.g. "w-6 h-6").
 */
export function IELogo({ className, color }: IELogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 810 810"
      className={cn('w-9 h-9', className)}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="ie-clip">
          <rect x="0" y="0" width="810" height="810" />
        </clipPath>
      </defs>
      <g clipPath="url(#ie-clip)">
        <g fill={color ?? 'currentColor'}>
          <g transform="matrix(1, 0, 0, 1, 55, 0)">
            <g transform="translate(1.118055, 659.61482)">
              <path d="M 56.734375 -472.828125 L 356.640625 -472.828125 L 356.640625 -420.140625 L 235.0625 -420.140625 L 235.0625 -52.6875 L 356.640625 -52.6875 L 356.640625 0 L 56.734375 0 L 56.734375 -52.6875 L 178.328125 -52.6875 L 178.328125 -420.140625 L 56.734375 -420.140625 Z M 56.734375 -472.828125 " />
            </g>
            <g transform="translate(285.484391, 659.61482)">
              <path d="M 63.5 -472.828125 L 349.890625 -472.828125 L 349.890625 -420.140625 L 120.234375 -420.140625 L 120.234375 -263.4375 L 345.84375 -263.4375 L 345.84375 -210.75 L 120.234375 -210.75 L 120.234375 -52.6875 L 353.953125 -52.6875 L 353.953125 0 L 63.5 0 Z M 63.5 -472.828125 " />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
