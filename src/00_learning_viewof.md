# Learning viewUIof

https://observablehq.com/@tmcw/exploring-viewUIof


```js
import {DOM} from "/components/DOM.js"
```

The first thing to understand is `viewUI` essentially gives a cell two representations:

1. In the cell’s visual output, you, the user, sees an HTML input or something
2. In the cell’s yielded values, the program sees strings, numbers, or other JavaScript values

So, in the cell below, the visual output is a textarea, but the yielded values are strings. Type into it and you’ll see.

```js echo
const cellOutputElement = viewUI(html`<input value="type here" />`);
```

```js echo
const cellOutput = display(cellOutputElement)
```


```js echo
const inputElement = html`<input value="type here" />`
```

```js echo
display(inputElement)
```

```js echo
const stringOutput = Generators.input(inputElement)
```

```js echo
display(stringOutput)
```

```js echo
const vector = (() => {
  let ctx = DOM.context2d(200, 200);
  let canvas = ctx.canvas;
  canvas.style.border = '1px solid #1e1bc7ff';
  canvas.addEventListener('mousemove', (e) => {
    ctx.clearRect(0, 0, 200, 200);
    ctx.beginPath(), ctx.moveTo(100, 100), ctx.lineTo(e.layerX, e.layerY), ctx.stroke();
    canvas.value = [e.layerX, e.layerY];
    canvas.dispatchEvent(new CustomEvent('input'));
  });
  return canvas;
})()

const vectorView = Generators.input(vector)
```

```js echo
display(vector)
```

```js echo
display(vectorView)
```


---



```js echo
const complexInputElement = viewUI`<div style="display: flex; justify-content:space-between; ">
<div style="display: flex-column;">
  <div>${["r1", Inputs.range([0, 10])]}</div>
  <div>${["r2", Inputs.range([0, 3])]}</div>
  <div>${[
      "text",
      Inputs.text({
        label: "Enter some text"
      })
    ]}</div>
</div>
</div>
`
```


```js echo
complexInputElement
```

```js echo
complexInputElement.value
```


```js echo
const complexOutput = Generators.input(complexInputElement)
```


```js echo
view(complexOutput)
```


---


```js
md`## Code

Most of the work is done by _htl_, we are simply adding a new _[key, HTML]_ case
`
```


```js
import markdownit from "npm:markdown-it";
```

```js
const Markdown = new markdownit({html: true});

function md(strings) {
  let string = strings[0];
  for (let i = 1; i < arguments.length; ++i) {
    string += String(arguments[i]);
    string += strings[i];
  }
  const template = document.createElement("template");
  template.innerHTML = Markdown.render(string);
  return template.content.cloneNode(true);
}
```


```js
function viewUI(strings, ...exprs) {
  return wrap(htl.html, strings, ...exprs);
};
display(viewUI)
```

```js
function viewUISvg(strings, ...exprs) {
  return wrap(htl.svg, strings, ...exprs);
};
display(viewUISvg)
```

