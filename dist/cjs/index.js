"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const vue = require("vue");
const isBoolean$1 = (value) => {
  return typeof value === "boolean";
};
function assign(target, ...sources) {
  for (let source of sources) {
    if (source != null) {
      for (const key in source) {
        if (source[key] !== void 0) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
const resolveEl = (target) => {
  target = vue.unref(target);
  if (target == null)
    return null;
  if (document && typeof target === "string") {
    return document.querySelector(target);
  }
  return target.$el ?? target;
};
const off$1 = (element, event, handler, opts = void 0) => {
  element.removeEventListener(event, handler, opts);
};
const on$1 = (element, event, handler, opts = void 0) => {
  element.addEventListener(event, handler, opts);
  return () => off$1(element, event, handler, opts);
};
const elementContains = (element, child) => !!element && !!child && (element === child || element.contains(child));
const PopoverTriggerEvents = {
  triggerShow: "triggerpopovershow",
  triggerHide: "triggerpopoverhide",
  triggerToggle: "triggerpopovertoggle",
  triggerUpdate: "triggerpopoverupdate"
};
const PopoverContentEvents = {
  show: "popovershow",
  hide: "popoverhide",
  update: "popoverupdate"
};
function showPopover(opts) {
  if (document) {
    document.dispatchEvent(
      new CustomEvent(PopoverTriggerEvents.triggerShow, {
        detail: opts
      })
    );
  }
}
function hidePopover(opts) {
  if (document) {
    document.dispatchEvent(
      new CustomEvent(PopoverTriggerEvents.triggerHide, {
        detail: opts
      })
    );
  }
}
function togglePopover(opts) {
  if (document) {
    document.dispatchEvent(
      new CustomEvent(PopoverTriggerEvents.triggerToggle, {
        detail: opts
      })
    );
  }
}
function updatePopoverState(opts) {
  if (document) {
    document.dispatchEvent(
      new CustomEvent(PopoverTriggerEvents.triggerUpdate, {
        detail: opts
      })
    );
  }
}
function onPopoverEvent(eventName, callback, specifier) {
  return on$1(document, eventName, (e) => {
    var _a;
    if (specifier) {
      if (Object.keys(specifier).some(
        (key) => specifier[key] !== e.detail[key]
      )) {
        return;
      }
      if (specifier.updates && !((_a = specifier.updates) == null ? void 0 : _a.some((key) => key in e.detail.updates))) {
        return;
      }
    }
    callback(e);
  });
}
function usePopoverEvent(eventName, callback, specifier) {
  let eventOff = () => {
  };
  vue.onMounted(() => {
    eventOff = onPopoverEvent(eventName, callback, specifier);
  });
  vue.onUnmounted(() => {
    eventOff();
  });
}
function getPopoverEventHandlers(opts) {
  let hovered = false;
  let focused = false;
  let target = null;
  const isClick = vue.computed(() => (vue.unref(opts).action ?? "click") === "click");
  const isHover = vue.computed(() => vue.unref(opts).action === "hover");
  const isHoverOrFocus = vue.computed(() => vue.unref(opts).action === "hover-focus");
  const isFocus = vue.computed(() => vue.unref(opts).action === "focus");
  const clickHandler = (e) => {
    if (isClick.value) {
      target = e.currentTarget;
      togglePopover({ target, ...vue.unref(opts) });
      e.stopPropagation();
    }
  };
  const mouseMoveHandler = (e) => {
    if (!hovered) {
      hovered = true;
      if (isHover.value || isHoverOrFocus.value) {
        target = e.currentTarget;
        showPopover({ target, ...vue.unref(opts) });
      }
    }
  };
  const mouseLeaveHandler = () => {
    if (hovered) {
      hovered = false;
      if (isHover.value || isHoverOrFocus.value && !focused) {
        hidePopover({ target, ...vue.unref(opts) });
        target = null;
      }
    }
  };
  const focusInHandler = (e) => {
    if (!focused) {
      focused = true;
      if (isFocus.value || isHoverOrFocus.value) {
        target = e.currentTarget;
        showPopover({ target, ...vue.unref(opts) });
      }
    }
  };
  const focusOutHandler = (e) => {
    if (focused && !elementContains(e.currentTarget, e.relatedTarget)) {
      focused = false;
      if (isFocus.value || isHoverOrFocus.value && !hovered) {
        hidePopover({ target, ...vue.unref(opts) });
        target = null;
      }
    }
  };
  if (vue.isRef(opts)) {
    vue.watch(
      () => opts.value,
      () => {
        if (target) {
          updatePopoverState({ target, ...vue.unref(opts) });
        }
      }
    );
  }
  return {
    click: clickHandler,
    mousemove: mouseMoveHandler,
    mouseleave: mouseLeaveHandler,
    focusin: focusInHandler,
    focusout: focusOutHandler
  };
}
function addHandlers(el, opts) {
  const removeHandlers = [];
  const handlers = getPopoverEventHandlers(opts);
  Object.entries(handlers).forEach(([event, handler]) => {
    removeHandlers.push(on$1(el, event, handler));
  });
  return () => removeHandlers.forEach((handler) => handler());
}
function setPopover(el, options) {
  const { name } = options;
  if (!name) {
    console.warn(`Popover name is missing from directive options: ${options}`);
    return;
  }
  const popoverEl = el;
  const popover = popoverEl.__popover__;
  if (popover) {
    popover.options.value = { ...options };
  } else {
    const optionsRef = vue.ref({ ...options });
    popoverEl.__popover__ = {
      name,
      options: optionsRef,
      cleanup: addHandlers(el, optionsRef)
    };
  }
}
function removePopover(el) {
  const popover = el.__popover__;
  if (popover) {
    popover.cleanup();
    delete el.__popover__;
  }
}
const directive = {
  mounted(el, binding) {
    const { value } = binding;
    if (!value)
      return;
    setPopover(el, value);
  },
  updated(el, binding) {
    if (!binding.value) {
      removePopover(el);
    } else {
      setPopover(el, binding.value);
    }
  },
  unmounted(el) {
    removePopover(el);
  }
};
const directives = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  popover: directive
}, Symbol.toStringTag, { value: "Module" }));
const sides = ["top", "right", "bottom", "left"];
const alignments = ["start", "end"];
const placements = /* @__PURE__ */ sides.reduce((acc, side) => acc.concat(side, side + "-" + alignments[0], side + "-" + alignments[1]), []);
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = (v) => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
const oppositeAlignmentMap = {
  start: "end",
  end: "start"
};
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ["left", "right"];
  const rl = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl)
        return isStart ? rl : lr;
      return isStart ? lr : rl;
    case "left":
    case "right":
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  return {
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
const computePosition$1 = async (reference, floating, config2) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config2;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data: data2,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platform2,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data2
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
      continue;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
async function detectOverflow(state2, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state2;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state2);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    ...rects.floating,
    x,
    y
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
function getPlacementList(alignment, autoAlignment, allowedPlacements) {
  const allowedPlacementsSortedByAlignment = alignment ? [...allowedPlacements.filter((placement) => getAlignment(placement) === alignment), ...allowedPlacements.filter((placement) => getAlignment(placement) !== alignment)] : allowedPlacements.filter((placement) => getSide(placement) === placement);
  return allowedPlacementsSortedByAlignment.filter((placement) => {
    if (alignment) {
      return getAlignment(placement) === alignment || (autoAlignment ? getOppositeAlignmentPlacement(placement) !== placement : false);
    }
    return true;
  });
}
const autoPlacement = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "autoPlacement",
    options,
    async fn(state2) {
      var _middlewareData$autoP, _middlewareData$autoP2, _placementsThatFitOnE;
      const {
        rects,
        middlewareData,
        placement,
        platform: platform2,
        elements
      } = state2;
      const {
        crossAxis = false,
        alignment,
        allowedPlacements = placements,
        autoAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state2);
      const placements$1 = alignment !== void 0 || allowedPlacements === placements ? getPlacementList(alignment || null, autoAlignment, allowedPlacements) : allowedPlacements;
      const overflow = await detectOverflow(state2, detectOverflowOptions);
      const currentIndex = ((_middlewareData$autoP = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP.index) || 0;
      const currentPlacement = placements$1[currentIndex];
      if (currentPlacement == null) {
        return {};
      }
      const alignmentSides = getAlignmentSides(currentPlacement, rects, await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)));
      if (placement !== currentPlacement) {
        return {
          reset: {
            placement: placements$1[0]
          }
        };
      }
      const currentOverflows = [overflow[getSide(currentPlacement)], overflow[alignmentSides[0]], overflow[alignmentSides[1]]];
      const allOverflows = [...((_middlewareData$autoP2 = middlewareData.autoPlacement) == null ? void 0 : _middlewareData$autoP2.overflows) || [], {
        placement: currentPlacement,
        overflows: currentOverflows
      }];
      const nextPlacement = placements$1[currentIndex + 1];
      if (nextPlacement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: nextPlacement
          }
        };
      }
      const placementsSortedByMostSpace = allOverflows.map((d) => {
        const alignment2 = getAlignment(d.placement);
        return [d.placement, alignment2 && crossAxis ? (
          // Check along the mainAxis and main crossAxis side.
          d.overflows.slice(0, 2).reduce((acc, v) => acc + v, 0)
        ) : (
          // Check only the mainAxis.
          d.overflows[0]
        ), d.overflows];
      }).sort((a, b) => a[1] - b[1]);
      const placementsThatFitOnEachSide = placementsSortedByMostSpace.filter((d) => d[2].slice(
        0,
        // Aligned placements should not check their opposite crossAxis
        // side.
        getAlignment(d[0]) ? 2 : 3
      ).every((v) => v <= 0));
      const resetPlacement = ((_placementsThatFitOnE = placementsThatFitOnEachSide[0]) == null ? void 0 : _placementsThatFitOnE[0]) || placementsSortedByMostSpace[0][0];
      if (resetPlacement !== placement) {
        return {
          data: {
            index: currentIndex + 1,
            overflows: allOverflows
          },
          reset: {
            placement: resetPlacement
          }
        };
      }
      return {};
    }
  };
};
const flip = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state2) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state2;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state2);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== "none") {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements2 = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state2, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements2[nextIndex];
        if (nextPlacement) {
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$map$so;
              const placement2 = (_overflowsData$map$so = overflowsData.map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
async function convertValueToCoords(state2, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state2;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state2);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...rawValue
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
const offset = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state2) {
      const {
        x,
        y
      } = state2;
      const diffCoords = await convertValueToCoords(state2, options);
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: diffCoords
      };
    }
  };
};
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null ? void 0 : (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isContainingBlock(element) {
  const webkit = isWebKit();
  const css = getComputedStyle(element);
  return css.transform !== "none" || css.perspective !== "none" || (css.containerType ? css.containerType !== "normal" : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== "none" : false) || !webkit && (css.filter ? css.filter !== "none" : false) || ["transform", "perspective", "filter"].some((value) => (css.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else {
      currentNode = getParentNode(currentNode);
    }
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.pageXOffset,
    scrollTop: element.pageYOffset
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], win.frameElement && traverseIframes ? getOverflowAncestors(win.frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getCssDimensions(element) {
  const css = getComputedStyle(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}
const noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  if (offsetParent === documentElement) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== "fixed") {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle(body).direction === "rtl") {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  return getCssDimensions(element);
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  return element.offsetParent;
}
function getOffsetParent(element, polyfill) {
  const window2 = getWindow(element);
  if (!isHTMLElement(element)) {
    return window2;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle(offsetParent).position === "static" && !isContainingBlock(offsetParent))) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}
const getElementRects = async function(_ref) {
  let {
    reference,
    floating,
    strategy
  } = _ref;
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  return {
    reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
    floating: {
      x: 0,
      y: 0,
      ...await getDimensionsFn(floating)
    }
  };
};
function isRTL(element) {
  return getComputedStyle(element).direction === "rtl";
}
const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root2 = getDocumentElement(element);
  function cleanup() {
    clearTimeout(timeoutId);
    io && io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root2.clientWidth - (left + width));
    const insetBottom = floor(root2.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 100);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root2.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          resizeObserver && resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo && cleanupIo();
    resizeObserver && resizeObserver.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
const computePosition = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};
const config = {
  action: "click",
  arrowHidden: false,
  arrowInsetHorizontal: 14,
  arrowInsetVertical: 8,
  arrowSize: 12,
  autoHide: true,
  autoPlacement: false,
  componentPrefix: "",
  contentClass: "",
  flip: true,
  hideDelay: 110,
  interactive: true,
  offset: 9,
  placement: "bottom-start",
  showDelay: 0,
  strategy: "absolute",
  teleport: "body",
  theme: "light",
  transitions: ["scale", "fade", "move"]
};
const _sfc_main$2$1 = vue.defineComponent({
  name: "PopoverContent",
  inheritAttrs: false,
  emits: ["show", "hide", "update"],
  props: {
    action: {
      type: String,
      default: () => config.action
    },
    anchor: {
      type: [String, Object, null]
    },
    arrowHidden: {
      type: Boolean,
      default: () => config.arrowHidden
    },
    arrowInsetHorizontal: {
      type: Number,
      default: () => config.arrowInsetHorizontal
    },
    arrowInsetVertical: {
      type: Number,
      default: () => config.arrowInsetVertical
    },
    arrowSize: {
      type: Number,
      default: () => config.arrowSize
    },
    autoHide: {
      type: Boolean,
      default: () => config.autoHide
    },
    autoPlacement: {
      type: [Boolean, Object],
      default: () => config.autoPlacement
    },
    contentClass: {
      type: String,
      default: () => config.contentClass
    },
    data: {
      type: null
    },
    flip: {
      type: Boolean,
      default: () => config.flip
    },
    hideDelay: {
      type: Number,
      default: () => config.hideDelay
    },
    interactive: {
      type: Boolean,
      default: () => config.interactive
    },
    name: {
      type: [Number, String, Symbol],
      required: true
    },
    offset: {
      type: [Number, Object],
      default: () => config.offset
    },
    placement: {
      type: String,
      default: () => config.placement
    },
    showDelay: {
      type: Number,
      default: () => config.showDelay
    },
    strategy: {
      type: String,
      default: () => config.strategy
    },
    teleport: {
      type: String,
      default: () => config.teleport
    },
    theme: {
      type: String,
      default: () => config.theme
    },
    transitions: {
      type: Array,
      default: () => config.transitions
    }
  },
  setup(props, { emit }) {
    let timeout = void 0;
    const popoverRef = vue.ref();
    const targetState = vue.ref(null);
    const state2 = vue.reactive({
      ...props,
      // Non-prop options
      target: null,
      // Private state
      focused: false,
      hovered: false,
      visible: false
    });
    vue.watch(
      () => props,
      () => assign(state2, props, targetState.value)
    );
    const popperStyle = vue.ref({});
    const style2 = vue.computed(() => ({
      ...popperStyle.value,
      "--arrow-size": `${state2.arrowSize}px`,
      "--arrow-display": state2.arrowHidden ? "none" : "block",
      "--arrow-inset-horizontal": `${state2.arrowInsetHorizontal}px`,
      "--arrow-inset-vertical": `${state2.arrowInsetVertical}px`,
      "--transition-property": transitionProperty.value
    }));
    const middleware = vue.computed(() => {
      const result = [];
      if (state2.autoPlacement) {
        result.push(
          autoPlacement(
            isBoolean$1(state2.autoPlacement) ? void 0 : state2.autoPlacement
          )
        );
      }
      if (state2.flip) {
        result.push(flip(isBoolean$1(state2.flip) ? void 0 : state2.flip));
      }
      if (state2.offset != null) {
        result.push(offset(state2.offset));
      }
      return result;
    });
    const actualPlacement = vue.ref(null);
    const direction = vue.computed(() => {
      const placement = actualPlacement.value ?? state2.placement ?? "bottom";
      return placement.split("-")[0];
    });
    const align = vue.computed(() => {
      const isLeftRight = direction.value === "left" || direction.value === "right";
      let align2 = "";
      const placement = actualPlacement.value ?? state2.placement ?? "";
      const parts = placement.split("-");
      if (parts.length > 1)
        align2 = parts[1];
      if (["start", "top", "left"].includes(align2)) {
        return isLeftRight ? "top" : "left";
      }
      if (["end", "bottom", "right"].includes(align2)) {
        return isLeftRight ? "bottom" : "right";
      }
      return isLeftRight ? "middle" : "center";
    });
    const supportsHover = vue.computed(() => {
      return ["hover", "hover-focus"].includes(state2.action);
    });
    const supportsFocus = vue.computed(() => {
      return ["focus", "hover-focus"].includes(state2.action);
    });
    const readonlyState = vue.computed(() => {
      return vue.readonly({
        ...state2,
        align: align.value,
        direction: direction.value,
        actualPlacement: actualPlacement.value
      });
    });
    vue.watch(
      () => readonlyState.value,
      (newState, oldState) => {
        const updates = {};
        Object.keys(newState).forEach((key) => {
          if (newState[key] !== oldState[key]) {
            updates[key] = [oldState[key], newState[key]];
          }
        });
        if (Object.keys(updates).length > 0) {
          const event = {
            ...newState,
            updates
          };
          emit("update", event);
          dispatch(PopoverContentEvents.update, event);
        }
      }
    );
    const transitionProperty = vue.computed(() => {
      const result = [];
      if (state2.transitions.includes("fade")) {
        result.push("opacity");
      }
      if (state2.transitions.some((t) => ["scale", "slide"].includes(t))) {
        result.push("transform");
      }
      if (state2.transitions.includes("move") && appeared.value) {
        result.push("top, right, bottom, left");
      }
      return result.join(", ");
    });
    const forced = vue.ref(false);
    function setTimer(delay, force, fn) {
      if (forced.value) {
        return;
      }
      if (force) {
        forced.value = true;
      }
      const fnWrapper = () => {
        forced.value = false;
        fn();
      };
      clearTimeout(timeout);
      if (delay > 0) {
        timeout = setTimeout(fnWrapper, delay);
      } else {
        fnWrapper();
      }
    }
    function dispatch(name, detail) {
      document.dispatchEvent(
        new CustomEvent(name, {
          detail
        })
      );
    }
    async function show(opts = {}) {
      const { force, ...newState } = opts;
      const target = newState.target ?? state2.target;
      if (!target) {
        console.warn(`PopoverContent requires a 'target' option`);
        return;
      }
      setTimer(newState.showDelay ?? state2.showDelay, force, () => {
        if (state2.visible && state2.target !== target) {
          emit("hide", readonlyState.value);
          dispatch(PopoverContentEvents.hide, readonlyState.value);
        }
        if (state2.visible && state2.target === target) {
          assign(targetState.value, newState);
          assign(state2, targetState.value);
        } else {
          targetState.value = assign({}, { anchor: newState.target }, newState);
          assign(state2, props, targetState.value, { visible: true });
        }
        vue.nextTick(() => {
          var _a;
          if (state2.interactive && state2.action === "click" && state2.target === document.activeElement) {
            const focusableElements = getFocusableElements();
            (_a = focusableElements[0]) == null ? void 0 : _a.focus({ preventScroll: true });
          }
          emit("show", readonlyState.value);
          dispatch(PopoverContentEvents.show, readonlyState.value);
        });
      });
    }
    function hide(opts = {}) {
      setTimer(opts.hideDelay ?? state2.hideDelay, opts.force, () => {
        state2.visible = false;
        targetState.value = null;
        if (state2.target && state2.interactive && document.activeElement && state2.action === "click" && getFocusableElements().includes(document.activeElement)) {
          state2.target.focus();
        }
        dispatch(PopoverContentEvents.hide, readonlyState.value);
      });
    }
    function update(opts = {}) {
      if (!state2.visible || !targetState.value) {
        return;
      }
      const { force, ...newState } = opts;
      assign(targetState.value, newState);
      assign(state2, targetState.value);
    }
    function onDocumentClick(e) {
      if (!popoverRef.value)
        return;
      const anchor = resolveEl(state2.anchor);
      if (anchor == null)
        return;
      const target = e.target;
      if (elementContains(popoverRef.value, target) || elementContains(anchor, target)) {
        return;
      }
      hide();
    }
    function onDocumentKeydown(e) {
      if (e.key === "Esc" || e.key === "Escape") {
        hide();
      }
    }
    function onDocumentShowPopover({ detail }) {
      const nameSpecified = !!detail.name;
      const nameMatchesSelf = detail.name === state2.name;
      if (nameSpecified && nameMatchesSelf) {
        show(detail);
      }
    }
    function onDocumentHidePopover({ detail }) {
      const nameSpecified = !!detail.name;
      const nameMatchesSelf = detail.name === state2.name;
      const targetNotSpecified = !detail.target;
      const targetMatchesSelf = detail.target === state2.target;
      if (nameSpecified && nameMatchesSelf && (targetNotSpecified || targetMatchesSelf)) {
        hide(detail);
      }
    }
    function onDocumentTogglePopover({ detail }) {
      const nameSpecified = !!detail.name;
      const nameMatchesSelf = detail.name === state2.name;
      const targetNotSpecified = !detail.target;
      const targetMatchesSelf = detail.target === state2.target;
      if (nameSpecified && nameMatchesSelf) {
        if (state2.visible && (targetNotSpecified || targetMatchesSelf)) {
          hide(detail);
        } else {
          show(detail);
        }
      }
    }
    function onDocumentUpdatePopover({ detail }) {
      const nameSpecified = !!detail.name;
      const nameMatchesSelf = detail.name === state2.name;
      const targetNotSpecified = !detail.target;
      const targetMatchesSelf = detail.target === state2.target;
      if (nameSpecified && nameMatchesSelf && (targetNotSpecified || targetMatchesSelf)) {
        update(detail);
      }
    }
    function onClick(e) {
      e.stopPropagation();
    }
    function onMouseOver() {
      if (state2.hovered) {
        return;
      }
      state2.hovered = true;
      if (supportsHover.value && state2.interactive) {
        show();
      }
    }
    function onMouseLeave() {
      if (!state2.hovered) {
        return;
      }
      state2.hovered = false;
      const el = resolveEl(state2.anchor);
      const selfNorAnchorFocused = !state2.focused && (!el || el !== document.activeElement);
      if (supportsHover.value && state2.autoHide && selfNorAnchorFocused) {
        hide();
      }
    }
    function onFocusIn() {
      if (state2.focused) {
        return;
      }
      state2.focused = true;
      if (supportsFocus.value && state2.interactive) {
        show();
      }
    }
    function onFocusOut(e) {
      if (!state2.focused) {
        return;
      }
      state2.focused = false;
      const focusNotInPopover = !e.relatedTarget || !elementContains(popoverRef.value, e.relatedTarget);
      if (supportsFocus.value && state2.autoHide && !state2.hovered && focusNotInPopover) {
        hide();
      }
    }
    vue.watchEffect((onCleanup) => {
      const el = resolveEl(state2.anchor);
      if (!el || !popoverRef.value)
        return;
      onCleanup(
        autoUpdate(el, popoverRef.value, () => {
          if (el == null || popoverRef.value == null)
            return;
          computePosition(el, popoverRef.value, {
            placement: state2.placement,
            strategy: state2.strategy,
            middleware: [...middleware.value]
          }).then(({ x, y, placement }) => {
            actualPlacement.value = placement;
            popperStyle.value = {
              left: `${x}px`,
              top: `${y}px`
            };
          });
        })
      );
    });
    function getFocusableElements() {
      var _a;
      return [
        ...((_a = popoverRef.value) == null ? void 0 : _a.querySelectorAll(
          "a[href], button, textarea, input, select"
        )) ?? []
      ];
    }
    function onPopoverKeydown(event) {
      if (event.key === "Tab") {
        if (popoverRef.value == null)
          return;
        const focusableElements = getFocusableElements();
        const hasFocusableElements = focusableElements.length > 0;
        const focusedFirst = hasFocusableElements ? document.activeElement === focusableElements[0] : false;
        const focusedLast = hasFocusableElements ? document.activeElement === focusableElements[focusableElements.length - 1] : false;
        if (event.shiftKey && focusedFirst) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        } else if (!event.shiftKey && focusedLast) {
          event.preventDefault();
          focusableElements[0].focus();
        }
      } else if (event.key === "Esc" || event.key === "Escape") {
        event.preventDefault();
        hide({ force: true });
      }
    }
    vue.watchEffect((onCleanup) => {
      if (!popoverRef.value || !state2.interactive) {
        return;
      }
      onCleanup(on$1(popoverRef.value, "keydown", onPopoverKeydown));
    });
    function addEvents() {
      on$1(document, "keydown", onDocumentKeydown);
      on$1(document, "click", onDocumentClick);
      on$1(document, PopoverTriggerEvents.triggerShow, onDocumentShowPopover);
      on$1(document, PopoverTriggerEvents.triggerHide, onDocumentHidePopover);
      on$1(document, PopoverTriggerEvents.triggerToggle, onDocumentTogglePopover);
      on$1(document, PopoverTriggerEvents.triggerUpdate, onDocumentUpdatePopover);
    }
    function removeEvents() {
      off$1(document, "keydown", onDocumentKeydown);
      off$1(document, "click", onDocumentClick);
      off$1(document, PopoverTriggerEvents.triggerShow, onDocumentShowPopover);
      off$1(document, PopoverTriggerEvents.triggerHide, onDocumentHidePopover);
      off$1(
        document,
        PopoverTriggerEvents.triggerToggle,
        onDocumentTogglePopover
      );
      off$1(
        document,
        PopoverTriggerEvents.triggerUpdate,
        onDocumentUpdatePopover
      );
    }
    vue.onMounted(() => {
      addEvents();
    });
    vue.onUnmounted(() => {
      removeEvents();
    });
    vue.watchEffect(() => {
      if (!props.name) {
        console.warn("PopoverContent requires a name from prop or context");
      } else {
        state2.name = props.name;
      }
    });
    const appeared = vue.ref(false);
    function onAfterEnter() {
      appeared.value = true;
    }
    function onAfterLeave() {
      appeared.value = false;
    }
    return {
      actualPlacement,
      align,
      contentClass: vue.toRef(state2, "contentClass"),
      theme: vue.toRef(state2, "theme"),
      data: vue.toRef(state2, "data"),
      direction,
      interactive: vue.toRef(state2, "interactive"),
      middleware,
      popoverRef,
      style: style2,
      teleport: vue.toRef(state2, "teleport"),
      transitions: vue.toRef(state2, "transitions"),
      visible: vue.toRef(state2, "visible"),
      hide,
      onClick,
      onMouseOver,
      onMouseLeave,
      onFocusIn,
      onFocusOut,
      onAfterEnter,
      onAfterLeave
    };
  }
});
const _export_sfc$1 = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _hoisted_1$d = ["data-direction", "data-align", "data-name"];
function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return vue.openBlock(), vue.createBlock(vue.Teleport, {
    to: _ctx.teleport,
    disabled: !_ctx.teleport
  }, [
    vue.createVNode(vue.Transition, {
      appear: "",
      onAfterEnter: _ctx.onAfterEnter,
      onAfterLeave: _ctx.onAfterLeave
    }, {
      default: vue.withCtx(() => {
        var _a, _b;
        return [
          _ctx.visible ? (vue.openBlock(), vue.createElementBlock("div", vue.mergeProps({ key: 0 }, _ctx.$attrs, {
            class: [
              "__v-popover-content__",
              _ctx.contentClass,
              {
                interactive: _ctx.interactive,
                [`__v-popover-content-${_ctx.theme}__`]: _ctx.theme,
                "__v-popover-transition__": ((_a = _ctx.transitions) == null ? void 0 : _a.length) > 0
              },
              ..._ctx.transitions.map((t) => `__v-popover-transition-${t}__`)
            ],
            style: _ctx.style,
            "data-direction": _ctx.direction,
            "data-align": _ctx.align,
            "data-name": (_b = _ctx.name) == null ? void 0 : _b.toString(),
            ref: "popoverRef",
            role: "dialog",
            onClick: _cache[0] || (_cache[0] = (...args) => _ctx.onClick && _ctx.onClick(...args)),
            onMouseover: _cache[1] || (_cache[1] = (...args) => _ctx.onMouseOver && _ctx.onMouseOver(...args)),
            onMouseleave: _cache[2] || (_cache[2] = (...args) => _ctx.onMouseLeave && _ctx.onMouseLeave(...args)),
            onFocusin: _cache[3] || (_cache[3] = (...args) => _ctx.onFocusIn && _ctx.onFocusIn(...args)),
            onFocusout: _cache[4] || (_cache[4] = (...args) => _ctx.onFocusOut && _ctx.onFocusOut(...args))
          }), [
            vue.renderSlot(_ctx.$slots, "default", {
              direction: _ctx.direction,
              align: _ctx.align,
              data: _ctx.data,
              hide: _ctx.hide
            }, () => [
              vue.createTextVNode(vue.toDisplayString(_ctx.data), 1)
            ])
          ], 16, _hoisted_1$d)) : vue.createCommentVNode("", true)
        ];
      }),
      _: 3
    }, 8, ["onAfterEnter", "onAfterLeave"])
  ], 8, ["to", "disabled"]);
}
const PopoverContent = /* @__PURE__ */ _export_sfc$1(_sfc_main$2$1, [["render", _sfc_render$7]]);
const BasePropTypes = {
  action: {
    type: String
  },
  anchor: {
    type: [String, Object, null]
  },
  arrowHidden: {
    type: Boolean,
    default: void 0
  },
  arrowSize: {
    type: Number
  },
  arrowInsetHorizontal: {
    type: Number
  },
  arrowInsetVertical: {
    type: Number
  },
  autoHide: {
    type: Boolean,
    default: void 0
  },
  autoPlacement: {
    type: [Boolean, Object]
  },
  content: {
    type: [String, Number]
  },
  contentClass: {
    type: String
  },
  data: {
    type: null
  },
  flip: {
    type: Boolean,
    default: void 0
  },
  hideDelay: {
    type: Number
  },
  id: {
    type: null,
    default: () => Symbol()
  },
  interactive: {
    type: Boolean,
    default: void 0
  },
  name: {
    type: [Number, String, Symbol],
    default: () => Symbol()
  },
  offset: {
    type: [Number, Object]
  },
  placement: {
    type: String
  },
  showDelay: {
    type: Number
  },
  teleport: {
    type: String
  },
  theme: {
    type: [String, null]
  },
  transitions: {
    type: Array
  }
};
const _sfc_main$1$1 = {
  name: "PopoverTrigger",
  inheritAttrs: false,
  props: BasePropTypes,
  emits: ["show", "hide", "update"],
  setup(props, { slots, emit }) {
    function flattenFragments(children) {
      return children.flatMap((node) => {
        if (node.type === vue.Fragment) {
          return flattenFragments(node.children);
        }
        return [node];
      });
    }
    function validNode(node) {
      return ![vue.Comment, vue.Text, vue.Static].some((type) => type === node.type);
    }
    const open = vue.ref(false);
    usePopoverEvent(
      "popovershow",
      (evt) => {
        open.value = true;
        emit("show", evt);
      },
      { id: props.id }
    );
    usePopoverEvent(
      "popoverhide",
      (evt) => {
        open.value = false;
        emit("hide", evt);
      },
      { id: props.id }
    );
    usePopoverEvent(
      "popoverupdate",
      (evt) => {
        emit("update", evt);
      },
      { id: props.id }
    );
    return () => {
      var _a;
      const slot = (_a = slots.default) == null ? void 0 : _a.call(slots, {
        open: open.value
      });
      if (!slot) {
        console.warn("PopoverTrigger requires a default slot");
        return null;
      }
      const el = flattenFragments(slot).find(validNode);
      if (!el) {
        console.warn("PopoverTrigger requires a valid child");
        return slot;
      }
      const trigger = vue.withDirectives(el, [[directive, props]]);
      if (props.content ?? slots.content) {
        return [
          trigger,
          vue.h(
            PopoverContent,
            { name: props.name },
            props.content != null ? () => props.content : slots.content
          )
        ];
      }
      return trigger;
    };
  }
};
const _sfc_main$j = {
  name: "Tooltip",
  props: {
    ...BasePropTypes,
    action: {
      type: String,
      default: "hover"
    },
    arrowSize: {
      type: Number,
      default: 10
    },
    contentClass: {
      type: String,
      default: "__v-popover-tooltip__"
    },
    offset: {
      type: [Number, Object],
      default: 7
    },
    theme: {
      type: [String, null],
      default: "dark"
    },
    interactive: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: "top"
    },
    transitions: {
      type: Array,
      default: () => ["fade"]
    }
  },
  render() {
    return vue.h(_sfc_main$1$1, this.$props, this.$slots);
  }
};
const components$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PopoverContent,
  PopoverTrigger: _sfc_main$1$1,
  Tooltip: _sfc_main$j
}, Symbol.toStringTag, { value: "Module" }));
const install$1 = (app, options = {}) => {
  assign(config, options);
  for (const directiveKey in directives) {
    const directive2 = directives[directiveKey];
    app.directive(directiveKey, directive2);
  }
  const prefix = config.componentPrefix;
  for (const componentKey in components$1) {
    const component = components$1[componentKey];
    app.component(`${prefix}${componentKey}`, component);
  }
};
const index$2 = { install: install$1, config };
const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PopoverContent,
  PopoverTrigger: _sfc_main$1$1,
  Tooltip: _sfc_main$j,
  assign,
  default: index$2,
  directive,
  elementContains,
  getPopoverEventHandlers,
  hidePopover,
  off: off$1,
  on: on$1,
  onPopoverEvent,
  resolveEl,
  showPopover,
  togglePopover,
  usePopoverEvent
}, Symbol.toStringTag, { value: "Module" }));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var objectProto$c = Object.prototype;
var hasOwnProperty$9 = objectProto$c.hasOwnProperty;
function baseHas$1(object, key) {
  return object != null && hasOwnProperty$9.call(object, key);
}
var _baseHas = baseHas$1;
var isArray$b = Array.isArray;
var isArray_1 = isArray$b;
var freeGlobal$1 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
var _freeGlobal = freeGlobal$1;
var freeGlobal = _freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root$8 = freeGlobal || freeSelf || Function("return this")();
var _root = root$8;
var root$7 = _root;
var Symbol$5 = root$7.Symbol;
var _Symbol = Symbol$5;
var Symbol$4 = _Symbol;
var objectProto$b = Object.prototype;
var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
var nativeObjectToString$1 = objectProto$b.toString;
var symToStringTag$1 = Symbol$4 ? Symbol$4.toStringTag : void 0;
function getRawTag$1(value) {
  var isOwn = hasOwnProperty$8.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var _getRawTag = getRawTag$1;
var objectProto$a = Object.prototype;
var nativeObjectToString = objectProto$a.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var _objectToString = objectToString$1;
var Symbol$3 = _Symbol, getRawTag = _getRawTag, objectToString = _objectToString;
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$3 ? Symbol$3.toStringTag : void 0;
function baseGetTag$9(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
var _baseGetTag = baseGetTag$9;
function isObjectLike$9(value) {
  return value != null && typeof value == "object";
}
var isObjectLike_1 = isObjectLike$9;
var baseGetTag$8 = _baseGetTag, isObjectLike$8 = isObjectLike_1;
var symbolTag$1 = "[object Symbol]";
function isSymbol$3(value) {
  return typeof value == "symbol" || isObjectLike$8(value) && baseGetTag$8(value) == symbolTag$1;
}
var isSymbol_1 = isSymbol$3;
var isArray$a = isArray_1, isSymbol$2 = isSymbol_1;
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey$3(value, object) {
  if (isArray$a(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol$2(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var _isKey = isKey$3;
function isObject$5(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var isObject_1 = isObject$5;
var baseGetTag$7 = _baseGetTag, isObject$4 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$2(value) {
  if (!isObject$4(value)) {
    return false;
  }
  var tag = baseGetTag$7(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$2;
var root$6 = _root;
var coreJsData$1 = root$6["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var _toSource = toSource$2;
var isFunction$1 = isFunction_1, isMasked = _isMasked, isObject$3 = isObject_1, toSource$1 = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$9 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$7).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value) {
  if (!isObject$3(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource$1(value));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object, key) {
  return object == null ? void 0 : object[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$7(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var _getNative = getNative$7;
var getNative$6 = _getNative;
var nativeCreate$4 = getNative$6(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$8 = Object.prototype;
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
function hashGet$1(key) {
  var data2 = this.__data__;
  if (nativeCreate$2) {
    var result = data2[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$6.call(data2, key) ? data2[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto$7 = Object.prototype;
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
function hashHas$1(key) {
  var data2 = this.__data__;
  return nativeCreate$1 ? data2[key] !== void 0 : hasOwnProperty$5.call(data2, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet$1(key, value) {
  var data2 = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data2[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
function eq$3(value, other) {
  return value === other || value !== value && other !== other;
}
var eq_1 = eq$3;
var eq$2 = eq_1;
function assocIndexOf$4(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$2(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data2 = this.__data__, index2 = assocIndexOf$3(data2, key);
  if (index2 < 0) {
    return false;
  }
  var lastIndex = data2.length - 1;
  if (index2 == lastIndex) {
    data2.pop();
  } else {
    splice.call(data2, index2, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data2 = this.__data__, index2 = assocIndexOf$2(data2, key);
  return index2 < 0 ? void 0 : data2[index2][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value) {
  var data2 = this.__data__, index2 = assocIndexOf(data2, key);
  if (index2 < 0) {
    ++this.size;
    data2.push([key, value]);
  } else {
    data2[index2][1] = value;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$4(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache$4.prototype.clear = listCacheClear;
ListCache$4.prototype["delete"] = listCacheDelete;
ListCache$4.prototype.get = listCacheGet;
ListCache$4.prototype.has = listCacheHas;
ListCache$4.prototype.set = listCacheSet;
var _ListCache = ListCache$4;
var getNative$5 = _getNative, root$5 = _root;
var Map$4 = getNative$5(root$5, "Map");
var _Map = Map$4;
var Hash = _Hash, ListCache$3 = _ListCache, Map$3 = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$3 || ListCache$3)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map, key) {
  var data2 = map.__data__;
  return isKeyable(key) ? data2[typeof key == "string" ? "string" : "hash"] : data2.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value) {
  var data2 = getMapData(this, key), size = data2.size;
  data2.set(key, value);
  this.size += data2.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$3(entries) {
  var index2 = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache$3.prototype.clear = mapCacheClear;
MapCache$3.prototype["delete"] = mapCacheDelete;
MapCache$3.prototype.get = mapCacheGet;
MapCache$3.prototype.has = mapCacheHas;
MapCache$3.prototype.set = mapCacheSet;
var _MapCache = MapCache$3;
var MapCache$2 = _MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize$1(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache$2)();
  return memoized;
}
memoize$1.Cache = MapCache$2;
var memoize_1 = memoize$1;
var memoize = memoize_1;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped$1(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var _memoizeCapped = memoizeCapped$1;
var memoizeCapped = _memoizeCapped;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath$1 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var _stringToPath = stringToPath$1;
function arrayMap$1(array, iteratee) {
  var index2 = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index2 < length) {
    result[index2] = iteratee(array[index2], index2, array);
  }
  return result;
}
var _arrayMap = arrayMap$1;
var Symbol$2 = _Symbol, arrayMap = _arrayMap, isArray$9 = isArray_1, isSymbol$1 = isSymbol_1;
var INFINITY$1 = 1 / 0;
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : void 0, symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString$1(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$9(value)) {
    return arrayMap(value, baseToString$1) + "";
  }
  if (isSymbol$1(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
var _baseToString = baseToString$1;
var baseToString = _baseToString;
function toString$1(value) {
  return value == null ? "" : baseToString(value);
}
var toString_1 = toString$1;
var isArray$8 = isArray_1, isKey$2 = _isKey, stringToPath = _stringToPath, toString = toString_1;
function castPath$2(value, object) {
  if (isArray$8(value)) {
    return value;
  }
  return isKey$2(value, object) ? [value] : stringToPath(toString(value));
}
var _castPath = castPath$2;
var baseGetTag$6 = _baseGetTag, isObjectLike$7 = isObjectLike_1;
var argsTag$2 = "[object Arguments]";
function baseIsArguments$1(value) {
  return isObjectLike$7(value) && baseGetTag$6(value) == argsTag$2;
}
var _baseIsArguments = baseIsArguments$1;
var baseIsArguments = _baseIsArguments, isObjectLike$6 = isObjectLike_1;
var objectProto$6 = Object.prototype;
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;
var isArguments$2 = baseIsArguments(function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike$6(value) && hasOwnProperty$4.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
var isArguments_1 = isArguments$2;
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex$3(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var _isIndex = isIndex$3;
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength$3(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
var isLength_1 = isLength$3;
var isSymbol = isSymbol_1;
var INFINITY = 1 / 0;
function toKey$4(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
var _toKey = toKey$4;
var castPath$1 = _castPath, isArguments$1 = isArguments_1, isArray$7 = isArray_1, isIndex$2 = _isIndex, isLength$2 = isLength_1, toKey$3 = _toKey;
function hasPath$2(object, path, hasFunc) {
  path = castPath$1(path, object);
  var index2 = -1, length = path.length, result = false;
  while (++index2 < length) {
    var key = toKey$3(path[index2]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index2 != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength$2(length) && isIndex$2(key, length) && (isArray$7(object) || isArguments$1(object));
}
var _hasPath = hasPath$2;
var baseHas = _baseHas, hasPath$1 = _hasPath;
function has$1(object, path) {
  return object != null && hasPath$1(object, path, baseHas);
}
var has_1 = has$1;
var baseGetTag$5 = _baseGetTag, isObjectLike$5 = isObjectLike_1;
var dateTag$2 = "[object Date]";
function baseIsDate$1(value) {
  return isObjectLike$5(value) && baseGetTag$5(value) == dateTag$2;
}
var _baseIsDate = baseIsDate$1;
function baseUnary$2(func) {
  return function(value) {
    return func(value);
  };
}
var _baseUnary = baseUnary$2;
var _nodeUtilExports = {};
var _nodeUtil = {
  get exports() {
    return _nodeUtilExports;
  },
  set exports(v) {
    _nodeUtilExports = v;
  }
};
(function(module2, exports2) {
  var freeGlobal2 = _freeGlobal;
  var freeExports = exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && true && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal2.process;
  var nodeUtil2 = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module2.exports = nodeUtil2;
})(_nodeUtil, _nodeUtilExports);
var baseIsDate = _baseIsDate, baseUnary$1 = _baseUnary, nodeUtil$1 = _nodeUtilExports;
var nodeIsDate = nodeUtil$1 && nodeUtil$1.isDate;
var isDate$1 = nodeIsDate ? baseUnary$1(nodeIsDate) : baseIsDate;
var isDate_1 = isDate$1;
var baseGetTag$4 = _baseGetTag, isArray$6 = isArray_1, isObjectLike$4 = isObjectLike_1;
var stringTag$2 = "[object String]";
function isString(value) {
  return typeof value == "string" || !isArray$6(value) && isObjectLike$4(value) && baseGetTag$4(value) == stringTag$2;
}
var isString_1 = isString;
function arraySome$2(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length;
  while (++index2 < length) {
    if (predicate(array[index2], index2, array)) {
      return true;
    }
  }
  return false;
}
var _arraySome = arraySome$2;
var ListCache$2 = _ListCache;
function stackClear$1() {
  this.__data__ = new ListCache$2();
  this.size = 0;
}
var _stackClear = stackClear$1;
function stackDelete$1(key) {
  var data2 = this.__data__, result = data2["delete"](key);
  this.size = data2.size;
  return result;
}
var _stackDelete = stackDelete$1;
function stackGet$1(key) {
  return this.__data__.get(key);
}
var _stackGet = stackGet$1;
function stackHas$1(key) {
  return this.__data__.has(key);
}
var _stackHas = stackHas$1;
var ListCache$1 = _ListCache, Map$2 = _Map, MapCache$1 = _MapCache;
var LARGE_ARRAY_SIZE = 200;
function stackSet$1(key, value) {
  var data2 = this.__data__;
  if (data2 instanceof ListCache$1) {
    var pairs = data2.__data__;
    if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data2.size;
      return this;
    }
    data2 = this.__data__ = new MapCache$1(pairs);
  }
  data2.set(key, value);
  this.size = data2.size;
  return this;
}
var _stackSet = stackSet$1;
var ListCache = _ListCache, stackClear = _stackClear, stackDelete = _stackDelete, stackGet = _stackGet, stackHas = _stackHas, stackSet = _stackSet;
function Stack$2(entries) {
  var data2 = this.__data__ = new ListCache(entries);
  this.size = data2.size;
}
Stack$2.prototype.clear = stackClear;
Stack$2.prototype["delete"] = stackDelete;
Stack$2.prototype.get = stackGet;
Stack$2.prototype.has = stackHas;
Stack$2.prototype.set = stackSet;
var _Stack = Stack$2;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd$1(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
var _setCacheAdd = setCacheAdd$1;
function setCacheHas$1(value) {
  return this.__data__.has(value);
}
var _setCacheHas = setCacheHas$1;
var MapCache = _MapCache, setCacheAdd = _setCacheAdd, setCacheHas = _setCacheHas;
function SetCache$1(values) {
  var index2 = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index2 < length) {
    this.add(values[index2]);
  }
}
SetCache$1.prototype.add = SetCache$1.prototype.push = setCacheAdd;
SetCache$1.prototype.has = setCacheHas;
var _SetCache = SetCache$1;
function cacheHas$1(cache, key) {
  return cache.has(key);
}
var _cacheHas = cacheHas$1;
var SetCache = _SetCache, arraySome$1 = _arraySome, cacheHas = _cacheHas;
var COMPARE_PARTIAL_FLAG$5 = 1, COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays$2(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index2 = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index2 < arrLength) {
    var arrValue = array[index2], othValue = other[index2];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index2, other, array, stack) : customizer(arrValue, othValue, index2, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome$1(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var _equalArrays = equalArrays$2;
var root$4 = _root;
var Uint8Array$1 = root$4.Uint8Array;
var _Uint8Array = Uint8Array$1;
function mapToArray$1(map) {
  var index2 = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index2] = [key, value];
  });
  return result;
}
var _mapToArray = mapToArray$1;
function setToArray$1(set) {
  var index2 = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index2] = value;
  });
  return result;
}
var _setToArray = setToArray$1;
var Symbol$1 = _Symbol, Uint8Array2 = _Uint8Array, eq$1 = eq_1, equalArrays$1 = _equalArrays, mapToArray = _mapToArray, setToArray = _setToArray;
var COMPARE_PARTIAL_FLAG$4 = 1, COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag$2 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", mapTag$2 = "[object Map]", numberTag$2 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag$1(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag$1:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
        return false;
      }
      return true;
    case boolTag$2:
    case dateTag$1:
    case numberTag$2:
      return eq$1(+object, +other);
    case errorTag$1:
      return object.name == other.name && object.message == other.message;
    case regexpTag$1:
    case stringTag$1:
      return object == other + "";
    case mapTag$2:
      var convert = mapToArray;
    case setTag$2:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack.set(object, other);
      var result = equalArrays$1(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var _equalByTag = equalByTag$1;
function arrayPush$1(array, values) {
  var index2 = -1, length = values.length, offset2 = array.length;
  while (++index2 < length) {
    array[offset2 + index2] = values[index2];
  }
  return array;
}
var _arrayPush = arrayPush$1;
var arrayPush = _arrayPush, isArray$5 = isArray_1;
function baseGetAllKeys$1(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$5(object) ? result : arrayPush(result, symbolsFunc(object));
}
var _baseGetAllKeys = baseGetAllKeys$1;
function arrayFilter$1(array, predicate) {
  var index2 = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index2 < length) {
    var value = array[index2];
    if (predicate(value, index2, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
var _arrayFilter = arrayFilter$1;
function stubArray$1() {
  return [];
}
var stubArray_1 = stubArray$1;
var arrayFilter = _arrayFilter, stubArray = stubArray_1;
var objectProto$5 = Object.prototype;
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols$1 = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
var _getSymbols = getSymbols$1;
function baseTimes$1(n, iteratee) {
  var index2 = -1, result = Array(n);
  while (++index2 < n) {
    result[index2] = iteratee(index2);
  }
  return result;
}
var _baseTimes = baseTimes$1;
var isBufferExports = {};
var isBuffer$2 = {
  get exports() {
    return isBufferExports;
  },
  set exports(v) {
    isBufferExports = v;
  }
};
function stubFalse() {
  return false;
}
var stubFalse_1 = stubFalse;
(function(module2, exports2) {
  var root2 = _root, stubFalse2 = stubFalse_1;
  var freeExports = exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && true && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root2.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer2 = nativeIsBuffer || stubFalse2;
  module2.exports = isBuffer2;
})(isBuffer$2, isBufferExports);
var baseGetTag$3 = _baseGetTag, isLength$1 = isLength_1, isObjectLike$3 = isObjectLike_1;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag$1 = "[object Map]", numberTag$1 = "[object Number]", objectTag$2 = "[object Object]", regexpTag = "[object RegExp]", setTag$1 = "[object Set]", stringTag = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] = typedArrayTags[setTag$1] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray$1(value) {
  return isObjectLike$3(value) && isLength$1(value.length) && !!typedArrayTags[baseGetTag$3(value)];
}
var _baseIsTypedArray = baseIsTypedArray$1;
var baseIsTypedArray = _baseIsTypedArray, baseUnary = _baseUnary, nodeUtil = _nodeUtilExports;
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray$2 = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var isTypedArray_1 = isTypedArray$2;
var baseTimes = _baseTimes, isArguments = isArguments_1, isArray$4 = isArray_1, isBuffer$1 = isBufferExports, isIndex$1 = _isIndex, isTypedArray$1 = isTypedArray_1;
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function arrayLikeKeys$1(value, inherited) {
  var isArr = isArray$4(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer$1(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex$1(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var _arrayLikeKeys = arrayLikeKeys$1;
var objectProto$3 = Object.prototype;
function isPrototype$1(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$3;
  return value === proto;
}
var _isPrototype = isPrototype$1;
function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var _overArg = overArg$1;
var overArg = _overArg;
var nativeKeys$1 = overArg(Object.keys, Object);
var _nativeKeys = nativeKeys$1;
var isPrototype = _isPrototype, nativeKeys = _nativeKeys;
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function baseKeys$1(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
var _baseKeys = baseKeys$1;
var isFunction = isFunction_1, isLength = isLength_1;
function isArrayLike$3(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
var isArrayLike_1 = isArrayLike$3;
var arrayLikeKeys = _arrayLikeKeys, baseKeys = _baseKeys, isArrayLike$2 = isArrayLike_1;
function keys$3(object) {
  return isArrayLike$2(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var keys_1 = keys$3;
var baseGetAllKeys = _baseGetAllKeys, getSymbols = _getSymbols, keys$2 = keys_1;
function getAllKeys$1(object) {
  return baseGetAllKeys(object, keys$2, getSymbols);
}
var _getAllKeys = getAllKeys$1;
var getAllKeys = _getAllKeys;
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects$1(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index2 = objLength;
  while (index2--) {
    var key = objProps[index2];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index2 < objLength) {
    key = objProps[index2];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var _equalObjects = equalObjects$1;
var getNative$4 = _getNative, root$3 = _root;
var DataView$1 = getNative$4(root$3, "DataView");
var _DataView = DataView$1;
var getNative$3 = _getNative, root$2 = _root;
var Promise$2 = getNative$3(root$2, "Promise");
var _Promise = Promise$2;
var getNative$2 = _getNative, root$1 = _root;
var Set$1 = getNative$2(root$1, "Set");
var _Set = Set$1;
var getNative$1 = _getNative, root = _root;
var WeakMap$1 = getNative$1(root, "WeakMap");
var _WeakMap = WeakMap$1;
var DataView = _DataView, Map$1 = _Map, Promise$1 = _Promise, Set = _Set, WeakMap = _WeakMap, baseGetTag$2 = _baseGetTag, toSource = _toSource;
var mapTag = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
var getTag$1 = baseGetTag$2;
if (DataView && getTag$1(new DataView(new ArrayBuffer(1))) != dataViewTag || Map$1 && getTag$1(new Map$1()) != mapTag || Promise$1 && getTag$1(Promise$1.resolve()) != promiseTag || Set && getTag$1(new Set()) != setTag || WeakMap && getTag$1(new WeakMap()) != weakMapTag) {
  getTag$1 = function(value) {
    var result = baseGetTag$2(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
var _getTag = getTag$1;
var Stack$1 = _Stack, equalArrays = _equalArrays, equalByTag = _equalByTag, equalObjects = _equalObjects, getTag = _getTag, isArray$3 = isArray_1, isBuffer = isBufferExports, isTypedArray = isTypedArray_1;
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep$1(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$3(object), othIsArr = isArray$3(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack$1());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack$1());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack$1());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
var _baseIsEqualDeep = baseIsEqualDeep$1;
var baseIsEqualDeep = _baseIsEqualDeep, isObjectLike$2 = isObjectLike_1;
function baseIsEqual$2(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike$2(value) && !isObjectLike$2(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual$2, stack);
}
var _baseIsEqual = baseIsEqual$2;
var Stack = _Stack, baseIsEqual$1 = _baseIsEqual;
var COMPARE_PARTIAL_FLAG$1 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch$1(object, source, matchData, customizer) {
  var index2 = matchData.length, length = index2, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index2--) {
    var data2 = matchData[index2];
    if (noCustomizer && data2[2] ? data2[1] !== object[data2[0]] : !(data2[0] in object)) {
      return false;
    }
  }
  while (++index2 < length) {
    data2 = matchData[index2];
    var key = data2[0], objValue = object[key], srcValue = data2[1];
    if (noCustomizer && data2[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual$1(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
var _baseIsMatch = baseIsMatch$1;
var isObject$2 = isObject_1;
function isStrictComparable$2(value) {
  return value === value && !isObject$2(value);
}
var _isStrictComparable = isStrictComparable$2;
var isStrictComparable$1 = _isStrictComparable, keys$1 = keys_1;
function getMatchData$1(object) {
  var result = keys$1(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable$1(value)];
  }
  return result;
}
var _getMatchData = getMatchData$1;
function matchesStrictComparable$2(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
var _matchesStrictComparable = matchesStrictComparable$2;
var baseIsMatch = _baseIsMatch, getMatchData = _getMatchData, matchesStrictComparable$1 = _matchesStrictComparable;
function baseMatches$1(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable$1(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}
var _baseMatches = baseMatches$1;
var castPath = _castPath, toKey$2 = _toKey;
function baseGet$2(object, path) {
  path = castPath(path, object);
  var index2 = 0, length = path.length;
  while (object != null && index2 < length) {
    object = object[toKey$2(path[index2++])];
  }
  return index2 && index2 == length ? object : void 0;
}
var _baseGet = baseGet$2;
var baseGet$1 = _baseGet;
function get$1(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet$1(object, path);
  return result === void 0 ? defaultValue : result;
}
var get_1 = get$1;
function baseHasIn$1(object, key) {
  return object != null && key in Object(object);
}
var _baseHasIn = baseHasIn$1;
var baseHasIn = _baseHasIn, hasPath = _hasPath;
function hasIn$1(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}
var hasIn_1 = hasIn$1;
var baseIsEqual = _baseIsEqual, get = get_1, hasIn = hasIn_1, isKey$1 = _isKey, isStrictComparable = _isStrictComparable, matchesStrictComparable = _matchesStrictComparable, toKey$1 = _toKey;
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty$1(path, srcValue) {
  if (isKey$1(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey$1(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
var _baseMatchesProperty = baseMatchesProperty$1;
function identity$1(value) {
  return value;
}
var identity_1 = identity$1;
function baseProperty$1(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
var _baseProperty = baseProperty$1;
var baseGet = _baseGet;
function basePropertyDeep$1(path) {
  return function(object) {
    return baseGet(object, path);
  };
}
var _basePropertyDeep = basePropertyDeep$1;
var baseProperty = _baseProperty, basePropertyDeep = _basePropertyDeep, isKey = _isKey, toKey = _toKey;
function property$1(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
var property_1 = property$1;
var baseMatches = _baseMatches, baseMatchesProperty = _baseMatchesProperty, identity = identity_1, isArray$2 = isArray_1, property = property_1;
function baseIteratee$2(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == "object") {
    return isArray$2(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
var _baseIteratee = baseIteratee$2;
function createBaseFor$1(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index2 = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index2];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var _createBaseFor = createBaseFor$1;
var createBaseFor = _createBaseFor;
var baseFor$1 = createBaseFor();
var _baseFor = baseFor$1;
var baseFor = _baseFor, keys = keys_1;
function baseForOwn$2(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}
var _baseForOwn = baseForOwn$2;
var isArrayLike$1 = isArrayLike_1;
function createBaseEach$1(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike$1(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index2 = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index2-- : ++index2 < length) {
      if (iteratee(iterable[index2], index2, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var _createBaseEach = createBaseEach$1;
var baseForOwn$1 = _baseForOwn, createBaseEach = _createBaseEach;
var baseEach$1 = createBaseEach(baseForOwn$1);
var _baseEach = baseEach$1;
var baseEach = _baseEach;
function baseSome$1(collection, predicate) {
  var result;
  baseEach(collection, function(value, index2, collection2) {
    result = predicate(value, index2, collection2);
    return !result;
  });
  return !!result;
}
var _baseSome = baseSome$1;
var eq = eq_1, isArrayLike = isArrayLike_1, isIndex = _isIndex, isObject$1 = isObject_1;
function isIterateeCall$1(value, index2, object) {
  if (!isObject$1(object)) {
    return false;
  }
  var type = typeof index2;
  if (type == "number" ? isArrayLike(object) && isIndex(index2, object.length) : type == "string" && index2 in object) {
    return eq(object[index2], value);
  }
  return false;
}
var _isIterateeCall = isIterateeCall$1;
var arraySome = _arraySome, baseIteratee$1 = _baseIteratee, baseSome = _baseSome, isArray$1 = isArray_1, isIterateeCall = _isIterateeCall;
function some(collection, predicate, guard) {
  var func = isArray$1(collection) ? arraySome : baseSome;
  if (guard && isIterateeCall(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee$1(predicate));
}
var some_1 = some;
var baseGetTag$1 = _baseGetTag, isObjectLike$1 = isObjectLike_1;
var boolTag = "[object Boolean]";
function isBoolean(value) {
  return value === true || value === false || isObjectLike$1(value) && baseGetTag$1(value) == boolTag;
}
var isBoolean_1 = isBoolean;
var baseGetTag = _baseGetTag, isObjectLike = isObjectLike_1;
var numberTag = "[object Number]";
function isNumber(value) {
  return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
}
var isNumber_1 = isNumber;
var getNative = _getNative;
var defineProperty$1 = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
var _defineProperty = defineProperty$1;
var defineProperty = _defineProperty;
function baseAssignValue$1(object, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
var _baseAssignValue = baseAssignValue$1;
var baseAssignValue = _baseAssignValue, baseForOwn = _baseForOwn, baseIteratee = _baseIteratee;
function mapValues(object, iteratee) {
  var result = {};
  iteratee = baseIteratee(iteratee);
  baseForOwn(object, function(value, key, object2) {
    baseAssignValue(result, key, iteratee(value, key, object2));
  });
  return result;
}
var mapValues_1 = mapValues;
function head(array) {
  return array && array.length ? array[0] : void 0;
}
var head_1 = head;
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : void 0;
}
var last_1 = last;
const getType = (value) => Object.prototype.toString.call(value).slice(8, -1);
const isDate = (value) => isDate_1(value) && !isNaN(value.getTime());
const isObject = (value) => getType(value) === "Object";
const has = has_1;
const hasAny = (obj, props) => some_1(props, (p) => has_1(obj, p));
const pad = (val, len, char = "0") => {
  val = val !== null && val !== void 0 ? String(val) : "";
  len = len || 2;
  while (val.length < len) {
    val = `${char}${val}`;
  }
  return val;
};
const warnings = {
  visibility: {
    shown: false,
    message: "Popover option `visibility` is deprecated. Use `action` instead."
  },
  navVisibility: {
    shown: false,
    message: "The `navVisibility` prop is deprecated. Use `navPopover` instead."
  },
  target: {
    shown: false,
    message: "Popover option `target` is deprecated. Use `anchor` instead."
  },
  interactive: {
    shown: false,
    message: "Popover option `isInteractive` is deprecated. Use `interactive` instead."
  },
  positionFixed: {
    shown: false,
    message: "Popover option `positionFixed` is deprecated. Use `strategy` instead."
  },
  modifiers: {
    shown: false,
    message: "Popover option `modifiers` is deprecated."
  }
};
function displayWarning(key) {
  if (!warnings[key].shown) {
    console.warn(warnings[key].message);
    warnings[key].shown = true;
  }
}
function cleanPopoverOptions(opts) {
  const {
    visibility,
    target,
    isInteractive,
    modifiers,
    positionFixed,
    ...cleanOpts
  } = opts;
  if (visibility != null) {
    displayWarning("visibility");
    cleanOpts.action = visibility;
  }
  if (target != null) {
    displayWarning("target");
    cleanOpts.anchor = target;
  }
  if (isInteractive != null) {
    displayWarning("interactive");
    cleanOpts.interactive = isInteractive;
  }
  if (positionFixed != null) {
    displayWarning("positionFixed");
    cleanOpts.strategy = positionFixed ? "fixed" : "absolute";
  }
  if (modifiers != null) {
    displayWarning("modifiers");
  }
  return cleanOpts;
}
const isArray = (val) => Array.isArray(val);
const arrayHasItems = (array) => isArray(array) && array.length > 0;
const off = (element, event, handler, opts = void 0) => {
  element.removeEventListener(event, handler, opts);
};
const on = (element, event, handler, opts = void 0) => {
  element.addEventListener(event, handler, opts);
  return () => off(element, event, handler, opts);
};
const onSpaceOrEnter = (event, handler) => {
  if (event.key === " " || event.key === "Enter") {
    handler(event);
    event.preventDefault();
  }
};
const omit = (obj, ...keys2) => {
  const ret = {};
  let key;
  for (key in obj) {
    if (!keys2.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};
const pick = (obj, keys2) => {
  const ret = {};
  keys2.forEach((key) => {
    if (key in obj)
      ret[key] = obj[key];
  });
  return ret;
};
function defaults(target, ...sources) {
  for (let source of sources) {
    if (source != null) {
      for (const key in source) {
        if (target[key] === void 0) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
function defaultsDeep(target, ...sources) {
  for (let source of sources) {
    if (source != null) {
      for (const key in source) {
        if (typeof source[key] === "object" && target[key]) {
          defaultsDeep(target[key], source[key]);
        } else if (target[key] === void 0) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
function clamp(num, min2, max2) {
  return Math.min(Math.max(num, min2), max2);
}
var toIntegerExports = {};
var toInteger$2 = {
  get exports() {
    return toIntegerExports;
  },
  set exports(v) {
    toIntegerExports = v;
  }
};
(function(module2, exports2) {
  Object.defineProperty(exports2, "__esModule", {
    value: true
  });
  exports2.default = toInteger2;
  function toInteger2(dirtyNumber) {
    if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
      return NaN;
    }
    var number = Number(dirtyNumber);
    if (isNaN(number)) {
      return number;
    }
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  }
  module2.exports = exports2.default;
})(toInteger$2, toIntegerExports);
const toInteger$1 = /* @__PURE__ */ getDefaultExportFromCjs(toIntegerExports);
var getTimezoneOffsetInMillisecondsExports = {};
var getTimezoneOffsetInMilliseconds$2 = {
  get exports() {
    return getTimezoneOffsetInMillisecondsExports;
  },
  set exports(v) {
    getTimezoneOffsetInMillisecondsExports = v;
  }
};
(function(module2, exports2) {
  Object.defineProperty(exports2, "__esModule", {
    value: true
  });
  exports2.default = getTimezoneOffsetInMilliseconds2;
  function getTimezoneOffsetInMilliseconds2(date) {
    var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    utcDate.setUTCFullYear(date.getFullYear());
    return date.getTime() - utcDate.getTime();
  }
  module2.exports = exports2.default;
})(getTimezoneOffsetInMilliseconds$2, getTimezoneOffsetInMillisecondsExports);
const getTimezoneOffsetInMilliseconds$1 = /* @__PURE__ */ getDefaultExportFromCjs(getTimezoneOffsetInMillisecondsExports);
function tzTokenizeDate(date, timeZone) {
  var dtf = getDateTimeFormat(timeZone);
  return dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
}
var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};
function partsOffset(dtf, date) {
  try {
    var formatted = dtf.formatToParts(date);
    var filled = [];
    for (var i = 0; i < formatted.length; i++) {
      var pos = typeToPos[formatted[i].type];
      if (pos >= 0) {
        filled[pos] = parseInt(formatted[i].value, 10);
      }
    }
    return filled;
  } catch (error) {
    if (error instanceof RangeError) {
      return [NaN];
    }
    throw error;
  }
}
function hackyOffset(dtf, date) {
  var formatted = dtf.format(date).replace(/\u200E/g, "");
  var parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted);
  return [parsed[3], parsed[1], parsed[2], parsed[4], parsed[5], parsed[6]];
}
var dtfCache = {};
function getDateTimeFormat(timeZone) {
  if (!dtfCache[timeZone]) {
    var testDateFormatted = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: "America/New_York",
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(/* @__PURE__ */ new Date("2014-06-25T04:00:00.123Z"));
    var hourCycleSupported = testDateFormatted === "06/25/2014, 00:00:00" || testDateFormatted === "‎06‎/‎25‎/‎2014‎ ‎00‎:‎00‎:‎00";
    dtfCache[timeZone] = hourCycleSupported ? new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }) : new Intl.DateTimeFormat("en-US", {
      hourCycle: "h23",
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  return dtfCache[timeZone];
}
function newDateUTC(fullYear, month, day, hour, minute, second, millisecond) {
  var utcDate = /* @__PURE__ */ new Date(0);
  utcDate.setUTCFullYear(fullYear, month, day);
  utcDate.setUTCHours(hour, minute, second, millisecond);
  return utcDate;
}
var MILLISECONDS_IN_HOUR$1 = 36e5;
var MILLISECONDS_IN_MINUTE$1 = 6e4;
var patterns$1 = {
  timezone: /([Z+-].*)$/,
  timezoneZ: /^(Z)$/,
  timezoneHH: /^([+-]\d{2})$/,
  timezoneHHMM: /^([+-]\d{2}):?(\d{2})$/
};
function tzParseTimezone(timezoneString, date, isUtcDate) {
  var token2;
  var absoluteOffset;
  if (!timezoneString) {
    return 0;
  }
  token2 = patterns$1.timezoneZ.exec(timezoneString);
  if (token2) {
    return 0;
  }
  var hours2;
  token2 = patterns$1.timezoneHH.exec(timezoneString);
  if (token2) {
    hours2 = parseInt(token2[1], 10);
    if (!validateTimezone(hours2)) {
      return NaN;
    }
    return -(hours2 * MILLISECONDS_IN_HOUR$1);
  }
  token2 = patterns$1.timezoneHHMM.exec(timezoneString);
  if (token2) {
    hours2 = parseInt(token2[1], 10);
    var minutes = parseInt(token2[2], 10);
    if (!validateTimezone(hours2, minutes)) {
      return NaN;
    }
    absoluteOffset = Math.abs(hours2) * MILLISECONDS_IN_HOUR$1 + minutes * MILLISECONDS_IN_MINUTE$1;
    return hours2 > 0 ? -absoluteOffset : absoluteOffset;
  }
  if (isValidTimezoneIANAString(timezoneString)) {
    date = new Date(date || Date.now());
    var utcDate = isUtcDate ? date : toUtcDate(date);
    var offset2 = calcOffset(utcDate, timezoneString);
    var fixedOffset = isUtcDate ? offset2 : fixOffset(date, offset2, timezoneString);
    return -fixedOffset;
  }
  return NaN;
}
function toUtcDate(date) {
  return newDateUTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
}
function calcOffset(date, timezoneString) {
  var tokens = tzTokenizeDate(date, timezoneString);
  var asUTC = newDateUTC(
    tokens[0],
    tokens[1] - 1,
    tokens[2],
    tokens[3] % 24,
    tokens[4],
    tokens[5],
    0
  ).getTime();
  var asTS = date.getTime();
  var over = asTS % 1e3;
  asTS -= over >= 0 ? over : 1e3 + over;
  return asUTC - asTS;
}
function fixOffset(date, offset2, timezoneString) {
  var localTS = date.getTime();
  var utcGuess = localTS - offset2;
  var o2 = calcOffset(new Date(utcGuess), timezoneString);
  if (offset2 === o2) {
    return offset2;
  }
  utcGuess -= o2 - offset2;
  var o3 = calcOffset(new Date(utcGuess), timezoneString);
  if (o2 === o3) {
    return o2;
  }
  return Math.max(o2, o3);
}
function validateTimezone(hours2, minutes) {
  return -23 <= hours2 && hours2 <= 23 && (minutes == null || 0 <= minutes && minutes <= 59);
}
var validIANATimezoneCache = {};
function isValidTimezoneIANAString(timeZoneString) {
  if (validIANATimezoneCache[timeZoneString])
    return true;
  try {
    new Intl.DateTimeFormat(void 0, { timeZone: timeZoneString });
    validIANATimezoneCache[timeZoneString] = true;
    return true;
  } catch (error) {
    return false;
  }
}
var tzPattern = /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/;
const tzPattern$1 = tzPattern;
var MILLISECONDS_IN_HOUR = 36e5;
var MILLISECONDS_IN_MINUTE = 6e4;
var DEFAULT_ADDITIONAL_DIGITS = 2;
var patterns = {
  dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
  datePattern: /^([0-9W+-]+)(.*)/,
  plainTime: /:/,
  // year tokens
  YY: /^(\d{2})$/,
  YYY: [
    /^([+-]\d{2})$/,
    // 0 additional digits
    /^([+-]\d{3})$/,
    // 1 additional digit
    /^([+-]\d{4})$/
    // 2 additional digits
  ],
  YYYY: /^(\d{4})/,
  YYYYY: [
    /^([+-]\d{4})/,
    // 0 additional digits
    /^([+-]\d{5})/,
    // 1 additional digit
    /^([+-]\d{6})/
    // 2 additional digits
  ],
  // date tokens
  MM: /^-(\d{2})$/,
  DDD: /^-?(\d{3})$/,
  MMDD: /^-?(\d{2})-?(\d{2})$/,
  Www: /^-?W(\d{2})$/,
  WwwD: /^-?W(\d{2})-?(\d{1})$/,
  HH: /^(\d{2}([.,]\d*)?)$/,
  HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
  HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
  // time zone tokens (to identify the presence of a tz)
  timeZone: tzPattern$1
};
function toDate$1(argument, dirtyOptions) {
  if (arguments.length < 1) {
    throw new TypeError("1 argument required, but only " + arguments.length + " present");
  }
  if (argument === null) {
    return /* @__PURE__ */ new Date(NaN);
  }
  var options = dirtyOptions || {};
  var additionalDigits = options.additionalDigits == null ? DEFAULT_ADDITIONAL_DIGITS : toInteger$1(options.additionalDigits);
  if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
    throw new RangeError("additionalDigits must be 0, 1 or 2");
  }
  if (argument instanceof Date || typeof argument === "object" && Object.prototype.toString.call(argument) === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || Object.prototype.toString.call(argument) === "[object Number]") {
    return new Date(argument);
  } else if (!(typeof argument === "string" || Object.prototype.toString.call(argument) === "[object String]")) {
    return /* @__PURE__ */ new Date(NaN);
  }
  var dateStrings = splitDateString(argument);
  var parseYearResult = parseYear(dateStrings.date, additionalDigits);
  var year = parseYearResult.year;
  var restDateString = parseYearResult.restDateString;
  var date = parseDate$1(restDateString, year);
  if (isNaN(date)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (date) {
    var timestamp = date.getTime();
    var time = 0;
    var offset2;
    if (dateStrings.time) {
      time = parseTime(dateStrings.time);
      if (isNaN(time)) {
        return /* @__PURE__ */ new Date(NaN);
      }
    }
    if (dateStrings.timeZone || options.timeZone) {
      offset2 = tzParseTimezone(dateStrings.timeZone || options.timeZone, new Date(timestamp + time));
      if (isNaN(offset2)) {
        return /* @__PURE__ */ new Date(NaN);
      }
    } else {
      offset2 = getTimezoneOffsetInMilliseconds$1(new Date(timestamp + time));
      offset2 = getTimezoneOffsetInMilliseconds$1(new Date(timestamp + time + offset2));
    }
    return new Date(timestamp + time + offset2);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}
function splitDateString(dateString) {
  var dateStrings = {};
  var parts = patterns.dateTimePattern.exec(dateString);
  var timeString;
  if (!parts) {
    parts = patterns.datePattern.exec(dateString);
    if (parts) {
      dateStrings.date = parts[1];
      timeString = parts[2];
    } else {
      dateStrings.date = null;
      timeString = dateString;
    }
  } else {
    dateStrings.date = parts[1];
    timeString = parts[3];
  }
  if (timeString) {
    var token2 = patterns.timeZone.exec(timeString);
    if (token2) {
      dateStrings.time = timeString.replace(token2[1], "");
      dateStrings.timeZone = token2[1].trim();
    } else {
      dateStrings.time = timeString;
    }
  }
  return dateStrings;
}
function parseYear(dateString, additionalDigits) {
  var patternYYY = patterns.YYY[additionalDigits];
  var patternYYYYY = patterns.YYYYY[additionalDigits];
  var token2;
  token2 = patterns.YYYY.exec(dateString) || patternYYYYY.exec(dateString);
  if (token2) {
    var yearString = token2[1];
    return {
      year: parseInt(yearString, 10),
      restDateString: dateString.slice(yearString.length)
    };
  }
  token2 = patterns.YY.exec(dateString) || patternYYY.exec(dateString);
  if (token2) {
    var centuryString = token2[1];
    return {
      year: parseInt(centuryString, 10) * 100,
      restDateString: dateString.slice(centuryString.length)
    };
  }
  return {
    year: null
  };
}
function parseDate$1(dateString, year) {
  if (year === null) {
    return null;
  }
  var token2;
  var date;
  var month;
  var week;
  if (dateString.length === 0) {
    date = /* @__PURE__ */ new Date(0);
    date.setUTCFullYear(year);
    return date;
  }
  token2 = patterns.MM.exec(dateString);
  if (token2) {
    date = /* @__PURE__ */ new Date(0);
    month = parseInt(token2[1], 10) - 1;
    if (!validateDate(year, month)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month);
    return date;
  }
  token2 = patterns.DDD.exec(dateString);
  if (token2) {
    date = /* @__PURE__ */ new Date(0);
    var dayOfYear = parseInt(token2[1], 10);
    if (!validateDayOfYearDate(year, dayOfYear)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, 0, dayOfYear);
    return date;
  }
  token2 = patterns.MMDD.exec(dateString);
  if (token2) {
    date = /* @__PURE__ */ new Date(0);
    month = parseInt(token2[1], 10) - 1;
    var day = parseInt(token2[2], 10);
    if (!validateDate(year, month, day)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    date.setUTCFullYear(year, month, day);
    return date;
  }
  token2 = patterns.Www.exec(dateString);
  if (token2) {
    week = parseInt(token2[1], 10) - 1;
    if (!validateWeekDate(year, week)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week);
  }
  token2 = patterns.WwwD.exec(dateString);
  if (token2) {
    week = parseInt(token2[1], 10) - 1;
    var dayOfWeek = parseInt(token2[2], 10) - 1;
    if (!validateWeekDate(year, week, dayOfWeek)) {
      return /* @__PURE__ */ new Date(NaN);
    }
    return dayOfISOWeekYear(year, week, dayOfWeek);
  }
  return null;
}
function parseTime(timeString) {
  var token2;
  var hours2;
  var minutes;
  token2 = patterns.HH.exec(timeString);
  if (token2) {
    hours2 = parseFloat(token2[1].replace(",", "."));
    if (!validateTime(hours2)) {
      return NaN;
    }
    return hours2 % 24 * MILLISECONDS_IN_HOUR;
  }
  token2 = patterns.HHMM.exec(timeString);
  if (token2) {
    hours2 = parseInt(token2[1], 10);
    minutes = parseFloat(token2[2].replace(",", "."));
    if (!validateTime(hours2, minutes)) {
      return NaN;
    }
    return hours2 % 24 * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE;
  }
  token2 = patterns.HHMMSS.exec(timeString);
  if (token2) {
    hours2 = parseInt(token2[1], 10);
    minutes = parseInt(token2[2], 10);
    var seconds = parseFloat(token2[3].replace(",", "."));
    if (!validateTime(hours2, minutes, seconds)) {
      return NaN;
    }
    return hours2 % 24 * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE + seconds * 1e3;
  }
  return null;
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
  week = week || 0;
  day = day || 0;
  var date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(isoWeekYear, 0, 4);
  var fourthOfJanuaryDay = date.getUTCDay() || 7;
  var diff = week * 7 + day + 1 - fourthOfJanuaryDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}
var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeapYearIndex(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
  if (month < 0 || month > 11) {
    return false;
  }
  if (date != null) {
    if (date < 1) {
      return false;
    }
    var isLeapYear = isLeapYearIndex(year);
    if (isLeapYear && date > DAYS_IN_MONTH_LEAP_YEAR[month]) {
      return false;
    }
    if (!isLeapYear && date > DAYS_IN_MONTH[month]) {
      return false;
    }
  }
  return true;
}
function validateDayOfYearDate(year, dayOfYear) {
  if (dayOfYear < 1) {
    return false;
  }
  var isLeapYear = isLeapYearIndex(year);
  if (isLeapYear && dayOfYear > 366) {
    return false;
  }
  if (!isLeapYear && dayOfYear > 365) {
    return false;
  }
  return true;
}
function validateWeekDate(year, week, day) {
  if (week < 0 || week > 52) {
    return false;
  }
  if (day != null && (day < 0 || day > 6)) {
    return false;
  }
  return true;
}
function validateTime(hours2, minutes, seconds) {
  if (hours2 != null && (hours2 < 0 || hours2 >= 25)) {
    return false;
  }
  if (minutes != null && (minutes < 0 || minutes >= 60)) {
    return false;
  }
  if (seconds != null && (seconds < 0 || seconds >= 60)) {
    return false;
  }
  return true;
}
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
  }
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof2(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function _typeof2(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || _typeof(argument) === "object" && argStr === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
      console.warn(new Error().stack);
    }
    return /* @__PURE__ */ new Date(NaN);
  }
}
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}
function startOfWeek$1(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getTimezoneOffsetInMilliseconds(date) {
  var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  utcDate.setUTCFullYear(date.getFullYear());
  return date.getTime() - utcDate.getTime();
}
var MILLISECONDS_IN_WEEK$2 = 6048e5;
function differenceInCalendarWeeks(dirtyDateLeft, dirtyDateRight, options) {
  requiredArgs(2, arguments);
  var startOfWeekLeft = startOfWeek$1(dirtyDateLeft, options);
  var startOfWeekRight = startOfWeek$1(dirtyDateRight, options);
  var timestampLeft = startOfWeekLeft.getTime() - getTimezoneOffsetInMilliseconds(startOfWeekLeft);
  var timestampRight = startOfWeekRight.getTime() - getTimezoneOffsetInMilliseconds(startOfWeekRight);
  return Math.round((timestampLeft - timestampRight) / MILLISECONDS_IN_WEEK$2);
}
function lastDayOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var month = date.getMonth();
  date.setFullYear(date.getFullYear(), month + 1, 0);
  date.setHours(0, 0, 0, 0);
  return date;
}
function startOfMonth(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getWeeksInMonth(date, options) {
  requiredArgs(1, arguments);
  return differenceInCalendarWeeks(lastDayOfMonth(date), startOfMonth(date), options) + 1;
}
function getWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var firstWeekOfNextYear = /* @__PURE__ */ new Date(0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  var startOfNextYear = startOfWeek$1(firstWeekOfNextYear, options);
  var firstWeekOfThisYear = /* @__PURE__ */ new Date(0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  var startOfThisYear = startOfWeek$1(firstWeekOfThisYear, options);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}
function startOfWeekYear(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$firstWeekCon, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var firstWeekContainsDate = toInteger((_ref = (_ref2 = (_ref3 = (_options$firstWeekCon = options === null || options === void 0 ? void 0 : options.firstWeekContainsDate) !== null && _options$firstWeekCon !== void 0 ? _options$firstWeekCon : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.firstWeekContainsDate) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.firstWeekContainsDate) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.firstWeekContainsDate) !== null && _ref !== void 0 ? _ref : 1);
  var year = getWeekYear(dirtyDate, options);
  var firstWeek = /* @__PURE__ */ new Date(0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  var date = startOfWeek$1(firstWeek, options);
  return date;
}
var MILLISECONDS_IN_WEEK$1 = 6048e5;
function getWeek(dirtyDate, options) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfWeek$1(date, options).getTime() - startOfWeekYear(date, options).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
}
function startOfISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  return startOfWeek$1(dirtyDate, {
    weekStartsOn: 1
  });
}
function getISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var year = date.getFullYear();
  var fourthOfJanuaryOfNextYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  var startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = /* @__PURE__ */ new Date(0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  var startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}
function startOfISOWeekYear(dirtyDate) {
  requiredArgs(1, arguments);
  var year = getISOWeekYear(dirtyDate);
  var fourthOfJanuary = /* @__PURE__ */ new Date(0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  var date = startOfISOWeek(fourthOfJanuary);
  return date;
}
var MILLISECONDS_IN_WEEK = 6048e5;
function getISOWeek(dirtyDate) {
  requiredArgs(1, arguments);
  var date = toDate(dirtyDate);
  var diff = startOfISOWeek(date).getTime() - startOfISOWeekYear(date).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}
function addDays(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  date.setDate(date.getDate() + amount);
  return date;
}
function addMonths(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var date = toDate(dirtyDate);
  var amount = toInteger(dirtyAmount);
  if (isNaN(amount)) {
    return /* @__PURE__ */ new Date(NaN);
  }
  if (!amount) {
    return date;
  }
  var dayOfMonth = date.getDate();
  var endOfDesiredMonth = new Date(date.getTime());
  endOfDesiredMonth.setMonth(date.getMonth() + amount + 1, 0);
  var daysInMonth = endOfDesiredMonth.getDate();
  if (dayOfMonth >= daysInMonth) {
    return endOfDesiredMonth;
  } else {
    date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
    return date;
  }
}
function addYears(dirtyDate, dirtyAmount) {
  requiredArgs(2, arguments);
  var amount = toInteger(dirtyAmount);
  return addMonths(dirtyDate, amount * 12);
}
const viewAddressKeys = {
  daily: ["year", "month", "day"],
  weekly: ["year", "month", "week"],
  monthly: ["year", "month"]
};
function getDays({
  monthComps,
  prevMonthComps,
  nextMonthComps
}, locale) {
  const days = [];
  const {
    firstDayOfWeek,
    firstWeekday,
    isoWeeknumbers,
    weeknumbers,
    numDays,
    numWeeks
  } = monthComps;
  const prevMonthDaysToShow = firstWeekday + (firstWeekday < firstDayOfWeek ? daysInWeek : 0) - firstDayOfWeek;
  let prevMonth = true;
  let thisMonth = false;
  let nextMonth = false;
  let position = 0;
  const formatter = new Intl.DateTimeFormat(locale.id, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  let day = prevMonthComps.numDays - prevMonthDaysToShow + 1;
  let dayFromEnd = prevMonthComps.numDays - day + 1;
  let weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
  let weekdayOrdinalFromEnd = 1;
  let week = prevMonthComps.numWeeks;
  let weekFromEnd = 1;
  let month = prevMonthComps.month;
  let year = prevMonthComps.year;
  const today = /* @__PURE__ */ new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  for (let w = 1; w <= weeksInMonth; w++) {
    for (let i = 1, weekday = firstDayOfWeek; i <= daysInWeek; i++, weekday += weekday === daysInWeek ? 1 - daysInWeek : 1) {
      if (prevMonth && weekday === firstWeekday) {
        day = 1;
        dayFromEnd = monthComps.numDays;
        weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
        weekdayOrdinalFromEnd = Math.floor((numDays - day) / daysInWeek + 1);
        week = 1;
        weekFromEnd = numWeeks;
        month = monthComps.month;
        year = monthComps.year;
        prevMonth = false;
        thisMonth = true;
      }
      const startDate = locale.getDateFromParams(year, month, day, 0, 0, 0, 0);
      const noonDate = locale.getDateFromParams(year, month, day, 12, 0, 0, 0);
      const endDate = locale.getDateFromParams(
        year,
        month,
        day,
        23,
        59,
        59,
        999
      );
      const date = startDate;
      const id = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
      const weekdayPosition = i;
      const weekdayPositionFromEnd = daysInWeek - i;
      const weeknumber = weeknumbers[w - 1];
      const isoWeeknumber = isoWeeknumbers[w - 1];
      const isToday = day === todayDay && month === todayMonth && year === todayYear;
      const isFirstDay = thisMonth && day === 1;
      const isLastDay = thisMonth && day === numDays;
      const onTop = w === 1;
      const onBottom = w === numWeeks;
      const onLeft = i === 1;
      const onRight = i === daysInWeek;
      const dayIndex = getDayIndex(year, month, day);
      days.push({
        locale,
        id,
        position: ++position,
        label: day.toString(),
        ariaLabel: formatter.format(new Date(year, month - 1, day)),
        day,
        dayFromEnd,
        weekday,
        weekdayPosition,
        weekdayPositionFromEnd,
        weekdayOrdinal,
        weekdayOrdinalFromEnd,
        week,
        weekFromEnd,
        weekPosition: w,
        weeknumber,
        isoWeeknumber,
        month,
        year,
        date,
        startDate,
        endDate,
        noonDate,
        dayIndex,
        isToday,
        isFirstDay,
        isLastDay,
        isDisabled: !thisMonth,
        isFocusable: thisMonth,
        isFocused: false,
        inMonth: thisMonth,
        inPrevMonth: prevMonth,
        inNextMonth: nextMonth,
        onTop,
        onBottom,
        onLeft,
        onRight,
        classes: [
          `id-${id}`,
          `day-${day}`,
          `day-from-end-${dayFromEnd}`,
          `weekday-${weekday}`,
          `weekday-position-${weekdayPosition}`,
          `weekday-ordinal-${weekdayOrdinal}`,
          `weekday-ordinal-from-end-${weekdayOrdinalFromEnd}`,
          `week-${week}`,
          `week-from-end-${weekFromEnd}`,
          {
            "is-today": isToday,
            "is-first-day": isFirstDay,
            "is-last-day": isLastDay,
            "in-month": thisMonth,
            "in-prev-month": prevMonth,
            "in-next-month": nextMonth,
            "on-top": onTop,
            "on-bottom": onBottom,
            "on-left": onLeft,
            "on-right": onRight
          }
        ]
      });
      if (thisMonth && isLastDay) {
        thisMonth = false;
        nextMonth = true;
        day = 1;
        dayFromEnd = numDays;
        weekdayOrdinal = 1;
        weekdayOrdinalFromEnd = Math.floor((numDays - day) / daysInWeek + 1);
        week = 1;
        weekFromEnd = nextMonthComps.numWeeks;
        month = nextMonthComps.month;
        year = nextMonthComps.year;
      } else {
        day++;
        dayFromEnd--;
        weekdayOrdinal = Math.floor((day - 1) / daysInWeek + 1);
        weekdayOrdinalFromEnd = Math.floor((numDays - day) / daysInWeek + 1);
      }
    }
    week++;
    weekFromEnd--;
  }
  return days;
}
function getWeeks(days, showWeeknumbers, showIsoWeeknumbers, locale) {
  const result = days.reduce(
    (result2, day, i) => {
      const weekIndex = Math.floor(i / 7);
      let week = result2[weekIndex];
      if (!week) {
        week = {
          id: `week-${weekIndex + 1}`,
          title: "",
          week: day.week,
          weekPosition: day.weekPosition,
          weeknumber: day.weeknumber,
          isoWeeknumber: day.isoWeeknumber,
          weeknumberDisplay: showWeeknumbers ? day.weeknumber : showIsoWeeknumbers ? day.isoWeeknumber : void 0,
          days: []
        };
        result2[weekIndex] = week;
      }
      week.days.push(day);
      return result2;
    },
    Array(days.length / daysInWeek)
  );
  result.forEach((week) => {
    const fromDay = week.days[0];
    const toDay = week.days[week.days.length - 1];
    if (fromDay.month === toDay.month) {
      week.title = `${locale.formatDate(fromDay.date, "MMMM YYYY")}`;
    } else if (fromDay.year === toDay.year) {
      week.title = `${locale.formatDate(
        fromDay.date,
        "MMM"
      )} - ${locale.formatDate(toDay.date, "MMM YYYY")}`;
    } else {
      week.title = `${locale.formatDate(
        fromDay.date,
        "MMM YYYY"
      )} - ${locale.formatDate(toDay.date, "MMM YYYY")}`;
    }
  });
  return result;
}
function getWeekdays(week, locale) {
  return week.days.map((day) => ({
    label: locale.formatDate(day.date, locale.masks.weekdays),
    weekday: day.weekday
  }));
}
function getPageId(month, year) {
  return `${year}.${pad(month, 2)}`;
}
function getPageAddressForDate(date, view, locale) {
  return pick(
    locale.getDateParts(locale.toDate(date)),
    viewAddressKeys[view]
  );
}
function addPages({ day, week, month, year }, count, view, locale) {
  if (view === "daily" && day) {
    const date = new Date(year, month - 1, day);
    const newDate = addDays(date, count);
    return {
      day: newDate.getDate(),
      month: newDate.getMonth() + 1,
      year: newDate.getFullYear()
    };
  } else if (view === "weekly" && week) {
    const comps = locale.getMonthParts(month, year);
    const date = comps.firstDayOfMonth;
    const newDate = addDays(date, (week - 1 + count) * 7);
    const parts = locale.getDateParts(newDate);
    return {
      week: parts.week,
      month: parts.month,
      year: parts.year
    };
  } else {
    const date = new Date(year, month - 1, 1);
    const newDate = addMonths(date, count);
    return {
      month: newDate.getMonth() + 1,
      year: newDate.getFullYear()
    };
  }
}
function pageIsValid(page) {
  return page != null && page.month != null && page.year != null;
}
function pageIsBeforePage(page, comparePage) {
  if (!pageIsValid(page) || !pageIsValid(comparePage))
    return false;
  page = page;
  comparePage = comparePage;
  if (page.year !== comparePage.year)
    return page.year < comparePage.year;
  if (page.month && comparePage.month && page.month !== comparePage.month)
    return page.month < comparePage.month;
  if (page.week && comparePage.week && page.week !== comparePage.week) {
    return page.week < comparePage.week;
  }
  if (page.day && comparePage.day && page.day !== comparePage.day) {
    return page.day < comparePage.day;
  }
  return false;
}
function pageIsAfterPage(page, comparePage) {
  if (!pageIsValid(page) || !pageIsValid(comparePage))
    return false;
  page = page;
  comparePage = comparePage;
  if (page.year !== comparePage.year) {
    return page.year > comparePage.year;
  }
  if (page.month && comparePage.month && page.month !== comparePage.month) {
    return page.month > comparePage.month;
  }
  if (page.week && comparePage.week && page.week !== comparePage.week) {
    return page.week > comparePage.week;
  }
  if (page.day && comparePage.day && page.day !== comparePage.day) {
    return page.day > comparePage.day;
  }
  return false;
}
function pageIsBetweenPages(page, fromPage, toPage) {
  return (page || false) && !pageIsBeforePage(page, fromPage) && !pageIsAfterPage(page, toPage);
}
function pageIsEqualToPage(aPage, bPage) {
  if (!aPage && bPage)
    return false;
  if (aPage && !bPage)
    return false;
  if (!aPage && !bPage)
    return true;
  aPage = aPage;
  bPage = bPage;
  return aPage.year === bPage.year && aPage.month === bPage.month && aPage.week === bPage.week && aPage.day === bPage.day;
}
function pageRangeToArray(from, to, view, locale) {
  if (!pageIsValid(from) || !pageIsValid(to))
    return [];
  const result = [];
  while (!pageIsAfterPage(from, to)) {
    result.push(from);
    from = addPages(from, 1, view, locale);
  }
  return result;
}
function getPageKey(config2) {
  const { day, week, month, year } = config2;
  let id = `${year}-${pad(month, 2)}`;
  if (week)
    id = `${id}-w${week}`;
  if (day)
    id = `${id}-${pad(day, 2)}`;
  return id;
}
function getCachedPage(config2, locale) {
  const { month, year, showWeeknumbers, showIsoWeeknumbers } = config2;
  const date = new Date(year, month - 1, 15);
  const monthComps = locale.getMonthParts(month, year);
  const prevMonthComps = locale.getPrevMonthParts(month, year);
  const nextMonthComps = locale.getNextMonthParts(month, year);
  const days = getDays({ monthComps, prevMonthComps, nextMonthComps }, locale);
  const weeks = getWeeks(days, showWeeknumbers, showIsoWeeknumbers, locale);
  const weekdays2 = getWeekdays(weeks[0], locale);
  return {
    id: getPageKey(config2),
    month,
    year,
    monthTitle: locale.formatDate(date, locale.masks.title),
    shortMonthLabel: locale.formatDate(date, "MMM"),
    monthLabel: locale.formatDate(date, "MMMM"),
    shortYearLabel: year.toString().substring(2),
    yearLabel: year.toString(),
    monthComps,
    prevMonthComps,
    nextMonthComps,
    days,
    weeks,
    weekdays: weekdays2
  };
}
function getPage(config2, cachedPage) {
  const { day, week, view, trimWeeks } = config2;
  const page = {
    ...cachedPage,
    ...config2,
    title: "",
    viewDays: [],
    viewWeeks: []
  };
  switch (view) {
    case "daily": {
      let dayObj = page.days.find((d) => d.inMonth);
      if (day) {
        dayObj = page.days.find((d) => d.day === day && d.inMonth) || dayObj;
      } else if (week) {
        dayObj = page.days.find((d) => d.week === week && d.inMonth);
      }
      const weekObj = page.weeks[dayObj.week - 1];
      page.viewWeeks = [weekObj];
      page.viewDays = [dayObj];
      page.week = dayObj.week;
      page.weekTitle = weekObj.title;
      page.day = dayObj.day;
      page.dayTitle = dayObj.ariaLabel;
      page.title = page.dayTitle;
      break;
    }
    case "weekly": {
      page.week = week || 1;
      const weekObj = page.weeks[page.week - 1];
      page.viewWeeks = [weekObj];
      page.viewDays = weekObj.days;
      page.weekTitle = weekObj.title;
      page.title = page.weekTitle;
      break;
    }
    default: {
      page.title = page.monthTitle;
      page.viewWeeks = page.weeks.slice(
        0,
        trimWeeks ? page.monthComps.numWeeks : void 0
      );
      page.viewDays = page.days;
      break;
    }
  }
  return page;
}
class Cache {
  constructor(size, createKey, createItem) {
    __publicField(this, "keys", []);
    __publicField(this, "store", {});
    this.size = size;
    this.createKey = createKey;
    this.createItem = createItem;
  }
  get(...args) {
    const key = this.createKey(...args);
    return this.store[key];
  }
  getOrSet(...args) {
    const key = this.createKey(...args);
    if (this.store[key])
      return this.store[key];
    const item = this.createItem(...args);
    if (this.keys.length >= this.size) {
      const removeKey = this.keys.shift();
      if (removeKey != null) {
        delete this.store[removeKey];
      }
    }
    this.keys.push(key);
    this.store[key] = item;
    return item;
  }
}
class DateRange {
  constructor(config2, locale = new Locale()) {
    __publicField(this, "order");
    __publicField(this, "locale");
    __publicField(this, "start", null);
    __publicField(this, "end", null);
    __publicField(this, "repeat", null);
    var _a;
    this.locale = locale;
    const { start, end, span, order, repeat } = config2;
    if (isDate(start)) {
      this.start = locale.getDateParts(start);
    }
    if (isDate(end)) {
      this.end = locale.getDateParts(end);
    } else if (this.start != null && span) {
      this.end = locale.getDateParts(addDays(this.start.date, span - 1));
    }
    this.order = order ?? 0;
    if (repeat) {
      this.repeat = new DateRepeat(
        {
          from: (_a = this.start) == null ? void 0 : _a.date,
          ...repeat
        },
        {
          locale: this.locale
        }
      );
    }
  }
  static fromMany(ranges, locale) {
    return (isArray(ranges) ? ranges : [ranges]).filter((d) => d).map((d) => DateRange.from(d, locale));
  }
  static from(source, locale) {
    if (source instanceof DateRange)
      return source;
    const config2 = {
      start: null,
      end: null
    };
    if (source != null) {
      if (isArray(source)) {
        config2.start = source[0] ?? null;
        config2.end = source[1] ?? null;
      } else if (isObject(source)) {
        Object.assign(config2, source);
      } else {
        config2.start = source;
        config2.end = source;
      }
    }
    if (config2.start != null)
      config2.start = new Date(config2.start);
    if (config2.end != null)
      config2.end = new Date(config2.end);
    return new DateRange(config2, locale);
  }
  get opts() {
    const { order, locale } = this;
    return { order, locale };
  }
  get hasRepeat() {
    return !!this.repeat;
  }
  get isSingleDay() {
    const { start, end } = this;
    return start && end && start.year === end.year && start.month === end.month && start.day === end.day;
  }
  get isMultiDay() {
    return !this.isSingleDay;
  }
  get daySpan() {
    if (this.start == null || this.end == null) {
      if (this.hasRepeat)
        return 1;
      return Infinity;
    }
    return this.end.dayIndex - this.start.dayIndex + 1;
  }
  startsOnDay(dayParts) {
    var _a, _b;
    return ((_a = this.start) == null ? void 0 : _a.dayIndex) === dayParts.dayIndex || !!((_b = this.repeat) == null ? void 0 : _b.passes(dayParts));
  }
  intersectsDay(dayIndex) {
    return this.intersectsDayRange(dayIndex, dayIndex);
  }
  intersectsRange(range) {
    var _a, _b;
    return this.intersectsDayRange(
      ((_a = range.start) == null ? void 0 : _a.dayIndex) ?? -Infinity,
      ((_b = range.end) == null ? void 0 : _b.dayIndex) ?? Infinity
    );
  }
  intersectsDayRange(startDayIndex, endDayIndex) {
    if (this.start && this.start.dayIndex > endDayIndex)
      return false;
    if (this.end && this.end.dayIndex < startDayIndex)
      return false;
    return true;
  }
}
class DateRangeContext {
  constructor() {
    __publicField(this, "records", {});
  }
  render(data2, range, days) {
    var _a, _b, _c, _d, _e, _f;
    let result = null;
    const startDayIndex = ((_a = days[0]) == null ? void 0 : _a.dayIndex) ?? 0;
    const endDayIndex = ((_b = days[days.length - 1]) == null ? void 0 : _b.dayIndex) ?? 0;
    if (range.hasRepeat) {
      days.forEach((day) => {
        var _a2, _b2;
        if (range.startsOnDay(day)) {
          const span = range.daySpan < Infinity ? range.daySpan : 1;
          result = {
            startDay: day.dayIndex,
            startTime: ((_a2 = range.start) == null ? void 0 : _a2.time) ?? 0,
            endDay: day.dayIndex + span - 1,
            endTime: ((_b2 = range.end) == null ? void 0 : _b2.time) ?? MS_PER_DAY
          };
          this.getRangeRecords(data2).push(result);
        }
      });
    } else if (range.intersectsDayRange(startDayIndex, endDayIndex)) {
      result = {
        startDay: ((_c = range.start) == null ? void 0 : _c.dayIndex) ?? -Infinity,
        startTime: ((_d = range.start) == null ? void 0 : _d.time) ?? -Infinity,
        endDay: ((_e = range.end) == null ? void 0 : _e.dayIndex) ?? Infinity,
        endTime: ((_f = range.end) == null ? void 0 : _f.time) ?? Infinity
      };
      this.getRangeRecords(data2).push(result);
    }
    return result;
  }
  getRangeRecords(data2) {
    let record = this.records[data2.key];
    if (!record) {
      record = {
        ranges: [],
        data: data2
      };
      this.records[data2.key] = record;
    }
    return record.ranges;
  }
  getCell(key, day) {
    const cells = this.getCells(day);
    const result = cells.find((cell) => cell.data.key === key);
    return result;
  }
  cellExists(key, dayIndex) {
    const records = this.records[key];
    if (records == null)
      return false;
    return records.ranges.some(
      (r) => r.startDay <= dayIndex && r.endDay >= dayIndex
    );
  }
  getCells(day) {
    const records = Object.values(this.records);
    const result = [];
    const { dayIndex } = day;
    records.forEach(({ data: data2, ranges }) => {
      ranges.filter((r) => r.startDay <= dayIndex && r.endDay >= dayIndex).forEach((range) => {
        const onStart = dayIndex === range.startDay;
        const onEnd = dayIndex === range.endDay;
        const startTime = onStart ? range.startTime : 0;
        const startDate = new Date(day.startDate.getTime() + startTime);
        const endTime = onEnd ? range.endTime : MS_PER_DAY;
        const endDate = new Date(day.endDate.getTime() + endTime);
        const allDay = startTime === 0 && endTime === MS_PER_DAY;
        const order = data2.order || 0;
        result.push({
          ...range,
          data: data2,
          onStart,
          onEnd,
          startTime,
          startDate,
          endTime,
          endDate,
          allDay,
          order
        });
      });
    });
    result.sort((a, b) => a.order - b.order);
    return result;
  }
}
const locales = {
  // Arabic
  ar: { dow: 7, L: "D/‏M/‏YYYY" },
  // Bulgarian
  bg: { dow: 2, L: "D.MM.YYYY" },
  // Catalan
  ca: { dow: 2, L: "DD/MM/YYYY" },
  // Chinese (China)
  "zh-CN": { dow: 2, L: "YYYY/MM/DD" },
  // Chinese (Taiwan)
  "zh-TW": { dow: 1, L: "YYYY/MM/DD" },
  // Croatian
  hr: { dow: 2, L: "DD.MM.YYYY" },
  // Czech
  cs: { dow: 2, L: "DD.MM.YYYY" },
  // Danish
  da: { dow: 2, L: "DD.MM.YYYY" },
  // Dutch
  nl: { dow: 2, L: "DD-MM-YYYY" },
  // English (US)
  "en-US": { dow: 1, L: "MM/DD/YYYY" },
  // English (Australia)
  "en-AU": { dow: 2, L: "DD/MM/YYYY" },
  // English (Canada)
  "en-CA": { dow: 1, L: "YYYY-MM-DD" },
  // English (Great Britain)
  "en-GB": { dow: 2, L: "DD/MM/YYYY" },
  // English (Ireland)
  "en-IE": { dow: 2, L: "DD-MM-YYYY" },
  // English (New Zealand)
  "en-NZ": { dow: 2, L: "DD/MM/YYYY" },
  // English (South Africa)
  "en-ZA": { dow: 1, L: "YYYY/MM/DD" },
  // Esperanto
  eo: { dow: 2, L: "YYYY-MM-DD" },
  // Estonian
  et: { dow: 2, L: "DD.MM.YYYY" },
  // Finnish
  fi: { dow: 2, L: "DD.MM.YYYY" },
  // French
  fr: { dow: 2, L: "DD/MM/YYYY" },
  // French (Canada)
  "fr-CA": { dow: 1, L: "YYYY-MM-DD" },
  // French (Switzerland)
  "fr-CH": { dow: 2, L: "DD.MM.YYYY" },
  // German
  de: { dow: 2, L: "DD.MM.YYYY" },
  // Hebrew
  he: { dow: 1, L: "DD.MM.YYYY" },
  // Indonesian
  id: { dow: 2, L: "DD/MM/YYYY" },
  // Italian
  it: { dow: 2, L: "DD/MM/YYYY" },
  // Japanese
  ja: { dow: 1, L: "YYYY年M月D日" },
  // Korean
  ko: { dow: 1, L: "YYYY.MM.DD" },
  // Latvian
  lv: { dow: 2, L: "DD.MM.YYYY" },
  // Lithuanian
  lt: { dow: 2, L: "DD.MM.YYYY" },
  // Macedonian
  mk: { dow: 2, L: "D.MM.YYYY" },
  // Norwegian
  nb: { dow: 2, L: "D. MMMM YYYY" },
  nn: { dow: 2, L: "D. MMMM YYYY" },
  // Polish
  pl: { dow: 2, L: "DD.MM.YYYY" },
  // Portuguese
  pt: { dow: 2, L: "DD/MM/YYYY" },
  // Romanian
  ro: { dow: 2, L: "DD.MM.YYYY" },
  // Russian
  ru: { dow: 2, L: "DD.MM.YYYY" },
  // Slovak
  sk: { dow: 2, L: "DD.MM.YYYY" },
  // Spanish (Spain)
  "es-ES": { dow: 2, L: "DD/MM/YYYY" },
  // Spanish (Mexico)
  "es-MX": { dow: 2, L: "DD/MM/YYYY" },
  // Swedish
  sv: { dow: 2, L: "YYYY-MM-DD" },
  // Thai
  th: { dow: 1, L: "DD/MM/YYYY" },
  // Turkish
  tr: { dow: 2, L: "DD.MM.YYYY" },
  // Ukrainian
  uk: { dow: 2, L: "DD.MM.YYYY" },
  // Vietnam
  vi: { dow: 2, L: "DD/MM/YYYY" }
};
locales.en = locales["en-US"];
locales.es = locales["es-ES"];
locales.no = locales.nb;
locales.zh = locales["zh-CN"];
const localeSettings = Object.entries(locales).reduce(
  (res, [id, { dow, L }]) => {
    res[id] = {
      id,
      firstDayOfWeek: dow,
      masks: { L }
    };
    return res;
  },
  {}
);
const title = "MMMM YYYY";
const weekdays = "W";
const navMonths = "MMM";
const hours = "h A";
const input = [
  "L",
  "YYYY-MM-DD",
  "YYYY/MM/DD"
];
const inputDateTime = [
  "L h:mm A",
  "YYYY-MM-DD h:mm A",
  "YYYY/MM/DD h:mm A"
];
const inputDateTime24hr = [
  "L HH:mm",
  "YYYY-MM-DD HH:mm",
  "YYYY/MM/DD HH:mm"
];
const inputTime = [
  "h:mm A"
];
const inputTime24hr = [
  "HH:mm"
];
const dayPopover = "WWW, MMM D, YYYY";
const data = [
  "L",
  "YYYY-MM-DD",
  "YYYY/MM/DD"
];
const model = "iso";
const iso = "YYYY-MM-DDTHH:mm:ss.SSSZ";
const masks = {
  title,
  weekdays,
  navMonths,
  hours,
  input,
  inputDateTime,
  inputDateTime24hr,
  inputTime,
  inputTime24hr,
  dayPopover,
  data,
  model,
  iso
};
const maxSwipeTime = 300;
const minHorizontalSwipeDistance = 60;
const maxVerticalSwipeDistance = 80;
const touch = {
  maxSwipeTime,
  minHorizontalSwipeDistance,
  maxVerticalSwipeDistance
};
const defaultConfig = {
  componentPrefix: "V",
  color: "blue",
  isDark: false,
  navPopover: {
    action: "click",
    flip: false,
    arrowHidden: false,
    transitions: ["fade", "slide", "scale"],
    offset: 8
  },
  titlePosition: "center",
  transition: "slide-h",
  touch,
  masks,
  locales: localeSettings,
  datePicker: {
    updateOnInput: true,
    inputDebounce: 1e3,
    popover: {
      action: "hover-focus",
      placement: "bottom-start",
      interactive: true
    }
  }
};
const state = vue.shallowReactive(defaultConfig);
const defaultLocales = vue.computed(() => {
  return mapValues_1(state.locales, (l) => {
    l.masks = defaultsDeep(l.masks, state.masks);
    return l;
  });
});
const getDefault = (path) => {
  if (typeof window !== "undefined" && has(window.__vcalendar__, path)) {
    return get_1(window.__vcalendar__, path);
  }
  return get_1(state, path);
};
const setupDefaults = (app, userDefaults) => {
  var _a;
  app.config.globalProperties.$VCalendar = state;
  if (userDefaults) {
    if (userDefaults.navVisibility) {
      state.navPopover.action = userDefaults.navVisibility;
      delete userDefaults.navVisibility;
      console.warn(
        "The `navVisibility` option is deprecated. Use `navPopover` instead."
      );
    }
    if ((_a = userDefaults.datePicker) == null ? void 0 : _a.popover) {
      state.datePicker.popover = cleanPopoverOptions(
        userDefaults.datePicker.popover
      );
    }
  }
  return Object.assign(state, defaultsDeep(userDefaults, state));
};
const DEFAULT_MONTH_CACHE_SIZE = 12;
const DEFAULT_PAGE_CACHE_SIZE = 5;
function resolveConfig(config2, locales2) {
  const detLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
  let id;
  if (isString_1(config2)) {
    id = config2;
  } else if (has(config2, "id")) {
    id = config2.id;
  }
  id = (id || detLocale).toLowerCase();
  const localeKeys = Object.keys(locales2);
  const validKey = (k) => localeKeys.find((lk) => lk.toLowerCase() === k);
  id = validKey(id) || validKey(id.substring(0, 2)) || detLocale;
  const defLocale = {
    ...locales2["en-IE"],
    ...locales2[id],
    id,
    monthCacheSize: DEFAULT_MONTH_CACHE_SIZE,
    pageCacheSize: DEFAULT_PAGE_CACHE_SIZE
  };
  const result = isObject(config2) ? defaultsDeep(config2, defLocale) : defLocale;
  return result;
}
class Locale {
  constructor(config2 = void 0, timezone) {
    __publicField(this, "id");
    __publicField(this, "daysInWeek");
    __publicField(this, "firstDayOfWeek");
    __publicField(this, "masks");
    __publicField(this, "timezone");
    __publicField(this, "hourLabels");
    __publicField(this, "dayNames");
    __publicField(this, "dayNamesShort");
    __publicField(this, "dayNamesShorter");
    __publicField(this, "dayNamesNarrow");
    __publicField(this, "monthNames");
    __publicField(this, "monthNamesShort");
    __publicField(this, "relativeTimeNames");
    __publicField(this, "amPm", ["am", "pm"]);
    __publicField(this, "monthCache");
    __publicField(this, "pageCache");
    const { id, firstDayOfWeek, masks: masks2, monthCacheSize, pageCacheSize } = resolveConfig(config2, defaultLocales.value);
    this.monthCache = new Cache(
      monthCacheSize,
      getMonthPartsKey,
      getMonthParts
    );
    this.pageCache = new Cache(pageCacheSize, getPageKey, getCachedPage);
    this.id = id;
    this.daysInWeek = daysInWeek;
    this.firstDayOfWeek = clamp(firstDayOfWeek, 1, daysInWeek);
    this.masks = masks2;
    this.timezone = timezone || void 0;
    this.hourLabels = this.getHourLabels();
    this.dayNames = getDayNames("long", this.id);
    this.dayNamesShort = getDayNames("short", this.id);
    this.dayNamesShorter = this.dayNamesShort.map((s) => s.substring(0, 2));
    this.dayNamesNarrow = getDayNames("narrow", this.id);
    this.monthNames = getMonthNames("long", this.id);
    this.monthNamesShort = getMonthNames("short", this.id);
    this.relativeTimeNames = getRelativeTimeNames(this.id);
  }
  formatDate(date, masks2) {
    return formatDate(date, masks2, this);
  }
  parseDate(dateString, mask) {
    return parseDate(dateString, mask, this);
  }
  toDate(d, opts = {}) {
    const nullDate = /* @__PURE__ */ new Date(NaN);
    let result = nullDate;
    const { fillDate, mask, patch, rules } = opts;
    if (isNumber_1(d)) {
      opts.type = "number";
      result = /* @__PURE__ */ new Date(+d);
    } else if (isString_1(d)) {
      opts.type = "string";
      result = d ? parseDate(d, mask || "iso", this) : nullDate;
    } else if (isDate(d)) {
      opts.type = "date";
      result = new Date(d.getTime());
    } else if (isDateParts(d)) {
      opts.type = "object";
      result = this.getDateFromParts(d);
    }
    if (result && (patch || rules)) {
      let parts = this.getDateParts(result);
      if (patch && fillDate != null) {
        const fillParts = this.getDateParts(this.toDate(fillDate));
        parts = this.getDateParts(
          this.toDate({ ...fillParts, ...pick(parts, DatePatchKeys[patch]) })
        );
      }
      if (rules) {
        parts = applyRulesForDateParts(parts, rules);
      }
      result = this.getDateFromParts(parts);
    }
    return result || nullDate;
  }
  toDateOrNull(d, opts = {}) {
    const dte = this.toDate(d, opts);
    return isNaN(dte.getTime()) ? null : dte;
  }
  fromDate(date, { type, mask } = {}) {
    switch (type) {
      case "number":
        return date ? date.getTime() : NaN;
      case "string":
        return date ? this.formatDate(date, mask || "iso") : "";
      case "object":
        return date ? this.getDateParts(date) : null;
      default:
        return date ? new Date(date) : null;
    }
  }
  range(source) {
    return DateRange.from(source, this);
  }
  ranges(ranges) {
    return DateRange.fromMany(ranges, this);
  }
  getDateParts(date) {
    return getDateParts(date, this);
  }
  getDateFromParts(parts) {
    return getDateFromParts(parts, this.timezone);
  }
  getDateFromParams(year, month, day, hours2, minutes, seconds, milliseconds) {
    return this.getDateFromParts({
      year,
      month,
      day,
      hours: hours2,
      minutes,
      seconds,
      milliseconds
    });
  }
  getPage(config2) {
    const cachedPage = this.pageCache.getOrSet(config2, this);
    return getPage(config2, cachedPage);
  }
  getMonthParts(month, year) {
    const { firstDayOfWeek } = this;
    return this.monthCache.getOrSet(month, year, firstDayOfWeek);
  }
  getThisMonthParts() {
    const date = /* @__PURE__ */ new Date();
    return this.getMonthParts(
      date.getMonth() + 1,
      date.getFullYear()
    );
  }
  getPrevMonthParts(month, year) {
    if (month === 1)
      return this.getMonthParts(12, year - 1);
    return this.getMonthParts(month - 1, year);
  }
  getNextMonthParts(month, year) {
    if (month === 12)
      return this.getMonthParts(1, year + 1);
    return this.getMonthParts(month + 1, year);
  }
  getHourLabels() {
    return getHourDates().map((d) => {
      return this.formatDate(d, this.masks.hours);
    });
  }
  getDayId(date) {
    return this.formatDate(date, "YYYY-MM-DD");
  }
}
var GroupRuleType = /* @__PURE__ */ ((GroupRuleType2) => {
  GroupRuleType2["Any"] = "any";
  GroupRuleType2["All"] = "all";
  return GroupRuleType2;
})(GroupRuleType || {});
var IntervalRuleType = /* @__PURE__ */ ((IntervalRuleType2) => {
  IntervalRuleType2["Days"] = "days";
  IntervalRuleType2["Weeks"] = "weeks";
  IntervalRuleType2["Months"] = "months";
  IntervalRuleType2["Years"] = "years";
  return IntervalRuleType2;
})(IntervalRuleType || {});
var ComponentRuleType = /* @__PURE__ */ ((ComponentRuleType2) => {
  ComponentRuleType2["Days"] = "days";
  ComponentRuleType2["Weekdays"] = "weekdays";
  ComponentRuleType2["Weeks"] = "weeks";
  ComponentRuleType2["Months"] = "months";
  ComponentRuleType2["Years"] = "years";
  return ComponentRuleType2;
})(ComponentRuleType || {});
var OrdinalComponentRuleType = /* @__PURE__ */ ((OrdinalComponentRuleType2) => {
  OrdinalComponentRuleType2["OrdinalWeekdays"] = "ordinalWeekdays";
  return OrdinalComponentRuleType2;
})(OrdinalComponentRuleType || {});
class IntervalRule {
  constructor(type, interval, from) {
    __publicField(this, "validated", true);
    this.type = type;
    this.interval = interval;
    this.from = from;
    if (!this.from) {
      console.warn(
        `A valid "from" date is required for date interval rule. This rule will be skipped.`
      );
      this.validated = false;
    }
  }
  passes(dateParts) {
    if (!this.validated)
      return true;
    const { date } = dateParts;
    switch (this.type) {
      case "days": {
        return diffInDays(this.from.date, date) % this.interval === 0;
      }
      case "weeks": {
        return diffInWeeks(this.from.date, date) % this.interval === 0;
      }
      case "months": {
        return diffInMonths(this.from.date, date) % this.interval === 0;
      }
      case "years": {
        return diffInYears(this.from.date, date) % this.interval === 0;
      }
      default: {
        return false;
      }
    }
  }
}
class ComponentRule {
  constructor(type, components2, validator, getter) {
    __publicField(this, "components", []);
    this.type = type;
    this.validator = validator;
    this.getter = getter;
    this.components = this.normalizeComponents(components2);
  }
  static create(type, config2) {
    switch (type) {
      case "days":
        return new DaysRule(config2);
      case "weekdays":
        return new WeekdaysRule(config2);
      case "weeks":
        return new WeeksRule(config2);
      case "months":
        return new MonthsRule(config2);
      case "years":
        return new YearsRule(config2);
    }
  }
  normalizeComponents(components2) {
    if (this.validator(components2))
      return [components2];
    if (!isArray(components2))
      return [];
    const result = [];
    components2.forEach((component) => {
      if (!this.validator(component)) {
        console.warn(
          `Component value ${component} in invalid for "${this.type}" rule. This rule will be skipped.`
        );
        return;
      }
      result.push(component);
    });
    return result;
  }
  passes(dayParts) {
    const comps = this.getter(dayParts);
    const result = comps.some((comp) => this.components.includes(comp));
    return result;
  }
}
class DaysRule extends ComponentRule {
  constructor(components2) {
    super(
      "days",
      components2,
      isDayInMonth,
      ({ day, dayFromEnd }) => [day, -dayFromEnd]
    );
  }
}
class WeekdaysRule extends ComponentRule {
  constructor(components2) {
    super(
      "weekdays",
      components2,
      isDayOfWeek,
      ({ weekday }) => [weekday]
    );
  }
}
class WeeksRule extends ComponentRule {
  constructor(components2) {
    super(
      "weeks",
      components2,
      isWeekInMonth,
      ({ week, weekFromEnd }) => [week, -weekFromEnd]
    );
  }
}
class MonthsRule extends ComponentRule {
  constructor(components2) {
    super("months", components2, isMonthInYear, ({ month }) => [
      month
    ]);
  }
}
class YearsRule extends ComponentRule {
  constructor(components2) {
    super("years", components2, isNumber_1, ({ year }) => [year]);
  }
}
class OrdinalComponentRule {
  constructor(type, components2) {
    __publicField(this, "components");
    this.type = type;
    this.components = this.normalizeComponents(components2);
  }
  normalizeArrayConfig(config2) {
    const result = [];
    config2.forEach((numOrArray, i) => {
      if (isNumber_1(numOrArray)) {
        if (i === 0)
          return;
        if (!isOrdinalWeekInMonth(config2[0])) {
          console.warn(
            `Ordinal range for "${this.type}" rule is from -5 to -1 or 1 to 5. This rule will be skipped.`
          );
          return;
        }
        if (!isDayOfWeek(numOrArray)) {
          console.warn(
            `Acceptable range for "${this.type}" rule is from 1 to 5. This rule will be skipped`
          );
          return;
        }
        result.push([config2[0], numOrArray]);
      } else if (isArray(numOrArray)) {
        result.push(...this.normalizeArrayConfig(numOrArray));
      }
    });
    return result;
  }
  normalizeComponents(config2) {
    const result = [];
    config2.forEach((numOrArray, i) => {
      if (isNumber_1(numOrArray)) {
        if (i === 0)
          return;
        if (!isOrdinalWeekInMonth(config2[0])) {
          console.warn(
            `Ordinal range for "${this.type}" rule is from -5 to -1 or 1 to 5. This rule will be skipped.`
          );
          return;
        }
        if (!isDayOfWeek(numOrArray)) {
          console.warn(
            `Acceptable range for "${this.type}" rule is from 1 to 5. This rule will be skipped`
          );
          return;
        }
        result.push([config2[0], numOrArray]);
      } else if (isArray(numOrArray)) {
        result.push(...this.normalizeArrayConfig(numOrArray));
      }
    });
    return result;
  }
  passes(dayParts) {
    const { weekday, weekdayOrdinal, weekdayOrdinalFromEnd } = dayParts;
    return this.components.some(
      ([ordinalWeek, ordinalWeekday]) => (ordinalWeek === weekdayOrdinal || ordinalWeek === -weekdayOrdinalFromEnd) && weekday === ordinalWeekday
    );
  }
}
class FunctionRule {
  constructor(fn) {
    __publicField(this, "type", "function");
    __publicField(this, "validated", true);
    this.fn = fn;
    if (!isFunction_1(fn)) {
      console.warn(
        `The function rule requires a valid function. This rule will be skipped.`
      );
      this.validated = false;
    }
  }
  passes(dayParts) {
    if (!this.validated)
      return true;
    return this.fn(dayParts);
  }
}
class DateRepeat {
  constructor(config2, options = {}, parent) {
    __publicField(this, "validated", true);
    __publicField(this, "config");
    __publicField(this, "type", GroupRuleType.Any);
    __publicField(this, "from");
    __publicField(this, "until");
    __publicField(this, "rules", []);
    __publicField(this, "locale", new Locale());
    this.parent = parent;
    if (options.locale)
      this.locale = options.locale;
    this.config = config2;
    if (isFunction_1(config2)) {
      this.type = GroupRuleType.All;
      this.rules = [new FunctionRule(config2)];
    } else if (isArray(config2)) {
      this.type = GroupRuleType.Any;
      this.rules = config2.map((c) => new DateRepeat(c, options, this));
    } else if (isObject(config2)) {
      this.type = GroupRuleType.All;
      this.from = config2.from ? this.locale.getDateParts(config2.from) : parent == null ? void 0 : parent.from;
      this.until = config2.until ? this.locale.getDateParts(config2.until) : parent == null ? void 0 : parent.until;
      this.rules = this.getObjectRules(config2);
    } else {
      console.error("Rule group configuration must be an object or an array.");
      this.validated = false;
    }
  }
  getObjectRules(config2) {
    const rules = [];
    if (config2.every) {
      if (isString_1(config2.every)) {
        config2.every = [1, `${config2.every}s`];
      }
      if (isArray(config2.every)) {
        const [interval = 1, type = IntervalRuleType.Days] = config2.every;
        rules.push(new IntervalRule(type, interval, this.from));
      }
    }
    Object.values(ComponentRuleType).forEach((type) => {
      if (!(type in config2))
        return;
      rules.push(ComponentRule.create(type, config2[type]));
    });
    Object.values(OrdinalComponentRuleType).forEach((type) => {
      if (!(type in config2))
        return;
      rules.push(new OrdinalComponentRule(type, config2[type]));
    });
    if (config2.on != null) {
      if (!isArray(config2.on))
        config2.on = [config2.on];
      rules.push(
        new DateRepeat(config2.on, { locale: this.locale }, this.parent)
      );
    }
    return rules;
  }
  passes(dayParts) {
    if (!this.validated)
      return true;
    if (this.from && dayParts.dayIndex <= this.from.dayIndex)
      return false;
    if (this.until && dayParts.dayIndex >= this.until.dayIndex)
      return false;
    if (this.type === GroupRuleType.Any) {
      return this.rules.some((r) => r.passes(dayParts));
    }
    return this.rules.every((r) => r.passes(dayParts));
  }
}
function isDayInMonth(dayInMonth) {
  if (!isNumber_1(dayInMonth))
    return false;
  return dayInMonth >= 1 && dayInMonth <= 31;
}
function isDayOfWeek(dayOfWeek) {
  if (!isNumber_1(dayOfWeek))
    return false;
  return dayOfWeek >= 1 && dayOfWeek <= 7;
}
function isWeekInMonth(weekInMonth) {
  if (!isNumber_1(weekInMonth))
    return false;
  return weekInMonth >= -6 && weekInMonth <= -1 || weekInMonth >= 1 && weekInMonth <= 6;
}
function isMonthInYear(monthInYear) {
  if (!isNumber_1(monthInYear))
    return false;
  return monthInYear >= 1 && monthInYear <= 12;
}
function isOrdinalWeekInMonth(weekInMonth) {
  if (!isNumber_1(weekInMonth))
    return false;
  if (weekInMonth < -5 || weekInMonth > 5 || weekInMonth === 0)
    return false;
  return true;
}
const DatePatchKeys = {
  dateTime: [
    "year",
    "month",
    "day",
    "hours",
    "minutes",
    "seconds",
    "milliseconds"
  ],
  date: ["year", "month", "day"],
  time: ["hours", "minutes", "seconds", "milliseconds"]
};
const daysInWeek = 7;
const weeksInMonth = 6;
const MS_PER_SECOND = 1e3;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const maskMacros = ["L", "iso"];
const DATE_PART_RANGES = {
  milliseconds: [0, 999, 3],
  seconds: [0, 59, 2],
  minutes: [0, 59, 2],
  hours: [0, 23, 2]
};
const token = /d{1,2}|W{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|Z{1,4}|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
const literal = /\[([^]*?)\]/gm;
const formatFlags = {
  D(d) {
    return d.day;
  },
  DD(d) {
    return pad(d.day, 2);
  },
  // Do(d: DateParts, l: Locale) {
  //   return l.DoFn(d.day);
  // },
  d(d) {
    return d.weekday - 1;
  },
  dd(d) {
    return pad(d.weekday - 1, 2);
  },
  W(d, l) {
    return l.dayNamesNarrow[d.weekday - 1];
  },
  WW(d, l) {
    return l.dayNamesShorter[d.weekday - 1];
  },
  WWW(d, l) {
    return l.dayNamesShort[d.weekday - 1];
  },
  WWWW(d, l) {
    return l.dayNames[d.weekday - 1];
  },
  M(d) {
    return d.month;
  },
  MM(d) {
    return pad(d.month, 2);
  },
  MMM(d, l) {
    return l.monthNamesShort[d.month - 1];
  },
  MMMM(d, l) {
    return l.monthNames[d.month - 1];
  },
  YY(d) {
    return String(d.year).substr(2);
  },
  YYYY(d) {
    return pad(d.year, 4);
  },
  h(d) {
    return d.hours % 12 || 12;
  },
  hh(d) {
    return pad(d.hours % 12 || 12, 2);
  },
  H(d) {
    return d.hours;
  },
  HH(d) {
    return pad(d.hours, 2);
  },
  m(d) {
    return d.minutes;
  },
  mm(d) {
    return pad(d.minutes, 2);
  },
  s(d) {
    return d.seconds;
  },
  ss(d) {
    return pad(d.seconds, 2);
  },
  S(d) {
    return Math.round(d.milliseconds / 100);
  },
  SS(d) {
    return pad(Math.round(d.milliseconds / 10), 2);
  },
  SSS(d) {
    return pad(d.milliseconds, 3);
  },
  a(d, l) {
    return d.hours < 12 ? l.amPm[0] : l.amPm[1];
  },
  A(d, l) {
    return d.hours < 12 ? l.amPm[0].toUpperCase() : l.amPm[1].toUpperCase();
  },
  Z() {
    return "Z";
  },
  ZZ(d) {
    const o = d.timezoneOffset;
    return `${o > 0 ? "-" : "+"}${pad(Math.floor(Math.abs(o) / 60), 2)}`;
  },
  ZZZ(d) {
    const o = d.timezoneOffset;
    return `${o > 0 ? "-" : "+"}${pad(
      Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60,
      4
    )}`;
  },
  ZZZZ(d) {
    const o = d.timezoneOffset;
    return `${o > 0 ? "-" : "+"}${pad(Math.floor(Math.abs(o) / 60), 2)}:${pad(
      Math.abs(o) % 60,
      2
    )}`;
  }
};
const twoDigits = /\d\d?/;
const threeDigits = /\d{3}/;
const fourDigits = /\d{4}/;
const word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
const noop = () => {
};
const monthUpdate = (arrName) => (d, v, l) => {
  const index2 = l[arrName].indexOf(
    v.charAt(0).toUpperCase() + v.substr(1).toLowerCase()
  );
  if (~index2) {
    d.month = index2;
  }
};
const parseFlags = {
  D: [
    twoDigits,
    (d, v) => {
      d.day = v;
    }
  ],
  Do: [
    new RegExp(twoDigits.source + word.source),
    (d, v) => {
      d.day = parseInt(v, 10);
    }
  ],
  d: [twoDigits, noop],
  W: [word, noop],
  M: [
    twoDigits,
    (d, v) => {
      d.month = v - 1;
    }
  ],
  MMM: [word, monthUpdate("monthNamesShort")],
  MMMM: [word, monthUpdate("monthNames")],
  YY: [
    twoDigits,
    (d, v) => {
      const da = /* @__PURE__ */ new Date();
      const cent = +da.getFullYear().toString().substr(0, 2);
      d.year = +`${v > 68 ? cent - 1 : cent}${v}`;
    }
  ],
  YYYY: [
    fourDigits,
    (d, v) => {
      d.year = v;
    }
  ],
  S: [
    /\d/,
    (d, v) => {
      d.milliseconds = v * 100;
    }
  ],
  SS: [
    /\d{2}/,
    (d, v) => {
      d.milliseconds = v * 10;
    }
  ],
  SSS: [
    threeDigits,
    (d, v) => {
      d.milliseconds = v;
    }
  ],
  h: [
    twoDigits,
    (d, v) => {
      d.hours = v;
    }
  ],
  m: [
    twoDigits,
    (d, v) => {
      d.minutes = v;
    }
  ],
  s: [
    twoDigits,
    (d, v) => {
      d.seconds = v;
    }
  ],
  a: [
    word,
    (d, v, l) => {
      const val = v.toLowerCase();
      if (val === l.amPm[0]) {
        d.isPm = false;
      } else if (val === l.amPm[1]) {
        d.isPm = true;
      }
    }
  ],
  Z: [
    /[^\s]*?[+-]\d\d:?\d\d|[^\s]*?Z?/,
    (d, v) => {
      if (v === "Z")
        v = "+00:00";
      const parts = `${v}`.match(/([+-]|\d\d)/gi);
      if (parts) {
        const minutes = +parts[1] * 60 + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === "+" ? minutes : -minutes;
      }
    }
  ]
};
parseFlags.DD = parseFlags.D;
parseFlags.dd = parseFlags.d;
parseFlags.WWWW = parseFlags.WWW = parseFlags.WW = parseFlags.W;
parseFlags.MM = parseFlags.M;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a;
parseFlags.ZZZZ = parseFlags.ZZZ = parseFlags.ZZ = parseFlags.Z;
function normalizeMasks(masks2, locale) {
  return (arrayHasItems(masks2) && masks2 || [
    isString_1(masks2) && masks2 || "YYYY-MM-DD"
  ]).map(
    (m) => maskMacros.reduce(
      (prev, curr) => prev.replace(curr, locale.masks[curr] || ""),
      m
    )
  );
}
function isDateParts(parts) {
  return isObject(parts) && "year" in parts && "month" in parts && "day" in parts;
}
function startOfWeek(date, firstDayOfWeek = 1) {
  const day = date.getDay() + 1;
  const daysToAdd = day >= firstDayOfWeek ? firstDayOfWeek - day : -(7 - (firstDayOfWeek - day));
  return addDays(date, daysToAdd);
}
function getDayIndex(year, month, day) {
  const utcDate = Date.UTC(year, month - 1, day);
  return diffInDays(/* @__PURE__ */ new Date(0), new Date(utcDate));
}
function diffInDays(d1, d2) {
  return Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
}
function diffInWeeks(d1, d2) {
  return Math.ceil(diffInDays(startOfWeek(d1), startOfWeek(d2)) / 7);
}
function diffInYears(d1, d2) {
  return d2.getUTCFullYear() - d1.getUTCFullYear();
}
function diffInMonths(d1, d2) {
  return diffInYears(d1, d2) * 12 + (d2.getMonth() - d1.getMonth());
}
function getDateFromParts(parts, timezone = "") {
  const d = /* @__PURE__ */ new Date();
  const {
    year = d.getFullYear(),
    month = d.getMonth() + 1,
    day = d.getDate(),
    hours: hrs = 0,
    minutes: min2 = 0,
    seconds: sec = 0,
    milliseconds: ms = 0
  } = parts;
  if (timezone) {
    const dateString = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(
      hrs,
      2
    )}:${pad(min2, 2)}:${pad(sec, 2)}.${pad(ms, 3)}`;
    return toDate$1(dateString, { timeZone: timezone });
  }
  return new Date(year, month - 1, day, hrs, min2, sec, ms);
}
function getDateParts(date, locale) {
  let tzDate = new Date(date.getTime());
  if (locale.timezone) {
    tzDate = new Date(
      date.toLocaleString("en-US", { timeZone: locale.timezone })
    );
    tzDate.setMilliseconds(date.getMilliseconds());
  }
  const milliseconds = tzDate.getMilliseconds();
  const seconds = tzDate.getSeconds();
  const minutes = tzDate.getMinutes();
  const hours2 = tzDate.getHours();
  const time = milliseconds + seconds * MS_PER_SECOND + minutes * MS_PER_MINUTE + hours2 * MS_PER_HOUR;
  const month = tzDate.getMonth() + 1;
  const year = tzDate.getFullYear();
  const monthParts = locale.getMonthParts(month, year);
  const day = tzDate.getDate();
  const dayFromEnd = monthParts.numDays - day + 1;
  const weekday = tzDate.getDay() + 1;
  const weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
  const weekdayOrdinalFromEnd = Math.floor((monthParts.numDays - day) / 7 + 1);
  const week = Math.ceil(
    (day + Math.abs(monthParts.firstWeekday - monthParts.firstDayOfWeek)) / 7
  );
  const weekFromEnd = monthParts.numWeeks - week + 1;
  const weeknumber = monthParts.weeknumbers[week];
  const dayIndex = getDayIndex(year, month, day);
  const parts = {
    milliseconds,
    seconds,
    minutes,
    hours: hours2,
    time,
    day,
    dayFromEnd,
    weekday,
    weekdayOrdinal,
    weekdayOrdinalFromEnd,
    week,
    weekFromEnd,
    weeknumber,
    month,
    year,
    date: tzDate,
    dateTime: tzDate.getTime(),
    dayIndex,
    timezoneOffset: 0,
    isValid: true
  };
  return parts;
}
function getMonthPartsKey(month, year, firstDayOfWeek) {
  return `${year}-${month}-${firstDayOfWeek}`;
}
function getMonthParts(month, year, firstDayOfWeek) {
  const inLeapYear = year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstWeekday = firstDayOfMonth.getDay() + 1;
  const numDays = month === 2 && inLeapYear ? 29 : daysInMonths[month - 1];
  const weekStartsOn = firstDayOfWeek - 1;
  const numWeeks = getWeeksInMonth(firstDayOfMonth, {
    weekStartsOn
  });
  const weeknumbers = [];
  const isoWeeknumbers = [];
  for (let i = 0; i < numWeeks; i++) {
    const date = addDays(firstDayOfMonth, i * 7);
    weeknumbers.push(getWeek(date, { weekStartsOn }));
    isoWeeknumbers.push(getISOWeek(date));
  }
  return {
    firstDayOfWeek,
    firstDayOfMonth,
    inLeapYear,
    firstWeekday,
    numDays,
    numWeeks,
    month,
    year,
    weeknumbers,
    isoWeeknumbers
  };
}
function getWeekdayDates() {
  const dates = [];
  const year = 2020;
  const month = 1;
  const day = 5;
  for (let i = 0; i < daysInWeek; i++) {
    dates.push(
      getDateFromParts({
        year,
        month,
        day: day + i,
        hours: 12
      })
    );
  }
  return dates;
}
function getDayNames(length, localeId = void 0) {
  const dtf = new Intl.DateTimeFormat(localeId, {
    weekday: length
  });
  return getWeekdayDates().map((d) => dtf.format(d));
}
function getHourDates() {
  const dates = [];
  for (let i = 0; i <= 24; i++) {
    dates.push(new Date(2e3, 0, 1, i));
  }
  return dates;
}
function getRelativeTimeNames(localeId = void 0) {
  const units = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "quarter",
    "year"
  ];
  const rtf = new Intl.RelativeTimeFormat(localeId);
  return units.reduce((names, unit) => {
    const parts = rtf.formatToParts(100, unit);
    names[unit] = parts[1].unit;
    return names;
  }, {});
}
function getMonthDates() {
  const dates = [];
  for (let i = 0; i < 12; i++) {
    dates.push(new Date(2e3, i, 15));
  }
  return dates;
}
function getMonthNames(length, localeId = void 0) {
  const dtf = new Intl.DateTimeFormat(localeId, {
    month: length,
    timeZone: "UTC"
  });
  return getMonthDates().map((d) => dtf.format(d));
}
function datePartIsValid(part, rule, parts) {
  if (isNumber_1(rule))
    return rule === part;
  if (isArray(rule))
    return rule.includes(part);
  if (isFunction_1(rule))
    return rule(part, parts);
  if (rule.min != null && rule.min > part)
    return false;
  if (rule.max != null && rule.max < part)
    return false;
  if (rule.interval != null && part % rule.interval !== 0)
    return false;
  return true;
}
function getDatePartOptions(parts, range, rule) {
  const options = [];
  const [min2, max2, padding] = range;
  for (let i = min2; i <= max2; i++) {
    if (rule == null || datePartIsValid(i, rule, parts)) {
      options.push({
        value: i,
        label: pad(i, padding)
      });
    }
  }
  return options;
}
function getDatePartsOptions(parts, rules) {
  return {
    milliseconds: getDatePartOptions(
      parts,
      DATE_PART_RANGES.milliseconds,
      rules.milliseconds
    ),
    seconds: getDatePartOptions(parts, DATE_PART_RANGES.seconds, rules.seconds),
    minutes: getDatePartOptions(parts, DATE_PART_RANGES.minutes, rules.minutes),
    hours: getDatePartOptions(parts, DATE_PART_RANGES.hours, rules.hours)
  };
}
function getNearestDatePart(parts, range, value, rule) {
  const options = getDatePartOptions(parts, range, rule);
  const result = options.reduce((prev, opt) => {
    if (opt.disabled)
      return prev;
    if (isNaN(prev))
      return opt.value;
    const diffPrev = Math.abs(prev - value);
    const diffCurr = Math.abs(opt.value - value);
    return diffCurr < diffPrev ? opt.value : prev;
  }, NaN);
  return isNaN(result) ? value : result;
}
function applyRulesForDateParts(dateParts, rules) {
  const result = { ...dateParts };
  Object.entries(rules).forEach(([key, rule]) => {
    const range = DATE_PART_RANGES[key];
    const value = dateParts[key];
    result[key] = getNearestDatePart(
      dateParts,
      range,
      value,
      rule
    );
  });
  return result;
}
function parseDate(dateString, mask, locale) {
  const masks2 = normalizeMasks(mask, locale);
  return masks2.map((m) => {
    if (typeof m !== "string") {
      throw new Error("Invalid mask");
    }
    let str = dateString;
    if (str.length > 1e3) {
      return false;
    }
    let isValid = true;
    const dp = {};
    m.replace(token, ($0) => {
      if (parseFlags[$0]) {
        const info = parseFlags[$0];
        const index2 = str.search(info[0]);
        if (!~index2) {
          isValid = false;
        } else {
          str.replace(info[0], (result) => {
            info[1](dp, result, locale);
            str = str.substr(index2 + result.length);
            return result;
          });
        }
      }
      return parseFlags[$0] ? "" : $0.slice(1, $0.length - 1);
    });
    if (!isValid) {
      return false;
    }
    const today = /* @__PURE__ */ new Date();
    if (dp.hours != null) {
      if (dp.isPm === true && +dp.hours !== 12) {
        dp.hours = +dp.hours + 12;
      } else if (dp.isPm === false && +dp.hours === 12) {
        dp.hours = 0;
      }
    }
    let date;
    if (dp.timezoneOffset != null) {
      dp.minutes = +(dp.minutes || 0) - +dp.timezoneOffset;
      date = new Date(
        Date.UTC(
          dp.year || today.getFullYear(),
          dp.month || 0,
          dp.day || 1,
          dp.hours || 0,
          dp.minutes || 0,
          dp.seconds || 0,
          dp.milliseconds || 0
        )
      );
    } else {
      date = locale.getDateFromParts({
        year: dp.year || today.getFullYear(),
        month: (dp.month || 0) + 1,
        day: dp.day || 1,
        hours: dp.hours || 0,
        minutes: dp.minutes || 0,
        seconds: dp.seconds || 0,
        milliseconds: dp.milliseconds || 0
      });
    }
    return date;
  }).find((d) => d) || new Date(dateString);
}
function formatDate(date, masks2, locale) {
  if (date == null)
    return "";
  let mask = normalizeMasks(masks2, locale)[0];
  if (/Z$/.test(mask))
    locale.timezone = "utc";
  const literals = [];
  mask = mask.replace(literal, ($0, $1) => {
    literals.push($1);
    return "??";
  });
  const dateParts = locale.getDateParts(date);
  mask = mask.replace(
    token,
    ($0) => $0 in formatFlags ? formatFlags[$0](dateParts, locale) : $0.slice(1, $0.length - 1)
  );
  return mask.replace(/\?\?/g, () => literals.shift());
}
let attrKey = 0;
class Attribute {
  constructor(config2, theme, locale) {
    __publicField(this, "key", "");
    __publicField(this, "highlight", null);
    __publicField(this, "content", null);
    __publicField(this, "dot", null);
    __publicField(this, "bar", null);
    __publicField(this, "event", null);
    __publicField(this, "popover", null);
    __publicField(this, "customData", null);
    __publicField(this, "ranges");
    __publicField(this, "hasRanges", false);
    __publicField(this, "order", 0);
    __publicField(this, "pinPage", false);
    __publicField(this, "maxRepeatSpan", 0);
    __publicField(this, "locale");
    const { dates } = Object.assign(this, { order: 0, pinPage: false }, config2);
    this.popover && (this.popover = cleanPopoverOptions(this.popover));
    this.key || (this.key = ++attrKey);
    this.locale = locale;
    theme.normalizeGlyphs(this);
    this.ranges = locale.ranges(dates ?? []);
    this.hasRanges = !!arrayHasItems(this.ranges);
    this.maxRepeatSpan = this.ranges.filter((r) => r.hasRepeat).map((r) => r.daySpan).reduce((res, curr) => Math.max(res, curr), 0);
  }
  intersectsRange({ start, end }) {
    if (start == null || end == null)
      return false;
    const simpleRanges = this.ranges.filter((r) => !r.hasRepeat);
    for (const range of simpleRanges) {
      if (range.intersectsDayRange(start.dayIndex, end.dayIndex)) {
        return true;
      }
    }
    const repeatRanges = this.ranges.filter((r) => r.hasRepeat);
    if (!repeatRanges.length)
      return false;
    let day = start;
    if (this.maxRepeatSpan > 1) {
      day = this.locale.getDateParts(addDays(day.date, -this.maxRepeatSpan));
    }
    while (day.dayIndex <= end.dayIndex) {
      for (const range of repeatRanges) {
        if (range.startsOnDay(day))
          return true;
      }
      day = this.locale.getDateParts(addDays(day.date, 1));
    }
    return false;
  }
}
const addHorizontalSwipeHandler = (element, handler, {
  maxSwipeTime: maxSwipeTime2,
  minHorizontalSwipeDistance: minHorizontalSwipeDistance2,
  maxVerticalSwipeDistance: maxVerticalSwipeDistance2
}) => {
  if (!element || !element.addEventListener || !isFunction_1(handler)) {
    return null;
  }
  let startX = 0;
  let startY = 0;
  let startTime = null;
  let isSwiping = false;
  function touchStart(e) {
    const t = e.changedTouches[0];
    startX = t.screenX;
    startY = t.screenY;
    startTime = (/* @__PURE__ */ new Date()).getTime();
    isSwiping = true;
  }
  function touchEnd(e) {
    if (!isSwiping || !startTime)
      return;
    isSwiping = false;
    const t = e.changedTouches[0];
    const deltaX = t.screenX - startX;
    const deltaY = t.screenY - startY;
    const deltaTime = (/* @__PURE__ */ new Date()).getTime() - startTime;
    if (deltaTime < maxSwipeTime2) {
      if (Math.abs(deltaX) >= minHorizontalSwipeDistance2 && Math.abs(deltaY) <= maxVerticalSwipeDistance2) {
        const arg = { toLeft: false, toRight: false };
        if (deltaX < 0) {
          arg.toLeft = true;
        } else {
          arg.toRight = true;
        }
        handler(arg);
      }
    }
  }
  on(element, "touchstart", touchStart, { passive: true });
  on(element, "touchend", touchEnd, { passive: true });
  return () => {
    off(element, "touchstart", touchStart);
    off(element, "touchend", touchEnd);
  };
};
const watchSkippers = {};
const skipWatcher = (watcher, durationMs = 10) => {
  watchSkippers[watcher] = Date.now() + durationMs;
};
const handleWatcher = (watcher, handler) => {
  if (watcher in watchSkippers) {
    const dateTime = watchSkippers[watcher];
    if (Date.now() < dateTime)
      return;
    delete watchSkippers[watcher];
  }
  handler();
};
function windowExists() {
  return typeof window !== "undefined";
}
function windowHasFeature(feature) {
  return windowExists() && feature in window;
}
function useDarkMode(config2) {
  const isDark = vue.ref(false);
  const displayMode = vue.computed(() => isDark.value ? "dark" : "light");
  let mediaQuery;
  let mutationObserver;
  function mqListener(ev) {
    isDark.value = ev.matches;
  }
  function setupSystem() {
    if (windowHasFeature("matchMedia")) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", mqListener);
      isDark.value = mediaQuery.matches;
    }
  }
  function moListener() {
    const { selector = ":root", darkClass = "dark" } = config2.value;
    const el = document.querySelector(selector);
    isDark.value = el.classList.contains(darkClass);
  }
  function setupClass(config3) {
    const { selector = ":root", darkClass = "dark" } = config3;
    if (windowExists() && selector && darkClass) {
      const el = document.querySelector(selector);
      if (el) {
        mutationObserver = new MutationObserver(moListener);
        mutationObserver.observe(el, {
          attributes: true,
          attributeFilter: ["class"]
        });
        isDark.value = el.classList.contains(darkClass);
      }
    }
  }
  function setup() {
    stopObservers();
    const type = typeof config2.value;
    if (type === "string" && config2.value.toLowerCase() === "system") {
      setupSystem();
    } else if (type === "object") {
      setupClass(config2.value);
    } else {
      isDark.value = !!config2.value;
    }
  }
  const stopWatch = vue.watch(() => config2.value, () => setup(), {
    immediate: true
  });
  function stopObservers() {
    if (mediaQuery) {
      mediaQuery.removeEventListener("change", mqListener);
      mediaQuery = void 0;
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = void 0;
    }
  }
  function cleanup() {
    stopObservers();
    stopWatch();
  }
  vue.onUnmounted(() => cleanup());
  return {
    isDark,
    displayMode,
    cleanup
  };
}
const targetProps = ["base", "start", "end", "startEnd"];
const displayProps = [
  "class",
  "wrapperClass",
  "contentClass",
  "style",
  "contentStyle",
  "color",
  "fillMode"
];
const _defaultProfile = { base: {}, start: {}, end: {} };
function normalizeConfig(color, config2, defaultProfile = _defaultProfile) {
  let rootColor = color;
  let root2 = {};
  if (config2 === true || isString_1(config2)) {
    rootColor = isString_1(config2) ? config2 : rootColor;
    root2 = { ...defaultProfile };
  } else if (isObject(config2)) {
    if (hasAny(config2, targetProps)) {
      root2 = { ...config2 };
    } else {
      root2 = {
        base: { ...config2 },
        start: { ...config2 },
        end: { ...config2 }
      };
    }
  }
  const result = defaultsDeep(
    root2,
    { start: root2.startEnd, end: root2.startEnd },
    defaultProfile
  );
  Object.entries(result).forEach(([targetType, targetConfig]) => {
    let targetColor = rootColor;
    if (targetConfig === true || isString_1(targetConfig)) {
      targetColor = isString_1(targetConfig) ? targetConfig : targetColor;
      result[targetType] = { color: targetColor };
    } else if (isObject(targetConfig)) {
      if (hasAny(targetConfig, displayProps)) {
        result[targetType] = { ...targetConfig };
      } else {
        result[targetType] = {};
      }
    }
    defaultsDeep(result[targetType], { color: targetColor });
  });
  return result;
}
class HighlightRenderer {
  constructor() {
    __publicField(this, "type", "highlight");
  }
  normalizeConfig(color, config2) {
    return normalizeConfig(color, config2, {
      base: { fillMode: "light" },
      start: { fillMode: "solid" },
      end: { fillMode: "solid" }
    });
  }
  prepareRender(glyphs) {
    glyphs.highlights = [];
    if (!glyphs.content)
      glyphs.content = [];
  }
  render({ data: data2, onStart, onEnd }, glyphs) {
    const { key, highlight } = data2;
    if (!highlight)
      return;
    const { highlights } = glyphs;
    const { base, start, end } = highlight;
    if (onStart && onEnd) {
      highlights.push({
        ...start,
        key,
        wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${start.color}`,
        class: [`vc-highlight vc-highlight-bg-${start.fillMode}`, start.class],
        contentClass: [
          `vc-attr vc-highlight-content-${start.fillMode} vc-${start.color}`,
          start.contentClass
        ]
      });
    } else if (onStart) {
      highlights.push({
        ...base,
        key: `${key}-base`,
        wrapperClass: `vc-day-layer vc-day-box-right-center vc-attr vc-${base.color}`,
        class: [
          `vc-highlight vc-highlight-base-start vc-highlight-bg-${base.fillMode}`,
          base.class
        ]
      });
      highlights.push({
        ...start,
        key,
        wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${start.color}`,
        class: [`vc-highlight vc-highlight-bg-${start.fillMode}`, start.class],
        contentClass: [
          `vc-attr vc-highlight-content-${start.fillMode} vc-${start.color}`,
          start.contentClass
        ]
      });
    } else if (onEnd) {
      highlights.push({
        ...base,
        key: `${key}-base`,
        wrapperClass: `vc-day-layer vc-day-box-left-center vc-attr vc-${base.color}`,
        class: [
          `vc-highlight vc-highlight-base-end vc-highlight-bg-${base.fillMode}`,
          base.class
        ]
      });
      highlights.push({
        ...end,
        key,
        wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${end.color}`,
        class: [`vc-highlight vc-highlight-bg-${end.fillMode}`, end.class],
        contentClass: [
          `vc-attr vc-highlight-content-${end.fillMode} vc-${end.color}`,
          end.contentClass
        ]
      });
    } else {
      highlights.push({
        ...base,
        key: `${key}-middle`,
        wrapperClass: `vc-day-layer vc-day-box-center-center vc-attr vc-${base.color}`,
        class: [
          `vc-highlight vc-highlight-base-middle vc-highlight-bg-${base.fillMode}`,
          base.class
        ],
        contentClass: [
          `vc-attr vc-highlight-content-${base.fillMode} vc-${base.color}`,
          base.contentClass
        ]
      });
    }
  }
}
class BaseRenderer {
  constructor(type, collectionType) {
    __publicField(this, "type", "");
    __publicField(this, "collectionType", "");
    this.type = type;
    this.collectionType = collectionType;
  }
  normalizeConfig(color, config2) {
    return normalizeConfig(color, config2);
  }
  prepareRender(glyphs) {
    glyphs[this.collectionType] = [];
  }
  render({ data: data2, onStart, onEnd }, glyphs) {
    const { key } = data2;
    const item = data2[this.type];
    if (!key || !item) {
      return;
    }
    const collection = glyphs[this.collectionType];
    const { base, start, end } = item;
    if (onStart) {
      collection.push({
        ...start,
        key,
        class: [
          `vc-${this.type} vc-${this.type}-start vc-${start.color} vc-attr`,
          start.class
        ]
      });
    } else if (onEnd) {
      collection.push({
        ...end,
        key,
        class: [
          `vc-${this.type} vc-${this.type}-end vc-${end.color} vc-attr`,
          end.class
        ]
      });
    } else {
      collection.push({
        ...base,
        key,
        class: [
          `vc-${this.type} vc-${this.type}-base vc-${base.color} vc-attr`,
          base.class
        ]
      });
    }
  }
}
class ContentRenderer extends BaseRenderer {
  constructor() {
    super("content", "content");
  }
  normalizeConfig(_, config2) {
    return normalizeConfig("base", config2);
  }
}
class DotRenderer extends BaseRenderer {
  constructor() {
    super("dot", "dots");
  }
}
class BarRenderer extends BaseRenderer {
  constructor() {
    super("bar", "bars");
  }
}
class Theme {
  constructor(color) {
    __publicField(this, "color");
    __publicField(this, "renderers", [
      new ContentRenderer(),
      new HighlightRenderer(),
      new DotRenderer(),
      new BarRenderer()
    ]);
    this.color = color;
  }
  normalizeGlyphs(attr) {
    this.renderers.forEach((renderer) => {
      const type = renderer.type;
      if (attr[type] != null) {
        attr[type] = renderer.normalizeConfig(this.color, attr[type]);
      }
    });
  }
  prepareRender(glyphs = {}) {
    this.renderers.forEach((renderer) => {
      renderer.prepareRender(glyphs);
    });
    return glyphs;
  }
  render(cell, glyphs) {
    this.renderers.forEach((renderer) => {
      renderer.render(cell, glyphs);
    });
  }
}
const contextKey$4 = Symbol("__vc_base_context__");
const propsDef$2 = {
  color: {
    type: String,
    default: () => getDefault("color")
  },
  isDark: {
    type: [Boolean, String, Object],
    default: () => getDefault("isDark")
  },
  firstDayOfWeek: Number,
  masks: Object,
  locale: [String, Object],
  timezone: String,
  minDate: null,
  maxDate: null,
  disabledDates: null
};
function createBase(props) {
  const color = vue.computed(() => props.color ?? "");
  const isDark = vue.computed(() => props.isDark ?? false);
  const { displayMode } = useDarkMode(isDark);
  const theme = vue.computed(() => new Theme(color.value));
  const locale = vue.computed(() => {
    if (props.locale instanceof Locale)
      return props.locale;
    const config2 = isObject(props.locale) ? props.locale : {
      id: props.locale,
      firstDayOfWeek: props.firstDayOfWeek,
      masks: props.masks
    };
    return new Locale(config2, props.timezone);
  });
  const masks2 = vue.computed(() => locale.value.masks);
  const minDate = vue.computed(() => props.minDate);
  const maxDate = vue.computed(() => props.maxDate);
  const disabledDates = vue.computed(() => {
    const dates = props.disabledDates ? [...props.disabledDates] : [];
    if (minDate.value != null) {
      dates.push({
        start: null,
        end: addDays(locale.value.toDate(minDate.value), -1)
      });
    }
    if (maxDate.value != null) {
      dates.push({
        start: addDays(locale.value.toDate(maxDate.value), 1),
        end: null
      });
    }
    return locale.value.ranges(dates);
  });
  const disabledAttribute = vue.computed(() => {
    return new Attribute(
      {
        key: "disabled",
        dates: disabledDates.value,
        order: 100
      },
      theme.value,
      locale.value
    );
  });
  const context = {
    color,
    isDark,
    displayMode,
    theme,
    locale,
    masks: masks2,
    minDate,
    maxDate,
    disabledDates,
    disabledAttribute
  };
  vue.provide(contextKey$4, context);
  return context;
}
function useOrCreateBase(props) {
  return vue.inject(contextKey$4, () => createBase(props), true);
}
function contextKey$3(slotKey) {
  return `__vc_slot_${slotKey}__`;
}
function provideSlots(slots, remap = {}) {
  Object.keys(slots).forEach((slotKey) => {
    vue.provide(contextKey$3(remap[slotKey] ?? slotKey), slots[slotKey]);
  });
}
function useSlot(slotKey) {
  return vue.inject(contextKey$3(slotKey), null);
}
const propsDef$1 = {
  ...propsDef$2,
  view: {
    type: String,
    default: "monthly",
    validator(value) {
      return ["daily", "weekly", "monthly"].includes(value);
    }
  },
  rows: {
    type: Number,
    default: 1
  },
  columns: {
    type: Number,
    default: 1
  },
  step: Number,
  titlePosition: {
    type: String,
    default: () => getDefault("titlePosition")
  },
  navVisibility: {
    type: String,
    default: () => getDefault("navVisibility")
  },
  navPopover: {
    type: Object,
    default: () => getDefault("navPopover")
  },
  showWeeknumbers: [Boolean, String],
  showIsoWeeknumbers: [Boolean, String],
  expanded: Boolean,
  borderless: Boolean,
  transparent: Boolean,
  initialPage: Object,
  initialPagePosition: { type: Number, default: 1 },
  minPage: Object,
  maxPage: Object,
  transition: String,
  attributes: Array,
  trimWeeks: Boolean,
  disablePageSwipe: Boolean
};
const emitsDef = [
  "dayclick",
  "daymouseenter",
  "daymouseleave",
  "dayfocusin",
  "dayfocusout",
  "daykeydown",
  "weeknumberclick",
  "transition-start",
  "transition-end",
  "did-move",
  "update:view",
  "update:pages"
];
const contextKey$2 = Symbol("__vc_calendar_context__");
let navPopoverUid = 0;
let dayPopoverUid = 0;
function createCalendar(props, { slots, emit }) {
  const containerRef = vue.ref(null);
  const focusedDay = vue.ref(null);
  const focusableDay = vue.ref((/* @__PURE__ */ new Date()).getDate());
  const inTransition = vue.ref(false);
  const navPopoverName = vue.ref(`__nav-popover-${navPopoverUid++}__`);
  const dayPopoverName = vue.ref(`__day-popover-${dayPopoverUid++}__`);
  const _view = vue.ref(props.view);
  const _pages = vue.ref([]);
  const transitionName = vue.ref("");
  let transitionPromise = null;
  let removeHandlers = null;
  provideSlots(slots);
  const {
    theme,
    color,
    displayMode,
    locale,
    masks: masks2,
    minDate,
    maxDate,
    disabledAttribute,
    disabledDates
  } = useOrCreateBase(props);
  const count = vue.computed(() => props.rows * props.columns);
  const step = vue.computed(() => props.step || count.value);
  const firstPage = vue.computed(() => head_1(_pages.value) ?? null);
  const lastPage = vue.computed(() => last_1(_pages.value) ?? null);
  const minPage = vue.computed(
    () => props.minPage || (minDate.value ? getDateAddress(minDate.value) : null)
  );
  const maxPage = vue.computed(
    () => props.maxPage || (maxDate.value ? getDateAddress(maxDate.value) : null)
  );
  const navPopover = vue.computed(() => {
    const result = {
      teleport: null,
      ...props.navPopover,
      name: navPopoverName.value
    };
    if (props.navVisibility) {
      displayWarning("navVisibility");
      result.action = props.navVisibility;
    }
    return result;
  });
  const showWeeknumbers = vue.computed(() => !!props.showWeeknumbers);
  const showIsoWeeknumbers = vue.computed(() => !!props.showIsoWeeknumbers);
  const isMonthly = vue.computed(() => _view.value === "monthly");
  const isWeekly = vue.computed(() => _view.value === "weekly");
  const isDaily = vue.computed(() => _view.value === "daily");
  const onTransitionBeforeEnter = () => {
    inTransition.value = true;
    emit("transition-start");
  };
  const onTransitionAfterEnter = () => {
    inTransition.value = false;
    emit("transition-end");
    if (transitionPromise) {
      transitionPromise.resolve(true);
      transitionPromise = null;
    }
  };
  const addPages$1 = (address, count2, view = _view.value) => {
    return addPages(address, count2, view, locale.value);
  };
  const getDateAddress = (date) => {
    return getPageAddressForDate(date, _view.value, locale.value);
  };
  const refreshDisabled = (day) => {
    if (!disabledAttribute.value || !attributeContext.value)
      return;
    day.isDisabled = attributeContext.value.cellExists(
      disabledAttribute.value.key,
      day.dayIndex
    );
  };
  const refreshFocusable = (day) => {
    day.isFocusable = day.inMonth && day.day === focusableDay.value;
  };
  const forDays = (pages, fn) => {
    for (const page of pages) {
      for (const day of page.days) {
        if (fn(day) === false)
          return;
      }
    }
  };
  const days = vue.computed(
    () => _pages.value.reduce((result, page) => {
      result.push(...page.viewDays);
      return result;
    }, [])
  );
  const attributes = vue.computed(() => {
    const result = [];
    (props.attributes || []).forEach((attr, i) => {
      if (!attr || !attr.dates)
        return;
      result.push(
        new Attribute(
          {
            ...attr,
            order: attr.order || 0
          },
          theme.value,
          locale.value
        )
      );
    });
    if (disabledAttribute.value) {
      result.push(disabledAttribute.value);
    }
    return result;
  });
  const hasAttributes = vue.computed(() => arrayHasItems(attributes.value));
  const attributeContext = vue.computed(() => {
    const ctx = new DateRangeContext();
    attributes.value.forEach((attr) => {
      attr.ranges.forEach((range) => {
        ctx.render(attr, range, days.value);
      });
    });
    return ctx;
  });
  const dayCells = vue.computed(() => {
    return days.value.reduce((result, day) => {
      result[day.dayIndex] = { day, cells: [] };
      result[day.dayIndex].cells.push(...attributeContext.value.getCells(day));
      return result;
    }, {});
  });
  const getWeeknumberPosition = (column, columnFromEnd) => {
    const showWeeknumbers2 = props.showWeeknumbers || props.showIsoWeeknumbers;
    if (showWeeknumbers2 == null)
      return "";
    if (isBoolean_1(showWeeknumbers2)) {
      return showWeeknumbers2 ? "left" : "";
    }
    if (showWeeknumbers2.startsWith("right")) {
      return columnFromEnd > 1 ? "right" : showWeeknumbers2;
    }
    return column > 1 ? "left" : showWeeknumbers2;
  };
  const getPageForAttributes = () => {
    var _a, _b;
    if (!hasAttributes.value)
      return null;
    const attr = attributes.value.find((attr2) => attr2.pinPage) || attributes.value[0];
    if (!attr || !attr.hasRanges)
      return null;
    const [range] = attr.ranges;
    const date = ((_a = range.start) == null ? void 0 : _a.date) || ((_b = range.end) == null ? void 0 : _b.date);
    return date ? getDateAddress(date) : null;
  };
  const getDefaultInitialPage = () => {
    if (pageIsValid(firstPage.value))
      return firstPage.value;
    const page = getPageForAttributes();
    if (pageIsValid(page))
      return page;
    return getDateAddress(/* @__PURE__ */ new Date());
  };
  const getTargetPageRange = (page, opts = {}) => {
    const { view = _view.value, position = 1, force } = opts;
    const pagesToAdd = position > 0 ? 1 - position : -(count.value + position);
    let fromPage = addPages$1(page, pagesToAdd, view);
    let toPage = addPages$1(fromPage, count.value - 1, view);
    if (!force) {
      if (pageIsBeforePage(fromPage, minPage.value)) {
        fromPage = minPage.value;
      } else if (pageIsAfterPage(toPage, maxPage.value)) {
        fromPage = addPages$1(maxPage.value, 1 - count.value);
      }
      toPage = addPages$1(fromPage, count.value - 1);
    }
    return { fromPage, toPage };
  };
  const getPageTransition = (oldPage, newPage, defaultTransition = "") => {
    if (defaultTransition === "none" || defaultTransition === "fade")
      return defaultTransition;
    if ((oldPage == null ? void 0 : oldPage.view) !== (newPage == null ? void 0 : newPage.view))
      return "fade";
    const moveNext2 = pageIsAfterPage(newPage, oldPage);
    const movePrev2 = pageIsBeforePage(newPage, oldPage);
    if (!moveNext2 && !movePrev2) {
      return "fade";
    }
    if (defaultTransition === "slide-v") {
      return movePrev2 ? "slide-down" : "slide-up";
    }
    return movePrev2 ? "slide-right" : "slide-left";
  };
  const refreshPages = (opts = {}) => {
    return new Promise((resolve, reject) => {
      const { position = 1, force = false, transition } = opts;
      const page = pageIsValid(opts.page) ? opts.page : getDefaultInitialPage();
      const { fromPage } = getTargetPageRange(page, {
        position,
        force
      });
      const pages = [];
      for (let i = 0; i < count.value; i++) {
        const newPage = addPages$1(fromPage, i);
        const position2 = i + 1;
        const row = Math.ceil(position2 / props.columns);
        const rowFromEnd = props.rows - row + 1;
        const column = position2 % props.columns || props.columns;
        const columnFromEnd = props.columns - column + 1;
        const weeknumberPosition = getWeeknumberPosition(column, columnFromEnd);
        pages.push(
          locale.value.getPage({
            ...newPage,
            view: _view.value,
            titlePosition: props.titlePosition,
            trimWeeks: props.trimWeeks,
            position: position2,
            row,
            rowFromEnd,
            column,
            columnFromEnd,
            showWeeknumbers: showWeeknumbers.value,
            showIsoWeeknumbers: showIsoWeeknumbers.value,
            weeknumberPosition
          })
        );
      }
      transitionName.value = getPageTransition(
        _pages.value[0],
        pages[0],
        transition
      );
      _pages.value = pages;
      if (transitionName.value && transitionName.value !== "none") {
        transitionPromise = {
          resolve,
          reject
        };
      } else {
        resolve(true);
      }
    });
  };
  const targetBy = (pages) => {
    const fromPage = firstPage.value ?? getDateAddress(/* @__PURE__ */ new Date());
    return addPages$1(fromPage, pages);
  };
  const canMove = (target, opts = {}) => {
    const page = pageIsValid(target) ? target : getDateAddress(target);
    Object.assign(
      opts,
      getTargetPageRange(page, {
        ...opts,
        force: true
      })
    );
    const pagesInRange = pageRangeToArray(
      opts.fromPage,
      opts.toPage,
      _view.value,
      locale.value
    ).map((p) => pageIsBetweenPages(p, minPage.value, maxPage.value));
    return pagesInRange.some((val) => val);
  };
  const canMoveBy = (pages, opts = {}) => {
    return canMove(targetBy(pages), opts);
  };
  const canMovePrev = vue.computed(() => canMoveBy(-step.value));
  const canMoveNext = vue.computed(() => canMoveBy(step.value));
  const move = async (target, opts = {}) => {
    if (!opts.force && !canMove(target, opts))
      return false;
    if (opts.fromPage && !pageIsEqualToPage(opts.fromPage, firstPage.value)) {
      hidePopover({ name: navPopoverName.value, hideDelay: 0 });
      hidePopover({ name: dayPopoverName.value, hideDelay: 0 });
      if (opts.view) {
        skipWatcher("view", 10);
        _view.value = opts.view;
      }
      await refreshPages({
        ...opts,
        page: opts.fromPage,
        position: 1,
        force: true
      });
      emit("did-move", _pages.value);
    }
    return true;
  };
  const moveBy = (pages, opts = {}) => {
    return move(targetBy(pages), opts);
  };
  const movePrev = () => {
    return moveBy(-step.value);
  };
  const moveNext = () => {
    return moveBy(step.value);
  };
  const tryFocusDate = (date) => {
    const inMonth = isMonthly.value ? ".in-month" : "";
    const daySelector = `.id-${locale.value.getDayId(date)}${inMonth}`;
    const selector = `${daySelector}.vc-focusable, ${daySelector} .vc-focusable`;
    const el = containerRef.value;
    if (el) {
      const focusableEl = el.querySelector(selector);
      if (focusableEl) {
        focusableEl.focus();
        return true;
      }
    }
    return false;
  };
  const focusDate = async (date, opts = {}) => {
    if (tryFocusDate(date))
      return true;
    await move(date, opts);
    return tryFocusDate(date);
  };
  const onDayClick = (day, event) => {
    focusableDay.value = day.day;
    emit("dayclick", day, event);
  };
  const onDayMouseenter = (day, event) => {
    emit("daymouseenter", day, event);
  };
  const onDayMouseleave = (day, event) => {
    emit("daymouseleave", day, event);
  };
  const onDayFocusin = (day, event) => {
    focusableDay.value = day.day;
    focusedDay.value = day;
    day.isFocused = true;
    emit("dayfocusin", day, event);
  };
  const onDayFocusout = (day, event) => {
    focusedDay.value = null;
    day.isFocused = false;
    emit("dayfocusout", day, event);
  };
  const onDayKeydown = (day, event) => {
    emit("daykeydown", day, event);
    const date = day.noonDate;
    let newDate = null;
    switch (event.key) {
      case "ArrowLeft": {
        newDate = addDays(date, -1);
        break;
      }
      case "ArrowRight": {
        newDate = addDays(date, 1);
        break;
      }
      case "ArrowUp": {
        newDate = addDays(date, -7);
        break;
      }
      case "ArrowDown": {
        newDate = addDays(date, 7);
        break;
      }
      case "Home": {
        newDate = addDays(date, -day.weekdayPosition + 1);
        break;
      }
      case "End": {
        newDate = addDays(date, day.weekdayPositionFromEnd);
        break;
      }
      case "PageUp": {
        if (event.altKey) {
          newDate = addYears(date, -1);
        } else {
          newDate = addMonths(date, -1);
        }
        break;
      }
      case "PageDown": {
        if (event.altKey) {
          newDate = addYears(date, 1);
        } else {
          newDate = addMonths(date, 1);
        }
        break;
      }
    }
    if (newDate) {
      event.preventDefault();
      focusDate(newDate).catch();
    }
  };
  const onKeydown = (event) => {
    const day = focusedDay.value;
    if (day != null) {
      onDayKeydown(day, event);
    }
  };
  const onWeeknumberClick = (week, event) => {
    emit("weeknumberclick", week, event);
  };
  refreshPages({
    page: props.initialPage,
    position: props.initialPagePosition
  });
  vue.onMounted(() => {
    if (!props.disablePageSwipe && containerRef.value) {
      removeHandlers = addHorizontalSwipeHandler(
        containerRef.value,
        ({ toLeft = false, toRight = false }) => {
          if (toLeft) {
            moveNext();
          } else if (toRight) {
            movePrev();
          }
        },
        getDefault("touch")
      );
    }
  });
  vue.onUnmounted(() => {
    _pages.value = [];
    if (removeHandlers)
      removeHandlers();
  });
  vue.watch(
    () => locale.value,
    () => {
      refreshPages();
    }
  );
  vue.watch(
    () => count.value,
    () => refreshPages()
  );
  vue.watch(
    () => props.view,
    () => _view.value = props.view
  );
  vue.watch(
    () => _view.value,
    () => {
      handleWatcher("view", () => {
        refreshPages();
      });
      emit("update:view", _view.value);
    }
  );
  vue.watch(
    () => focusableDay.value,
    () => {
      forDays(_pages.value, (day) => refreshFocusable(day));
    }
  );
  vue.watchEffect(() => {
    emit("update:pages", _pages.value);
    forDays(_pages.value, (day) => {
      refreshDisabled(day);
      refreshFocusable(day);
    });
  });
  const context = {
    emit,
    containerRef,
    focusedDay,
    inTransition,
    view: _view,
    pages: _pages,
    transitionName,
    theme,
    color,
    displayMode,
    locale,
    masks: masks2,
    attributes,
    disabledAttribute,
    disabledDates,
    attributeContext,
    days,
    dayCells,
    count,
    step,
    firstPage,
    lastPage,
    canMovePrev,
    canMoveNext,
    minPage,
    maxPage,
    isMonthly,
    isWeekly,
    isDaily,
    dayPopoverName,
    navPopoverName,
    navPopover,
    showWeeknumbers,
    showIsoWeeknumbers,
    getDateAddress,
    canMove,
    canMoveBy,
    move,
    moveBy,
    movePrev,
    moveNext,
    onTransitionBeforeEnter,
    onTransitionAfterEnter,
    tryFocusDate,
    focusDate,
    onKeydown,
    onDayKeydown,
    onDayClick,
    onDayMouseenter,
    onDayMouseleave,
    onDayFocusin,
    onDayFocusout,
    onWeeknumberClick
  };
  vue.provide(contextKey$2, context);
  return context;
}
function useCalendar() {
  const context = vue.inject(contextKey$2);
  if (context)
    return context;
  throw new Error(
    "Calendar context missing. Please verify this component is nested within a valid context provider."
  );
}
const _hoisted_1$c = { class: "vc-day-popover-row" };
const _hoisted_2$b = {
  key: 0,
  class: "vc-day-popover-row-indicator"
};
const _hoisted_3$9 = { class: "vc-day-popover-row-label" };
const _sfc_main$i = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarDayPopoverRow",
  props: {
    attribute: null
  },
  setup(__props) {
    const props = __props;
    const indicator = vue.computed(() => {
      const { content, highlight, dot, bar, popover } = props.attribute;
      if (popover && popover.hideIndicator)
        return null;
      if (content) {
        return {
          class: `vc-bar vc-day-popover-row-bar vc-attr vc-${content.base.color}`
        };
      }
      if (highlight) {
        return {
          class: `vc-highlight-bg-solid vc-day-popover-row-highlight vc-attr vc-${highlight.base.color}`
        };
      }
      if (dot) {
        return {
          class: `vc-dot vc-attr vc-${dot.base.color}`
        };
      }
      if (bar) {
        return {
          class: `vc-bar vc-day-popover-row-bar vc-attr vc-${bar.base.color}`
        };
      }
      return null;
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", _hoisted_1$c, [
        vue.unref(indicator) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$b, [
          vue.createElementVNode("span", {
            class: vue.normalizeClass(vue.unref(indicator).class)
          }, null, 2)
        ])) : vue.createCommentVNode("", true),
        vue.createElementVNode("div", _hoisted_3$9, [
          vue.renderSlot(_ctx.$slots, "default", {}, () => [
            vue.createTextVNode(vue.toDisplayString(__props.attribute.popover ? __props.attribute.popover.label : "No content provided"), 1)
          ])
        ])
      ]);
    };
  }
});
const CalendarDayPopoverRow_vue_vue_type_style_index_0_lang = "";
const __default__$2 = {
  inheritAttrs: false
};
const _sfc_main$h = /* @__PURE__ */ vue.defineComponent({
  ...__default__$2,
  __name: "CalendarSlot",
  props: {
    name: null
  },
  setup(__props) {
    const props = __props;
    const slot = useSlot(props.name);
    return (_ctx, _cache) => {
      return vue.unref(slot) ? (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(vue.unref(slot)), vue.normalizeProps(vue.mergeProps({ key: 0 }, _ctx.$attrs)), null, 16)) : vue.renderSlot(_ctx.$slots, "default", { key: 1 });
    };
  }
});
const _hoisted_1$b = { class: "vc-day-popover-container" };
const _hoisted_2$a = {
  key: 0,
  class: "vc-day-popover-header"
};
const _sfc_main$g = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarDayPopover",
  setup(__props) {
    const { dayPopoverName, displayMode, color, masks: masks2, locale } = useCalendar();
    function format(date, mask) {
      return locale.value.formatDate(date, mask);
    }
    function dayTitle(day) {
      return locale.value.formatDate(day.date, masks2.value.dayPopover);
    }
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.unref(PopoverContent), {
        name: vue.unref(dayPopoverName),
        class: vue.normalizeClass([`vc-${vue.unref(color)}`, `vc-${vue.unref(displayMode)}`])
      }, {
        default: vue.withCtx(({ data: { day, attributes }, hide }) => [
          vue.createVNode(_sfc_main$h, {
            name: "day-popover",
            day,
            dayTitle: dayTitle(day),
            attributes,
            format,
            masks: vue.unref(masks2),
            hide
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("div", _hoisted_1$b, [
                vue.unref(masks2).dayPopover ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$a, vue.toDisplayString(dayTitle(day)), 1)) : vue.createCommentVNode("", true),
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(attributes, (attribute) => {
                  return vue.openBlock(), vue.createBlock(_sfc_main$i, {
                    key: attribute.key,
                    attribute
                  }, null, 8, ["attribute"]);
                }), 128))
              ])
            ]),
            _: 2
          }, 1032, ["day", "dayTitle", "attributes", "masks", "hide"])
        ]),
        _: 1
      }, 8, ["name", "class"]);
    };
  }
});
const CalendarDayPopover_vue_vue_type_style_index_0_lang = "";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$f = {};
const _hoisted_1$a = {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  viewBox: "0 0 24 24"
};
const _hoisted_2$9 = /* @__PURE__ */ vue.createElementVNode("polyline", { points: "9 18 15 12 9 6" }, null, -1);
const _hoisted_3$8 = [
  _hoisted_2$9
];
function _sfc_render$6(_ctx, _cache) {
  return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1$a, _hoisted_3$8);
}
const IconChevronRight = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$6]]);
const _sfc_main$e = {};
const _hoisted_1$9 = {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  viewBox: "0 0 24 24"
};
const _hoisted_2$8 = /* @__PURE__ */ vue.createElementVNode("polyline", { points: "15 18 9 12 15 6" }, null, -1);
const _hoisted_3$7 = [
  _hoisted_2$8
];
function _sfc_render$5(_ctx, _cache) {
  return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1$9, _hoisted_3$7);
}
const IconChevronLeft = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$5]]);
const _sfc_main$d = {};
const _hoisted_1$8 = {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  viewBox: "0 0 24 24"
};
const _hoisted_2$7 = /* @__PURE__ */ vue.createElementVNode("polyline", { points: "6 9 12 15 18 9" }, null, -1);
const _hoisted_3$6 = [
  _hoisted_2$7
];
function _sfc_render$4(_ctx, _cache) {
  return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1$8, _hoisted_3$6);
}
const IconChevronDown = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$4]]);
const _sfc_main$c = {};
const _hoisted_1$7 = {
  fill: "none",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  viewBox: "0 0 24 24"
};
const _hoisted_2$6 = /* @__PURE__ */ vue.createElementVNode("path", { d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }, null, -1);
const _hoisted_3$5 = [
  _hoisted_2$6
];
function _sfc_render$3(_ctx, _cache) {
  return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1$7, _hoisted_3$5);
}
const IconClock = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$3]]);
const icons = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
  __name: "BaseIcon",
  props: {
    name: { type: String, required: true },
    width: { type: String },
    height: { type: String },
    size: { type: String, default: "26" },
    viewBox: { type: String }
  },
  setup(__props) {
    const props = __props;
    const width = vue.computed(() => props.width || props.size);
    const height = vue.computed(() => props.height || props.size);
    const icon = vue.computed(() => icons[`Icon${props.name}`]);
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent(vue.unref(icon)), {
        width: vue.unref(width),
        height: vue.unref(height),
        class: "vc-base-icon"
      }, null, 8, ["width", "height"]);
    };
  }
});
const BaseIcon_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$6 = ["disabled"];
const _hoisted_2$5 = {
  key: 1,
  class: "vc-title-wrapper"
};
const _hoisted_3$4 = {
  type: "button",
  class: "vc-title"
};
const _hoisted_4$3 = ["disabled"];
const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarHeader",
  props: {
    page: null,
    layout: null,
    isLg: { type: Boolean },
    isXl: { type: Boolean },
    is2xl: { type: Boolean },
    hideTitle: { type: Boolean },
    hideArrows: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const {
      navPopover,
      canMovePrev,
      movePrev,
      canMoveNext,
      moveNext,
      displayMode
    } = useCalendar();
    const navPlacement = vue.computed(() => {
      switch (props.page.titlePosition) {
        case "left":
          return "bottom-start";
        case "right":
          return "bottom-end";
        default:
          return "bottom";
      }
    });
    const navPopoverOptions = vue.computed(() => {
      const { page } = props;
      return {
        theme: displayMode.value,
        ...navPopover.value,
        placement: navPlacement.value,
        data: { page },
        interactive: true
      };
    });
    const titleLeft = vue.computed(() => props.page.titlePosition.includes("left"));
    const titleRight = vue.computed(() => props.page.titlePosition.includes("right"));
    const layout_ = vue.computed(() => {
      if (props.layout)
        return props.layout;
      if (titleLeft.value)
        return "tu-pn";
      if (titleRight.value)
        return "pn-tu";
      return "p-tu-n;";
    });
    const show = vue.computed(() => {
      return {
        prev: layout_.value.includes("p") && !props.hideArrows,
        title: layout_.value.includes("t") && !props.hideTitle,
        next: layout_.value.includes("n") && !props.hideArrows
      };
    });
    const gridStyle = vue.computed(() => {
      const gridTemplateColumns = layout_.value.split("").map((l) => {
        switch (l) {
          case "p":
            return "[prev] auto";
          case "n":
            return "[next] auto";
          case "t":
            return "[title] auto";
          case "-":
            return "1fr";
          default:
            return "";
        }
      }).join(" ");
      return { gridTemplateColumns };
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vc-header", { "is-lg": __props.isLg, "is-xl": __props.isXl, "is-2xl": __props.is2xl }]),
        style: vue.normalizeStyle(vue.unref(gridStyle))
      }, [
        vue.unref(show).prev ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 0,
          type: "button",
          class: "vc-arrow vc-prev vc-focus",
          disabled: !vue.unref(canMovePrev),
          onClick: _cache[0] || (_cache[0] = //@ts-ignore
          (...args) => vue.unref(movePrev) && vue.unref(movePrev)(...args)),
          onKeydown: _cache[1] || (_cache[1] = vue.withKeys(
            //@ts-ignore
            (...args) => vue.unref(movePrev) && vue.unref(movePrev)(...args),
            ["space", "enter"]
          ))
        }, [
          vue.createVNode(_sfc_main$h, {
            name: "header-prev-button",
            disabled: !vue.unref(canMovePrev)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_sfc_main$b, {
                name: "ChevronLeft",
                size: "24"
              })
            ]),
            _: 1
          }, 8, ["disabled"])
        ], 40, _hoisted_1$6)) : vue.createCommentVNode("", true),
        vue.unref(show).title ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$5, [
          vue.createVNode(_sfc_main$h, { name: "header-title-wrapper" }, {
            default: vue.withCtx(() => [
              vue.withDirectives((vue.openBlock(), vue.createElementBlock("button", _hoisted_3$4, [
                vue.createVNode(_sfc_main$h, {
                  name: "header-title",
                  title: __props.page.title
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("span", null, vue.toDisplayString(__props.page.title), 1)
                  ]),
                  _: 1
                }, 8, ["title"])
              ])), [
                [vue.unref(directive), vue.unref(navPopoverOptions)]
              ])
            ]),
            _: 1
          })
        ])) : vue.createCommentVNode("", true),
        vue.unref(show).next ? (vue.openBlock(), vue.createElementBlock("button", {
          key: 2,
          type: "button",
          class: "vc-arrow vc-next vc-focus",
          disabled: !vue.unref(canMoveNext),
          onClick: _cache[2] || (_cache[2] = //@ts-ignore
          (...args) => vue.unref(moveNext) && vue.unref(moveNext)(...args)),
          onKeydown: _cache[3] || (_cache[3] = vue.withKeys(
            //@ts-ignore
            (...args) => vue.unref(moveNext) && vue.unref(moveNext)(...args),
            ["space", "enter"]
          ))
        }, [
          vue.createVNode(_sfc_main$h, {
            name: "header-next-button",
            disabled: !vue.unref(canMoveNext)
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_sfc_main$b, {
                name: "ChevronRight",
                size: "24"
              })
            ]),
            _: 1
          }, 8, ["disabled"])
        ], 40, _hoisted_4$3)) : vue.createCommentVNode("", true)
      ], 6);
    };
  }
});
const CalendarHeader_vue_vue_type_style_index_0_lang = "";
const contextKey$1 = Symbol("__vc_page_context__");
function createPage(page) {
  const { locale, getDateAddress, canMove } = useCalendar();
  function getMonthItems(year, mask) {
    const { month: thisMonth, year: thisYear } = getDateAddress(/* @__PURE__ */ new Date());
    return getMonthDates().map((d, i) => {
      const month = i + 1;
      return {
        month,
        year,
        id: getPageId(month, year),
        label: locale.value.formatDate(d, mask),
        ariaLabel: locale.value.formatDate(d, "MMMM"),
        isActive: month === page.value.month && year === page.value.year,
        isCurrent: month === thisMonth && year === thisYear,
        isDisabled: !canMove(
          { month, year },
          { position: page.value.position }
        )
      };
    });
  }
  function getYearItems(startYear, endYear) {
    const { year: thisYear } = getDateAddress(/* @__PURE__ */ new Date());
    const { position } = page.value;
    const items = [];
    for (let year = startYear; year <= endYear; year += 1) {
      const enabled = [...Array(12).keys()].some(
        (m) => canMove({ month: m + 1, year }, { position })
      );
      items.push({
        year,
        id: year.toString(),
        label: year.toString(),
        ariaLabel: year.toString(),
        isActive: year === page.value.year,
        isCurrent: year === thisYear,
        isDisabled: !enabled
      });
    }
    return items;
  }
  const context = { page, getMonthItems, getYearItems };
  vue.provide(contextKey$1, context);
  return context;
}
function usePage() {
  const context = vue.inject(contextKey$1);
  if (context)
    return context;
  throw new Error(
    "Page context missing. Please verify this component is nested within a valid context provider."
  );
}
const _hoisted_1$5 = { class: "vc-nav-header" };
const _hoisted_2$4 = ["disabled"];
const _hoisted_3$3 = ["disabled"];
const _hoisted_4$2 = { class: "vc-nav-items" };
const _hoisted_5$2 = ["data-id", "aria-label", "disabled", "onClick", "onKeydown"];
const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarNav",
  setup(__props) {
    const { masks: masks2, move } = useCalendar();
    const { page, getMonthItems, getYearItems } = usePage();
    const monthMode = vue.ref(true);
    const yearGroupCount = 12;
    const selectedYear = vue.ref(page.value.year);
    const selectedYearGroup = vue.ref(getYearGroupIndex(page.value.year));
    const navContainer = vue.ref(null);
    function focusFirstItem() {
      setTimeout(() => {
        if (navContainer.value == null)
          return;
        const focusableEl = navContainer.value.querySelector(
          ".vc-nav-item:not(:disabled)"
        );
        if (focusableEl) {
          focusableEl.focus();
        }
      }, 10);
    }
    function getYearGroupIndex(year) {
      return Math.floor(year / yearGroupCount);
    }
    function toggleMode() {
      monthMode.value = !monthMode.value;
    }
    function getStartYear(groupIndex) {
      return groupIndex * yearGroupCount;
    }
    function getEndYear(groupIndex) {
      return yearGroupCount * (groupIndex + 1) - 1;
    }
    function movePrev() {
      if (!prevItemsEnabled.value)
        return;
      if (monthMode.value) {
        movePrevYear();
      }
      movePrevYearGroup();
    }
    function moveNext() {
      if (!nextItemsEnabled.value)
        return;
      if (monthMode.value) {
        moveNextYear();
      }
      moveNextYearGroup();
    }
    function movePrevYear() {
      selectedYear.value--;
    }
    function moveNextYear() {
      selectedYear.value++;
    }
    function movePrevYearGroup() {
      selectedYearGroup.value--;
    }
    function moveNextYearGroup() {
      selectedYearGroup.value++;
    }
    const monthItems = vue.computed(
      () => getMonthItems(selectedYear.value, masks2.value.navMonths).map((item) => ({
        ...item,
        click: () => move(
          { month: item.month, year: item.year },
          { position: page.value.position }
        )
      }))
    );
    const prevMonthItems = vue.computed(
      () => getMonthItems(selectedYear.value - 1, masks2.value.navMonths)
    );
    const prevMonthItemsEnabled = vue.computed(
      () => prevMonthItems.value.some((i) => !i.isDisabled)
    );
    const nextMonthItems = vue.computed(
      () => getMonthItems(selectedYear.value + 1, masks2.value.navMonths)
    );
    const nextMonthItemsEnabled = vue.computed(
      () => nextMonthItems.value.some((i) => !i.isDisabled)
    );
    const yearItems = vue.computed(
      () => getYearItems(
        getStartYear(selectedYearGroup.value),
        getEndYear(selectedYearGroup.value)
      ).map((item) => {
        return {
          ...item,
          click: () => {
            selectedYear.value = item.year;
            monthMode.value = true;
            focusFirstItem();
          }
        };
      })
    );
    const prevYearItems = vue.computed(
      () => getYearItems(
        getStartYear(selectedYearGroup.value - 1),
        getEndYear(selectedYearGroup.value - 1)
      )
    );
    const prevYearItemsEnabled = vue.computed(
      () => prevYearItems.value.some((i) => !i.isDisabled)
    );
    const nextYearItems = vue.computed(
      () => getYearItems(
        getStartYear(selectedYearGroup.value + 1),
        getEndYear(selectedYearGroup.value + 1)
      )
    );
    const nextYearItemsEnabled = vue.computed(
      () => nextYearItems.value.some((i) => !i.isDisabled)
    );
    const activeItems = vue.computed(
      () => monthMode.value ? monthItems.value : yearItems.value
    );
    const prevItemsEnabled = vue.computed(
      () => monthMode.value ? prevMonthItemsEnabled.value : prevYearItemsEnabled.value
    );
    const nextItemsEnabled = vue.computed(
      () => monthMode.value ? nextMonthItemsEnabled.value : nextYearItemsEnabled.value
    );
    const firstYear = vue.computed(() => head_1(yearItems.value.map((i) => i.year)));
    const lastYear = vue.computed(() => last_1(yearItems.value.map((i) => i.year)));
    const title2 = vue.computed(() => {
      return monthMode.value ? selectedYear.value : `${firstYear.value} - ${lastYear.value}`;
    });
    vue.watchEffect(() => {
      selectedYear.value = page.value.year;
      focusFirstItem();
    });
    vue.watch(
      () => selectedYear.value,
      (val) => selectedYearGroup.value = getYearGroupIndex(val)
    );
    vue.onMounted(() => focusFirstItem());
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: "vc-nav-container",
        ref_key: "navContainer",
        ref: navContainer
      }, [
        vue.createElementVNode("div", _hoisted_1$5, [
          vue.createElementVNode("button", {
            type: "button",
            class: "vc-nav-arrow is-left vc-focus",
            disabled: !vue.unref(prevItemsEnabled),
            onClick: movePrev,
            onKeydown: _cache[0] || (_cache[0] = (e) => vue.unref(onSpaceOrEnter)(e, movePrev))
          }, [
            vue.createVNode(_sfc_main$h, {
              name: "nav-prev-button",
              move: movePrev,
              disabled: !vue.unref(prevItemsEnabled)
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_sfc_main$b, {
                  name: "ChevronLeft",
                  width: "22px",
                  height: "24px"
                })
              ]),
              _: 1
            }, 8, ["disabled"])
          ], 40, _hoisted_2$4),
          vue.createElementVNode("button", {
            type: "button",
            class: "vc-nav-title vc-focus",
            onClick: toggleMode,
            onKeydown: _cache[1] || (_cache[1] = (e) => vue.unref(onSpaceOrEnter)(e, toggleMode))
          }, vue.toDisplayString(vue.unref(title2)), 33),
          vue.createElementVNode("button", {
            type: "button",
            class: "vc-nav-arrow is-right vc-focus",
            disabled: !vue.unref(nextItemsEnabled),
            onClick: moveNext,
            onKeydown: _cache[2] || (_cache[2] = (e) => vue.unref(onSpaceOrEnter)(e, moveNext))
          }, [
            vue.createVNode(_sfc_main$h, {
              name: "nav-next-button",
              move: moveNext,
              disabled: !vue.unref(nextItemsEnabled)
            }, {
              default: vue.withCtx(() => [
                vue.createVNode(_sfc_main$b, {
                  name: "ChevronRight",
                  width: "22px",
                  height: "24px"
                })
              ]),
              _: 1
            }, 8, ["disabled"])
          ], 40, _hoisted_3$3)
        ]),
        vue.createElementVNode("div", _hoisted_4$2, [
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(activeItems), (item) => {
            return vue.openBlock(), vue.createElementBlock("button", {
              key: item.label,
              type: "button",
              "data-id": item.id,
              "aria-label": item.ariaLabel,
              class: vue.normalizeClass(["vc-nav-item vc-focus", [
                item.isActive ? "is-active" : item.isCurrent ? "is-current" : ""
              ]]),
              disabled: item.isDisabled,
              onClick: item.click,
              onKeydown: (e) => vue.unref(onSpaceOrEnter)(e, item.click)
            }, vue.toDisplayString(item.label), 43, _hoisted_5$2);
          }), 128))
        ])
      ], 512);
    };
  }
});
const CalendarNav_vue_vue_type_style_index_0_lang = "";
const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarPageProvider",
  props: {
    page: null
  },
  setup(__props) {
    const props = __props;
    createPage(vue.toRef(props, "page"));
    return (_ctx, _cache) => {
      return vue.renderSlot(_ctx.$slots, "default");
    };
  }
});
const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
  __name: "CalendarNavPopover",
  setup(__props) {
    const { navPopoverName, color, displayMode } = useCalendar();
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createBlock(vue.unref(PopoverContent), {
        name: vue.unref(navPopoverName),
        class: vue.normalizeClass(["vc-nav-popover-container", `vc-${vue.unref(color)}`, `vc-${vue.unref(displayMode)}`])
      }, {
        default: vue.withCtx(({ data: data2 }) => [
          vue.createVNode(_sfc_main$8, {
            page: data2.page
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(_sfc_main$h, { name: "nav" }, {
                default: vue.withCtx(() => [
                  vue.createVNode(_sfc_main$9)
                ]),
                _: 1
              })
            ]),
            _: 2
          }, 1032, ["page"])
        ]),
        _: 1
      }, 8, ["name", "class"]);
    };
  }
});
const _sfc_main$6 = vue.defineComponent({
  directives: { popover: directive },
  components: { CalendarSlot: _sfc_main$h },
  props: {
    day: { type: Object, required: true }
  },
  setup(props) {
    const {
      locale,
      theme,
      attributeContext,
      dayPopoverName,
      displayMode,
      onDayClick,
      onDayMouseenter,
      onDayMouseleave,
      onDayFocusin,
      onDayFocusout,
      onDayKeydown
    } = useCalendar();
    const day = vue.computed(() => props.day);
    const attributeCells = vue.computed(() => {
      return attributeContext.value.getCells(day.value);
    });
    const attributes = vue.computed(
      () => attributeCells.value.map((cell) => cell.data)
    );
    const attributedDay = vue.computed(() => {
      return {
        ...day.value,
        attributes: attributes.value,
        attributeCells: attributeCells.value
      };
    });
    function processPopover({ data: attribute }, { popovers }) {
      const { key, customData, popover } = attribute;
      if (!popover)
        return;
      const resolvedPopover = defaults(
        {
          key,
          customData,
          attribute
        },
        { ...popover },
        {
          action: popover.label ? "hover" : "click",
          placement: "bottom",
          interactive: !popover.label
        }
      );
      popovers.splice(0, 0, resolvedPopover);
    }
    const glyphs = vue.computed(() => {
      const result = {
        ...theme.value.prepareRender({}),
        popovers: []
      };
      attributeCells.value.forEach((cell) => {
        theme.value.render(cell, result);
        processPopover(cell, result);
      });
      return result;
    });
    const highlights = vue.computed(() => glyphs.value.highlights);
    const hasHighlights = vue.computed(() => !!arrayHasItems(highlights.value));
    const content = vue.computed(() => glyphs.value.content);
    const dots = vue.computed(() => glyphs.value.dots);
    const hasDots = vue.computed(() => !!arrayHasItems(dots.value));
    const bars = vue.computed(() => glyphs.value.bars);
    const hasBars = vue.computed(() => !!arrayHasItems(bars.value));
    const dayContentSlot = useSlot("day-content");
    const dayClasses = vue.computed(() => {
      return [
        "vc-day",
        ...day.value.classes,
        { "vc-day-box-center-center": !dayContentSlot },
        { "is-not-in-month": !props.day.inMonth }
      ];
    });
    const dayContentProps = vue.computed(() => {
      let tabindex;
      if (day.value.isFocusable) {
        tabindex = "0";
      } else {
        tabindex = "-1";
      }
      const classes = [
        "vc-day-content vc-focusable vc-focus vc-attr",
        { "vc-disabled": day.value.isDisabled },
        get_1(last_1(highlights.value), "contentClass"),
        get_1(last_1(content.value), "class") || ""
      ];
      const style2 = {
        ...get_1(last_1(highlights.value), "contentStyle"),
        ...get_1(last_1(content.value), "style")
      };
      return {
        class: classes,
        style: style2,
        tabindex,
        "aria-label": day.value.ariaLabel,
        "aria-disabled": day.value.isDisabled ? true : false,
        role: "button"
      };
    });
    const dayContentEvents = vue.computed(() => {
      return {
        click(event) {
          onDayClick(attributedDay.value, event);
        },
        mouseenter(event) {
          onDayMouseenter(attributedDay.value, event);
        },
        mouseleave(event) {
          onDayMouseleave(attributedDay.value, event);
        },
        focusin(event) {
          onDayFocusin(attributedDay.value, event);
        },
        focusout(event) {
          onDayFocusout(attributedDay.value, event);
        },
        keydown(event) {
          onDayKeydown(attributedDay.value, event);
        }
      };
    });
    const dayPopover2 = vue.computed(() => {
      const popovers = glyphs.value.popovers;
      if (!arrayHasItems(popovers))
        return null;
      return cleanPopoverOptions(
        defaults(
          {
            name: dayPopoverName.value,
            data: {
              day,
              attributes: popovers.map((p) => p.attribute)
            }
          },
          ...popovers,
          {
            arrowHidden: false,
            transitions: ["fade", "scale"],
            theme: displayMode.value
          }
        )
      );
    });
    return {
      attributes,
      attributeCells,
      bars,
      dayClasses,
      dayContentProps,
      dayContentEvents,
      dayPopover: dayPopover2,
      glyphs,
      dots,
      hasDots,
      hasBars,
      highlights,
      hasHighlights,
      locale
    };
  }
});
const CalendarDay_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$4 = {
  key: 0,
  class: "vc-highlights vc-day-layer"
};
const _hoisted_2$3 = {
  key: 1,
  class: "vc-day-layer vc-day-box-center-bottom"
};
const _hoisted_3$2 = { class: "vc-dots" };
const _hoisted_4$1 = {
  key: 2,
  class: "vc-day-layer vc-day-box-center-bottom"
};
const _hoisted_5$1 = { class: "vc-bars" };
function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_CalendarSlot = vue.resolveComponent("CalendarSlot");
  const _directive_popover = vue.resolveDirective("popover");
  return vue.openBlock(), vue.createElementBlock("div", {
    class: vue.normalizeClass(_ctx.dayClasses)
  }, [
    _ctx.hasHighlights ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$4, [
      (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.highlights, ({ key, wrapperClass, class: bgClass, style: style2 }) => {
        return vue.openBlock(), vue.createElementBlock("div", {
          key,
          class: vue.normalizeClass(wrapperClass)
        }, [
          vue.createElementVNode("div", {
            class: vue.normalizeClass(bgClass),
            style: vue.normalizeStyle(style2)
          }, null, 6)
        ], 2);
      }), 128))
    ])) : vue.createCommentVNode("", true),
    vue.createVNode(_component_CalendarSlot, {
      name: "day-content",
      day: _ctx.day,
      attributes: _ctx.attributes,
      "attribute-cells": _ctx.attributeCells,
      dayProps: _ctx.dayContentProps,
      dayEvents: _ctx.dayContentEvents,
      locale: _ctx.locale
    }, {
      default: vue.withCtx(() => [
        vue.withDirectives((vue.openBlock(), vue.createElementBlock("div", vue.mergeProps(_ctx.dayContentProps, vue.toHandlers(_ctx.dayContentEvents, true)), [
          vue.createTextVNode(vue.toDisplayString(_ctx.day.label), 1)
        ], 16)), [
          [_directive_popover, _ctx.dayPopover]
        ])
      ]),
      _: 1
    }, 8, ["day", "attributes", "attribute-cells", "dayProps", "dayEvents", "locale"]),
    _ctx.hasDots ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$3, [
      vue.createElementVNode("div", _hoisted_3$2, [
        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.dots, ({ key, class: bgClass, style: style2 }) => {
          return vue.openBlock(), vue.createElementBlock("span", {
            key,
            class: vue.normalizeClass(bgClass),
            style: vue.normalizeStyle(style2)
          }, null, 6);
        }), 128))
      ])
    ])) : vue.createCommentVNode("", true),
    _ctx.hasBars ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_4$1, [
      vue.createElementVNode("div", _hoisted_5$1, [
        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.bars, ({ key, class: bgClass, style: style2 }) => {
          return vue.openBlock(), vue.createElementBlock("span", {
            key,
            class: vue.normalizeClass(bgClass),
            style: vue.normalizeStyle(style2)
          }, null, 6);
        }), 128))
      ])
    ])) : vue.createCommentVNode("", true)
  ], 2);
}
const CalendarDay = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$2]]);
const _hoisted_1$3 = { class: "vc-weekdays" };
const _hoisted_2$2 = ["onClick"];
const __default__$1 = {
  inheritAttrs: false
};
const _sfc_main$5 = /* @__PURE__ */ vue.defineComponent({
  ...__default__$1,
  __name: "CalendarPage",
  setup(__props) {
    const { page } = usePage();
    const { onWeeknumberClick } = useCalendar();
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass([
          "vc-pane",
          `row-${vue.unref(page).row}`,
          `row-from-end-${vue.unref(page).rowFromEnd}`,
          `column-${vue.unref(page).column}`,
          `column-from-end-${vue.unref(page).columnFromEnd}`
        ]),
        ref: "pane"
      }, [
        vue.createVNode(_sfc_main$a, {
          page: vue.unref(page),
          "is-lg": "",
          "hide-arrows": ""
        }, null, 8, ["page"]),
        vue.createElementVNode("div", {
          class: vue.normalizeClass(["vc-weeks", {
            [`vc-show-weeknumbers-${vue.unref(page).weeknumberPosition}`]: vue.unref(page).weeknumberPosition
          }])
        }, [
          vue.createElementVNode("div", _hoisted_1$3, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(page).weekdays, ({ weekday, label }, i) => {
              return vue.openBlock(), vue.createElementBlock("div", {
                key: i,
                class: vue.normalizeClass(`vc-weekday vc-weekday-${weekday}`)
              }, vue.toDisplayString(label), 3);
            }), 128))
          ]),
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(page).viewWeeks, (week) => {
            return vue.openBlock(), vue.createElementBlock("div", {
              key: `weeknumber-${week.weeknumber}`,
              class: "vc-week"
            }, [
              vue.unref(page).weeknumberPosition ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 0,
                class: vue.normalizeClass(["vc-weeknumber", `is-${vue.unref(page).weeknumberPosition}`])
              }, [
                vue.createElementVNode("span", {
                  class: vue.normalizeClass(["vc-weeknumber-content"]),
                  onClick: ($event) => vue.unref(onWeeknumberClick)(week, $event)
                }, vue.toDisplayString(week.weeknumberDisplay), 9, _hoisted_2$2)
              ], 2)) : vue.createCommentVNode("", true),
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(week.days, (day) => {
                return vue.openBlock(), vue.createBlock(CalendarDay, {
                  key: day.id,
                  day
                }, null, 8, ["day"]);
              }), 128))
            ]);
          }), 128))
        ], 2)
      ], 2);
    };
  }
});
const CalendarPage_vue_vue_type_style_index_0_lang = "";
const _sfc_main$4 = vue.defineComponent({
  components: {
    CalendarHeader: _sfc_main$a,
    CalendarPage: _sfc_main$5,
    CalendarNavPopover: _sfc_main$7,
    CalendarDayPopover: _sfc_main$g,
    CalendarPageProvider: _sfc_main$8,
    CalendarSlot: _sfc_main$h
  },
  props: propsDef$1,
  emit: emitsDef,
  setup(props, { emit, slots }) {
    return createCalendar(props, { emit, slots });
  }
});
const Calendar_vue_vue_type_style_index_0_lang = "";
const _hoisted_1$2 = { class: "vc-pane-header-wrapper" };
function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_CalendarHeader = vue.resolveComponent("CalendarHeader");
  const _component_CalendarPage = vue.resolveComponent("CalendarPage");
  const _component_CalendarSlot = vue.resolveComponent("CalendarSlot");
  const _component_CalendarPageProvider = vue.resolveComponent("CalendarPageProvider");
  const _component_CalendarDayPopover = vue.resolveComponent("CalendarDayPopover");
  const _component_CalendarNavPopover = vue.resolveComponent("CalendarNavPopover");
  return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
    vue.createElementVNode("div", vue.mergeProps({ "data-helptext": "Press the arrow keys to navigate by day, Home and End to navigate to week ends, PageUp and PageDown to navigate by month, Alt+PageUp and Alt+PageDown to navigate by year" }, _ctx.$attrs, {
      class: [
        "vc-container",
        `vc-${_ctx.view}`,
        `vc-${_ctx.color}`,
        `vc-${_ctx.displayMode}`,
        {
          "vc-expanded": _ctx.expanded,
          "vc-bordered": !_ctx.borderless,
          "vc-transparent": _ctx.transparent
        }
      ],
      onMouseup: _cache[0] || (_cache[0] = vue.withModifiers(() => {
      }, ["prevent"])),
      ref: "containerRef"
    }), [
      vue.createElementVNode("div", {
        class: vue.normalizeClass(["vc-pane-container", { "in-transition": _ctx.inTransition }])
      }, [
        vue.createElementVNode("div", _hoisted_1$2, [
          _ctx.firstPage ? (vue.openBlock(), vue.createBlock(_component_CalendarHeader, {
            key: 0,
            page: _ctx.firstPage,
            "is-lg": "",
            "hide-title": ""
          }, null, 8, ["page"])) : vue.createCommentVNode("", true)
        ]),
        vue.createVNode(vue.Transition, {
          name: `vc-${_ctx.transitionName}`,
          onBeforeEnter: _ctx.onTransitionBeforeEnter,
          onAfterEnter: _ctx.onTransitionAfterEnter
        }, {
          default: vue.withCtx(() => [
            (vue.openBlock(), vue.createElementBlock("div", {
              key: _ctx.pages[0].id,
              class: "vc-pane-layout",
              style: vue.normalizeStyle({
                gridTemplateColumns: `repeat(${_ctx.columns}, 1fr)`
              })
            }, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(_ctx.pages, (page) => {
                return vue.openBlock(), vue.createBlock(_component_CalendarPageProvider, {
                  key: page.id,
                  page
                }, {
                  default: vue.withCtx(() => [
                    vue.createVNode(_component_CalendarSlot, {
                      name: "page",
                      page
                    }, {
                      default: vue.withCtx(() => [
                        vue.createVNode(_component_CalendarPage)
                      ]),
                      _: 2
                    }, 1032, ["page"])
                  ]),
                  _: 2
                }, 1032, ["page"]);
              }), 128))
            ], 4))
          ]),
          _: 1
        }, 8, ["name", "onBeforeEnter", "onAfterEnter"]),
        vue.createVNode(_component_CalendarSlot, { name: "footer" })
      ], 2)
    ], 16),
    vue.createVNode(_component_CalendarDayPopover),
    vue.createVNode(_component_CalendarNavPopover)
  ], 64);
}
const Calendar = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$1]]);
const contextKey = Symbol("__vc_date_picker_context__");
const propsDef = {
  ...propsDef$2,
  mode: { type: String, default: "date" },
  modelValue: {
    type: [Number, String, Date, Object]
  },
  modelModifiers: {
    type: Object,
    default: () => ({})
  },
  rules: [String, Object],
  is24hr: Boolean,
  hideTimeHeader: Boolean,
  timeAccuracy: { type: Number, default: 2 },
  isRequired: Boolean,
  isRange: Boolean,
  updateOnInput: {
    type: Boolean,
    default: () => getDefault("datePicker.updateOnInput")
  },
  inputDebounce: {
    type: Number,
    default: () => getDefault("datePicker.inputDebounce")
  },
  popover: {
    type: [Boolean, Object, null],
    default: () => getDefault("datePicker.popover")
  },
  dragAttribute: Object,
  selectAttribute: Object,
  attributes: [Object, Array]
};
const emits = [
  "update:modelValue",
  "drag",
  "dayclick",
  "daykeydown",
  "popover-will-show",
  "popover-did-show",
  "popover-will-hide",
  "popover-did-hide"
];
let popoverUid = 0;
function createDatePicker(props, { emit, slots }) {
  provideSlots(slots, { footer: "dp-footer" });
  const baseCtx = createBase(props);
  const { locale, masks: masks2, disabledAttribute, displayMode } = baseCtx;
  const showCalendar = vue.ref(false);
  const dateValue = vue.ref(null);
  const dragValue = vue.ref(null);
  const inputValues = vue.ref(["", ""]);
  const popoverName = vue.ref(`__date_picker_popover_${popoverUid++}__`);
  const calendarRef = vue.ref(null);
  let updateTimeout = void 0;
  let dragTrackingValue;
  let watchValue = true;
  const isRange = vue.computed(() => {
    return props.isRange || props.modelModifiers.range === true;
  });
  const valueStart = vue.computed(
    () => isRange.value && dateValue.value != null ? dateValue.value.start : null
  );
  const valueEnd = vue.computed(
    () => isRange.value && dateValue.value != null ? dateValue.value.end : null
  );
  const isDateMode = vue.computed(() => props.mode.toLowerCase() === "date");
  const isDateTimeMode = vue.computed(
    () => props.mode.toLowerCase() === "datetime"
  );
  const isTimeMode = vue.computed(() => props.mode.toLowerCase() === "time");
  const isDragging = vue.computed(() => !!dragValue.value);
  const modelConfig = vue.computed(() => {
    let type = "date";
    if (props.modelModifiers.number)
      type = "number";
    if (props.modelModifiers.string)
      type = "string";
    const mask = masks2.value.modelValue || "iso";
    return normalizeConfig2({ type, mask });
  });
  const dateParts = vue.computed(
    () => getDateParts2(dragValue.value ?? dateValue.value)
  );
  const inputMask = vue.computed(() => {
    if (isTimeMode.value) {
      return props.is24hr ? masks2.value.inputTime24hr : masks2.value.inputTime;
    }
    if (isDateTimeMode.value) {
      return props.is24hr ? masks2.value.inputDateTime24hr : masks2.value.inputDateTime;
    }
    return masks2.value.input;
  });
  const inputMaskHasTime = vue.computed(() => /[Hh]/g.test(inputMask.value));
  const inputMaskHasDate = vue.computed(
    () => /[dD]{1,2}|Do|W{1,4}|M{1,4}|YY(?:YY)?/g.test(inputMask.value)
  );
  const inputMaskPatch = vue.computed(() => {
    if (inputMaskHasTime.value && inputMaskHasDate.value) {
      return "dateTime";
    }
    if (inputMaskHasDate.value)
      return "date";
    if (inputMaskHasTime.value)
      return "time";
    return void 0;
  });
  const popover = vue.computed(() => {
    return cleanPopoverOptions(
      defaultsDeep(
        { name: popoverName.value },
        props.popover,
        getDefault("datePicker.popover"),
        { theme: displayMode.value }
      )
    );
  });
  const inputValue = vue.computed(() => {
    return isRange.value ? {
      start: inputValues.value[0],
      end: inputValues.value[1]
    } : inputValues.value[0];
  });
  const inputEvents = vue.computed(() => {
    const events = ["start", "end"].map((target) => ({
      input: onInputInput(target),
      change: onInputChange(target),
      keyup: onInputKeyup,
      ...props.popover ? getPopoverEventHandlers(popover.value) : {}
    }));
    return isRange.value ? {
      start: events[0],
      end: events[1]
    } : events[0];
  });
  const selectAttribute = vue.computed(() => {
    if (!hasValue(dateValue.value))
      return null;
    const attribute = {
      key: "select-drag",
      ...props.selectAttribute,
      dates: dateValue.value,
      pinPage: true
    };
    const { dot, bar, highlight, content } = attribute;
    if (!dot && !bar && !highlight && !content) {
      attribute.highlight = true;
    }
    return attribute;
  });
  const dragAttribute = vue.computed(() => {
    if (!isRange.value || !hasValue(dragValue.value)) {
      return null;
    }
    const attribute = {
      key: "select-drag",
      ...props.dragAttribute,
      dates: dragValue.value
    };
    const { dot, bar, highlight, content } = attribute;
    if (!dot && !bar && !highlight && !content) {
      attribute.highlight = {
        startEnd: {
          fillMode: "outline"
        }
      };
    }
    return attribute;
  });
  const attributes = vue.computed(() => {
    const attrs = isArray(props.attributes) ? [...props.attributes] : [];
    if (dragAttribute.value) {
      attrs.unshift(dragAttribute.value);
    } else if (selectAttribute.value) {
      attrs.unshift(selectAttribute.value);
    }
    return attrs;
  });
  const rules = vue.computed(() => {
    return normalizeConfig2(
      props.rules === "auto" ? getAutoRules() : props.rules ?? {}
    );
  });
  function getAutoRules() {
    const _rules = {
      ms: [0, 999],
      sec: [0, 59],
      min: [0, 59],
      hr: [0, 23]
    };
    const accuracy = isDateMode.value ? 0 : props.timeAccuracy;
    return [0, 1].map((i) => {
      switch (accuracy) {
        case 0:
          return {
            hours: _rules.hr[i],
            minutes: _rules.min[i],
            seconds: _rules.sec[i],
            milliseconds: _rules.ms[i]
          };
        case 1:
          return {
            minutes: _rules.min[i],
            seconds: _rules.sec[i],
            milliseconds: _rules.ms[i]
          };
        case 3:
          return { milliseconds: _rules.ms[i] };
        case 4:
          return {};
        default:
          return { seconds: _rules.sec[i], milliseconds: _rules.ms[i] };
      }
    });
  }
  function normalizeConfig2(config22) {
    if (isArray(config22)) {
      if (config22.length === 1)
        return [config22[0], config22[0]];
      return config22;
    }
    return [config22, config22];
  }
  function normalizeDateConfig(config22) {
    return normalizeConfig2(config22).map(
      (c, i) => ({
        ...c,
        rules: rules.value[i]
      })
    );
  }
  function hasDateValue(value) {
    if (value == null)
      return false;
    if (isNumber_1(value))
      return !isNaN(value);
    if (isDate(value))
      return !isNaN(value.getTime());
    if (isString_1(value))
      return value !== "";
    return isDateParts(value);
  }
  function hasRangeValue(value) {
    return isObject(value) && "start" in value && "end" in value && hasDateValue(value.start ?? null) && hasDateValue(value.end ?? null);
  }
  function hasValue(value) {
    return hasRangeValue(value) || hasDateValue(value);
  }
  function valuesAreEqual(a, b) {
    if (a == null && b == null)
      return true;
    if (a == null || b == null)
      return false;
    const aIsDate = isDate(a);
    const bIsDate = isDate(b);
    if (aIsDate && bIsDate)
      return a.getTime() === b.getTime();
    if (aIsDate || bIsDate)
      return false;
    return valuesAreEqual(a.start, b.start) && valuesAreEqual(a.end, b.end);
  }
  function valueIsDisabled(value) {
    if (!hasValue(value) || !disabledAttribute.value)
      return false;
    return disabledAttribute.value.intersectsRange(locale.value.range(value));
  }
  function normalizeValue(value, config22, patch, targetPriority) {
    if (!hasValue(value))
      return null;
    if (hasRangeValue(value)) {
      const start = locale.value.toDate(value.start, {
        ...config22[0],
        fillDate: valueStart.value ?? void 0,
        patch
      });
      const end = locale.value.toDate(value.end, {
        ...config22[1],
        fillDate: valueEnd.value ?? void 0,
        patch
      });
      return sortRange({ start, end }, targetPriority);
    }
    return locale.value.toDateOrNull(value, {
      ...config22[0],
      fillDate: dateValue.value,
      patch
    });
  }
  function denormalizeValue(value, config22) {
    if (hasRangeValue(value)) {
      return {
        start: locale.value.fromDate(value.start, config22[0]),
        end: locale.value.fromDate(value.end, config22[1])
      };
    }
    if (isRange.value) {
      return null;
    }
    return locale.value.fromDate(value, config22[0]);
  }
  function updateValue(value, opts = {}) {
    clearTimeout(updateTimeout);
    return new Promise((resolve) => {
      const { debounce = 0, ...args } = opts;
      if (debounce > 0) {
        updateTimeout = window.setTimeout(() => {
          resolve(forceUpdateValue(value, args));
        }, debounce);
      } else {
        resolve(forceUpdateValue(value, args));
      }
    });
  }
  function forceUpdateValue(value, {
    config: config22 = modelConfig.value,
    patch = "dateTime",
    clearIfEqual = false,
    formatInput: fInput = true,
    hidePopover: hPopover = false,
    dragging = isDragging.value,
    targetPriority,
    moveToValue: mValue = false
  } = {}) {
    const normalizedConfig = normalizeDateConfig(config22);
    let normalizedValue = normalizeValue(
      value,
      normalizedConfig,
      patch,
      targetPriority
    );
    const isDisabled = valueIsDisabled(normalizedValue);
    if (isDisabled) {
      if (dragging)
        return null;
      normalizedValue = dateValue.value;
      hPopover = false;
    } else if (normalizedValue == null && props.isRequired) {
      normalizedValue = dateValue.value;
    } else if (
      // Clear value if same value was passed
      normalizedValue != null && valuesAreEqual(dateValue.value, normalizedValue) && clearIfEqual
    ) {
      normalizedValue = null;
    }
    const valueRef = dragging ? dragValue : dateValue;
    const notify = !valuesAreEqual(valueRef.value, normalizedValue);
    valueRef.value = normalizedValue;
    if (!dragging)
      dragValue.value = null;
    const denormalizedValue = denormalizeValue(
      normalizedValue,
      modelConfig.value
    );
    if (notify) {
      watchValue = false;
      emit(dragging ? "drag" : "update:modelValue", denormalizedValue);
      vue.nextTick(() => watchValue = true);
    }
    if (hPopover && !dragging)
      hidePopover$1();
    if (fInput)
      formatInput();
    if (mValue) {
      vue.nextTick(() => moveToValue(targetPriority ?? "start"));
    }
    return denormalizedValue;
  }
  function formatInput() {
    vue.nextTick(() => {
      const config22 = normalizeDateConfig({
        type: "string",
        mask: inputMask.value
      });
      const value = denormalizeValue(
        dragValue.value ?? dateValue.value,
        config22
      );
      if (isRange.value) {
        inputValues.value = [value && value.start, value && value.end];
      } else {
        inputValues.value = [value, ""];
      }
    });
  }
  function onInputUpdate(inputValue2, target, opts) {
    inputValues.value.splice(target === "start" ? 0 : 1, 1, inputValue2);
    const value = isRange.value ? {
      start: inputValues.value[0],
      end: inputValues.value[1] || inputValues.value[0]
    } : inputValue2;
    const config22 = {
      type: "string",
      mask: inputMask.value
    };
    updateValue(value, {
      ...opts,
      config: config22,
      patch: inputMaskPatch.value,
      targetPriority: target,
      moveToValue: true
    });
  }
  function onInputInput(target) {
    return (e) => {
      if (!props.updateOnInput)
        return;
      onInputUpdate(e.currentTarget.value, target, {
        formatInput: false,
        hidePopover: false,
        debounce: props.inputDebounce
      });
    };
  }
  function onInputChange(target) {
    return (e) => {
      onInputUpdate(e.currentTarget.value, target, {
        formatInput: true,
        hidePopover: false
      });
    };
  }
  function onInputKeyup(e) {
    if (e.key !== "Escape")
      return;
    updateValue(dateValue.value, {
      formatInput: true,
      hidePopover: true
    });
  }
  function getDateParts2(value) {
    if (isRange.value) {
      return [
        value && value.start ? locale.value.getDateParts(value.start) : null,
        value && value.end ? locale.value.getDateParts(value.end) : null
      ];
    }
    return [value ? locale.value.getDateParts(value) : null];
  }
  function cancelDrag() {
    dragValue.value = null;
    formatInput();
  }
  function onPopoverBeforeShow(el) {
    emit("popover-will-show", el);
  }
  function onPopoverAfterShow(el) {
    emit("popover-did-show", el);
  }
  function onPopoverBeforeHide(el) {
    cancelDrag();
    emit("popover-will-hide", el);
  }
  function onPopoverAfterHide(el) {
    emit("popover-did-hide", el);
  }
  function handleDayClick(day) {
    const opts = {
      patch: "date",
      formatInput: true,
      hidePopover: true
    };
    if (isRange.value) {
      const dragging = !isDragging.value;
      if (dragging) {
        dragTrackingValue = { start: day.startDate, end: day.endDate };
      } else if (dragTrackingValue != null) {
        dragTrackingValue.end = day.date;
      }
      updateValue(dragTrackingValue, {
        ...opts,
        dragging
      });
    } else {
      updateValue(day.date, {
        ...opts,
        clearIfEqual: !props.isRequired
      });
    }
  }
  function onDayClick(day, event) {
    handleDayClick(day);
    emit("dayclick", day, event);
  }
  function onDayKeydown(day, event) {
    switch (event.key) {
      case " ":
      case "Enter": {
        handleDayClick(day);
        event.preventDefault();
        break;
      }
      case "Escape": {
        hidePopover$1();
      }
    }
    emit("daykeydown", day, event);
  }
  function onDayMouseEnter(day, event) {
    if (!isDragging.value || dragTrackingValue == null)
      return;
    dragTrackingValue.end = day.date;
    updateValue(sortRange(dragTrackingValue), {
      patch: "date",
      formatInput: true
    });
  }
  function showPopover$1(opts = {}) {
    showPopover({
      ...opts,
      interactive: true,
      name: popoverName.value
    });
  }
  function hidePopover$1(opts = {}) {
    hidePopover({
      hideDelay: 10,
      force: true,
      ...opts,
      name: popoverName.value
    });
  }
  function togglePopover$1(opts) {
    togglePopover({
      ...opts,
      interactive: true,
      name: popoverName.value
    });
  }
  function sortRange(range, priority) {
    const { start, end } = range;
    if (start > end) {
      switch (priority) {
        case "start":
          return { start, end: start };
        case "end":
          return { start: end, end };
        default:
          return { start: end, end: start };
      }
    }
    return { start, end };
  }
  async function move(target, opts = {}) {
    if (calendarRef.value == null)
      return false;
    return calendarRef.value.move(target, opts);
  }
  async function moveBy(pages, opts = {}) {
    if (calendarRef.value == null)
      return false;
    return calendarRef.value.moveBy(pages, opts);
  }
  async function moveToValue(target, opts = {}) {
    const dValue = dateValue.value;
    if (calendarRef.value == null || !hasValue(dValue))
      return false;
    const start = target !== "end";
    const position = start ? 1 : -1;
    const date = hasRangeValue(dValue) ? start ? dValue.start : dValue.end : dValue;
    const page = getPageAddressForDate(date, "monthly", locale.value);
    return calendarRef.value.move(page, { position, ...opts });
  }
  vue.watch(
    () => props.isRange,
    (val) => {
      if (val) {
        console.warn(
          "The `is-range` prop will be deprecated in future releases. Please use the `range` modifier."
        );
      }
    },
    { immediate: true }
  );
  vue.watch(
    () => isRange.value,
    () => {
      forceUpdateValue(null, { formatInput: true });
    }
  );
  vue.watch(
    () => inputMask.value,
    () => formatInput()
  );
  vue.watch(
    () => props.modelValue,
    (val) => {
      if (!watchValue)
        return;
      forceUpdateValue(val, {
        formatInput: true,
        hidePopover: false
      });
    }
  );
  vue.watch(
    () => rules.value,
    () => {
      if (isObject(props.rules)) {
        forceUpdateValue(props.modelValue, {
          formatInput: true,
          hidePopover: false
        });
      }
    }
  );
  vue.watch(
    () => props.timezone,
    () => {
      forceUpdateValue(dateValue.value, { formatInput: true });
    }
  );
  const config2 = normalizeConfig2(modelConfig.value);
  dateValue.value = normalizeValue(
    props.modelValue ?? null,
    config2,
    "dateTime"
  );
  vue.onMounted(() => {
    forceUpdateValue(props.modelValue, {
      formatInput: true,
      hidePopover: false
    });
  });
  vue.nextTick(() => showCalendar.value = true);
  const context = {
    ...baseCtx,
    showCalendar,
    popoverName,
    calendarRef,
    isRange,
    isTimeMode,
    isDateTimeMode,
    is24hr: vue.toRef(props, "is24hr"),
    hideTimeHeader: vue.toRef(props, "hideTimeHeader"),
    timeAccuracy: vue.toRef(props, "timeAccuracy"),
    isDragging,
    inputValue,
    inputEvents,
    dateParts,
    attributes,
    rules,
    move,
    moveBy,
    moveToValue,
    updateValue,
    showPopover: showPopover$1,
    hidePopover: hidePopover$1,
    togglePopover: togglePopover$1,
    onDayClick,
    onDayKeydown,
    onDayMouseEnter,
    onPopoverBeforeShow,
    onPopoverAfterShow,
    onPopoverBeforeHide,
    onPopoverAfterHide
  };
  vue.provide(contextKey, context);
  return context;
}
function useDatePicker() {
  const context = vue.inject(contextKey);
  if (context)
    return context;
  throw new Error(
    "DatePicker context missing. Please verify this component is nested within a valid context provider."
  );
}
const _amOptions = [
  { value: 0, label: "12" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "11" }
];
const _pmOptions = [
  { value: 12, label: "12" },
  { value: 13, label: "1" },
  { value: 14, label: "2" },
  { value: 15, label: "3" },
  { value: 16, label: "4" },
  { value: 17, label: "5" },
  { value: 18, label: "6" },
  { value: 19, label: "7" },
  { value: 20, label: "8" },
  { value: 21, label: "9" },
  { value: 22, label: "10" },
  { value: 23, label: "11" }
];
function createTimePicker(props) {
  const ctx = useDatePicker();
  const {
    locale,
    isRange,
    isTimeMode,
    dateParts,
    rules,
    is24hr,
    hideTimeHeader,
    timeAccuracy,
    updateValue: updateDpValue
  } = ctx;
  function updateParts(newParts) {
    newParts = Object.assign(parts.value, newParts);
    let newValue = null;
    if (isRange.value) {
      const start = isStart.value ? newParts : dateParts.value[0];
      const end = isStart.value ? dateParts.value[1] : newParts;
      newValue = { start, end };
    } else {
      newValue = newParts;
    }
    updateDpValue(newValue, {
      patch: "time",
      targetPriority: isStart.value ? "start" : "end",
      moveToValue: true
    });
  }
  const isStart = vue.computed(() => props.position === 0);
  const parts = vue.computed(
    () => dateParts.value[props.position] || { isValid: false }
  );
  const partsValid = vue.computed(() => isDateParts(parts.value));
  const isValid = vue.computed(() => !!parts.value.isValid);
  const showHeader = vue.computed(() => {
    return !hideTimeHeader.value && isValid.value;
  });
  const date = vue.computed(() => {
    if (!partsValid.value)
      return null;
    let date2 = locale.value.toDate(parts.value);
    if (parts.value.hours === 24) {
      date2 = new Date(date2.getTime() - 1);
    }
    return date2;
  });
  const hours2 = vue.computed({
    get() {
      return parts.value.hours;
    },
    set(val) {
      updateParts({ hours: val });
    }
  });
  const minutes = vue.computed({
    get() {
      return parts.value.minutes;
    },
    set(val) {
      updateParts({ minutes: val });
    }
  });
  const seconds = vue.computed({
    get() {
      return parts.value.seconds;
    },
    set(val) {
      updateParts({ seconds: val });
    }
  });
  const milliseconds = vue.computed({
    get() {
      return parts.value.milliseconds;
    },
    set(val) {
      updateParts({ milliseconds: val });
    }
  });
  const isAM = vue.computed({
    get() {
      return parts.value.hours < 12;
    },
    set(value) {
      value = String(value).toLowerCase() == "true";
      let hValue = hours2.value;
      if (value && hValue >= 12) {
        hValue -= 12;
      } else if (!value && hValue < 12) {
        hValue += 12;
      }
      updateParts({ hours: hValue });
    }
  });
  const options = vue.computed(
    () => getDatePartsOptions(parts.value, rules.value[props.position])
  );
  const amHourOptions = vue.computed(() => {
    return _amOptions.filter(
      (opt) => options.value.hours.some((ho) => ho.value === opt.value)
    );
  });
  const pmHourOptions = vue.computed(() => {
    return _pmOptions.filter(
      (opt) => options.value.hours.some((ho) => ho.value === opt.value)
    );
  });
  const hourOptions = vue.computed(() => {
    if (is24hr.value)
      return options.value.hours;
    if (isAM.value)
      return amHourOptions.value;
    return pmHourOptions.value;
  });
  const isAMOptions = vue.computed(() => {
    const result = [];
    if (arrayHasItems(amHourOptions.value))
      result.push({ value: true, label: "AM" });
    if (arrayHasItems(pmHourOptions.value))
      result.push({ value: false, label: "PM" });
    return result;
  });
  return {
    ...ctx,
    showHeader,
    timeAccuracy,
    parts,
    isValid,
    date,
    hours: hours2,
    minutes,
    seconds,
    milliseconds,
    options,
    hourOptions,
    isAM,
    isAMOptions,
    is24hr
  };
}
const _hoisted_1$1 = ["value"];
const _hoisted_2$1 = ["value", "disabled"];
const _hoisted_3$1 = {
  key: 1,
  class: "vc-base-sizer",
  "aria-hidden": "true"
};
const __default__ = {
  inheritAttrs: false
};
const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
  ...__default__,
  __name: "BaseSelect",
  props: {
    options: null,
    modelValue: null,
    alignRight: { type: Boolean },
    alignLeft: { type: Boolean },
    showIcon: { type: Boolean },
    fitContent: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const props = __props;
    const selectedLabel = vue.computed(() => {
      const option = props.options.find((opt) => opt.value === props.modelValue);
      return option == null ? void 0 : option.label;
    });
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vc-base-select", {
          "vc-fit-content": __props.fitContent,
          "vc-has-icon": __props.showIcon
        }])
      }, [
        vue.createElementVNode("select", vue.mergeProps(_ctx.$attrs, {
          value: __props.modelValue,
          class: ["vc-focus", {
            "vc-align-right": __props.alignRight,
            "vc-align-left": __props.alignLeft
          }],
          onChange: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", $event.target.value))
        }), [
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(__props.options, (option) => {
            return vue.openBlock(), vue.createElementBlock("option", {
              key: option.value,
              value: option.value,
              disabled: option.disabled
            }, vue.toDisplayString(option.label), 9, _hoisted_2$1);
          }), 128))
        ], 16, _hoisted_1$1),
        __props.showIcon ? (vue.openBlock(), vue.createBlock(_sfc_main$b, {
          key: 0,
          name: "ChevronDown",
          size: "18"
        })) : vue.createCommentVNode("", true),
        __props.fitContent ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$1, vue.toDisplayString(vue.unref(selectedLabel)), 1)) : vue.createCommentVNode("", true)
      ], 2);
    };
  }
});
const BaseSelect_vue_vue_type_style_index_0_lang = "";
const _hoisted_1 = {
  key: 0,
  class: "vc-time-header"
};
const _hoisted_2 = { class: "vc-time-weekday" };
const _hoisted_3 = { class: "vc-time-month" };
const _hoisted_4 = { class: "vc-time-day" };
const _hoisted_5 = { class: "vc-time-year" };
const _hoisted_6 = { class: "vc-time-select-group" };
const _hoisted_7 = /* @__PURE__ */ vue.createElementVNode("span", { class: "vc-time-colon" }, ":", -1);
const _hoisted_8 = /* @__PURE__ */ vue.createElementVNode("span", { class: "vc-time-colon" }, ":", -1);
const _hoisted_9 = /* @__PURE__ */ vue.createElementVNode("span", { class: "vc-time-decimal" }, ".", -1);
const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
  __name: "TimePicker",
  props: {
    position: null
  },
  setup(__props, { expose }) {
    const props = __props;
    const timePicker = createTimePicker(props);
    expose(timePicker);
    const {
      locale,
      isValid,
      date,
      hours: hours2,
      minutes,
      seconds,
      milliseconds,
      options,
      hourOptions,
      isTimeMode,
      isAM,
      isAMOptions,
      is24hr,
      showHeader,
      timeAccuracy
    } = timePicker;
    return (_ctx, _cache) => {
      return vue.openBlock(), vue.createElementBlock("div", {
        class: vue.normalizeClass(["vc-time-picker", [{ "vc-invalid": !vue.unref(isValid), "vc-attached": !vue.unref(isTimeMode) }]])
      }, [
        vue.createVNode(_sfc_main$h, { name: "time-header" }, {
          default: vue.withCtx(() => [
            vue.unref(showHeader) && vue.unref(date) ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1, [
              vue.createElementVNode("span", _hoisted_2, vue.toDisplayString(vue.unref(locale).formatDate(vue.unref(date), "WWW")), 1),
              vue.createElementVNode("span", _hoisted_3, vue.toDisplayString(vue.unref(locale).formatDate(vue.unref(date), "MMM")), 1),
              vue.createElementVNode("span", _hoisted_4, vue.toDisplayString(vue.unref(locale).formatDate(vue.unref(date), "D")), 1),
              vue.createElementVNode("span", _hoisted_5, vue.toDisplayString(vue.unref(locale).formatDate(vue.unref(date), "YYYY")), 1)
            ])) : vue.createCommentVNode("", true)
          ]),
          _: 1
        }),
        vue.createElementVNode("div", _hoisted_6, [
          vue.createVNode(_sfc_main$b, {
            name: "Clock",
            size: "17"
          }),
          vue.createVNode(_sfc_main$3, {
            modelValue: vue.unref(hours2),
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => vue.isRef(hours2) ? hours2.value = $event : null),
            modelModifiers: { number: true },
            options: vue.unref(hourOptions),
            class: "vc-time-select-hours",
            "align-right": ""
          }, null, 8, ["modelValue", "options"]),
          vue.unref(timeAccuracy) > 1 ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
            _hoisted_7,
            vue.createVNode(_sfc_main$3, {
              modelValue: vue.unref(minutes),
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => vue.isRef(minutes) ? minutes.value = $event : null),
              modelModifiers: { number: true },
              options: vue.unref(options).minutes,
              class: "vc-time-select-minutes",
              "align-left": vue.unref(timeAccuracy) === 2
            }, null, 8, ["modelValue", "options", "align-left"])
          ], 64)) : vue.createCommentVNode("", true),
          vue.unref(timeAccuracy) > 2 ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 1 }, [
            _hoisted_8,
            vue.createVNode(_sfc_main$3, {
              modelValue: vue.unref(seconds),
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => vue.isRef(seconds) ? seconds.value = $event : null),
              modelModifiers: { number: true },
              options: vue.unref(options).seconds,
              class: "vc-time-select-seconds",
              "align-left": vue.unref(timeAccuracy) === 3
            }, null, 8, ["modelValue", "options", "align-left"])
          ], 64)) : vue.createCommentVNode("", true),
          vue.unref(timeAccuracy) > 3 ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 2 }, [
            _hoisted_9,
            vue.createVNode(_sfc_main$3, {
              modelValue: vue.unref(milliseconds),
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => vue.isRef(milliseconds) ? milliseconds.value = $event : null),
              modelModifiers: { number: true },
              options: vue.unref(options).milliseconds,
              class: "vc-time-select-milliseconds",
              "align-left": ""
            }, null, 8, ["modelValue", "options"])
          ], 64)) : vue.createCommentVNode("", true),
          !vue.unref(is24hr) ? (vue.openBlock(), vue.createBlock(_sfc_main$3, {
            key: 3,
            modelValue: vue.unref(isAM),
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => vue.isRef(isAM) ? isAM.value = $event : null),
            options: vue.unref(isAMOptions)
          }, null, 8, ["modelValue", "options"])) : vue.createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const TimePicker_vue_vue_type_style_index_0_lang = "";
