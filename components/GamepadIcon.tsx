import React from 'react';

export default function GamepadIcon({
  className = '',
  width = 48,
  height = 48,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={width}
      height={height}
      className={className}
      {...props}
    >
      <defs>
        {/* Main symmetrical controller body path */}
        <path
          id="controller-body"
          d="M 160 80
             C 70 80, 26 140, 26 238
             C 26 336, 70 410, 160 420
             C 205 425, 230 365, 256 365
             C 282 365, 307 425, 352 420
             C 442 410, 486 336, 486 238
             C 486 140, 442 80, 352 80
             C 307 80, 282 135, 256 135
             C 230 135, 205 80, 160 80 Z"
        />
      </defs>

      {/* Wrapper to perfectly center the entire graphic (including offset shadow) */}
      <g transform="translate(5, -1)">
        
        {/* Darker shadow layer (shifted left and down) */}
        <use
          href="#controller-body"
          fill="#E02E4C"
          transform="translate(-10, 14)"
        />

        {/* Main top pink layer */}
        <use href="#controller-body" fill="#FF4B6A" />

        {/* D-Pad (Left Side) */}
        <g fill="#FFFFFF">
          <rect x="91" y="219" width="88" height="38" rx="19" />
          <rect x="116" y="194" width="38" height="88" rx="19" />
        </g>

        {/* Action Buttons (Right Side) */}
        <g fill="#FFFFFF">
          <circle cx="352" cy="208" r="28" />
          <circle cx="402" cy="268" r="28" />
        </g>
        
      </g>
    </svg>
  );
}
