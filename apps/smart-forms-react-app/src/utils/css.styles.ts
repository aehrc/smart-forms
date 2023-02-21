// @mui
import { alpha } from '@mui/material/styles';

export interface BgBlurProps {
  color?: string;
  blur?: number;
  opacity?: number;
  imgUrl?: string;
}

export interface BgBlurOutputProps {
  backdropFilter?: string;
  WebkitBackdropFilter?: string;
  backgroundColor?: string;
  position?: string;
  backgroundImage?: string;
  '&:before'?: {
    position?: string;
    top?: number;
    left?: number;
    zIndex?: number;
    content?: string;
    width?: string;
    height?: string;
    backdropFilter?: string;
    WebkitBackdropFilter?: string;
    backgroundColor?: string;
  };
}

export function bgBlur(props: BgBlurProps): BgBlurOutputProps {
  const color = props?.color || '#000000';
  const blur = props?.blur || 6;
  const opacity = props?.opacity || 0.8;
  const imgUrl = props?.imgUrl;

  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity)
      }
    };
  }

  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity)
  };
}
