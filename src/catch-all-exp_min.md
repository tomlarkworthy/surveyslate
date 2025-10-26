# catchAll - Minimal Experimental


<!--
// FIGURE OUT HOW TO LINK TO MUTABLE SO THAT ITS VALUE CHANGES
// const errorTriggerEl = Mutable(null);
-->

```js echo
//viewof errorTrigger = Inputs.button(md`throw an error`, { required: true })

// Expose the input element separately from the view so that we can use it to dispatch events and add listeners
const errorTriggerElement = Inputs.button(html`throw an error`, { required: true });

const errorTrigger = view(Inputs.bind(Inputs.button(html`throw an error`, { required: true }), errorTriggerElement));
```

```js echo
display(errorTrigger);
```

```js
// For testing
// This displays as true where we use the pattern of separating an input element with DOM from the generator.
//display(errorTriggerElement.dispatchEvent(new Event("input")))
```


```js echo
//const errorCell = (() => {
//  errorTrigger;
  // Errors thrown here are picked up by catchAll
//  throw new Error("An error " + Math.random().toString(16).substring(3));
//})();

// Experimental:  We're updating the Mutable here.  This allows the errorLog to accumulate errors but it doesn't work with the testing portion. We'll need to revisit this approach later....

const errorCell = (() => {
  try {
    // make this cell depend on errorTrigger
    if (errorTrigger) {
      throw new Error("An error " + Math.random().toString(16).slice(3));
    }
    return "Click the button to throw.";
  } catch (reason) {
    // call the setter function for the Mutable
    appendError({ cellName: "errorCell", reason: String(reason) });
    throw reason; // show the error message
  }
})();

display(errorCell)
```


```js echo
display(errorLog);
```

```js echo
view(Inputs.table(errorLog))
```



### Implementation

```js echo
const catchAll = (handler, invalidation) => {
  const listener = () => handler("unknown", error.value);

  error.addEventListener("input", listener);
  if (invalidation)
    invalidation.then(() => {
      error.removeEventListener("input", listener);
    });
};
display(catchAll);
```


```js echo
display(errorLog);
```


```js echo
let errorLog = Mutable([]);
const appendError = (entry) => (errorLog.value = [...errorLog.value, entry]);
```

```js echo
// update the mutable using .value
catchAll((cellName, reason) => {
  errorLog.value = errorLog.value.concat({
    cellName,
    reason
  });
}, invalidation)
```



```js echo
// In the original notebook, this element is defined as a 'viewof'

// that means that it has both an HTML element and a value.
// Under the catchAll function, we evaluate whether this value has changed


// 1) Build the "viewof-like" element
const errorElement = (() => {
  const view = Inputs.input();

  const notify = (event) => {
    // Guard: only handle inspector-style error events with detail.error
    const d = event?.detail;
    if (!d || !("error" in d)) return;

    view.value = d.error;
    // Dispatch an InputEvent so Generators.input() picks it up
    view.dispatchEvent(new InputEvent("input", { bubbles: true }));
  };

  const processInspectorNode = (el) => {
    el.addEventListener("error", notify);
  };

  // Attach to current cells (notebook-style selectors still exist in Framework)
  [...document.querySelectorAll(".observablehq").values()].forEach(
    processInspectorNode
  );

  // Watch for new cells
  const root = document.querySelector(".observablehq-root");
  if (root) {
    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        [...mutation.addedNodes].forEach(processInspectorNode);
      }
    });
    observer.observe(root, { childList: true });
    invalidation.then(observer.disconnect);
  }

  // Clean up the global listeners too
  invalidation.then(() => {
    [...document.querySelectorAll(".observablehq").values()].forEach((el) =>
      el.removeEventListener("error", notify)
    );
  });

  return view;
})();

```


```js echo
display(error);
```

```js echo
display(error.value);
```



