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

const SIZE_ATTR = 'data-iframe-size';
const OVERFLOW_ATTR = 'data-overflowed';

const HEIGHT_EDGE = 'bottom';
const WIDTH_EDGE = 'right';

function addEventListener(el, evt, func, options) {
  el.addEventListener(evt, func, options || false);
}

function removeEventListener(el, evt, func) {
  el.removeEventListener(evt, func, false);
}

export const id = (x) => x;

function overflowObserver(options) {
  const side = options.side || HEIGHT_EDGE;
  const onChange = options.onChange || id;

  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1
  };

  function emit() {
    const overflowedNodeList = document.querySelectorAll(`[${OVERFLOW_ATTR}]`);
    onChange(overflowedNodeList);
  }

  const emitAfterReflow = () => requestAnimationFrame(emit);

  function callback(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry;
      const edge = boundingClientRect[side];
      const hasOverflow = edge === 0 || edge > rootBounds[side];
      target.toggleAttribute(OVERFLOW_ATTR, hasOverflow);
    }

    emitAfterReflow();
  }

  const observer = new IntersectionObserver(callback, observerOptions);
  const observed = new WeakSet();

  return function (nodeList) {
    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE || observed.has(node)) continue;

      observer.observe(node);
      observed.add(node);
    }
  };
}

