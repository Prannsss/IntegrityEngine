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
        <clipPath id="ie-clip-a">
          <rect x="0" y="0" width="315" height="567" />
        </clipPath>
        <clipPath id="ie-clip-b">
          <rect x="0" y="0" width="515" height="566" />
        </clipPath>
      </defs>

      {/* Left bar — I */}
      <g transform="matrix(1, 0, 0, 1, 10, 185)">
        <g clipPath="url(#ie-clip-a)">
          <g fill={color ?? 'currentColor'} fillOpacity="1">
            <g transform="translate(0.264711, 438.784182)">
              <path d="M 280.015625 -434.5 L 280.015625 0 L 33.515625 0 L 33.515625 -434.5 Z" />
            </g>
          </g>
        </g>
      </g>

      {/* Right section — E */}
      <g transform="matrix(1, 0, 0, 1, 285, 56)">
        <g clipPath="url(#ie-clip-b)">
          <g fill={color ?? 'currentColor'} fillOpacity="1">
            <g transform="translate(514.732691, 127.866562)">
              <path d="M -492.984375 433.484375 L -492.984375 270.28125 L -448.78125 303.15625 L -448.78125 141.65625 L -492.984375 177.359375 L -492.984375 0 L -36.828125 0 L -36.828125 433.484375 Z M -447.078125 304.859375 L -287.859375 424.40625 L -286.15625 424.40625 L -286.15625 219.296875 Z M -286.15625 9.0625 L -287.859375 9.0625 L -448.78125 139.953125 L -286.15625 214.1875 Z" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
