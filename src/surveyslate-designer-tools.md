# Survey Slate | Designer Tools

_Create, edit, and connect questions for both simple and complex surveys using a variety of input types. Also check out the [User Guide for Survey Slate Designer](https://observablehq.com/@categorise/surveyslate-user-guide-for-grouping-questions)._

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js
toc()
```

```js
loginTitle = md`## Login`
```

```js
md`test credentials for demoEditor
~~~js
{
  "accessKeyId": "AKIAQO7DBPIFDAUBK4SL",
  "secretAccessKey": "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"
}

~~~
`
```

```js
viewof login = viewof manualCredentials
```

```js
credStore = saveCreds
```

```js
surveyChooserTitle = md`## Survey Chooser`
```

```js
viewof survey = Inputs.select(surveys)
```

```js
surveys = myTags['designer'].split(" ")
```

## Designer UI

```js
import {surveyEditor, styles as designUiStyles, tachyons} from '@categorise/surveyslate-designer-ui'
```

```js
loadStyles = (tachyons, designUiStyles)
```

```js echo
viewof surveyUi = {
  (initialLoadQuestions, initialLoadLayout, load_config)

  console.log("Executing surveyUi")

  const updateEditorState = (state) => {
    ui.dataset.surveyEditorState = state;
    console.log(ui.dataset.surveyEditorState);
  };
  const resetEditorState = () => updateEditorState('editor');

  const ui = view`<div
  class="[ survey-ui ][ brand-font bg-near-white ba b--light-gray ]"
  data-survey-editor-state="editor">
  <div class="solid-shadow-y-1">${pageHeader(['Survey Designer'])}</div>
  <main class="[ mr-auto mw9 ][ space-y-3 pa3 ]">
    <div class="toolbar flex items-center">
      <!-- <div class=""><a class="brand hover-underline" href="#">← Back</a></div> -->
      <div class="ml-auto button-group">
        ${Inputs.button(buttonLabel({label: "Import", iconLeft: "download"}), {reduce: () => updateEditorState('import')})}
      ${Inputs.button(buttonLabel({label: "Export", iconLeft: "upload"}), {reduce: () => updateEditorState('export')})}
      </div>
    </div>

    <div class="[ survey-editor__import ][ space-y-3 ]">
      <div class="card space-y-3">
        <div class="flex">
          <h2 class="mr-auto">Import</h2>
          ${Inputs.button("Close", { reduce: resetEditorState})}
        </div>
        <div class="space-y-3">
          <div>${importUi(resetEditorState)}</div>
        </div>
      </div>
    </div>
    <div class="[ survey-editor__export ][ space-y-3 ]">
      <div class="card space-y-3">
        <div class="flex">
          <h2 class="mr-auto">Export</h2>
          ${Inputs.button("Close", { reduce: resetEditorState})}
        </div>
        <!-- Exports UI -->
        <div>${exportUi()}</div>
      </div>
    </div>
    <div class="[ survey-editor__editor ][ space-y-3 ]">
      ${['...', surveyEditor()]}      
    </div>
  </main>
  ${pageFooter()}
</div>`

  return ui;
}
```

```js
// Special arg suffixes like _json, _md, _html are expended
function questionToUiCell(source) {
  const questionAttribute = ([k, v]) => {
    k = k.trim()
    if (k.endsWith("_json")) {
      return [k.replace(/_json$/, ''),
              Array.isArray(v) ? v.map(v => questionToUiCell(JSON.parse("(" + v + ")")))
                                       : questionToUiCell(JSON.parse("(" + v + ")"))] 
    }
    if (k.endsWith("_eval")) {
      return [k.replace(/_eval$/, ''),
              Array.isArray(v) ? v.map(v => questionToUiCell(eval("(" + v + ")")))
                                       : questionToUiCell(eval("(" + v + ")"))]    
    }
    if (k.endsWith("_js")) {
      return [k.replace(/_js$/, ''),
              Array.isArray(v) ? v.map(v => questionToUiCell(eval("(" + v + ")")))
                                       : questionToUiCell(eval("(" + v + ")"))]    
    }
    if (k.endsWith("_md")) {
      return [k.replace(/_md$/, ''), v]    
    }
    if (!k || !v) return undefined;
    
    return [k, v]
  }
  if (Array.isArray(source))
    return source.map(arg => questionToUiCell(arg));
  else if (typeof source === 'object')
    return Object.fromEntries(Object.entries(source).map(questionAttribute).filter(e => e))
  else 
    return source
} 
```

```js
function uiCellToQuestion(args) {
  const uiAttribute = ([k, v]) => {
    if (v == "") return undefined;
    if (k == "connections") return undefined;
    if (k == "id") k = "value";

    const arrays = ["options", "rows", "columns"]
    if (arrays.includes(k) && Array.isArray(v)) {
      return [k + "_js", uiCellToQuestion(v).map(e => JSON.stringify(e))];
    } 

    v = uiCellToQuestion(v);

    if (_.isEqual(v, {})) return undefined;
    if (v === undefined) return undefined;

    if (["description"].includes(k)) return [k + "_md", v];
    
    return [k, v]
  }
  if (Array.isArray(args))
    return args.map(arg => uiCellToQuestion(arg));
  else if (typeof args === 'object')
    return Object.fromEntries(Object.entries(args).map(uiAttribute).filter(a => a !== undefined))
  else if (typeof args === 'number')
    return String(args)
  else 
    return args
}
```

```js echo
questionsNoLayout
```

```js
viewof surveyUiInput = {
  console.log("Executing viewof surveyUiInput")
  // Go through the layout *in order* and build up pages with cells *in order*
  const pagesByMenu = {};

  const layoutUi = [...questionsNoLayout.entries()].map(([id, q]) => ({
    menu: "nolayout",
    id, set:"", role:""
  })).concat(layout.data);
  
  layoutUi.forEach(l => {
    const connections = [];
    // set and role are comma deliminated lists
    // zip them into an array
    const sets = l.set.split(",");
    const roles = l.role.split(",");
    for (let i = 0; i < Math.max(sets.length, roles.length); i++) {
      connections.push({
        set: sets[i],
        role: roles[i],
      })
    }
    const source = questions.get(l.id);
    if (!source) return;
    const question = questionToUiCell(source);
    
    pagesByMenu[l.menu] = pagesByMenu[l.menu] || {
      title: l.menu,
      cells: []
    };
    pagesByMenu[l.menu].cells.push({
      id: l.id,
      inner: {
        type: question.type,
        result: {
          ...question,
          ...(question.options && {options: question.options.map(
            (option, index) => ({...option, id: option.value})
          )})
        }
      },
      connections: {
        connections: connections 
      }
    })
  })

  return Inputs.input(({
    metadata: {
      ...surveyConfig,
      title: surveyConfig.pageTitle
    },
    pages: Object.entries(pagesByMenu).map(([menu, page]) => page)
  }))  
}
```

```js echo
syncSurveyUiInputToSurveyUi = {
  console.log("syncSurveyUiInputToSurveyUi");
  if (!_.isEqual(viewof surveyUi.value, viewof surveyUiInput.value)) {
    console.log("syncSurveyUiInputToSurveyUi: change detected");
    viewof surveyUi.value = viewof surveyUiInput.value;
    // Manually updating the UI state
    // viewof surveyUi.applyValueUpdates();
    viewof surveyUi.dispatchEvent(new Event('input', {bubbles: true}))
  }
}
```

```js
syncSurveyUIToSurveyUiOutput = {
  console.log("syncSurveyUIToSurveyUiOutput")
  // Reactive to UI changes (i.e. surveyUi)
  if (!_.isEqual(viewof surveyUiOutput.value, surveyUi)) {
    console.log("syncSurveyUIToSurveyUiOutput: change detected");
    viewof surveyUiOutput.value = _.cloneDeep(surveyUi);
    viewof surveyUiOutput.dispatchEvent(new Event('input', {bubbles: true}))
  }
}
```

```js
viewof surveyUiOutput = Inputs.input(undefined);
```

```js echo
syncSurveyOutput = {
  console.log("surveyOutput")
  // convert ui representation (pages -> cells) to {questions, layout, config} for storage.

  if (surveyUiOutput.pages.length === 0) return invalidation;
  // Extract questions
  const questions = new Map();
  surveyUiOutput.pages.forEach(page => {
    page.cells.forEach(cell => {
      questions.set(cell.id, uiCellToQuestion({
        ...cell.inner.result,
        type: cell.inner.type,
      }))
    })
  });

  // Extract layout
  const layout = [];
  surveyUiOutput.pages.forEach(page => {
    page.cells.forEach(cell => {
      const connections = cell?.connections?.connections || []
      const set = connections.map(c => c.set).join(",");
      layout.push({
        id: cell.id,
        menu: page.title,
        set,
        role: set === "" ? "" : connections.map(c => c.role).join(","),
      })
    })
  });

  // Extract config
  const config = {
    ...viewof surveyConfig.value, // carry over initial state
    pageTitle: surveyUiOutput.metadata.title
  };
  
  viewof surveyOutput.value = {
    questions,
    layout,
    config
  };
  viewof surveyOutput.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js
viewof surveyOutput = Inputs.input(undefined)
```

```js
diff = require('https://bundle.run/json-diff@0.5.4')
```

```js
viewof selectedQuestionDiff = Inputs.select(Object.keys(logicalQuestionDiff).map(k => k.replace("__deleted", '').replace("__added", '')), {label: "Select question diff"})
```

```js
md`
question: <b>${selectedQuestionDiff}</b>

Question Input to UI questions
~~~js
${JSON.stringify(questions.get(selectedQuestionDiff), null, 2)}
~~~

Question Output to UI
~~~js
${JSON.stringify(surveyOutput.questions.get(selectedQuestionDiff), null, 2)}
~~~
`
```

```js
normalizedQuestions = Object.fromEntries([...csvToQuestions(questionsToCSV(questions)).entries()].map(reifyAttributes))
```

```js
normalizedQuestionsOutput = Object.fromEntries([...csvToQuestions(questionsToCSV(surveyOutput.questions)).entries()]
                     .map(reifyAttributes).filter(e => e[0] !== " "))
```

```js
logicalQuestionDiff = Object.fromEntries(Object.entries(
  diff.diff(normalizedQuestions, normalizedQuestionsOutput) || []
))
```

## Autosave UI

```js

autosave = {
  async function saveState() {
    console.log("saveState")
    await Promise.all([
      saveQuestions(viewof surveyOutput.value.questions),
      saveLayout(viewof surveyOutput.value.layout),
      saveConfig(viewof surveyOutput.value.config)
    ]);
    await files.save("settings.json", viewof settings.value);
    return "Saved " + new Date()
  }
  console.log("Initializing autosave");
  function debounce(func, timeout = 2000){ // 2 seconds
    let timer;
    let hasRun = true; // Only one of setTimeout OR visibility change should run
    let args;
    const runTask = async () => {
      if (!hasRun) {
        console.log("auto_save")
        hasRun = true;
        await func.apply(this, args);
      }
    };
    
    window.addEventListener('beforeunload', function (e) {
      if (!hasRun) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = "Please wait for your latest changes to be saved. Try again in a few seconds";
      }
    });
    
    return (...latestArgs) => {
      args = latestArgs;
      hasRun = false;
      
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", runTask)
      
      timer = setTimeout(runTask, timeout);
      document.addEventListener("visibilitychange", runTask);
      
      invalidation.then(() => document.removeEventListener("visibilitychange", runTask))
    };
  }
  
  let first = true;
  
  return Generators.observe(next => {
    const autosave = debounce(async () => {
      if (first) {
        console.log("Skipping first save as its from page load not human interaction")
        first = false; // Skip first save as it's from page load
      } else {
        console.log("saving")
        const answers = await saveState()
        next(answers);
      }
    });
    viewof surveyOutput.addEventListener('input', autosave);
    invalidation.then(() => viewof surveyOutput.removeEventListener('input', autosave))
    
    next("Autosave initialized")
  })
  
}
```

## Export

```js
exportDataUri = URL.createObjectURL(new Blob([ JSON.stringify({
  ...surveyOutput,
  questions: Object.fromEntries(surveyOutput.questions.entries())
}) ], { type: 'application/json' }));
```

```js
htl.html`<a href=${exportDataUri} download="survey_${Date.now()}.json">
  download survey.json
</a>`
```

## Persistence

```js
viewof settings = Inputs.input(await files.load('settings.json'))
```

```js
files = ({
  save: async (key, object) => {
    await putObject(config.PRIVATE_BUCKET, `surveys/${survey}/${key}`, JSON.stringify(object), {
      tags: {
        "survey": survey
      },
      ...(key === "settings.json" && {'CacheControl': "no-cache"})
    })
  },
  load: async (key, object) => {
    return JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/${key}`))
  }
})
```

```js
saveQuestions = async (questions) => {
  const name = `questions_${Date.now()}.json`
  await files.save(name, Array.from(questions.entries()))
  viewof settings.value = {
    ...viewof settings.value,
    questions: [
      ...(viewof settings.value.questions || []),
      name
    ]
  }
  return name;
}
```

```js
loadQuestions = async (name) => {
  const entries = await files.load(name)
  return new Map(entries);
}
```

```js
saveLayout = async (layout) => {
  const name = `layout_${Date.now()}.json`
  await files.save(name, layout);
  viewof settings.value = {
    ...viewof settings.value,
    layout: [
      ...(viewof settings.value.layout || []),
      name
    ]
  };
  return name;
}
```

```js
loadLayout = async (name) => await files.load(name)
```

```js
saveConfig = async (config) => {
  const name = `config_${Date.now()}.json`
  await files.save(name, config)
  viewof settings.value = {
    ...viewof settings.value,
    configs: [
      ...(viewof settings.value.configs || []),
      name
    ]
  };
  return name;
}
```

```js
loadConfig = async (name) => await files.load(name)
```

```js
async function saveVersion() {
  const name = `version_${Date.now()}.json`
  
  const version = ({
    layout: viewof settings.value.layout.at(-1),
    questions: viewof settings.value.questions.at(-1),
    config: viewof settings.value.configs.at(-1)
  });
  
  await files.save(name, version)
  
  viewof settings.value = {
    ...viewof settings.value,
    versions: [
      ...(viewof settings.value.versions || []),
      name
    ]
  };
  
  await files.save("settings.json", viewof settings.value);
  
  return name;
}
```

```js echo
viewof settings.value.versions.at(-1)
```

```js
revertChanges = async function() {
  const version = await files.load(viewof settings.value.versions.at(-1))
  viewof settings.value = {
    ...viewof settings.value,
    configs: [
      ...(viewof settings.value.configs || []),
      version.config
    ],
    questions: [
      ...(viewof settings.value.questions || []),
      version.questions
    ],
    layout: [
      ...(viewof settings.value.layout || []),
      version.layout
    ]
  };
  
  await files.save("settings.json", viewof settings.value);
}
```

```js
md`## Questions`
```

```js
viewof questions = Inputs.input(new Map())
```

```js
mutable initialLoadQuestions = (/* reload everything on choice change */ survey, false)
```

```js
initialQuestionLoader = {
  if (!initialLoadQuestions) {
    mutable initialLoadQuestions = true;
    viewof questions.value = await loadQuestions(settings.questions[settings.questions.length - 1])
    viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
  }
  return "Initial Question Loader"
}
```

```js
md`### Import external CSV of questions`
```

```js
viewof questionUpload = fileInput({prompt: "Drop questions as a CSV file here"})
```

```js echo
onQuestionUpload = {
  viewof questions.value = csvToQuestions(await questionUpload.csv());
  viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
}
```

```js echo
function csvToQuestions(csv) {
  return csv.reduce(
    (acc, row) => {
      

      // Now append the rows question attributes and values to the current question being processed
      const attribute = row['key'];
      const value = row['value'];
      const id = row['id'] || acc.previous?.id;

      let current = acc.previous;
      
      if (id != acc.previous?.id) {
        current = {
          id: id
        }
        acc.questions.push(current)
      }

      const arrays = ['options', 'rows', 'columns'];
      if (arrays.some(arr => attribute.startsWith(arr))) {
        // But if the element is packed as an array we don't unwind
        let packed = false;
        try {
          if (Array.isArray(eval(value))) {
            packed = true;
            current[attribute] = value;
          }
        } catch (err) {}

        if (attribute === 'rows' && !Number.isNaN(+value)) {
          // When rows is in a textarea is it not in an array
          current[attribute] = value;
        } else if (!packed) {
          // Arrays come in a list of elements
          const array = current[attribute] || [];
          if (arrays.includes(attribute)) {
            array.push({
              value: value,
              label: value
            });
          } else {
            array.push(value);
          }
  
          current[attribute] = array; 
        }
      } else {
        current[attribute] = sanitizeValue(value);
      }

      return {
        questions: acc.questions,
        previous: current
      }
    }
    , {
      questions: [],
      previous: null
    }
  ).questions.reduce( // Index by id
    (map, q) => {
      const {id, ...value} = q
      map.set(id, value)
      return map;
    },
    new Map() // Map remembers insertion order which is useful
  )
}
```

```js
questionsToCSV = (questions) =>
  [...questions.entries()].reduce(
    (acc, row) => {
      Object.entries(row[1] || row[0]).forEach(([k,v]) => {
        if (k == 'id') return;
        if (Array.isArray(v)) {
          v.forEach(e => {
            if (typeof e === 'string') {
              acc.push({
                'id': row[0],
                'key': k,
                'value': e
              })
            } else if (typeof e === 'object' && typeof e.label === 'string' && e.label === e.value) {
              acc.push({
                'id': row[0],
                'key': k,
                'value': e.label
              })
            } else {
              throw new Error(Object.keys(e))
            } 
          })
        } else if (typeof v === 'string'){
          acc.push({
            'id': row[0],
            'key': k,
            'value':v
          })
        } else if (typeof v === 'boolean') {
          acc.push({
            'id': row[0],
            'key': k,
            'value': v ? "TRUE" : "FALSE"
          })
        } else if (typeof v === 'object') {
          acc.push({
            'id': row[0],
            'key': k + "_js",
            'value': JSON.stringify(v)
          })
        }else {
          throw new Error(v)
        }
      });
      
      return acc;
    },[])
```

```js
md`### Export questions to CSV`
```

```js
questionsCsvDataUri = URL.createObjectURL(new Blob([ d3.csvFormat(exportQuestionsCSV) ], { type: 'text/csv' }));
```

```js
viewof questionsCsvDataUriView = Inputs.input(undefined)
```

```js echo
updateQuestionsCsvDataUriView = {
  viewof questionsCsvDataUriView.value = questionsCsvDataUri /* sync questionsCsvDataUri changes to the view */
  viewof questionsCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js echo
downloadQuestionsCsv = htl.html`<a href=${viewof questionsCsvDataUriView.value} download="questions_${Date.now()}.csv">
  Download questions.csv
</a>
${exportQuestionsProblems.length > 0 ? md`<mark> Warning, some questions are not exporting properly, you may lose data in export` : null}
`
```

```js
exportQuestionsCSV = questionsToCSV(questions)

```

```js
exportQuestionsProblems = {
  const exportedQuestions = csvToQuestions(exportQuestionsCSV);
  const qProblems = [...questions.keys()].reduce((acc, q) => {
    const question = questions.get(q);
    const exported = exportedQuestions.get(q);
    if (!_.isEqual(question, exported)) {
      acc.push({
        q, question, exported
      })
    }
    return acc
  }, [])
  
  const eProblems = [...exportedQuestions.keys()].reduce((acc, q) => {
    const question = questions.get(q);
    const exported = exportedQuestions.get(q);
    if (!_.isEqual(question, exported)) {
      acc.push({
        q, question, exported
      })
    }
    return acc
  }, qProblems)
  
  return eProblems;
  
}
```

```js
md`## Layout`
```

```js
viewof layoutData = Inputs.input([]);
```

```js
md`### Import layout from CSV`
```

```js
viewof layoutUpload = fileInput({prompt: "Drop layout as a CSV file here"})
```

```js echo
onLayoutUpload = {
  viewof layoutData.value = {data: csvToLayout(await layoutUpload.csv())}
  viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js
function csvToLayout(csv) {
  return csv.reduce(
    (acc, row) => {
      acc.push(row)
      return acc
    }, []
  )
}
```

```js
md`### Export layout to CSV`
```

```js echo
layoutCsvDataUri = URL.createObjectURL(new Blob([ d3.csvFormat(exportLayoutCSV) ], { type: 'text/csv' }));
```

```js echo
viewof layoutCsvDataUriView = Inputs.input(undefined)
```

```js echo
updateLayoutCsvDataUriView = {
  viewof layoutCsvDataUriView.value = layoutCsvDataUri
  viewof layoutCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js
downloadLayoutCsv = htl.html`<a href=${viewof layoutCsvDataUriView.value} download="layout_${Date.now()}.csv">
  Download layout.csv
</a>
${exportLayoutProblems.length > 0 ? md`<mark> Warning, some layouts are not exporting properly, you may lose data in export` : null}
`
```

```js
mutable initialLoadLayout = false
```

```js
initialLayoutLoader = {
  if (!initialLoadLayout) {
    mutable initialLoadLayout = true;
    setLayout([...await loadLayout(settings.layout[settings.layout.length - 1])])
  }
  return "Initial Layout Loader"
}
```

```js
function setLayout(data) {
  const choices = learnChoices(data);
  
  menuOptions.data = choices["menu"]
  setOptions.data = choices["set"]
  viewof menuOptions.dispatchEvent(new Event('input', {bubbles: true}))
  viewof setOptions.dispatchEvent(new Event('input', {bubbles: true}))
  
  
  layoutData.data = data;
  viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js
learnChoices = (data) => {
  const columns = ["menu", "set"]
  const counts = data.reduce(
    (arr, l) => {
      columns.forEach(c => { 
        arr[c] = arr[c] || {};
        arr[c][l[c]] = (arr[c][l[c]] || 0) + 1 
      })
      return arr;
    }, {})
  return Object.fromEntries(Object.entries(counts).map(([key, counts]) => {
    return [key, Object.keys(counts).map(k => ({[key]: k}))]
  }))
}
```

### Export UI

```js
sampleExportUi = exportUi()
```

```js echo
exportUi = () => {
  const now = Date.now();

  return view`<div class="space-y-3">
  <div>
    <a href=${viewof questionsCsvDataUriView.value} download="questions_${Date.now()}.csv">Download Questions</a>
  </div>

  <div>
    <a href=${viewof layoutCsvDataUriView.value} download="layout_${Date.now()}.csv">Download Layout</a>
  </div>
</div>`
}
```

### Import UI

```js echo
viewof sampleImportUi = importUi()
```

```js echo
sampleImportUi
```

```js echo
importUi = (afterSave) => {
  const submitFiles = async ()  => {
    if (ui.value.questionsCsv) {
      console.log('Updating questions CSV')
      viewof questions.value = csvToQuestions(await ui.value.questionsCsv.csv());
    }

    if (ui.value.layoutCsv) {
      console.log('Updating layout CSV')
      viewof layoutData.value = {data: csvToLayout(await ui.value.layoutCsv.csv())}
    }

    if (ui.value.questionsCsv || ui.value.layoutCsv) {
      viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
      viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
    }

    if (typeof afterSave === 'function') {
      afterSave();
    }
  }
  const submit = Inputs.button(buttonLabel({label: "Save"}), {reduce: submitFiles});
  
  const ui = view`<div class="space-y-3">
  <h3 class="f5">Questions CSV file</h3>
  ${['questionsCsv', fileInput({prompt: "Drop questions as a CSV file here"})]}
  <h3 class="f5">Layout CSV file</h3>
  ${['layoutCsv', fileInput({prompt: "Drop layout as a CSV file here"})]}
  <div>
    ${submit}
  </div>`
  
  return ui;
}
```

```js
md`### Edit user choices within the layout Editors`
```

```js
function selection(title) {
  const choices = dataEditor([], {
    columns: [title],
    width: {
      [title]: "400px"
    },
    format: {
      [title]: (d) => Inputs.text({value: d, width: "400px", disabled: true}),
    },
  })
  const addForm = view`<div style="display: flex;">
    ${[title, Inputs.text({
      label: `Add ${title}`
    })]}
    ${Inputs.button("add", {
      reduce: () => {
        choices.value.data = [...choices.value.data, addForm.value]
        addForm[title].value = '';
        choices.dispatchEvent(new Event('input', {bubbles: true}));
      }
    })}
  `

  return view`<div><details>
      <summary>Edit choices for <b>${title}</b></summary>
      ${['...', choices]}${cautious(() => addForm)}
  `
}
```

```js
viewof menuOptions = selection("menu")
```

```js
viewof setOptions = selection("set")
```

```js
md`### Layout Data`
```

```js
viewof layout = Inputs.input(layoutData)
/*
{ 
  const menuOptionsArr = menuOptions.data.map(d => d["menu"]);
  const setOptionsArr = setOptions.data.map(d => d["set"]);
  
  return dataEditor(layoutData.data, {
    columns: ["id", "menu", "set", "role"],
    format: {
      "id": (d) => Inputs.text({value: d}),
      "menu": (d) => Inputs.select(menuOptionsArr, {value: d}),
      "set": (d) => Inputs.select(setOptionsArr, {value: d}),
      "role": (d) => Inputs.text({value: d})
    },
    width: {
      "set": "100px"
    },
    tableClass: "layout",
    stylesheet: `
      .layout .col-cell_name form {
        width: 300px
      }
      .layout .col-menu form {
        width: 100px
      }
      .layout .col-set form {
        width: 100px
      }
    `
  })
}*/
```

```js
md`## Data Quality Checks`
```

```js
md`### Questions that have no layout`
```

```js
{
  const results = [...questionsNoLayout.entries()].map(([k, v]) => ({id: k, ...v}));
  if (results.length > 0) {
    return dataEditor(results, {
      columns: ["id", "type"]
    })
  } else {
    return md`✅ The are no questions with no layout`
  }
}
```

```js echo
questionsNoLayout.values().next()
```

```js
md`### Layouts with no question`
```

```js
{
  const results = layoutsNoQuestion.map(([name, layoutArray]) => layoutArray[0]);
  if (results.length > 0) {
    return dataEditor(results)
  } else {
    return md`✅ The are no layouts with no questions`
  }
}
```

```js
md`### Questions with options but some of the options do not have a 'value'

All options need value's defined, this is the key used to ensure updates to question text do not affect the endusers pre-existing answers.
`
```

```js
{
  if (optionsWithoutValue.length > 0) {
    return md`⚠️ There are ${optionsWithoutValue.length} mistakes
  ${optionsWithoutValue.map(mistake => `\n- ${mistake[1].cell_name}`)}`
  } else {
    return md`✅ All options have a value defined`
  }
}
```

```js
optionsWithoutValue = [...surveyOutput.questions.entries()].map(([k, q]) => [k, reifyAttributes(q)]).filter(([name, question]) => question.options &&  !question.options.some(option => option.value))
```

```js
layoutById = d3.group(layout.data, d => d.id)
```

```js
duplicateLayouts = Object.fromEntries([...layoutById.entries()].filter(([name, layoutArr]) => layoutArr.length  > 1))
```

```js
questionsNoLayout = new Map([...questions.entries()].filter(([name, q]) => !layoutById.has(name)))
```

```js
layoutsNoQuestion = ([...layoutById.keys()].filter(name => !surveyOutput.questions.has(name))).map(k => [k, layoutById.get(k)])
```

```js
exportLayoutCSV = surveyOutput.layout
```

```js
exportLayoutProblems  = {
  const exportedLayout = csvToLayout(exportLayoutCSV);
  
  const problems = [];
  for (var i = 0; i < Math.max(surveyOutput.layout.length, exportedLayout.length); i++) {
    if (!_.isEqual(layout.data[i], exportedLayout[i])) {
      problems.push({
        row: i,
        layout: layout.data[i],
        exportedLayout: exportedLayout[1]
      })
    }
  }
  return problems;
}
```

## Config

Config is additional data that might be useful such as the menu display titles.

```js
viewof latestConfig = editor({
  type: "object",
  title: "Config",
  properties: {
    pageTitle: {
      type: "string"
    },
    menuSegmentLabels: {
      type: "object",
      additionalProperties: { "type": "string" }
    }
  }
}, {
  theme: "spectre",
  disable_edit_json: true,
  disable_properties: false,
  iconlib: "spectre",
  show_errors: "always",
  prompt_before_delete: "false"
})
```

```js
save_config = {
  
  if (viewof surveyConfig.value && !_.isEqual(latestConfig, viewof surveyConfig.value)) {
    yield md`Saving...`
    viewof surveyConfig.value = latestConfig;
    await saveConfig(latestConfig);
    yield md`saved`
  } else {
    yield md`no changes`
  }
}
```

```js
viewof surveyConfig = Inputs.input()
```

```js
sync_ui = {
  viewof latestConfig.value = surveyConfig
}
```

```js
load_config = {
  viewof surveyConfig.value = settings.configs?.length > 0 
                                ? await loadConfig(settings.configs[settings.configs.length - 1])
                                : {};
  viewof surveyConfig.dispatchEvent(new Event('input', {bubbles: true}))
}
```

```js
import {editor} from "@a10k/hello-json-editor"
```

## Styles

```js echo
styles = html`<style>
/* Survey Editor */

.survey-editor__import,
.survey-editor__export,
.survey-editor__editor {
  display: none;
}

[data-survey-editor-state="import"] .survey-editor__import,
[data-survey-editor-state="export"] .survey-editor__export,
[data-survey-editor-state="editor"] .survey-editor__editor {
  display: block;
}

/* Styles when displayed as a stand alone notebook */
[data-standalone-designer-notebook] .observablehq > h2 {
  padding-top: var(--spacing-medium); 
  border-top: 1px solid;
  border-color: #eee; /* .b--light-gray */
}
</style>`
```

### Styles for the in notebook demo

```html echo
<style>
  .survey-ui {
    overflow-y: auto;
    max-height: 600px;
    overscroll-behavior-y: contain;
  }
</style>
```

```js
surveyPreviewTitle = md`## Survey Preview`
```

```js
viewof responses = {
  addMenuBehaviour
  const view = surveyView(surveyOutput.questions, surveyOutput.layout, surveyOutput.config, new Map(), {
    putFile: (name) => console.log("mock save " + name),
    getFile: (name) => console.log("mock get " + name),
  })
  
  return view
}
```

```js echo
responses
```

```js
import {surveyView, addMenuBehaviour} from '@categorise/surveyslate-styling'
```

```js
md`## Preview Answers`
```

```js
responses
```

## Revert changes

Rollback survey to last deployed version

```js
viewof reollbackButton = Inputs.button("revert", {
  reduce: async () => {
    await revertChanges(); 
  }
})
```

```js
deployTitle = md`## Deploy Survey Version`
```

Last deployed: ${new Date(Number.parseInt(viewof settings.value.versions.at(-1).replace("version_", "").replace(".json", "")))}

${/*force update on deploy*/ (deployButton, '')}

```js
viewof deployButton = Inputs.button("deploy", {
  reduce: async () => {
    await saveVersion(); 
  }
})
```

```js
md`---
## Cloud Configuration`
```

```js
me = getUser()
```

```js
myTags = listUserTags(me.UserName)
```

```js
REGION = 'us-east-2'
```

```js
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, viewof manualCredentials, viewof mfaCode, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} with {REGION as REGION} from '@tomlarkworthy/aws'
```

```js
md`---

## Helpers`
```

```js
sanitizeValue = (text) => {
  text = text.trim()
  if (text === "TRUE") return true;
  if (text === "FALSE") return false;
  return text
}
```

```js
md`### Dependancies`
```

```js
import {createQuestion, reifyAttributes, bindLogic, setTypes, config} from '@categorise/survey-components'
```

```js
import {toc} from "@bryangingechen/toc"
```

```js
import {view, cautious} from '@tomlarkworthy/view'
```

```js
import {fileInput} from "@tomlarkworthy/fileinput"
```

```js
import {dataEditor} from '@tomlarkworthy/dataeditor'
```

```js
import {pageHeader, pageFooter, buttonLabel} from "@categorise/common-components"
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
