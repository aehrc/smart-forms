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
 *
 */

const MSG_HEADER = 'message';
const MSG_HEADER_LEN = MSG_HEADER.length;
const MSG_ID = '[iFrameSizer]'; // Must match iframe msg ID
const MSG_ID_LEN = MSG_ID.length;
const resetRequiredMethods = Object.freeze({
  max: 1,
  scroll: 1,
  bodyScroll: 1,
  documentElementScroll: 1
});

const defaults = Object.freeze({
  autoResize: true,
  bodyBackground: null,
  bodyMargin: null,
  bodyMarginV1: 8,
  bodyPadding: null,
  checkOrigin: true,
  inPageLinks: false,
  heightCalculationMethod: 'auto',
  id: 'iFrameResizer',
  mouseEvents: true,
  postMessageTarget: null,
  scrolling: false,
  sizeHeight: true,
  sizeWidth: false,
  warningTimeout: 5000,
  tolerance: 0,
  widthCalculationMethod: 'auto',
  onClose: () => true,
  onClosed() {},
  onInit() {},
  onMessage() {},
  onMouseEnter() {},
  onMouseLeave() {},
  onResized() {},
  onScroll: () => true
});

let pagePosition = null;

// Listeners
function addEventListener(el, evt, func, options) {
  el.addEventListener(evt, func, options || false);
}

function removeEventListener(el, evt, func) {
  el.removeEventListener(evt, func, false);
}

const settings = {};