const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
  __name: "DatePickerBase",
  setup(__props) {
    const {
      attributes,
      calendarRef,
      color,
      displayMode,
      isDateTimeMode,
      isTimeMode,
      isRange,
      onDayClick,
      onDayMouseEnter,
      onDayKeydown
    } = useDatePicker();
    const positions = isRange.value ? [0, 1] : [0];
    return (_ctx, _cache) => {
      return vue.unref(isTimeMode) ? (vue.openBlock(), vue.createElementBlock("div", {
        key: 0,
        class: vue.normalizeClass(`vc-container vc-bordered vc-${vue.unref(color)} vc-${vue.unref(displayMode)}`)
      }, [
        (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(positions), (position) => {
          return vue.openBlock(), vue.createBlock(_sfc_main$2, {
            key: position,
            position
          }, null, 8, ["position"]);
        }), 128))
      ], 2)) : (vue.openBlock(), vue.createBlock(Calendar, {
        key: 1,
        attributes: vue.unref(attributes),
        ref_key: "calendarRef",
        ref: calendarRef,
        onDayclick: vue.unref(onDayClick),
        onDaymouseenter: vue.unref(onDayMouseEnter),
        onDaykeydown: vue.unref(onDayKeydown)
      }, {
        footer: vue.withCtx(() => [
          vue.unref(isDateTimeMode) ? (vue.openBlock(true), vue.createElementBlock(vue.Fragment, { key: 0 }, vue.renderList(vue.unref(positions), (position) => {
            return vue.openBlock(), vue.createBlock(_sfc_main$2, {
              key: position,
              position
            }, null, 8, ["position"]);
          }), 128)) : vue.createCommentVNode("", true),
          vue.createVNode(_sfc_main$h, { name: "dp-footer" })
        ]),
        _: 1
      }, 8, ["attributes", "onDayclick", "onDaymouseenter", "onDaykeydown"]));
    };
  }
});
const _sfc_main = vue.defineComponent({
  inheritAttrs: false,
  emits,
  props: propsDef,
  components: {
    DatePickerBase: _sfc_main$1,
    PopoverContent
  },
  setup(props, ctx) {
    const datePicker = createDatePicker(props, ctx);
    const slotCtx = vue.reactive(omit(datePicker, "calendarRef"));
    const {
      color,
      displayMode,
      popoverName,
      onPopoverBeforeShow,
      onPopoverAfterShow,
      onPopoverBeforeHide,
      onPopoverAfterHide
    } = datePicker;
    return {
      slotCtx,
      color,
      displayMode,
      popoverName,
      onPopoverBeforeShow,
      onPopoverAfterShow,
      onPopoverBeforeHide,
      onPopoverAfterHide
    };
  }
});
const DatePicker_vue_vue_type_style_index_0_lang = "";
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_DatePickerBase = vue.resolveComponent("DatePickerBase");
  const _component_PopoverContent = vue.resolveComponent("PopoverContent");
  return _ctx.$slots.default ? (vue.openBlock(), vue.createElementBlock(vue.Fragment, { key: 0 }, [
    vue.renderSlot(_ctx.$slots, "default", vue.normalizeProps(vue.guardReactiveProps(_ctx.slotCtx))),
    vue.createVNode(_component_PopoverContent, {
      name: _ctx.popoverName,
      placement: "bottom-start",
      class: vue.normalizeClass(`vc-date-picker-content vc-${_ctx.color} vc-${_ctx.displayMode}`),
      onBeforeShow: _ctx.onPopoverBeforeShow,
      onAfterShow: _ctx.onPopoverAfterShow,
      onBeforeHide: _ctx.onPopoverBeforeHide,
      onAfterHide: _ctx.onPopoverAfterHide
    }, {
      default: vue.withCtx(() => [
        vue.createVNode(_component_DatePickerBase, vue.normalizeProps(vue.guardReactiveProps(_ctx.$attrs)), null, 16)
      ]),
      _: 1
    }, 8, ["name", "class", "onBeforeShow", "onAfterShow", "onBeforeHide", "onAfterHide"])
  ], 64)) : (vue.openBlock(), vue.createBlock(_component_DatePickerBase, vue.normalizeProps(vue.mergeProps({ key: 1 }, _ctx.$attrs)), null, 16));
}
const DatePicker = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
const components = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Calendar,
  CalendarDayPopoverRow: _sfc_main$i,
  DatePicker
}, Symbol.toStringTag, { value: "Module" }));
const index$1 = "";
const style = "";
const install = (app, defaults2 = {}) => {
  app.use(setupDefaults, defaults2);
  const prefix = app.config.globalProperties.$VCalendar.componentPrefix;
  for (const componentKey in components) {
    const component = components[componentKey];
    app.component(`${prefix}${componentKey}`, component);
  }
};
const index = { install };
exports.Calendar = Calendar;
exports.CalendarDayPopoverRow = _sfc_main$i;
exports.DatePicker = DatePicker;
exports.Popover = index$3;
exports.createCalendar = createCalendar;
exports.createDatePicker = createDatePicker;
exports.default = index;
exports.setupCalendar = setupDefaults;
exports.useCalendar = useCalendar;
exports.useDatePicker = useDatePicker;
//# sourceMappingURL=index.js.map