```js echo
function wrap(fn, strings, ...exprs) {
  let singleton = undefined;
  let start = undefined; // To know where to start dynamic objects
  let builder = undefined; // For new keys are added dynamically
  const viewUIs = {};

  const pexpr = exprs.map((exp) => {
    // All special functions are [key, ...]
    // Otherwise we pass through
    if (!Array.isArray(exp) || typeof exp[0] !== "string") {
      return exp;
    }

    const hidden = exp[0].startsWith("_");
    const key = hidden ? exp[0].substring(1) : exp[0];
    if (key === "value") throw new Error("Cannot use 'value' as a key");
    let presentation;

    if (exp.length === 2 && exp[1] instanceof EventTarget) {
      // SINGLE VIEW PASSED IN
      if (key === "...") {
        // SINGLETON!
        singleton = exp[1];
      } else {
        // look for [key, HTML] entries
        viewUIs[key] = exp[1];
      }
      presentation = exp[1];
    } else if (
      // ARRAY PASSED IN (NO BUILDER)
      exp.length === 2 &&
      Array.isArray(exp[1]) &&
      exp[1].every((e) => e instanceof EventTarget)
    ) {
      if (key === "...") throw new Error("Spread not supported for arrays ATM");
      /*
      const start = document.createComment(key);
      arrayViews[key] = {
        start,
        array: exp[1]
      };
      presentation = [start, ...exp[1]];*/
      presentation = arrayView({
        name: key,
        initial: exp[1]
      });
      viewUIs[key] = presentation;
    } else if (
      // ARRAY PASSED IN (WITH BUILDER)
      exp.length === 3 &&
      Array.isArray(exp[1]) &&
      exp[1].every((e) => e instanceof EventTarget) &&
      typeof exp[2] === "function"
    ) {
      if (key === "...") throw new Error("Spread not supported for arrays ATM");
      /*
      const start = document.createComment(key);
      arrayViews[key] = {
        start,
        array: exp[1],
        builder: exp[2]
      };
      presentation = [start, ...exp[1]];*/
      presentation = arrayView({
        name: key,
        initial: exp[1],
        builder: exp[2]
      });
      viewUIs[key] = presentation;
    } else if (
      // SPREAD OBJECT (NO BUILDER)
      exp.length === 2 &&
      key === "..." &&
      typeof exp[1] === "object" &&
      Object.keys(exp[1]).every((e) => typeof e === "string") &&
      Object.values(exp[1]).every((e) => e instanceof EventTarget)
    ) {
      Object.entries(exp[1]).forEach((e) => (viewUIs[e[0]] = e[1]));
      presentation = Object.values(exp[1]);
    } else if (
      // SPREAD OBJECT (WITH BUILDER)
      exp.length === 3 &&
      key === "..." &&
      typeof exp[1] === "object" &&
      Object.keys(exp[1]).every((e) => typeof e === "string") &&
      Object.values(exp[1]).every((e) => e instanceof EventTarget) &&
      typeof exp[2] === "function"
    ) {
      Object.entries(exp[1]).forEach((e) => (viewUIs[e[0]] = e[1]));
      start = document.createComment(key);
      builder = exp[2];
      presentation = [start, ...Object.values(exp[1])];
    } else {
      presentation = exp;
    }

    if (hidden) {
      const forwardEvent = (evt) => {
        const clone = new evt.constructor(evt.type, evt);
        self.dispatchEvent(clone);
      };
      if (presentation.addEventListener) {
        presentation.addEventListener("input", forwardEvent);
      } else if (Array.isArray(presentation)) {
        presentation.forEach((p) => {
          // The first element can be the start event sometimes
          if (p.addEventListener) {
            p.addEventListener("input", forwardEvent);
          }
        });
      } else {
        throw new Error("Not sure how to deal with this hidden element");
      }

      return undefined; // No DOM representation
    } else {
      return presentation; // Places in DOM
    }
  });
  const self = fn(strings, ...pexpr);

  if (singleton) {
    if (Object.keys(viewUIs).length !== 0)
      throw new Error("Singleton defined but additional properties supplied");

    // Users are expected to call dispatchEvent on viewUI, so the inner singleton
    // need to know about these events for the viewUI to work
    // => events need to be copied over, if originating from here
    self.addEventListener("input", (evt) => {
      if (evt.target === self) {
        const clone = new evt.constructor(evt.type, evt);
        singleton.dispatchEvent(clone);
      }
    });

    return Object.defineProperties(self, {
      value: {
        get: () => singleton.value,
        set: (val) => (singleton.value = val),
        configurable: true
      },
      singleton: {
        value: singleton,
        enumerable: true
      }
    });
  }
  // Non-singleton (Object or Array)
  return Object.defineProperties(self, {
    value: {
      get() {
        return Object.defineProperties(
          {},
          Object.keys(viewUIs).reduce((acc, key) => {
            acc[key] = {
              get: () => viewUIs[key].value,
              set: (v) => (viewUIs[key].value = v),
              enumerable: true
            };
            return acc;
          }, {})
        );
      },
      set(newValues) {
        Object.entries(newValues).forEach(([key, newValue]) => {
          if (viewUIs[key]) {
            viewUIs[key].value = newValue; // Update of existing child value
          } else if (start && builder) {
            // Adding a new key
            const parent = start.parentNode;
            const newView = builder(newValue);
            viewUIs[key] = newView;
            parent.appendChild(newView);
            // Add top level entry too
            Object.defineProperty(self, key, {
              value: newView,
              enumerable: true,
              configurable: true
            });
          }
        });

        // If we are a dynamic Object, we need to remove keys too
        Object.entries(viewUIs).forEach(([key, oldValue]) => {
          if (!newValues.hasOwnProperty(key)) {
            // It needs to go
            const oldView = viewUIs[key];
            delete viewUIs[key];
            if (oldView.remove) oldView.remove();
            delete self[key];
          }
        });
      },
      configurable: true
    },
    ...Object.keys(viewUIs).reduce(
      // Add top level field to access the subviewUIs in the parent viewUIof
      (acc, key) => {
        acc[key] = {
          get: () => viewUIs[key],
          set: (newView) => {
            const oldView = viewUIs[key];
            delete viewUIs[key];
            if (oldView.remove) oldView.remove();

            // assigning an arrayView (special cased)
            if (oldView.length && newView.length) {
              newView = arrayView({
                initial: newView,
                builder: oldView.builder
              });
            }

            viewUIs[key] = newView;
            if (newView instanceof Node) self.appendChild(newView);
          },
          enumerable: true,
          configurable: true
        };
        return acc;
      },
      {}
    )
  });
};
display(wrap)
```