function iframeListener(event) {
  function resizeIFrame() {
    setSize(messageData);
    setPagePosition();
    on('onResized', messageData);
  }

  function getPaddingEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') {
      return 0;
    }

    const top = compStyle.paddingTop ? parseInt(compStyle.paddingTop, 10) : 0;
    const bot = compStyle.paddingBottom ? parseInt(compStyle.paddingBottom, 10) : 0;

    return top + bot;
  }

  function getBorderEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') {
      return 0;
    }

    const top = compStyle.borderTopWidth ? parseInt(compStyle.borderTopWidth, 10) : 0;
    const bot = compStyle.borderBottomWidth ? parseInt(compStyle.borderBottomWidth, 10) : 0;

    return top + bot;
  }

  function processMsg() {
    const data = msg.slice(MSG_ID_LEN).split(':');
    const height = data[1] ? Number(data[1]) : 0;
    const iframe = settings[data[0]]?.iframe;
    const compStyle = getComputedStyle(iframe);

    return {
      iframe,
      id: data[0],
      height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
      width: Number(data[2]),
      type: data[3]
    };
  }

  function isMessageFromIFrame() {
    function checkAllowedOrigin() {
      function checkList() {
        let i = 0;
        let retCode = false;

        for (; i < checkOrigin.length; i++) {
          if (checkOrigin[i] === origin) {
            retCode = true;
            break;
          }
        }

        return retCode;
      }

      function checkSingle() {
        const remoteHost = settings[iframeId]?.remoteHost;
        return origin === remoteHost;
      }

      return checkOrigin.constructor === Array ? checkList() : checkSingle();
    }

    const origin = event.origin;
    const checkOrigin = settings[iframeId]?.checkOrigin;

    if (checkOrigin && `${origin}` !== 'null' && !checkAllowedOrigin()) {
      throw new Error(
        `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`
      );
    }

    return true;
  }

  function isMessageForUs() {
    return (
      MSG_ID === `${msg}`.slice(0, MSG_ID_LEN) && msg.slice(MSG_ID_LEN).split(':')[0] in settings
    );
  }

  function isMessageFromMetaParent() {
    // Test if this message is from a parent above us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    return messageData.type in { true: 1, false: 1, undefined: 1 };
  }

  function getMsgBody(offset) {
    return msg.slice(msg.indexOf(':') + MSG_HEADER_LEN + offset);
  }

  function forwardMsgFromIFrame(msgBody) {
    on('onMessage', {
      iframe: messageData.iframe,
      message: JSON.parse(msgBody)
    });
  }

  function getPageInfo() {
    const bodyPosition = document.body.getBoundingClientRect();
    const iFramePosition = messageData.iframe.getBoundingClientRect();

    const { scrollY, scrollX, innerHeight, innerWidth } = window;
    const { clientHeight, clientWidth } = document.documentElement;

    return JSON.stringify({
      iframeHeight: iFramePosition.height,
      iframeWidth: iFramePosition.width,
      clientHeight: Math.max(clientHeight, innerHeight || 0),
      clientWidth: Math.max(clientWidth, innerWidth || 0),
      offsetTop: parseInt((iFramePosition.top - bodyPosition.top).toString(), 10),
      offsetLeft: parseInt((iFramePosition.left - bodyPosition.left).toString(), 10),
      scrollTop: scrollY,
      scrollLeft: scrollX,
      documentHeight: clientHeight,
      documentWidth: clientWidth,
      windowHeight: innerHeight,
      windowWidth: innerWidth
    });
  }

  const sendInfoToIframe = (type, infoFunction) => (requestType, iframeId) => {
    const gate = {};

    function throttle(func, frameId) {
      if (!gate[frameId]) {
        func();
        gate[frameId] = requestAnimationFrame(() => {
          gate[frameId] = null;
        });
      }
    }

    function gatedTrigger() {
      trigger(`${type}:${infoFunction()}`, iframeId);
    }

    throttle(gatedTrigger, iframeId);
  };

  const startInfoMonitor = (sendInfoToIframe, type) => () => {
    let pending = false;

    const sendInfo = (requestType) => () => {
      if (settings[id]) {
        if (!pending || pending === requestType) {
          sendInfoToIframe(requestType, id);

          pending = requestType;
          requestAnimationFrame(() => {
            pending = false;
          });
        }
      } else {
        stop();
      }
    };

    const sendScroll = sendInfo('scroll');
    const sendResize = sendInfo('resize window');

    function setListener(listener) {
      listener(window, 'scroll', sendScroll);
      listener(window, 'resize', sendResize);
    }

    function stop() {
      setListener(removeEventListener);
      pageObserver.disconnect();
      iframeObserver.disconnect();
    }

    function start() {
      setListener(addEventListener);

      pageObserver.observe(
        document.body,
        {
          attributes: true,
          childList: true,
          subtree: true
        } ?? undefined
      );

      iframeObserver.observe(
        settings[id].iframe,
        {
          attributes: true,
          childList: false,
          subtree: false
        } ?? undefined
      );
    }

    const id = iframeId; // Create locally scoped copy of iFrame ID

    const pageObserver = new ResizeObserver(sendInfo('page observed'));
    const iframeObserver = new ResizeObserver(sendInfo('iframe observed'));

    start();

    if (settings[id]) {
      settings[id][`stop${type}`] = stop;
    }
  };

  const stopInfoMonitor = (stopFunction) => () => {
    if (stopFunction in settings[iframeId]) {
      settings[iframeId][stopFunction]();
      delete settings[iframeId][stopFunction];
    }
  };

  const sendPageInfoToIframe = sendInfoToIframe('pageInfo', getPageInfo);
  const startPageInfoMonitor = startInfoMonitor(sendPageInfoToIframe, 'PageInfo');
  const stopPageInfoMonitor = stopInfoMonitor('stopPageInfo');

  function checkIFrameExists() {
    return messageData.iframe !== null;
  }

  function getElementPosition(target) {
    const iFramePosition = target.getBoundingClientRect();

    getPagePosition();

    return {
      x: Number(iFramePosition.left) + Number(pagePosition.x),
      y: Number(iFramePosition.top) + Number(pagePosition.y)
    };
  }

  function scrollRequestFromChild(addOffset) {
    function reposition(newPositionX, newPositionY) {
      pagePosition = {
        x: newPositionX,
        y: newPositionY
      };
      scrollTo(iframeId);
    }

    function scrollParent(target, newPositionX, newPositionY) {
      target[`scrollTo${addOffset ? 'Offset' : ''}`](newPositionX, newPositionY);
    }

    function calcOffset(messageData, offset) {
      return {
        x: messageData.width + offset.x,
        y: messageData.height + offset.y
      };
    }

    const offset = addOffset ? getElementPosition(messageData.iframe) : { x: 0, y: 0 };
    const { x, y } = calcOffset(messageData, offset);

    const target = window.parentIframe || window.parentIFrame;

    if (target) {
      scrollParent(target, x, y);
      return;
    }

    reposition(x, y);
  }

  function scrollTo(iframeId) {
    const { x, y } = pagePosition;
    const iframe = settings[iframeId]?.iframe;

    if (on('onScroll', { iframe, top: y, left: x, x, y }) === false) {
      unsetPagePosition();
      return;
    }

    setPagePosition();
  }

  function findTarget(location) {
    function jumpToTarget() {
      const jumpPosition = getElementPosition(target);

      pagePosition = {
        x: jumpPosition.x,
        y: jumpPosition.y
      };

      scrollTo(iframeId);
      window.location.hash = hash;
    }

    const hash = location.split('#')[1] || '';
    const hashData = decodeURIComponent(hash);

    let target = document.getElementById(hashData) || document.getElementsByName(hashData)[0];

    if (target) {
      jumpToTarget();
    }
  }

  function onMouse(event) {
    let mousePos;

    if (Number(messageData.width) === 0 && Number(messageData.height) === 0) {
      const data = getMsgBody(9).split(':');
      mousePos = {
        x: data[1],
        y: data[0]
      };
    } else {
      mousePos = {
        x: messageData.width,
        y: messageData.height
      };
    }

    on(event, {
      iframe: messageData.iframe,
      screenX: Number(mousePos.x),
      screenY: Number(mousePos.y),
      type: messageData.type
    });
  }

  function on(funcName, val) {
    return chkEvent(iframeId, funcName, val);
  }

  function actionMsg() {
    if (settings[iframeId]?.firstRun) firstRun();

    switch (messageData.type) {
      case 'close':
        closeIFrame(messageData.iframe);
        break;

      case 'message':
        forwardMsgFromIFrame(getMsgBody(6));
        break;

      case 'mouseenter':
        onMouse('onMouseEnter');
        break;

      case 'mouseleave':
        onMouse('onMouseLeave');
        break;

      case 'autoResize':
        settings[iframeId].autoResize = JSON.parse(getMsgBody(9));
        break;

      case 'scrollTo':
        scrollRequestFromChild(false);
        break;

      case 'scrollToOffset':
        scrollRequestFromChild(true);
        break;

      case 'pageInfo':
        sendPageInfoToIframe('start', iframeId);
        startPageInfoMonitor();
        break;

      case 'pageInfoStop':
        stopPageInfoMonitor();
        break;

      case 'inPageLink':
        findTarget(getMsgBody(9));
        break;

      case 'reset':
        resetIFrame(messageData);
        break;

      case 'init':
        resizeIFrame();
        on('onInit', messageData.iframe);
        break;

      default:
        if (messageData.width === 0 || messageData.height === 0) {
          console.warn(
            'Unsupported message received (' +
              messageData.type +
              '), this is likely due to the iframe containing a later ' +
              'version of iframe-resizer than the parent page'
          );
          return;
        }

        resizeIFrame();
    }
  }

  function iFrameReadyMsgReceived() {
    for (const iframeId in settings) {
      trigger(createOutgoingMsg(iframeId), settings[iframeId].iframe, iframeId);
    }
  }

  function firstRun() {
    if (settings[iframeId]) {
      settings[iframeId].firstRun = false;
    }
  }

  let msg = event.data;
  let messageData = {};
  let iframeId = null;

  if (msg === '[iFrameResizerChild]Ready') {
    iFrameReadyMsgReceived();
    return;
  }

  if (!isMessageForUs()) {
    return;
  }

  messageData = processMsg();
  iframeId = messageData.id;

  if (!iframeId) {
    return;
  }

  if (!isMessageFromMetaParent()) {
    settings[iframeId].loaded = true;

    if (checkIFrameExists() && isMessageFromIFrame()) {
      actionMsg();
    }
  }
}

