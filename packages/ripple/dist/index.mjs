// src/options.ts
var DEFAULT_PLUGIN_OPTIONS = {
  directive: "ripple",
  color: "currentColor",
  initialOpacity: 0.1,
  finalOpacity: 0.2,
  duration: 350,
  easing: "ease-out",
  delay: 60,
  disabled: false,
  center: false
};

// src/utils/create-container-element.ts
var createContainer = ({
  borderTopLeftRadius,
  borderTopRightRadius,
  borderBottomLeftRadius,
  borderBottomRightRadius
}) => {
  const rippleContainer = document.createElement("div");
  rippleContainer.style.top = "0";
  rippleContainer.style.left = "0";
  rippleContainer.style.width = "100%";
  rippleContainer.style.height = "100%";
  rippleContainer.style.position = "absolute";
  rippleContainer.style.borderRadius = `${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomRightRadius} ${borderBottomLeftRadius}`;
  rippleContainer.style.overflow = "hidden";
  rippleContainer.style.pointerEvents = "none";
  rippleContainer.style.webkitMaskImage = "-webkit-radial-gradient(white, black)";
  return rippleContainer;
};

// src/utils/create-ripple-element.ts
var createRippleElement = (x, y, size, options, rect) => {
  const rippleElement = document.createElement("div");
  rippleElement.style.position = "absolute";
  rippleElement.style.width = options.center ? `${Math.sqrt(rect.width * rect.width + rect.height * rect.height)}px` : `${size * 2}px`;
  rippleElement.style.height = options.center ? `${Math.sqrt(rect.width * rect.width + rect.height * rect.height)}px` : `${size * 2}px`;
  rippleElement.style.top = options.center ? `${rect.height / 2}px` : `${y}px`;
  rippleElement.style.left = options.center ? `${rect.width / 2}px` : `${x}px`;
  rippleElement.style.background = options.color;
  rippleElement.style.borderRadius = "50%";
  rippleElement.style.opacity = `${options.initialOpacity}`;
  rippleElement.style.transform = `translate(-50%,-50%) scale(0)`;
  rippleElement.style.transition = `transform ${options.duration / 1e3}s   cubic-bezier(0, 0.5, 0.25, 1)
  , opacity ${options.duration / 1e3}s
  cubic-bezier(0.0, 0, 0.2, 1)
  `;
  return rippleElement;
};

// src/utils/get-element-position-utils.ts
function getPythagoreanDistance(x1, y1, x2, y2) {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
function getDistanceToFurthestCorner(event, { width, height, left, top }) {
  const x = event.clientX - left;
  const y = event.clientY - top;
  const topLeft = getPythagoreanDistance(x, y, 0, 0);
  const topRight = getPythagoreanDistance(x, y, width, 0);
  const bottomLeft = getPythagoreanDistance(x, y, 0, height);
  const bottomRight = getPythagoreanDistance(x, y, width, height);
  const diameter = Math.max(topLeft, topRight, bottomLeft, bottomRight);
  return {
    x,
    y,
    diameter
  };
}

// src/utils/ripple-count.ts
var RIPPLE_COUNT = "vRippleCountInternal";
function setRippleCount(el, count) {
  el.dataset[RIPPLE_COUNT] = count.toString();
}
function getRippleCount(el) {
  return parseInt(el.dataset[RIPPLE_COUNT] ?? "0", 10);
}
function incrementRippleCount(el) {
  const count = getRippleCount(el);
  setRippleCount(el, count + 1);
}
function decrementRippleCount(el) {
  const count = getRippleCount(el);
  setRippleCount(el, count - 1);
}
function deleteRippleCount(el) {
  delete el.dataset[RIPPLE_COUNT];
}

// src/v-ripple.ts
var MULTIPLE_NUMBER = 1.05;
var ripple = (event, el, options) => {
  const rect = el.getBoundingClientRect();
  const computedStyles = window.getComputedStyle(el);
  const { diameter, x, y } = getDistanceToFurthestCorner(event, rect);
  const rippleContainer = createContainer(computedStyles);
  const rippleEl = createRippleElement(x, y, diameter * MULTIPLE_NUMBER, options, rect);
  let originalPositionValue = "";
  let shouldDissolveRipple = false;
  let token = void 0;
  function dissolveRipple() {
    rippleEl.style.transition = "opacity 120ms ease in out";
    rippleEl.style.opacity = "0";
    setTimeout(() => {
      rippleContainer.remove();
      decrementRippleCount(el);
      if (getRippleCount(el) === 0) {
        deleteRippleCount(el);
        el.style.position = originalPositionValue;
      }
    }, 100);
  }
  function releaseRipple(e) {
    if (typeof e !== "undefined") {
      document.removeEventListener("pointerup", releaseRipple);
    }
    if (shouldDissolveRipple) {
      dissolveRipple();
    } else {
      shouldDissolveRipple = true;
    }
  }
  function cancelRipple(e) {
    console.log(e);
    console.log(6666);
    clearTimeout(token);
    rippleContainer.remove();
    document.removeEventListener("pointerup", releaseRipple);
    document.removeEventListener("pointercancel", releaseRipple);
    document.removeEventListener("pointercancel", cancelRipple);
  }
  incrementRippleCount(el);
  if (computedStyles.position === "static") {
    if (el.style.position) {
      originalPositionValue = el.style.position;
    }
    el.style.position = "relative";
  }
  rippleContainer.appendChild(rippleEl);
  el.appendChild(rippleContainer);
  document.addEventListener("pointerup", releaseRipple);
  document.addEventListener("pointercancel", releaseRipple);
  token = setTimeout(() => {
    document.removeEventListener("pointercancel", cancelRipple);
    rippleEl.style.transform = `translate(-50%,-50%) scale(1)`;
    rippleEl.style.opacity = `${options.finalOpacity}`;
    setTimeout(() => releaseRipple(), options.duration);
  }, options.delay);
  document.addEventListener("pointercancel", cancelRipple);
};

// src/ripple-directive.ts
var optionMap = /* @__PURE__ */ new WeakMap();
var globalOptions = { ...DEFAULT_PLUGIN_OPTIONS };
var ripple_directive_default = {
  mounted(el, binding) {
    optionMap.set(el, binding.value ?? {});
    el.addEventListener("pointerdown", (event) => {
      const options = optionMap.get(el);
      if (binding.value && binding.value.disabled) {
        return;
      }
      if (options === false) {
        return;
      }
      ripple(event, el, {
        ...globalOptions,
        ...options
      });
    });
  },
  updated(el, binding) {
    optionMap.set(el, binding.value ?? {});
  }
};

// index.ts
var ripple_default = {
  title: "Ripple \u6C34\u6CE2\u7EB9",
  install(app) {
    app.directive("Ripple", ripple_directive_default);
  }
};
export {
  ripple_directive_default as RippleDirective,
  ripple_default as default
};
//# sourceMappingURL=index.mjs.map