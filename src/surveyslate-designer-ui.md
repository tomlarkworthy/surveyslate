# Survey Slate | Designer UI 

_A simple user interface for Survey Slate's [Designer Tools](https://observablehq.com/@categorise/surveyslate-designer-tools).  Also check out the [User Guide for Survey Slate Designer](https://observablehq.com/@categorise/surveyslate-user-guide-for-grouping-questions)._

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js
toc({
  headers: "h2,h3,h4,h5"
})
```

## Wireframe

```js
FileAttachment("image.png").image()
```

## Config

```js
types = new Map([
 ["Markdown", "md"],
 ["Text", "textarea"],
 ["Checkbox", "checkbox"],
 ["Radio", "radio"],
 ["Number", "number"],
 ["Number Matrix", "table"],
 ["File", "file_attachment"],
 ["Summary", "summary"],
 ["Aggregate", "aggregate"],
  ["Section", "section"],
 ["Custom", "fallback"],
]);

```

```js
roles = ["yes", "yesno", "yesnomaybe", "ifyes", "ifno", "calculation", "scored"]
```

## UI Builders

### surveyEditor

```js echo
viewof exampleSurveyEditor = view`<div class="brand-font bg-near-white">
  <div style="overflow-y: auto; max-height:600px;">
    ${["...", surveyEditor(await FileAttachment("surveyUiInput.json").json())]}
  </div>
</div>`
```

```js
viewof anotherSurveyEditorData = {
  return Inputs.input(({
  metadata: {
    title: "Another Demo Survey"
  },
  pages: [{
    title: "page1",
    cells: [{
      id: "a-md-question-type",
      inner: {
        type: "md",
        result: {
          content: "_Hello world_" 
        }
      },
    }]
  },{
    title: "page2"
  }]
}))
}
```

```js echo
Inputs.button("Overwrite suvery editor data", {
  reduce: () => {
    viewof exampleSurveyEditor.value = viewof anotherSurveyEditorData.value;
    viewof exampleSurveyEditor.applyValueUpdates();
  }
})
```

```js echo
surveyEditor = ({metadata, pages = []} = {}) => {
  const pageBuilder = (args) => page({
    ...args,
    onDelete: (id) => {
      const index = ui.value.pages.findIndex(pages => pages.id === id);
      ui.value.pages.splice(index, 1);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onDown: (id) => {
      const index = ui.value.pages.findIndex(pages => pages.id === id);
      var element = ui.value.pages[index];
      ui.value.pages.splice(index, 1);
      ui.value.pages.splice(index + 1, 0, element);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onUp: (id) => {
      const index = ui.value.pages.findIndex(page => page.id === id);
      var element = ui.value.pages[index];
      ui.value.pages.splice(index, 1);
      ui.value.pages.splice(Math.max(index - 1, 0), 0, element);
      ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
    },
  })

  const summary = view`<p class="ma0">
    ${['questions', textNodeView("0 questions")]} across ${['pages', textNodeView("0 pages")]}.
  </p>`

  const updateSummary = () => {
    // console.log('updateSummary');
    const pages = ui.value?.pages?.length ||  0;
    const questions = ui.value?.pages?.reduce((count, page) => {
      const cells = filterCellsNotOfType(page.cells || [], 'section');
      return count + cells.length
    }, 0);

    summary.value.pages = pages === 1 ? "1 page" : `${pages} pages`;
    summary.value.questions = questions === 1 ? "1 question" : `${questions} questions`;
  }

  const ui = view`<div class="space-y-3">
  ${['metadata', surveyMetadata(metadata)]}
  
  <div class="space-y-3">
    ${['pages', pages.map(pageBuilder), pageBuilder]}
  </div>
  <div>
    ${Inputs.button('Add Page', {
      reduce: () => {
        ui.value.pages.push({
          title: "page " + randomId()
        });
        ui.pages.dispatchEvent(new Event('input', {bubbles: true}));
      }
    })}
  </div>

  <div class="sticky bottom-1">
    ${summaryCard(summary, html`<div class="flex space-x-2">${Inputs.button('Preview')} ${Inputs.button('Save')}`)}
  </div>
</div>`

  ui.addEventListener('input', updateSummary);

  // When values assigned to `viewof surveyEditor().value`, without dispatching `input` event
  // call `viewof surveyEditor().applyValueUpdates()` to update UIs like summary.
  ui.applyValueUpdates = () => {
    updateSummary();
  };
  updateSummary();

  return ui;
}
```

```js echo
filterCellsNotOfType = (cells, type) =>  cells.filter(c => c?.inner?.type != type)
```

### surveyMetadata

```js echo
surveyMetadata = ({title} = {}) => view`<div class="card solid-shadow-1 space-y-3">
  <h2>Survey Metadata</h2>
  ${['title', Inputs.text({value: title, label: "Survey title"})]}
</div>`
```

```js echo
viewof exampleSurveyMetadata = surveyMetadata()
```

```js
exampleSurveyMetadata
```

### page

```js
viewof examplePage = page({
  title: "intro",
  cells: [{
    id: "md",
    inner: {
      type: "md",
      result: {
        content: "example content"
      }
    }
  }, {
    id: "radio",
    inner: {
      type: "radio",
      result: {
        options: [{
          value: "0",
          label: "Option 0",
          score: "1"
        },{
          value: "1",
          label: "Option 1",
          score: "2"
        },{
          value: "2",
          label: "Option 2",
          score: "3"
        }]
      
      }
    }
  },{
    id: "fallback",
    inner: {
      type: "fallback",
      result: {
        title:	"the title",
        placeholder:	"the placeholder",
        rows:	1
      }
    }
  }]
})
```

```js echo
examplePage
```

```js echo
Inputs.button("test backwritability of a cell", {
  reduce: () => {
    debugger;
    examplePage.cells[0] = ({
      id: "md",
      inner: {
        type: "md",
        result: {
          content: Math.random()
        }
      }
    })
  }
})
```

```js echo
page = ({
    id = randomId(),
    title,
    cells = [],
    onDelete = (id) => {},
    onUp = (id) => {},
    onDown = (id) => {},
  } = {}) => {
  const cellBuilder = (args) => cell({
    ...args,
    onDelete: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      ui.value.cells.splice(index, 1);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onDown: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      const element = ui.value.cells[index];
      ui.value.cells.splice(index, 1);
      ui.value.cells.splice(index + 1, 0, element);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    },
    onUp: (id) => {
      const index = ui.value.cells.findIndex(cell => cell.id === id);
      const element = ui.value.cells[index];
      ui.value.cells.splice(index, 1);
      ui.value.cells.splice(Math.max(index - 1, 0), 0, element);
      ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
    }
  });
  

  const ui = view`<div class="[ page card ][ solid-shadow-1 space-y-3 ]">
    ${['_id', Inputs.input(id)]}
    <div class="flex justify-between">
      <div class="w-100 pr4">${['title', Inputs.text({label: "Page title", value: title})]}</div>
      
      <div class="flex space-x-2">
        ${Inputs.button(buttonLabel({ariaLabel: "Delete", iconLeft: "trash-2", iconLeftClass: "icon--danger"}), {reduce: () => onDelete(id)})}
        <div class="button-group">
          ${Inputs.button(buttonLabel({ariaLabel: "Move up", iconLeft: "arrow-up"}), {reduce: () => onUp(id)})}
          ${Inputs.button(buttonLabel({ariaLabel: "Move down", iconLeft: "arrow-down"}), {reduce: () => onDown(id)})}
        </div>
      </div>
    </div>
    <div class="box space-y-3">
      ${['cells', cells.map(cellData => cellBuilder(cellData)), cellBuilder]}
    </div>
    <div class="flex space-x-3">
      <div class="button-group">
        ${Inputs.button('Add Question', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "textarea"}})
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
        ${Inputs.button('Add Text', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "md"}});
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
      </div>
      ${Inputs.button('Add Section', {
          reduce: () => {
            ui.value.cells.push({inner: {type: "section"}});
            ui.cells.dispatchEvent(new Event('input', {bubbles: true}));
          }
        })}
    </div>
  </div>`

  return ui;
}
```

### cell

```js echo
viewof exampleCell = cell({
  id: "cell1",
  inner: {
    type: "md",
    result: {
      content: "hi!"
    }
  },
  connections: {  // Ugly double nesting (simplest implementation)
    connections: [{
      set: "g1",
      role: "ifyes"
    }]  
  }
}) 

```

```js echo
exampleCell
```

```js echo
Inputs.button("test backwritability", {
  reduce: () => {
    viewof exampleCell.value = ({
      id: "cellTest",
      inner: {
        type: "md",
        result: {
          content: Math.random()
        }
      },
      connections: {  // Ugly double nesting (simplest implementation)
        connections: [{
          set: "test2",
          role: "scored"
        }]  
      }
    })
  }
})
```

```js echo
cell = ({
  id = randomId(),
  inner = {
    type: "radio",
    result: {
      
    }
  },
  connections,
  onDelete = (id) => {},
  onDown = (id) => {},
  onUp = (id) => {}
} = {}) => {
  const typeSelector = Inputs.select(types, {value: inner?.type, label: "Question Type"});
  const innerTypeUI = typeUI(inner);
  Inputs.bind(innerTypeUI.type, typeSelector);

  const ui = view`<section class="[ cell ]" data-cell-type="${typeSelector.value}">
    <div class="[ cell__section ][ flex ]">
      <div>
        ${typeSelector}
      </div>

      <div class="ml-auto">
        <div class="flex space-x-2">
          ${Inputs.button(buttonLabel({ariaLabel: "Delete", iconLeft: "trash-2", iconLeftClass: "icon--danger"}), {reduce: () => onDelete(id)})}
        <div class="button-group">
          ${Inputs.button(buttonLabel({ariaLabel: "Move up", iconLeft: "arrow-up"}), {reduce: () => onUp(id)})}
          ${Inputs.button(buttonLabel({ariaLabel: "Move down", iconLeft: "arrow-down"}), {reduce: () => onDown(id)})}
        </div>
        </div>
      </div>
    </div>
    <div class="[ cell__section ][ space-y-3 ]">
      <div class="flex">${['id', Inputs.text({value: id, "label": "Question ID"})]}</div>
    </div>
    <div>${['inner', innerTypeUI]}</div>
    <div class="[ cell__section cell__section--separated ][ space-y-3 ]">
      <details>
        <summary>Connections</summary>
        <div class="pv2">${['connections', connectionsUI(connections)]}</div>
      </details>
    </div>
</section>`
  typeSelector.addEventListener('input', () => {
    ui.dataset.cellType = typeSelector.value;
  });
  return ui;
}
```

### typeUi

```js echo
viewof exampleType = Inputs.select(types, {value: "fallback"})
```

```js echo
viewof exampleTypeUI = {
  const view = typeUI({
    result: {
      content: "foo"
    }
  })
  Inputs.bind(view.type, viewof exampleType); // type is backwriteable
  return view;
}
```

```js echo
typeUI({
  type: "md",
    result: {
      content: "foo"
    }
  })

```

```js echo
exampleTypeUI
```

```js echo
viewof exampleTypeUIRadio = typeUI({
  type: "radio",
  result: {
    options: [{
      id: "my id",
      label: "a label",
      score: 10000,
    }]
  }
})
```

```js echo
exampleTypeUIRadio
```

```js echo
typeUIFactories = ({
  "radio": radioUI,
  "checkbox": checkboxUI,
  "table": tableUI,
  "md": mdUI,
  "text": textUI,
  "number": numberUI,
  "textarea": textareaUI,
  "file_attachment": fileAttachmentUI,
  "summary": summaryUI,
  "section": sectionUI,
  "aggregate": aggregateSummaryUI
})
```

```js echo
typeUI = juice((arg0) => {
  const factory = typeUIFactories[arg0?.type];
  if (factory) {
    return factory(arg0?.result)
  }
  return fallbackUI(arg0?.result)
}, {
  "type": "[0].type"
})
```

#### Fallback UI

If we encounter a cell type we don't know, we will use a generic UI to allow the user to get/set questions 
attributes arbitrarily.

It is slightly awkward because we only have lists available in UI representation, so we need to pivot that into a `{type, results<map>}` format. This is the step between *fallbackUIEntries* and *fallbackUI*

```js echo
typeof "" === 'string'
```

```js echo
fallbackUI = (args = {}) => { // Main purpose is to convert into <map>format. Main UI is in fallbackUIEntries
  const entriesUI = fallbackUIEntries({
    entries: Object.entries(args).map(([k, v]) => {
      if (!v) {
        return {key: k, value_: undefined};
      } if (v.outerHTML) {
        return {key: k + "_md", value_: v.outerHTML};
      } else if (typeof v === 'object') {
        return {key: k + "_js", value_: JSON.stringify(v)};
      } else {
        return {key: k, value_: v};
      }
    })
  });
  const result = bindOneWay(Inputs.input(undefined), entriesUI, {
    transform: (entriesUi) => Object.fromEntries(entriesUi.entries.map(e => {
      return [e.key, e.value_]
    }))
  })
  const ui = view`<div class="[ cell__section ][ pb3 ]">
    <form class="${ns}"><label>Attributes</label>
    ${entriesUI}
    ${['_...', result]}
    </form>
  </div>`

  return ui;
}
```

```js echo
md``.outerHTML
```

```js echo
viewof exampleFallbackUI = fallbackUI({
  key1: "v2",
  key2: md`<mark>we need to convert to string</mark>`,
  key3: {object: true}
})
```

```js echo
exampleFallbackUI
```

```js echo
fallbackUIEntries = ({entries = []}) => {
  const newAttributeInput = kvRowBuilder({
    placeholder: "Add attribute",
    onEnter: () => {
      ui.entries.value.push(newAttributeInput.value)
      newAttributeInput.value = {key: "", value_: ""};
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const kvRowBuilderWithDelete = (args) => kvRowBuilder({...args, onDelete: (id) => {
    const index = ui.entries.value.find(option => option.id === id)
    ui.entries.value.splice(index, 1); // delete in-place
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})
  const ui = view`<table class="ma0">
  <tr>
    <th>Attribute</th>
    <th>Value</th>
  </tr>
  ${['entries', entries.map(kvRowBuilderWithDelete), kvRowBuilderWithDelete]}
  <tfoot>
    ${newAttributeInput}
  </tfoot>
</table>`
  return ui;
}
```

```js echo
viewof exampleFallbackUIEntries = fallbackUIEntries({
  entries: [{key: "type", value_: "random"}]
})
```

```js echo
exampleFallbackUIEntries
```

```js echo
kvRowBuilder = ({
  placeholder,
  key, value_,
  onEnter, onDelete
}) => {
  const keyInput = Inputs.text({placeholder, value: key});
  const valueInput = Inputs.text({value: value_});
  
  if (onEnter) {
    keyInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
    valueInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    keyInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && keyInput.value.length == 0) {
        onDelete(keyInput.value);
      }
    });
  }
  
  const ui = view`<tr>
    <td>${['key', keyInput]}</td>
    <td>${['value_', valueInput]}</td>
  </tr>`
  return ui;
}
```

```js echo
viewof exampleKvRow = kvRowBuilder ({
  key: "k1",
  value: "val"
})
```

#### Markdown Text

```js echo
viewof sampleMdUI = mdUI({
  content: "## content"
})
```

```js echo
sampleMdUI
```

```js echo
mdUI = ({content, rows = 20} = {}) => {
  return view`<div class="[ cell__section ][ pb3 ]">
  ${['content', Inputs.textarea({value: content, label: "Content", rows})]}
</div>`
}
```

#### Text Question (Deprecated)

```js
FileAttachment("image@2.png").image()
```

```js echo
viewof sampleTextUI = textUI()
```

```js echo
sampleTextUI
```

```js echo
textUI = ({title,description} = {}) => {
  return view`<div class="[ cell__section ][ pb2 ]">
  ${['title', Inputs.text({value: title, label: "Question"})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2">${['description', Inputs.text({label: "Description", value: description})]}</div>
  </details>
</div>`
}
```

#### Radio Question

![image@3.png](${await FileAttachment("image@3.png").url()})

```js echo
viewof exampleRadioUI = radioUI({
  title: "How far along is your process?",
  options: [{
    id: "dsds",
    label: "We are planning a process",
    score: 4
  },{
    id: "asdas",
    label: "Do you have process in place?",
    score: 10
  }],
  includeAllOption: {
    score: 5,
    label: "All of the above"
  },
  description: "Select the statements that best describes your case"
})
```

```js echo
exampleRadioUI
```

```js echo
radioUI = ({title, options = [], connections = [], description,includeAllOption} = {}) => {
  const newOptionInput = optionsRowBuilder({
    placeholder: "Add new row",
    id: randomId(),
    onEnter: () => {
      ui.value = {
        ...ui.value,
        options: [...ui.value.options, newOptionInput.value]
      }
      newOptionInput.value.label = "";
      newOptionInput.value.id = randomId();
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const radioOptionBuilderWithDelete = (args) => optionsRowBuilder({...args, onDelete: (id) => {
    ui.value = {
      ...ui.value,
      options: ui.value.options.filter(option => option.id !== id)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})
  const ui = view`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Radio Options</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Score</th>
        <th>ID</th>
      </tr>
      ${['options', options.map(radioOptionBuilderWithDelete), radioOptionBuilderWithDelete]}
      <tfoot>
        ${newOptionInput}
      </tfoot>
    </table>
  </form>
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['includeAllOption', includeOptionalAttributesUI(includeAllOption)]}
      ${['description', descriptionUI(description)]}  
    </div>
  </details>
</div>`

  return ui;

}
```

```js echo
optionsRowBuilder = ({
  label,
  score,
  id,
  placeholder,
  onEnter,
  onDelete,
} = {}) => {
  const labelInput = Inputs.text({value: label, placeholder})
  if (onEnter) {
    labelInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    labelInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && labelInput.value.length == 0) {
        onDelete(id);
      }
    });
  }
  return view`<tr>
    <td>${['label', labelInput]}</td>
    <td>${['score', Inputs.text({value: score})]}</td>
    <td>${['id', Inputs.text({value: id})]}</td>
  </tr>`
}
```

#### Checkbox Question

```js
FileAttachment("checkboxes.png").image()
```

```js echo
viewof exampleCheckboxUI = checkboxUI({
  title: "Your business focus",
  options: [{
    id: "eg",
    label: "Electricity Generation",
    score: 10
  },{
    id: "et",
    label: "Electricity Transmission",
    score: 8
  },{
    id: "ed",
    label: "Electricity Distribution",
    score: 7
  },{
    id: "other",
    label: "Other",
    score: 3
  }],
  includeAllOption: {
    score: 5,
    label: "All of the above"
  },
  description: "Select a statement that best describes your case",
})
```

```js echo
exampleCheckboxUI
```

```js echo
checkboxUI = ({title, options = [], includeAllOption, includeNoneOption, description} = {}) => {
  const newOptionInput = optionsRowBuilder({
    placeholder: "Add new row",
    id: randomId(),
    onEnter: () => {
      ui.value = {
        ...ui.value,
        options: [...ui.value.options, newOptionInput.value]
      }
      newOptionInput.value.label = "";
      newOptionInput.value.id = randomId();
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const radioOptionBuilderWithDelete = (args) => optionsRowBuilder({...args, onDelete: (id) => {
    ui.value = {
      ...ui.value,
      options: ui.value.options.filter(option => option.id !== id)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})

  const selectNoneUI = includeOptionalAttributesUI(includeNoneOption, "Add option to select none", "None of the above");

  const ui = view`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Checkbox Options</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Score</th>
        <th>ID</th>
      </tr>
      ${['options', options.map(radioOptionBuilderWithDelete), radioOptionBuilderWithDelete]}
      <tfoot>
        ${newOptionInput}
      </tfoot>
    </table>
  </form>
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['includeAllOption', includeOptionalAttributesUI(includeAllOption)]}
      ${['includeNoneOption', selectNoneUI]}
      ${['description', descriptionUI(description)]}
    </div>
    </div>
  </details>
</div>`

  return ui;

}
```

```js echo
typeUI({
  type: "checkbox",
    result: {
      title: "Your business focus",
      options: [{
        id: "a",
        label: "a_label",
        score: 10
      },{
        id: "b",
        label: "b_label",
        score: 8
      }],
      includeAllOption: {
        score: 5,
        label: "all"
      },
    }
  })
```

#### Number Question

```js echo
viewof exampleNumberUI = numberUI({
  title: "How old is your company?",
  description: "In years",
  min: 1,
  // max: 21, 
  step: 2
})
```

```js echo
exampleNumberUI
```

```js echo
numberUI = ({title, description, min = 0, max, step = 1} = {}) => {
  const attributes =  [
    {
      id: "min",
      label: "Minimum",
      value: min,
    },
    {
      id: "max",
      label: "Maximum",
      value: max
    },
    {
      id: "steps",
      label: "Steps",
      value: step
    }
  ];

  return view`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', descriptionUI(description)]}
      <div class="space-y-2 w-25-ns">
        ${['...', {
          ...attributes.reduce((acc,{id, label, value}) => {
            return {...acc, [id]: Inputs.number([-Infinity, Infinity], {label, value}) }
          }, {})
        }]}
      </div>
    </div>
  </details>
</div>`;
}
```

#### Textarea Question

```js echo
viewof exampleTextareaUI = textareaUI({
  title: "Tell us about the work your company does?",
  description: "Include you primary and secondary revenue streams",
  placeholder: "Please be elaborate",
  rows: 6
})
```

```js echo
exampleTextareaUI
```

```js echo
textareaUI = ({title, placeholder, description, rows = 4} = {}) => {
  const attributes =  [
    {
      id: "rows",
      label: "Rows",
      value: rows,
    }
  ];

  return view`<div class="[ cell__section ][ ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', descriptionUI(description)]}
      ${['placeholder', Inputs.text({label: "Placeholder", value: placeholder})]}
      <div class="space-y-2 w-25-ns">
      ${['...', {
            ...attributes.reduce((acc,{id, label, value}) => {
              return {...acc, [id]: Inputs.number([-Infinity, Infinity], {label, value}) }
            }, {})
          }]}
      </div>
    </div>
  </details>
</div>`
}
```

#### File Attachment Question

```js echo
viewof exampleFileAttachmentUI = fileAttachmentUI({
  title: "File attachments",
  description: "You can provide documents such as policies, brochure, etc.",
  placeholder: "No file chosen" 
})
```

```js echo
exampleFileAttachmentUI
```

```js echo
fileAttachmentUI = ({title, description, placeholder} = {}) => {
  return view`
<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
</div>
<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['description', Inputs.text({label: "Description", value: description})]}
    ${['placeholder', Inputs.text({label: "Placeholder", value: placeholder})]}
    </div>
  </details>
</div>`
}
```

#### Table Question

```js echo
viewof exampleTableUI = tableUI({
  title: "Gender distribution across teams",
  columns: [
    { key: "w", label: "Women", total: "women" },
    { key: "m", label: "Men", total: "men" },
    { key: "unknown", label: "No Data", total: "no data" },
  ],
  rows: [
    { key: "board", label: "Board" },
    { key: "management", label: "Management" },
    { key: "tech", label: "Technical / Engineering Staff" },
    { key: "staff", label: "Non-Technical Staff" },
    { key: "admin", label: "Administrative / Support Staff" },
    { key: "customerservice", label: "Customer Service Staff" },
    { key: "other", label: "Other Staff" },
    { key: "day", label: "Non-Contractual/Informal Day Workers" },
  ],
  caption: "_Some caption_",
  user_rows: true,
  table_total: "Total workforce",
  table_total_label: "people",
});
```

```js echo
viewof exampleTableUI2 = tableUI();
```

```js
exampleTableUI2
```

```js echo
tableUI = ({title, rows = [], columns = [], caption, user_rows, table_total, table_total_label} = {}) => {
  const newRowInputBuilder = (valueKey, hideTotal) => {
    const newRowInput = tableHeaderRowBuilder({
      placeholder: "Add new row",
      key: randomId(),
      hideTotal,
      onEnter: () => {
        ui.value = {
          ...ui.value,
          [valueKey]: [...ui.value[valueKey], newRowInput.value]
        }
        newRowInput.value.label = "";
        newRowInput.value.key = randomId();
        ui.dispatchEvent(new Event('input', {bubbles: true}))
      }
    })
    return newRowInput;
  };

  const tableHeaderRowBuilderWithDelete = (valueKey, hideTotal) => (args) => tableHeaderRowBuilder({...args, hideTotal, onDelete: (key) => {
    console.log("ui.value", ui.value);
    ui.value = {
      ...ui.value,
      [valueKey]: ui.value[valueKey].filter(option => option.key !== key)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}));
  }})

  const ui =  view`
<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['title', Inputs.text({label: "Question", value: title})]}
  <form class="${ns}">
    <label>Columns</label>
    <table class="ma0">
      <tr>
        <th>Label</th>
        <th>Key</th>
        <th>Total</th>
      </tr>
      ${['columns', columns.map(tableHeaderRowBuilderWithDelete("columns")), tableHeaderRowBuilderWithDelete("columns")]}
      <tfoot>
        ${newRowInputBuilder("columns")}
      </tfoot>
    </table>
  </form>
  <form class="${ns}">
    <label>Rows</label>
    <table class="ma0">
       <tr>
          <th>Label</th>
          <th>Key</th>
        </tr>
        ${['rows', rows.map(tableHeaderRowBuilderWithDelete("rows", true)), tableHeaderRowBuilderWithDelete("rows", true)]}
        <tfoot>
          ${newRowInputBuilder("rows", true)}
        </tfoot>
    </table>
  </form>
</div>

<div class="[ cell__section cell__section--separated ]">
  <details>
    <summary>Options</summary>
    <div class="pv2 space-y-2">
      ${['user_rows', Inputs.toggle({label: "Allow to edit row labels", value: user_rows})]}
      ${['table_total', Inputs.text({label: "Label for total", value: table_total})]}
      ${['table_total_label', Inputs.text({label: "Unit for total", value: table_total_label})]}
      ${['caption', descriptionUI(caption)]}
    </div>
  </details>
</div>`

  return ui;
}
```

```js echo
tableHeaderRowBuilder = ({
  label,
  key,
  total,
  placeholder,
  onEnter,
  onDelete,
  hideTotal
} = {}) => {
  const labelInput = Inputs.text({value: label, placeholder})
  if (onEnter) {
    labelInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    labelInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && labelInput.value.length == 0) {
        onDelete(key);
      }
    });
  }

  const row = {
    label: view`<td>${['...', labelInput]}</td>`,
    key: view`<td>${['...', Inputs.text({value: key})]}</td>`
  }

  if (!hideTotal) {
    row.total = view`<td>${['...', Inputs.text({value: total})]}</td>`
  }

  return view`<tr>
    ${['...', row]}
  </tr>`
}
```

#### Summary

```js echo
viewof sampleSummaryUI = summaryUI({
  label: "Policy/commitment to promoting gender equality and women's empowerment",
  counter_group: "A",
  counter_value: "4"
})
```

```js echo
summaryUI = ({label, counter_group, counter_value} = {}) => {
  return view`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['label', Inputs.text({value: label, label: "Label"})]}
  ${['counter_group', Inputs.text({label: "Group", value: counter_group})]}
  ${['counter_value', Inputs.text({label: "Value", value: counter_value})]}
</div>`
}
```

#### Aggregate Summary

```js echo
viewof exampleAggregateSummaryUI = aggregateSummaryUI({
  label: "Organizational Policies"
})
```

```js echo
aggregateSummaryUI = ({label, counter_group} = {}) => {
  return view`<div class="[ cell__section ][ space-y-3 ph2 pb3 ]">
  ${['label', Inputs.text({value: label, label: "Label"})]}
  ${['counter_group', Inputs.text({label: "Group", value: counter_group})]}
</div>`
}
```

#### Section

```js echo
viewof sampleSectionUI = sectionUI({
  title: "External operations"
})
```

```js echo
sectionUI = ({title} = {}) => {
  // class="[ pa3 mh-3 ][ bt bw1 b--light-silver" ]"
  return view`<div class="[ cell__section pb3 ]">
  ${['title', Inputs.text({value: title, label: "Title"})]}
</div>`
}
```

#### Include Optional Attributes

Used to include extra checkbox or radio option like 'Select all' or 'Select none'

```js echo
viewof sampleIncludeOptionalAttributesUI = includeOptionalAttributesUI({
    score: 5,
    label: "Everything"
  })
```

```js echo
viewof sampleIncludeOptionalAttributesUINoLabel = includeOptionalAttributesUI({
  score: 2
})
```

```js echo
sampleIncludeOptionalAttributesUINoLabel
```

```js echo
sampleIncludeOptionalAttributesUI
```

```js echo
viewof sampleIncludeOptionalAttributesUI3 = includeOptionalAttributesUI({
  label: "This is included in our regulations, internal policies/strategies, guidelines, and/or mechanisms; we are planning to implement.",
  score: 3,
  id: "planning"
}, "Add option to select none", "None", true)
```

```js echo
sampleIncludeOptionalAttributesUI3
```

```js echo
viewof sampleIncludeOptionalAttributesUI4 = includeOptionalAttributesUI({
  score: 3,
  id: "planning"
}, "Add option to select none", "None of the above", true)
```

```js echo
includeOptionalAttributesUI = (option = {}, toggleLabel = "Add option to select all", defaultOptionLabel = "All of the above", showId = false) =>  {   
  const {score, label, id} = option;
  
  const showUI = Boolean(score || label);
  const toggleUI = Inputs.toggle({label: toggleLabel, value: showUI});

  let optionRow  = {
    label: view`<td>${['...', Inputs.text({value: label})]}</td>`,
    score: view`<td>${['...', Inputs.text({value: score})]}</td>`
  }

  if (showId) {
    optionRow.id = view`<td>${['...', Inputs.text({value: id})]}</td>`
  }
  
  const table = view`<table class="mt0 dn">
  <tr>
    <th>Label</th>
    <th>Score</th>
    ${showId ? html`<th>ID</th>` : ""}
  </tr>
  <tr>
    ${['...', optionRow]}
  </tr>`;

  const handler = (val) => {
    if (val) {
      table.classList.remove('dn')
      table.value.label = table.value.label || label || defaultOptionLabel;
      table.value.score = table.value.score || score;
      table.value.id = table.value.id || id;
    } else {
      table.classList.add('dn');
      table.value.label = undefined;
      table.value.score = undefined;
      table.value.id = undefined;
    }
  }
  
  bindOneWay(Inputs.input(undefined), toggleUI, {
    transform: handler
  })

  handler(showUI);
  
  return view`<div>
  ${toggleUI}
  ${['...', table]}
</div>`;
}
```

### connectionsUI

Connections are the lower part of the UI that allows cells to communicate. It is reused across a few different components

```js echo
FileAttachment("image@4.png").image()
```

```js echo
viewof exampleInitializedConnectionsUI = connectionsUI({connections: [
  {set:"g1", role:"r1"},
  {set:"g2", role:"r2"}
]})
```

```js echo
viewof exampleConnectionsUI = connectionsUI()
```

```js echo
exampleConnectionsUI
```

```js echo
exampleConnectionsUIBackwritingExample = {
  viewof exampleConnectionsUI.value = {connections: [
    {set:"g1", role:"r1"},
    {set:"g2", role:"r2"}
  ]}
  viewof exampleConnectionsUI.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js echo
connectionsUI = ({connections = []} = {}) => {
  const newRoleInput = connectionRowBuilder({
    placeholder: "Add new connection",
    id: randomId(),
    role: "scored",
    onEnter: () => {
      ui.value = {
        ...ui.value,
        connections: [...ui.value.connections, newRoleInput.value]
      }
      newRoleInput.value.group = "";
      newRoleInput.value.role = "scored";
      ui.dispatchEvent(new Event('input', {bubbles: true}))
    }
  });
  const connectionRowBuilderWithDelete = (args) => connectionRowBuilder({...args, onDelete: (group) => {
    console.log("deleting", group, ui.value.connections.filter(option => option.group !== group))
    ui.value = {
      ...ui.value,
      connections: ui.value.connections.filter(option => option.group !== group)
    }
    ui.dispatchEvent(new Event('input', {bubbles: true}))
  }})
  const ui = view`<table class="ma0">
      <tr>
        <th>Group</th>
        <th>Role</th>
      </tr>
      ${['connections', connections.map(connectionRowBuilderWithDelete), connectionRowBuilderWithDelete]}
      <tfoot>
        ${newRoleInput}
      </tfoot>
    </table>`

  return ui;

}
```

```js echo
connectionRowBuilder = ({
  set,
  role,
  placeholder,
  onEnter,
  onDelete
} = {}) => {
  const setInput = Inputs.text({value: set, placeholder})
  if (onEnter) {
    setInput.addEventListener('keyup', (evt) => {
      if (evt.keyCode === 13) {
        onEnter(evt);
      }
    });
  }
  if (onDelete) { // If user editable rows
    setInput.addEventListener('keyup', (evt) => {
      // BACKSPACE
      if (evt.keyCode === 8 && setInput.value.length == 0) {
        onDelete(setInput.value);
      }
    });
  }
  return view`<tr>
    <td>${['set', setInput]}</td>
    <td>${['role', Inputs.select(roles, {value: role})]}</td>
  </tr>`
}
```

```js echo
viewof exampleConnectionRowBuilder = connectionRowBuilder()
```

```js echo
exampleConnectionRowBuilder
```

### Description UI

```js echo
descriptionUI("Some description")
```

```js echo
descriptionUI = (description, rows = 2) => view`<div>
  ${['...', Inputs.textarea({label: "Description", value: description, rows})]}
  <form class="${ns}"><p class="[ align-observable-inputs ][ ma0 ][ mid-gray ]">Supports Markdown</p></form>
</div>`
```

## Settings Card

```js echo
viewof exampleSettingsCard = settingsCard()
```

```js echo
exampleSettingsCard
```

```js echo
settingsCard = () => {
  return view`<div class="[ card card--compact ][ solid-shadow-1 ]">
  <div class="[ space-y-3 ]">
    <h2 class="mt0 f4">Settings</h2>
    ${['showResults', Inputs.toggle({label: "Show results to respondents"})]}
  </div>
`
}
```

```js echo

```

## Summary Bar

```js echo
summaryCard('30 questions across 4 pages');
```

```js echo
summaryCard('30 questions across 4 pages', html`<div class="flex space-x-2">${Inputs.button('Preview')} ${Inputs.button('Save')}`);
```

```js echo
summaryCard = (title, actionsHtml) => {
  const actions = actionsHtml ? html`<div>${actionsHtml}` : "";

  return html`<div class="[ card card--compact ][ b--light-blue solid-shadow-1 ]">
  <div class="[ flex flex-wrap justify-between items-center ][ f6 mid-gray ]">
    <p class="ma0">${title}</p>
    ${actions}
  </div>
`
}
```

## Input Label

```js echo
inputLabel("A sample label")
```

```js echo
inputLabel("A sample label", true)
```

```js echo
inputLabel = (label, optional) => html`<span>${label}${ optional ? ` <span class="mid-gray">Optional</span` : "" }</span>`
```

## Styles

```js echo
styles = html`${commonComponentStyles}
<style>
.mh-3 {
  margin-right: calc(-1 * var(--spacing-medium));
  margin-left: calc(-1 * var(--spacing-medium));
}

tr:not(:last-child) {
  border: 0;
}

.cell {
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-2);
}

.cell[data-cell-type="section"] {
  margin-left: -1rem;
  margin-right: -1rem;
  border-top-width: 0.25rem;
  border-left-width: 0;
  border-right-width: 0;
  border-radius: 0;
}

.cell__section {
  padding-top: var(--spacing-medium);
  padding-left: var(--spacing-medium); 
  padding-right: var(--spacing-medium); 
}

.cell__section--separated {
  padding-top: var(--spacing-extra-small);
  padding-bottom: var(--spacing-extra-small);
  border-top: 1px solid var(--border-color-light);
}

.cell__section summary {
  color: #555; /* mid-gray */
  cursor: pointer;
  font-size: .875rem; /* .f6 */
}

.align-observable-inputs {}

@media screen and (min-width: 30em) {
  .align-observable-inputs {
    margin-left: calc(var(--label-width) + var(--length2));
  }
}
</style>`
```

### Styles for the demo

```js echo
html`
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style type="text/css" media="screen, print">
  body {
    font-family: var(--brand-font);
  }
</style>
`
```

```js echo
tachyons = tachyonsExt({
  colors: {
    brand: mainColors[900], // or, provide and color hex code
    accent: accentColors[900], // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff",
  },
  fonts: {
    "brand-font": `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
  }
})
```

## Dependencies

```js echo
randomId = () => Math.random().toString(16).substring(2)
```

```js
import {view, bindOneWay} from '@tomlarkworthy/view'
```

```js
import {juice} from "@tomlarkworthy/juice"
```

```js
import { toc } from "@nebrius/indented-toc"
```

```js
import {mainColors, accentColors} from "@categorise/brand"
```

```js
import {tachyonsExt} from "@categorise/tachyons-and-some-extras"
```

```js
import {pageHeader, pageFooter, buttonLabel, styles as commonComponentStyles, ns, textNodeView} from "@categorise/common-components"
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