function chkEvent(iframeId, funcName, val) {
  let func = null;
  let retVal = null;

  if (settings[iframeId]) {
    func = settings[iframeId][funcName];

    if (typeof func === 'function') {
      if (funcName === 'onClose' || funcName === 'onScroll') {
        retVal = func(val);
      } else {
        setTimeout(() => func(val));
      }
    } else {
      throw new TypeError(`${funcName} on iFrame[${iframeId}] is not a function`);
    }
  }

  return retVal;
}

function removeIframeListeners(iframe) {
  const { id } = iframe;
  delete settings[id];
}

function closeIFrame(iframe) {
  const { id } = iframe;

  if (chkEvent(id, 'onClose', id) === false) {
    return;
  }

  try {
    // Catch race condition error with React
    if (iframe.parentNode) {
      iframe.remove();
    }
  } catch (error) {
    console.warn(id, error);
  }

  chkEvent(id, 'onClosed', id);
  removeIframeListeners(iframe);
}

function getPagePosition() {
  if (pagePosition !== null) return;

  pagePosition = {
    x: window.scrollX,
    y: window.scrollY
  };
}

function unsetPagePosition() {
  pagePosition = null;
}

function setPagePosition() {
  if (pagePosition === null) return;

  window.scrollTo(pagePosition.x, pagePosition.y);
  unsetPagePosition();
}

