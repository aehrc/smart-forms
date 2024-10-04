/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modified from:
 * GitHub: https://github.com/davidjbradshaw/iframe-resizer/tree/v4
 * Author: David J. Bradshaw - info@iframe-resizer.com
 * License: MIT
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { IframeHTMLAttributes } from 'react';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import iframeResizer from './iframeResizerParent';

interface IframeResizerProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  autoResize?: boolean;
  bodyBackground?: string | null;
  bodyMargin?: number | null;
  bodyPadding?: number | null;
  checkOrigin?: boolean;
  inPageLinks?: boolean;
  heightCalculationMethod?: string;
  sizeHeight?: boolean;
  sizeWidth?: boolean;
  warningTimeout?: number;
  tolerance?: number;
  widthCalculationMethod?: string;
  onClosed?: () => void;
  onInit?: () => void;
  onMessage?: (message: any) => void;
  onResized?: (message: any) => void;
}

function IframeResizer(props: IframeResizerProps & { forwardRef?: any }) {
  // eslint-disable-next-line react/prop-types
  const { forwardRef, ...rest } = props;
  const filteredProps = filterIframeAttribs(props);
  const iframeRef = useRef(null);

  const onClose = () => {
    return false;
  };

  // This hook is only run once, as once iframe-resizer is bound, it will
  // deal with changes to the element and does not need recalling
  useEffect(() => {
    const iframe = iframeRef.current;
    const resizer = iframeResizer({ ...rest, onClose })(iframe);
    return () => resizer?.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(forwardRef, () => ({
    resize: () => iframeRef.current.iframeResizer.resize(),
    moveToAnchor: (anchor) => iframeRef.current.iframeResizer.moveToAnchor(anchor),
    sendMessage: (message, targetOrigin) => {
      iframeRef.current.iframeResizer.sendMessage(message, targetOrigin);
    }
  }));

  return <iframe {...filteredProps} ref={iframeRef} />;
}

function filterIframeAttribs(props: IframeResizerProps) {
  const {
    autoResize,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    checkOrigin,
    inPageLinks,
    heightCalculationMethod,
    sizeHeight,
    sizeWidth,
    warningTimeout,
    tolerance,
    widthCalculationMethod,
    onClosed,
    onInit,
    onMessage,
    onResized,
    ...iframeProps
  } = props;

  return iframeProps;
}

export default IframeResizer;