function iframeResizerChild() {
  const checkVisibilityOptions = {
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true
  };
  const customCalcMethods = {
    height: () => {
      return getHeight.auto();
    },
    width: () => {
      return getWidth.auto();
    }
  };
  const eventCancelTimer = 128;
  const eventHandlersByName = {};
  const hasCheckVisibility = 'checkVisibility' in window;
  const msgID = '[iFrameSizer]'; // Must match host page msg ID
  const msgIdLen = msgID.length;
  const resetRequiredMethods = {
    max: 1,
    min: 1,
    bodyScroll: 1,
    documentElementScroll: 1
  };
  const widthCalcModeDefault = 'scroll';

  let autoResize = true;
  let bodyBackground = '';
  let bodyMargin = 0;
  let bodyMarginStr = '';
  let bodyPadding = '';
  let calculateHeight = true;
  let calculateWidth = false;
  let firstRun = true;
  let hasOverflow = false;
  let hasTags = false;
  let height = 1;
  let heightCalcModeDefault = 'auto';
  let heightCalcMode = heightCalcModeDefault;
  let initLock = true;
  let initMsg = '';
  let inPageLinks = {};
  let mouseEvents = false;
  let myID = '';
  let offsetHeight;
  let offsetWidth;
  let observeOverflow = id;
  let overflowedNodeList = [];
  let resizeFrom = 'child';
  let resizeObserver = null;
  let taggedElements = [];
  let target = window.parent;
  let targetOriginDefault = '*';
  let timerActive;
  let tolerance = 0;
  let triggerLocked = false;
  let width = 1;
  let widthCalcMode = widthCalcModeDefault;
  let win = window;

  let onReady = () => {};
  let onPageInfo = null;
  let onParentInfo = null;

  function init() {
    readDataFromParent();
    readDataFromPage();

    checkHeightMode();
    checkWidthMode();
    checkDeprecatedAttrs();

    checkAndSetupTags();

    setupObserveOverflow();
    setupPublicMethods();
    setupMouseEvents();
    inPageLinks = setupInPageLinks();

    addOverflowObservers(getAllElements(document)());

    setMargin();
    setBodyStyle('background', bodyBackground);
    setBodyStyle('padding', bodyPadding);

    injectClearFixIntoBodyElement();
    stopInfiniteResizingOfIframe();

    sendSize('init', 'Init message from host page', undefined, undefined, undefined);

    initEventListeners();
    setTimeout(onReady);
  }

  function onOverflowChange(nodeList) {
    overflowedNodeList = nodeList;
    hasOverflow = overflowedNodeList.length > 0;

    sendSize('overflowChanged', 'Overflow updated');
  }

  function setupObserveOverflow() {
    if (calculateHeight === calculateWidth) {
      return;
    }

    observeOverflow = overflowObserver({
      onChange: onOverflowChange,
      root: document.documentElement,
      side: calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE
    });
  }

  function checkAndSetupTags() {
    taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`);
    hasTags = taggedElements.length > 0;
  }

  function addOverflowObservers(nodeList) {
    if (!hasTags) {
      observeOverflow(nodeList);
    }
  }

  function readDataFromParent() {
    const strBool = (str) => str === 'true';
    const data = initMsg.slice(msgIdLen).split(':');

    myID = data[0];
    bodyMargin = undefined === data[1] ? bodyMargin : Number(data[1]); // For V1 compatibility
    calculateWidth = undefined === data[2] ? calculateWidth : strBool(data[2]);
    autoResize = undefined === data[3] ? autoResize : strBool(data[3]);
    bodyMarginStr = data[4];
    heightCalcMode = undefined === data[5] ? heightCalcMode : data[5];
    bodyBackground = data[6];
    bodyPadding = data[7];
    tolerance = undefined === data[8] ? tolerance : Number(data[8]);
    inPageLinks.enable = undefined === data[9] ? false : strBool(data[9]);
    resizeFrom = undefined === data[10] ? resizeFrom : data[10];
    widthCalcMode = undefined === data[11] ? widthCalcMode : data[11];
    mouseEvents = undefined === data[12] ? mouseEvents : strBool(data[12]);
  }

  function readDataFromPage() {
    function readData(data) {
      if (typeof data?.offset === 'number') {
        if (calculateHeight) offsetHeight = data?.offset;
        if (calculateWidth) offsetWidth = data?.offset;
      }

      if (typeof data?.offsetSize === 'number') {
        if (calculateHeight) offsetHeight = data?.offsetSize;
        if (calculateWidth) offsetWidth = data?.offsetSize;
      }

      targetOriginDefault = data?.targetOrigin || targetOriginDefault;
      heightCalcMode = data?.heightCalculationMethod || heightCalcMode;
      widthCalcMode = data?.widthCalculationMethod || widthCalcMode;
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if (typeof calcMode === 'function') {
        customCalcMethods[calcFunc] = calcMode;
        calcMode = 'custom';
      }

      return calcMode;
    }

    const data = window.iframeResizer || window.iFrameResizer;

    if (typeof data !== 'object') {
      return;
    }

    readData(data);
    heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height');
    widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width');
  }

  function chkCSS(attr, value) {
    if (value.includes('-')) {
      value = '';
    }

    return value;
  }

  function setBodyStyle(attr, value) {
    if (undefined !== value && value !== '' && value !== 'null') {
      document.body.style.setProperty(attr, value);
    }
  }

  function setMargin() {
    // If called via V1 script, convert bodyMargin from int to str
    if (undefined === bodyMarginStr) {
      bodyMarginStr = `${bodyMargin}px`;
    }

    setBodyStyle('margin', chkCSS('margin', bodyMarginStr));
  }

  function stopInfiniteResizingOfIframe() {
    const setAutoHeight = (el) =>
      el.style.setProperty('height', heightCalcModeDefault, 'important');

    setAutoHeight(document.documentElement);
    setAutoHeight(document.body);
  }

  function manageTriggerEvent(options) {
    const listener = {
      add(eventName) {
        function handleEvent() {
          sendSize(options.eventName, options.eventType);
        }

        eventHandlersByName[eventName] = handleEvent;

        addEventListener(window, eventName, handleEvent, { passive: true });
      },
      remove(eventName) {
        const handleEvent = eventHandlersByName[eventName];
        delete eventHandlersByName[eventName];

        removeEventListener(window, eventName, handleEvent);
      }
    };

    listener[options.method](options.eventName);
  }

  function manageEventListeners(method) {
    manageTriggerEvent({
      method,
      eventType: 'After Print',
      eventName: 'afterprint'
    });

    manageTriggerEvent({
      method,
      eventType: 'Before Print',
      eventName: 'beforeprint'
    });

    manageTriggerEvent({
      method,
      eventType: 'Ready State Change',
      eventName: 'readystatechange'
    });
  }

  function checkDeprecatedAttrs() {
    let found = false;

    const checkAttrs = (attr) =>
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        found = true;
        el.removeAttribute(attr);
        el.toggleAttribute(SIZE_ATTR, true);
      });

    checkAttrs('data-iframe-height');
    checkAttrs('data-iframe-width');
  }

  function checkCalcMode(calcMode, calcModeDefault, modes) {
    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        calcMode = calcModeDefault;
      }
    }

    return calcMode;
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(heightCalcMode, heightCalcModeDefault, getHeight);
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(widthCalcMode, widthCalcModeDefault, getWidth);
  }

  function initEventListeners() {
    manageEventListeners('add');
    setupMutationObserver();
    setupResizeObservers();
  }

  function injectClearFixIntoBodyElement() {
    const clearFix = document.createElement('div');

    clearFix.style.clear = 'both';
    // Guard against the following having been globally redefined in CSS.
    clearFix.style.display = 'block';
    clearFix.style.height = '0';
    document.body.append(clearFix);
  }

  function setupInPageLinks() {
    function getPagePosition() {
      return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop
      };
    }

    function getElementPosition(el) {
      const elPosition = el.getBoundingClientRect();
      const { x, y } = getPagePosition();

      return {
        x: parseInt(elPosition.left, 10) + parseInt(x.toString(), 10),
        y: parseInt(elPosition.top, 10) + parseInt(y.toString(), 10)
      };
    }

    function findTarget(location) {
      function jumpToTarget(target) {
        const jumpPosition = getElementPosition(target);

        sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      }

      const hash = location.split('#')[1] || location; // Remove # if present
      const hashData = decodeURIComponent(hash);
      const target = document.getElementById(hashData) || document.getElementsByName(hashData)[0];

      if (target !== undefined) {
        jumpToTarget(target);
        return;
      }

      sendMsg(0, 0, 'inPageLink', `#${hash}`);

      // Don't run for server side render
      if (typeof window !== 'undefined') {
        iframeResizerChild();
      }
    }

    function checkLocationHash() {
      const { hash, href } = window.location;

      if (hash !== '' && hash !== '#') {
        findTarget(href);
      }
    }

    function bindAnchors() {
      for (const link of document.querySelectorAll('a[href^="#"]')) {
        if (link.getAttribute('href') !== '#') {
          addEventListener(link, 'click', (e) => {
            e.preventDefault();
            findTarget(link.getAttribute('href'));
          });
        }
      }
    }

    function bindLocationHash() {
      addEventListener(window, 'hashchange', checkLocationHash);
    }

    function initCheck() {
      // Check if page loaded with location hash after init resize
      setTimeout(checkLocationHash, eventCancelTimer);
    }

    function enableInPageLinks() {
      bindAnchors();
      bindLocationHash();
      initCheck();
    }

    if (inPageLinks.enable) {
      enableInPageLinks();
    }

    return {
      findTarget
    };
  }

  function setupMouseEvents() {
    if (mouseEvents !== true) return;

    function sendMouse(e) {
      sendMsg(0, 0, e.type, `${e.screenY}:${e.screenX}`);
    }

    function addMouseListener(evt) {
      addEventListener(window.document, evt, sendMouse);
    }

    addMouseListener('mouseenter');
    addMouseListener('mouseleave');
  }

  function setupPublicMethods() {
    win.parentIframe = Object.freeze({
      autoResize: (resize) => {
        if (resize === true && autoResize === false) {
          autoResize = true;
          sendSize('autoResizeEnabled', 'Auto Resize enabled');
        } else if (resize === false && autoResize === true) {
          autoResize = false;
        }

        sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize));

        return autoResize;
      },

      close() {
        sendMsg(0, 0, 'close');
      },

      getId: () => myID,

      getPageInfo(callback) {
        if (typeof callback === 'function') {
          onPageInfo = callback;
          sendMsg(0, 0, 'pageInfo');
          return;
        }

        onPageInfo = null;
        sendMsg(0, 0, 'pageInfoStop');
      },

      getParentProps(callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('parentIframe.getParentProps(callback) callback not a function');
        }

        onParentInfo = callback;
        sendMsg(0, 0, 'parentInfo');

        return () => {
          onParentInfo = null;
          sendMsg(0, 0, 'parentInfoStop');
        };
      },

      getParentProperties(callback) {
        this.getParentProps(callback);
      },

      moveToAnchor(hash) {
        inPageLinks.findTarget(hash);
      },

      reset() {
        resetIframe();
      },

      scrollBy(x, y) {
        sendMsg(y, x, 'scrollBy'); // X&Y reversed at sendMsg uses height/width
      },

      scrollTo(x, y) {
        sendMsg(y, x, 'scrollTo'); // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset(x, y) {
        sendMsg(y, x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      },

      sendMessage(msg, targetOrigin) {
        sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin);
      },

      setHeightCalculationMethod(heightCalculationMethod) {
        heightCalcMode = heightCalculationMethod;
        checkHeightMode();
      },

      setWidthCalculationMethod(widthCalculationMethod) {
        widthCalcMode = widthCalculationMethod;
        checkWidthMode();
      },

      setTargetOrigin(targetOrigin) {
        targetOriginDefault = targetOrigin;
      },

      resize(customHeight, customWidth) {
        const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`;

        sendSize('resizeParent', `parentIframe.resize(${valString})`, customHeight, customWidth);
      },

      size(customHeight, customWidth) {
        this.resize(customHeight, customWidth);
      }
    });

    win.parentIFrame = win.parentIframe;
  }

  function resizeObserved(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return;

    sendSize('resizeObserver', `Resize Observed:`);
  }

  const resizeSet = new WeakSet();

  // This function has to iterate over all page elements during load
  // so is optimized for performance, rather than best practices.
  function attachResizeObserverToNonStaticElements(rootElement) {
    if (rootElement.nodeType !== Node.ELEMENT_NODE) return;

    if (!resizeSet.has(rootElement)) {
      const position = getComputedStyle(rootElement)?.position;
      if (!(position === '' || position === 'static')) {
        resizeObserver.observe(rootElement);
        resizeSet.add(rootElement);
      }
    }

    const nodeList = getAllElements(rootElement)();

    for (const node of nodeList) {
      if (resizeSet.has(node) || node?.nodeType !== Node.ELEMENT_NODE) continue;

      const position = getComputedStyle(node)?.position;
      if (position === '' || position === 'static') continue;

      resizeObserver.observe(node);
      resizeSet.add(node);
    }
  }

  function setupResizeObservers() {
    resizeObserver = new ResizeObserver(resizeObserved);
    resizeObserver.observe(document.body);
    resizeSet.add(document.body);
    attachResizeObserverToNonStaticElements(document.body);
  }

  function setupMutationObserver() {
    const observedMutations = new Set();
    let pending = false;
    let newMutations = [];

    const updateMutation = (mutations) => {
      for (const mutation of mutations) {
        const { addedNodes, removedNodes } = mutation;

        for (const node of addedNodes) {
          observedMutations.add(node);
        }

        for (const node of removedNodes) {
          observedMutations.delete(node);
        }
      }
    };

    let delayCount = 1;

    function processMutations() {
      delayCount = 1;

      newMutations.forEach(updateMutation);
      newMutations = [];

      if (observedMutations.size === 0) {
        pending = false;
        return;
      }

      // Rebuild tagged elements list for size calculation
      checkAndSetupTags();

      // Add observers to new elements
      addOverflowObservers(observedMutations);
      observedMutations.forEach(attachResizeObserverToNonStaticElements);

      observedMutations.clear();

      pending = false;
    }

    function mutationObserved(mutations) {
      newMutations.push(mutations);
      if (pending) return;

      pending = true;
      requestAnimationFrame(processMutations);
    }

    function createMutationObserver() {
      const observer = new window.MutationObserver(mutationObserved);
      const target = document.querySelector('body');
      const config = {
        attributes: false,
        attributeOldValue: false,
        characterData: false,
        characterDataOldValue: false,
        childList: true,
        subtree: true
      };

      observer.observe(target, config);

      return observer;
    }

    const observer = createMutationObserver();

    return {
      disconnect() {
        observer.disconnect();
      }
    };
  }

  function getMaxElement(side) {
    let elVal = 0;
    let maxEl = document.documentElement;
    let maxVal = hasTags ? 0 : document.documentElement.getBoundingClientRect().bottom;

    const targetElements = hasTags
      ? taggedElements
      : hasOverflow
        ? overflowedNodeList
        : getAllElements(document)(); // We should never get here, but just in case

    let len = targetElements.length;

    for (const element of targetElements) {
      if (
        !hasTags &&
        hasCheckVisibility && // Safari was missing checkVisibility until March 2024
        !element.checkVisibility(checkVisibilityOptions ?? undefined)
      ) {
        len -= 1;
        continue;
      }

      elVal =
        element.getBoundingClientRect()[side] +
        parseFloat(getComputedStyle(element).getPropertyValue(`margin-${side}`));

      if (elVal > maxVal) {
        maxVal = elVal;
        maxEl = element;
      }
    }

    return maxVal;
  }

  const getAllMeasurements = (dimension) => [
    dimension.bodyOffset(),
    dimension.bodyScroll(),
    dimension.documentElementOffset(),
    dimension.documentElementScroll(),
    dimension.boundingClientRect()
  ];

  const getAllElements = (element) => () =>
    element.querySelectorAll(
      '* :not(head):not(meta):not(base):not(title):not(script):not(link):not(style):not(map):not(area):not(option):not(optgroup):not(template):not(track):not(wbr):not(nobr)'
    );

  const prevScrollSize = {
    height: 0,
    width: 0
  };

  const prevBoundingSize = {
    height: 0,
    width: 0
  };

  const getAdjustedScroll = (getDimension) =>
    getDimension.documentElementScroll() + Math.max(0, getDimension.getOffset());

  function getAutoSize(getDimension) {
    function returnBoundingClientRect() {
      prevBoundingSize[dimension] = boundingSize;
      prevScrollSize[dimension] = scrollSize;
      return boundingSize;
    }

    const isHeight = getDimension === getHeight;
    const dimension = isHeight ? 'height' : 'width';
    const boundingSize = getDimension.boundingClientRect();
    const ceilBoundingSize = Math.ceil(boundingSize);
    const floorBoundingSize = Math.floor(boundingSize);
    const scrollSize = getAdjustedScroll(getDimension);

    switch (true) {
      case !getDimension.enabled():
        return scrollSize;

      case hasTags:
        return getDimension.taggedElement();

      case !hasOverflow && prevBoundingSize[dimension] === 0 && prevScrollSize[dimension] === 0:
        return returnBoundingClientRect();

      case triggerLocked &&
        boundingSize === prevBoundingSize[dimension] &&
        scrollSize === prevScrollSize[dimension]:
        return Math.max(boundingSize, scrollSize);

      case boundingSize === 0:
        return scrollSize;

      case !hasOverflow &&
        boundingSize !== prevBoundingSize[dimension] &&
        scrollSize <= prevScrollSize[dimension]:
        return returnBoundingClientRect();

      case !isHeight:
        return getDimension.taggedElement();

      case !hasOverflow && boundingSize < prevBoundingSize[dimension]:
        return returnBoundingClientRect();

      case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
        return returnBoundingClientRect();

      case boundingSize > scrollSize:
        return returnBoundingClientRect();

      default:
    }

    return Math.max(getDimension.taggedElement(), returnBoundingClientRect());
  }

  const getBodyOffset = () => {
    const { body } = document;
    const style = getComputedStyle(body);

    return body.offsetHeight + parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
  };

  const getHeight = {
    enabled: () => calculateHeight,
    getOffset: () => offsetHeight,
    auto: () => getAutoSize(getHeight),
    bodyOffset: getBodyOffset,
    bodyScroll: () => document.body.scrollHeight,
    offset: () => getHeight.bodyOffset(), // Backwards compatibility
    custom: () => customCalcMethods.height(),
    documentElementOffset: () => document.documentElement.offsetHeight,
    documentElementScroll: () => document.documentElement.scrollHeight,
    boundingClientRect: () =>
      Math.max(
        document.documentElement.getBoundingClientRect().bottom,
        document.body.getBoundingClientRect().bottom
      ),
    max: () => Math.max(...getAllMeasurements(getHeight)),
    min: () => Math.min(...getAllMeasurements(getHeight)),
    grow: () => getHeight.max(),
    taggedElement: () => getMaxElement(HEIGHT_EDGE)
  };

  const getWidth = {
    enabled: () => calculateWidth,
    getOffset: () => offsetWidth,
    auto: () => getAutoSize(getWidth),
    bodyScroll: () => document.body.scrollWidth,
    bodyOffset: () => document.body.offsetWidth,
    custom: () => customCalcMethods.width(),
    documentElementScroll: () => document.documentElement.scrollWidth,
    documentElementOffset: () => document.documentElement.offsetWidth,
    boundingClientRect: () =>
      Math.max(
        document.documentElement.getBoundingClientRect().right,
        document.body.getBoundingClientRect().right
      ),
    max: () => Math.max(...getAllMeasurements(getWidth)),
    min: () => Math.min(...getAllMeasurements(getWidth)),
    scroll: () => Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll()),
    taggedElement: () => getMaxElement(WIDTH_EDGE)
  };

  const checkTolerance = (a, b) => !(Math.abs(a - b) <= tolerance);

  function sizeIframe(triggerEvent, triggerEventDesc, customHeight, customWidth, msg) {
    const isForceResizableEvent = () => !(triggerEvent in { init: 1, interval: 1, size: 1 });

    const isForceResizableCalcMode = () =>
      (calculateHeight && heightCalcMode in resetRequiredMethods) ||
      (calculateWidth && widthCalcMode in resetRequiredMethods);

    const isSizeChangeDetected = () =>
      (calculateHeight && checkTolerance(height, newHeight)) ||
      (calculateWidth && checkTolerance(width, newWidth));

    const newHeight = undefined === customHeight ? getHeight[heightCalcMode]() : customHeight;
    const newWidth = undefined === customWidth ? getWidth[widthCalcMode]() : customWidth;

    if (isSizeChangeDetected() || triggerEvent === 'init') {
      lockTrigger();
      height = newHeight;
      width = newWidth;
      sendMsg(height, width, triggerEvent, msg);
    } else if (isForceResizableEvent() && isForceResizableCalcMode()) {
      resetIframe();
    } else {
      timerActive = false; // We're not resizing, so turn off the timer
    }
  }

  let sendPending = false;

  function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth, msg) {
    if (!autoResize && triggerEvent in { reset: 1, resetPage: 1, init: 1 }) {
      return;
    }

    if (document.hidden) {
      // Currently only correctly supported in firefox
      // This is checked again on the parent page
      return;
    }

    if (!sendPending) {
      timerActive = true;
      sizeIframe(triggerEvent, triggerEventDesc, customHeight, customWidth, msg);
      requestAnimationFrame(() => {
        sendPending = false;
      });
    }

    sendPending = true;
  }

  function lockTrigger() {
    if (triggerLocked) return;

    triggerLocked = true;

    requestAnimationFrame(() => {
      triggerLocked = false;
    });
  }

  function triggerReset(triggerEvent) {
    height = getHeight[heightCalcMode]();
    width = getWidth[widthCalcMode]();

    sendMsg(height, width, triggerEvent);
  }

  function resetIframe() {
    const hcm = heightCalcMode;
    heightCalcMode = heightCalcModeDefault;

    lockTrigger();
    triggerReset('reset');

    heightCalcMode = hcm;
  }

  function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
    function setTargetOrigin() {
      if (undefined === targetOrigin) {
        targetOrigin = targetOriginDefault;
      }
    }

    function sendToParent() {
      const size = `${height + (offsetHeight || 0)}:${width + (offsetWidth || 0)}`;
      const message = `${myID}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`;

      timerActive = false;

      target.postMessage(msgID + message, targetOrigin);
    }

    setTargetOrigin();
    sendToParent();
  }

  function receiver(event) {
    const processRequestFromParent = {
      init: function initFromParent() {
        initMsg = event.data;
        target = event.source;

        init();
        firstRun = false;
        setTimeout(() => {
          initLock = false;
        }, eventCancelTimer);
      },

      reset() {
        if (initLock) {
          return;
        }
        triggerReset('resetPage');
      },

      resize() {
        sendSize('resizeParent', 'Parent window requested size check');
      },

      moveToAnchor() {
        inPageLinks.findTarget(getData());
      },

      inPageLink() {
        this.moveToAnchor();
      }, // Backward compatibility

      pageInfo() {
        const msgBody = getData();
        if (onPageInfo) {
          setTimeout(() => onPageInfo(JSON.parse(msgBody)));
        } else {
          // not expected, so cancel more messages
          sendMsg(0, 0, 'pageInfoStop');
        }
      }
    };

    const isMessageForUs = () => msgID === `${event.data}`.slice(0, msgIdLen);

    const getMessageType = () => event.data.split(']')[1].split(':')[0];

    const getData = () => event.data.slice(event.data.indexOf(':') + 1);

    // Test if this message is from a child below us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const isInitMsg = () => event.data.split(':')[2] in { true: 1, false: 1 };

    function callFromParent() {
      const messageType = getMessageType();

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]();
      }
    }

    function processMessage() {
      if (firstRun === false) {
        callFromParent();
        return;
      }

      if (isInitMsg()) {
        processRequestFromParent.init();
      }
    }

    if (isMessageForUs()) {
      processMessage();
    }
  }

  // Normally the parent kicks things off when it detects the iFrame has loaded.
  // If this script is async-loaded, then tell parent page to retry init.
  function chkLateLoaded() {
    if (document.readyState !== 'loading') {
      window.parent.postMessage('[iFrameResizerChild]Ready', '*');
    }
  }

  if (!('iframeChildListener' in window)) {
    window.iframeChildListener = (data) => setTimeout(() => receiver({ data }));
    addEventListener(window, 'message', receiver);
    addEventListener(window, 'readystatechange', chkLateLoaded);
    chkLateLoaded();
  }
}

// Don't run for server side render
if (typeof window !== 'undefined') {
  iframeResizerChild();
}
