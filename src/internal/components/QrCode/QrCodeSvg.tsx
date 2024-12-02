import { useEffect, useMemo, useState } from 'react';
// import { Animated, Easing } from 'react-native';
// import Svg, { Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
// import { curves, durations } from '@cbhq/cds-common/motion/tokens';

import {
  GRADIENT_END_COORDINATES,
  GRADIENT_START_COORDINATES,
} from './gradientConstants';
import { useLinearGradient } from './useLinearGradient';

import { useCorners } from './useCorners';
import { useDotsPath } from './useDotsPath';
import { useLogo } from './useLogo';
import { useMatrix } from './useMatrix';
import { usePresetGradientForColor } from './usePresetGradientForColor';

function coordinateAsPercentage(coordinate: number) {
  return `${coordinate * 100}%`;
}

export type QRCodeSVGProps = {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  logo?: { uri: string };
  logoSize?: number;
  logoBackgroundColor?: string;
  logoMargin?: number;
  logoBorderRadius?: number;
  quietZone?: number;
  quietZoneBorderRadius?: number;
  ecl?: 'L' | 'M' | 'Q' | 'H';
  isAsyncDataFetched?: boolean;
  gradientType?: 'radial' | 'linear';
};

// const A = {
//   RadialGradient: Animated.createAnimatedComponent(RadialGradient),
// };

export function QRCodeSVG({
  value,
  size = 100,
  color = 'black',
  backgroundColor = 'white',
  logo,
  logoSize = size * 0.2,
  logoBackgroundColor = 'transparent',
  logoMargin = 5,
  logoBorderRadius = 0,
  quietZone = 12,
  quietZoneBorderRadius = 8,
  ecl = 'Q',
  isAsyncDataFetched = true,
  gradientType = 'radial',
}: QRCodeSVGProps) {
  const { linearColors } = useLinearGradient();
  const isRadialGradient = gradientType === 'radial';
  const fillColor = isRadialGradient ? 'url(#radialGrad)' : 'black';
  const bgColor = isRadialGradient ? backgroundColor : `url(#${gradientType}Grad)`;
  const gradientRadiusMax = size * 0.55;
  const gradientRadiusMin = logoSize / 2;
  const gradientCenterPoint = size / 2;
  // const gradientAnim = useRef(
  //   new Animated.Value(isAsyncDataFetched ? gradientRadiusMax : gradientRadiusMin),
  // ).current;
  const [gradientRadius, setGradientRadius] = useState(
    isAsyncDataFetched ? gradientRadiusMax : gradientRadiusMin,
  );
  const presetGradientForColor = usePresetGradientForColor(color);
  const matrix = useMatrix(value, ecl);
  const corners = useCorners(size, matrix.length, bgColor, fillColor);
  const { x: x1, y: y1 } = GRADIENT_START_COORDINATES;
  const { x: x2, y: y2 } = GRADIENT_END_COORDINATES;

  const viewBox = useMemo(() => {
    return [-quietZone, -quietZone, size + quietZone * 2, size + quietZone * 2].join(' ');
  }, [quietZone, size]);

  const svgLogo = useLogo({
    size,
    logo,
    logoSize,
    logoBackgroundColor,
    logoMargin,
    logoBorderRadius,
  });

  const path = useDotsPath({
    matrix,
    size,
    logoSize,
    logoMargin,
    logoBorderRadius,
    hasLogo: !!logo,
  });

  // const growGradient = useCallback(() => {
  //   Animated.timing(gradientAnim, {
  //     toValue: gradientRadiusMax,
  //     duration: durations.slow4 * 2,
  //     useNativeDriver: false,
  //     easing: Easing.bezier(...curves.enterExpressive),
  //   }).start();
  // }, [gradientAnim, gradientRadiusMax]);

  useEffect(() => {
    if (isAsyncDataFetched && gradientRadius === gradientRadiusMin) {
      setGradientRadius(gradientRadiusMax);
    }
  }, [isAsyncDataFetched, gradientRadius, gradientRadiusMin, gradientRadiusMax]);

  console.log({ value, path, color, isRadialGradient, bgColor, fillColor });

  if (!path) {
    return null;
  }

  return (
    <svg viewBox={viewBox} width={size} height={size}>
      <title>QR Code</title>
      <defs>
        {isRadialGradient ? (
          <radialGradient
            id="radialGrad"
            rx={gradientRadius}
            ry={gradientRadius}
            cx={gradientCenterPoint}
            cy={gradientCenterPoint}
            gradientUnits="userSpaceOnUse"
          >
            {presetGradientForColor.map(([gradientColor, offset]) => (
              <stop
                key={`${gradientColor}${offset}`}
                offset={offset}
                stopColor={gradientColor}
                stopOpacity={1}
              />
            ))}
          </radialGradient>
        ) : (
          <linearGradient
            id="linearGrad"
            x1={coordinateAsPercentage(x1)}
            y1={coordinateAsPercentage(y1)}
            x2={coordinateAsPercentage(x2)}
            y2={coordinateAsPercentage(y2)}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={linearColors[0]} />
            <stop offset="1" stopColor={linearColors[1]} />
          </linearGradient>
        )}
      </defs>
      <g>
        <rect
          rx={quietZoneBorderRadius}
          ry={quietZoneBorderRadius}
          x={-quietZone}
          y={-quietZone}
          width={size + quietZone * 2}
          height={size + quietZone * 2}
          fill={bgColor}
        />
      </g>
      <g>
        <path
          d={path}
          fill={fillColor}
          strokeLinecap="butt"
          stroke={fillColor}
          strokeWidth={0}
        />
        {corners}
        {svgLogo}
      </g>
    </svg>
  );
}