function resetIFrame(messageData) {
  getPagePosition();
  setSize(messageData);
  trigger('reset', messageData.id);
}

function setSize(messageData) {
  function setDimension(dimension) {
    messageData.iframe.style[dimension] = `${messageData[dimension]}px`;
  }

  const { id } = messageData;
  const { sizeHeight, sizeWidth } = settings[id];

  if (sizeHeight) setDimension('height');
  if (sizeWidth) setDimension('width');
}

function trigger(msg, id, noResponseWarning) {
  function postMessageToIFrame() {
    const { postMessageTarget, targetOrigin } = settings[id];

    postMessageTarget.postMessage(MSG_ID + msg, targetOrigin);
  }

  function chkAndSend() {
    if (!settings[id]?.postMessageTarget) {
      return;
    }

    postMessageToIFrame();
  }

  function warnOnNoResponse() {
    function warning() {
      if (settings[id] === undefined) return; // iframe has been closed while we were waiting

      const { loaded, loadErrorShown } = settings[id];

      if (!loaded && !loadErrorShown) {
        settings[id].loadErrorShown = true;
        console.warn(
          id,
          'IFrame has not responded within ' +
            settings[id].warningTimeout / 1000 +
            ' seconds. Check iFrameResizer.contentWindow.js has been loaded in iFrame. This message can be ignored if everything is working, or you can set the warningTimeout option to a higher value or zero to suppress this warning.'
        );
      }
    }

    if (!!noResponseWarning && !!settings[id]?.warningTimeout) {
      settings[id].msgTimeout = setTimeout(warning, settings[id].warningTimeout);
    }
  }

  if (settings[id]) {
    chkAndSend();
    warnOnNoResponse();
  }
}

function createOutgoingMsg(iframeId) {
  const iframeSettings = settings[iframeId];

  return [
    iframeId,
    iframeSettings.bodyMarginV1, // Backwards compatibility (PaddingV1)
    iframeSettings.sizeWidth,
    iframeSettings.autoResize,
    iframeSettings.bodyMargin,
    iframeSettings.heightCalculationMethod,
    iframeSettings.bodyBackground,
    iframeSettings.bodyPadding,
    iframeSettings.tolerance,
    iframeSettings.inPageLinks,
    'child', // Backwards compatibility (resizeFrom)
    iframeSettings.widthCalculationMethod,
    iframeSettings.mouseEvents
  ].join(':');
}

let count = 0;