```js echo
function arrayView({
  name = "arrayNode" + DOM.uid().id,
  value = [],
  initial = [],
  builder
} = {}) {
  if (value.length > 0 && !builder)
    throw new Error(
      "You cannot initialize an arrayView with data without a builder"
    );

  const frag = new DocumentFragment();

  const subviewUIToFragmentEventCloner = (e) => {
    const new_e = new e.constructor(e.type, e);
    frag.dispatchEvent(new_e);
  };

  const _builder = builder
    ? (arg) => {
        const subviewUI = builder(arg);
        subviewUI.addEventListener("input", subviewUIToFragmentEventCloner);
        return subviewUI;
      }
    : undefined;

  const unbuilder = (subviewUI) => {
    subviewUI.removeEventListener("input", subviewUIToFragmentEventCloner);
  };

  initial.forEach((subviewUI) =>
    subviewUI.addEventListener("input", subviewUIToFragmentEventCloner)
  );

  const start = document.createComment("START:" + name);
  const end = document.createComment("END:" + name);
  let subviewUIs = (_builder ? value.map(_builder) : []).concat(initial);
  frag.append(...[start, ...subviewUIs, end]);

  frag.addEventListener("input", (e) => {
    // https://stackoverflow.com/questions/11974262/how-to-clone-or-re-dispatch-dom-events
    const new_e = new e.constructor(e.type, e);
    start.dispatchEvent(new_e);
  });

  const getIndexProperty = (index) => ({
    get: () => subviewUIs[index],
    enumerable: true,
    configurable: true
  });

  const customSplice = (startIndex, deleteCount, ...items) => {
    const parent = start.parentNode;
    startIndex = Math.floor(startIndex);
    const removedData = [];
    // sync the splice with the DOM
    let node = start;
    // Forward to begining of the splice
    for (let i = 0; i < startIndex && i < subviewUIs.length; i++)
      node = node.nextSibling;
    // delete 'deleteCount' times
    for (let i = 0; i < deleteCount && i < subviewUIs.length; i++) {
      const toDelete = node.nextSibling;
      removedData.push(toDelete.value);
      unbuilder(toDelete);
      toDelete.remove();
    }
    // add additional items
    const itemViews = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const subviewUI = _builder(items[i]);
      Object.defineProperty(frag, i, getIndexProperty(i));
      let presentation =
        subviewUI instanceof HTMLElement ? subviewUI : htl.html`${subviewUI}`;
      itemViews.unshift(subviewUI);
      parent.insertBefore(presentation, node.nextSibling);
    }

    // Apply to cache
    subviewUIs.splice(startIndex, deleteCount, ...itemViews);
    // Let flow upwards to array too
    return removedData;
  };
  // We intercept operations to the data array and use it to drive DOM operations too.
  const dataArrayProxyHandler = {
    get: function (target, prop, receiver) {
      const args = arguments;

      if (prop === "splice") {
        return customSplice;
      } else if (prop === "push") {
        return (...elements) => {
          customSplice(subviewUIs.length, 0, ...elements);
          return subviewUIs.length;
        };
      } else if (prop === "pop") {
        return () => {
          return customSplice(subviewUIs.length - 1, 1)[0];
        };
      } else if (prop === "shift") {
        return () => {
          return customSplice(0, 1)[0];
        };
      } else if (prop === "unshift") {
        return (...elements) => {
          customSplice(0, 0, ...elements);
          return subviewUIs.length;
        };
      }
      return Reflect.get(...args);
    },
    set(obj, prop, value) {
      if (!isNaN(+prop)) {
        // we also need to set the viewUI
        customSplice(+prop, 1, value);
      }
      return Reflect.set(...arguments);
    }
  };

  // Add data channel
  Object.defineProperties(frag, {
    value: {
      get: () =>
        new Proxy(
          subviewUIs.map((sv) => sv.value),
          dataArrayProxyHandler
        ),
      set: (newArray) => {
        const vArr = _.cloneDeep(newArray);
        const parent = start.parentNode;

        if (builder) {
          // We should be true to the operation and tear of the DOM and then replace it.
          subviewUIs.forEach((sv) => (sv.remove ? sv.remove() : undefined));
          subviewUIs = vArr.map((data) => {
            const subviewUI = _builder(data);
            let presentation =
              subviewUI instanceof HTMLElement ? subviewUI : htl.html`${subviewUI}`;
            parent.insertBefore(presentation, end);
            return subviewUI;
          });
        } else {
          // We have to work around the limitations and try to do the operation without
          // building, so this only can work if you are setting it to something smaller
          vArr.forEach((v, i) => {
            if (i < subviewUIs.length) {
              subviewUIs[i].value = v; // mutate inplace
            } else {
              let built = _builder(v); // append additional
              subviewUIs[i] = built;
              if (!(built instanceof HTMLElement)) built = htl.html`${built}`;
              parent.appendChild(built);
            }
          });

          for (var i = subviewUIs.length - 1; i >= vArr.length; i--) {
            // delete backwards
            const deleted = subviewUIs.pop();
            if (deleted.remove) deleted.remove();
          }
        }
      }
    }
  });

  // Add presentation channel
  return Object.defineProperties(frag, {
    remove: {
      value: () => {
        const toRemove = [];
        for (var node = start; node !== end; node = node.nextSibling) {
          toRemove.push(node);
        }
        toRemove.push(end);
        toRemove.forEach((n) => n.remove());
      }
    },
    length: {
      get: () => subviewUIs.length,
      enumerable: true,
      configurable: true
    },
    [Symbol.iterator]: {
      value: () => {
        let index = 0;
        return {
          next() {
            if (index < subviewUIs.length) {
              let val = subviewUIs[index];
              index++;
              return { value: val, done: false };
            } else return { done: true };
          }
        };
      }
    },
    ...subviewUIs.reduce((acc, sv, index) => {
      acc[index] = getIndexProperty(index);
      return acc;
    }, {})
  });
};

display(arrayView)
```