export default (options) => (iframe) => {
  function newId() {
    let id = options?.id || defaults.id + count++;

    if (document.getElementById(id) !== null) {
      id += count++;
    }

    return id;
  }

  function ensureHasId(iframeId) {
    if (iframeId && typeof iframeId !== 'string') {
      throw new TypeError('Invalid id for iFrame. Expected String');
    }

    if (iframeId === '' || !iframeId) {
      iframeId = newId();
      iframe.id = iframeId;
    }

    return iframeId;
  }

  function setScrolling() {
    iframe.style.overflow = settings[iframeId]?.scrolling === false ? 'hidden' : 'auto';

    switch (settings[iframeId]?.scrolling) {
      case 'omit':
        break;

      case true:
        iframe.scrolling = 'yes';
        break;

      case false:
        iframe.scrolling = 'no';
        break;

      default:
        iframe.scrolling = settings[iframeId] ? settings[iframeId].scrolling : 'no';
    }
  }

  function setupBodyMarginValues() {
    const { bodyMargin } = settings[iframeId];

    if (typeof bodyMargin === 'number' || bodyMargin === '0') {
      settings[iframeId].bodyMargin = `${bodyMargin}px`;
    }
  }

  function checkReset() {
    const firstRun = settings[iframeId]?.firstRun;
    const resetRequestMethod = settings[iframeId]?.heightCalculationMethod in resetRequiredMethods;

    if (!firstRun && resetRequestMethod) {
      resetIFrame({ iframe, height: 0, width: 0, type: 'init' });
    }
  }

  function setupIFrameObject() {
    if (settings[iframeId]) {
      const { iframe } = settings[iframeId];
      const resizer = {
        close: closeIFrame.bind(null, iframe),

        disconnect: removeIframeListeners.bind(null, iframe),

        removeListeners() {
          this.disconnect();
        },

        resize: trigger.bind(null, 'resize', iframeId)
      };

      iframe.iframeResizer = resizer;
      iframe.iFrameResizer = resizer;
    }
  }

  // We have to call trigger twice, as we can not be sure if all
  // iframes have completed loading when this code runs. The
  // event listener also catches the page changing in the iFrame.
  function init(msg) {
    function iFrameLoaded() {
      trigger(`${msg}`, id, true);
      checkReset();
    }

    const { id } = iframe;

    addEventListener(iframe, 'load', iFrameLoaded);
    trigger(`${msg}`, id, true);
  }

  function checkOptions(options) {
    if (!options) return {};

    if (typeof options !== 'object') {
      throw new TypeError('Options is not an object');
    }

    return options;
  }

  const getTargetOrigin = (remoteHost) =>
    remoteHost === '' || remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
      ? '*'
      : remoteHost;

  function getPostMessageTarget() {
    if (settings[iframeId].postMessageTarget === null)
      settings[iframeId].postMessageTarget = iframe.contentWindow;
  }

  function chkTitle(iframeId) {
    const title = settings[iframeId]?.iframe?.title;
    return title === '' || title === undefined;
  }

  function processOptions(options) {
    settings[iframeId] = {
      iframe,
      firstRun: true,
      remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
      ...defaults,
      ...checkOptions(options),
      syncTitle: chkTitle(iframeId)
    };

    getPostMessageTarget();

    settings[iframeId].targetOrigin =
      settings[iframeId].checkOrigin === true
        ? getTargetOrigin(settings[iframeId].remoteHost)
        : '*';
  }

  const beenHere = () => iframeId in settings && 'iFrameResizer' in iframe;

  const iframeId = ensureHasId(iframe.id);

  if (beenHere()) {
    console.warn(iframeId, 'Ignored iFrame, already setup.');
  } else {
    processOptions(options);
    setupEventListenersOnce();
    setScrolling();
    setupBodyMarginValues();
    init(createOutgoingMsg(iframeId));
    setupIFrameObject();
  }

  return iframe?.iFrameResizer;
};

function sendTriggerMsg(event) {
  function triggerEnabledIframe(iframeId) {
    if (isIFrameResizeEnabled(iframeId)) {
      trigger(event, iframeId);
    }
  }

  const isIFrameResizeEnabled = (iframeId) =>
    settings[iframeId]?.autoResize && !settings[iframeId]?.firstRun;

  Object.keys(settings).forEach(triggerEnabledIframe);
}

function tabVisible() {
  if (document.hidden === false) {
    sendTriggerMsg('resize');
  }
}

// Set up the event listeners only once
const setupEventListenersOnce = (() => {
  let done = false;

  return function () {
    if (done) return;
    done = true;

    addEventListener(window, 'message', iframeListener);
    addEventListener(document, 'visibilitychange', tabVisible);
    window.iframeParentListener = (data) => setTimeout(() => iframeListener({ data }));
  };
})();
