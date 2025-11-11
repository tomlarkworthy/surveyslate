//# GESI Survey | Designer Tools

import { Generators } from "observablehq:stdlib";

import * as htl from "/components/htl@0.3.1.js";

import markdownit from "markdown-it";

//import {view, cautious} from '@tomlarkworthy/view'
import {viewUI, cautious} from '/components/view.js';

//import {fileInput} from "@tomlarkworthy/fileinput";
import {fileInput} from "/components/fileinput.js";

//import {dataEditor} from '@tomlarkworthy/dataeditor';
import {dataEditor} from '/components/dataeditor.js';

//import {localStorageView} from '@tomlarkworthy/local-storage-view'
import {localStorageView} from '/components/local-storage-view.js';

//import {pageHeader, pageFooter, buttonLabel} from "@adb/gesi-survey-common-components";
import {pageHeader, pageFooter, buttonLabel} from "/components/gesi-survey-common-components.js";

//import {surveyEditor, styles as designUiStyles, tachyons} from '@adb/gesi-survey-designer-ui'
import {surveyEditor, styles as designUiStyles, tachyons} from '/components/gesi-survey-designer-ui.js';

///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
//import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, viewof manualCredentials, viewof mfaCode, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} with {REGION as REGION} from '@tomlarkworthy/aws'
//import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, manualCredentialsElement, manualCredentials, mfaCode, saveCredsElement, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} from '/components/aws.js';
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, manualCredentialsElement, manualCredentials,mfaCode, saveCredsElement, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} from '/components/aws.js';

//import {createQuestion, reifyAttributes, bindLogic, setTypes, surveyView, config} from '@adb/gesi-survey-components'
import {createQuestion, reifyAttributes, bindLogic, setTypes, surveyView, config} from '/components/gesi-survey-components.js';


//## Helpers

const html = htl.html

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


const sanitizeValue = (text) => {
  text = text.trim()
  if (text === "TRUE") return true;
  if (text === "FALSE") return false;
  return text
}


///---


//## Cloud Configuration


const me = getUser()

const myTags = listUserTags(me.UserName)

const REGION = 'us-east-2'

///---

// Login & survey chooser


const loginTitle = md`## Login`

//viewof login = viewof manualCredentials
const login = manualCredentialsElement

const credStore = saveCredsElement

const surveyChooserTitle = md`## Survey Chooser`

const surveys = myTags['designer'].split(" ")

//viewof survey = Inputs.bind(Inputs.select(surveys, {label: "survey"}), localStorageView("designer-project", {
const surveyElement = Inputs.bind(Inputs.select(surveys, {label: "survey"}), localStorageView("designer-project", {
  defaultValue: 
    new URLSearchParams(location.search).get("survey") ||
    surveys[0]
}))

const survey = Generator.input(surveyElement)



// !!--

//Persistence layer (files + settings + save/load helpers)



//!! --

//## Designer UI


const loadStyles = (tachyons, designUiStyles)


//viewof surveyUi = {
const surveyUiElement = () => {
  (initialLoadQuestions, initialLoadLayout, load_config)

  console.log("Executing surveyUi")

  const updateEditorState = (state) => {
    ui.dataset.surveyEditorState = state;
    console.log(ui.dataset.surveyEditorState);
  };
  const resetEditorState = () => updateEditorState('editor');

  //const ui = view`<div
  const ui = viewUI`<div
  class="[ survey-ui ][ brand-font bg-near-white ba b--light-gray ]"
  data-survey-editor-state="editor">
  <div class="solid-shadow-y-1">${pageHeader(['Survey Designer'])}</div>
  <main class="[ mr-auto mw9 ][ space-y-3 pa3 ]">
    <div class="toolbar flex items-center">
      <!-- <div class=""><a class="brand hover-underline" href="#">← Back</a></div> -->
      <div class="ml-auto button-group">
        ${Inputs.button(buttonLabel({label: "Import", iconLeft: "download"}), {reduce: () => updateEditorState('import')})}
      ${Inputs.button(buttonLabel({label: "Export", iconLeft: "upload"}), {reduce: () => {
        ui.querySelector("#exportUI").innerHTML = (exportUi()).outerHTML
        updateEditorState('export')
      }})}
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
        <div id="exportUI"></div>
      </div>
    </div>
    <div class="[ survey-editor__editor ][ space-y-3 ]">
      ${['...', surveyEditor()]}      
    </div>
  </main>
  ${pageFooter()}
</div>`

  return ui;
};

const surveyUi = Generators.input(surveyUiElement);


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



//viewof surveyUiInput = {
const surveyUiInputElement = (() => {
  console.log("Executing viewof surveyUiInput");
  // Go through the layout *in order* and build up pages with cells *in order*
  const pagesByMenu = {};

  const layoutUi = [...questionsNoLayout.entries()]
    .map(([id, q]) => ({
      menu: "nolayout",
      id,
      set: "",
      role: ""
    }))
    .concat(layout.data);

  layoutUi.forEach(l => {
    const connections = [];
    // set and role are comma delimited lists
    // zip them into an array
    const sets = l.set.split(",");
    const roles = l.role.split(",");
    for (let i = 0; i < Math.max(sets.length, roles.length); i++) {
      connections.push({
        set: sets[i],
        role: roles[i]
      });
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
          ...(question.options && {
            options: question.options.map((option, index) => ({
              ...option,
              id: option.value
            }))
          })
        }
      },
      connections: {
        connections: connections
      }
    });
  });

  return Inputs.input({
    metadata: {
      ...surveyConfig,
      title: surveyConfig.pageTitle
    },
    pages: Object.entries(pagesByMenu).map(([menu, page]) => page)
  });
})();
const surveyUiInput = Generators.input(surveyUiInputElement);



//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const syncSurveyUiInputToSurveyUi = () => {
  console.log("syncSurveyUiInputToSurveyUi");
  //if (!_.isEqual(viewof surveyUi.value, viewof surveyUiInput.value)) {
  if (!_.isEqual(surveyUi.value, surveyUiInput.value)) {
    console.log("syncSurveyUiInputToSurveyUi: change detected");
    //viewof surveyUi.value = viewof surveyUiInput.value;
    surveyUi.value = surveyUiInput.value;
      // Manually updating the UI state
      // viewof surveyUi.applyValueUpdates();
    //viewof surveyUi.dispatchEvent(new Event('input', {bubbles: true}))
    surveyUi.dispatchEvent(new Event('input', {bubbles: true}))
  }
}



const syncSurveyUIToSurveyUiOutput = () => {
  console.log("syncSurveyUIToSurveyUiOutput")
  // Reactive to UI changes (i.e. surveyUi)
  //if (!_.isEqual(viewof surveyUiOutput.value, surveyUi)) {
  if (!_.isEqual(surveyUiOutput.value, surveyUi)) {
    console.log("syncSurveyUIToSurveyUiOutput: change detected");
    //viewof surveyUiOutput.value = _.cloneDeep(surveyUi);
    surveyUiOutput.value = _.cloneDeep(surveyUi);
    //viewof surveyUiOutput.dispatchEvent(new Event('input', {bubbles: true}))
    surveyUiOutput.dispatchEvent(new Event('input', {bubbles: true}))
  }
}


const normalizedQuestions = Object.fromEntries([...csvToQuestions(questionsToCSV(questions)).entries()].map(reifyAttributes))


const normalizedQuestionsOutput = Object.fromEntries([...csvToQuestions(questionsToCSV(surveyOutput.questions)).entries()]
                     .map(reifyAttributes).filter(e => e[0] !== " "))


const logicalQuestionDiff = Object.fromEntries(Object.entries(
  diff.diff(normalizedQuestions, normalizedQuestionsOutput) || []
))

//const diff = require('https://bundle.run/json-diff@0.5.4')
import { diff } from "https://esm.sh/just-diff@6";



//viewof selectedQuestionDiff = Inputs.select(Object.keys(logicalQuestionDiff).map(k => k.replace("__deleted", '').replace("__added", '')), {label: "Select question diff"})
const selectedQuestionDiffElement = Inputs.select(Object.keys(logicalQuestionDiff).map(k => k.replace("__deleted", '').replace("__added", '')), {label: "Select question diff"})

const selectedQuestionDiff = Generators.input(selectedQuestionDiffElement)




//## Autosave UI

//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const autosave = () => {
  async function saveState() {
    console.log("saveState")
    await Promise.all([
    //  saveQuestions(viewof surveyOutput.value.questions),
    saveQuestions(surveyOutput.value.questions),
    //  saveLayout(viewof surveyOutput.value.layout),
    saveLayout(surveyOutput.value.layout),
    //  saveConfig(viewof surveyOutput.value.config)
    saveConfig(surveyOutput.value.config)
    ]);
    //await files.save("settings.json", viewof settings.value);
    await files.save("settings.json", settings.value);
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
  
  let first = true && settings.questions !== undefined;
  
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
    //viewof surveyOutput.addEventListener('input', autosave);
    surveyOutput.addEventListener('input', autosave);
    //invalidation.then(() => viewof surveyOutput.removeEventListener('input', autosave))
    invalidation.then(() => surveyOutput.removeEventListener('input', autosave))
    
    next("Autosave initialized")
  })
  
}


//## Export


const exportDataUri = URL.createObjectURL(new Blob([ JSON.stringify({
  ...surveyOutput,
  questions: Object.fromEntries(surveyOutput.questions.entries())
}) ], { type: 'application/json' }));



htl.html`<a href=${exportDataUri} download="survey_${Date.now()}.json">
  download survey.json
</a>`


//## Persistence


const files = ({
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


//viewof settings = Inputs.input(await files.load('settings.json'))
const settingsElement = Inputs.input(await files.load('settings.json'))

const settings = Generators.input(settingsElement)



//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const saveQuestions = async (questions) => {
  const name = `questions_${Date.now()}.json`
  await files.save(name, Array.from(questions.entries()))
  //viewof settings.value = {
  //settings.value = {
  settingsElement.value = {
    //...viewof settings.value,
    ///...settings.value,
    ...settingsElement.value,
    questions: [
      //...(viewof settings.value.questions || []),
      //...(settings.value.questions || []),
      ...(settingsElement.value.questions || []),
      name
    ]
  }
  return name;
}



const loadQuestions = async (name) => {
  const entries = await files.load(name)
  return new Map(entries);
}



const saveLayout = async (layout) => {
  const name = `layout_${Date.now()}.json`
  await files.save(name, layout);
  //viewof settings.value = {
  settings.value = {
    //...viewof settings.value,
    ...settings.value,

    layout: [
     // ...(viewof settings.value.layout || []),
      ...(settings.value.layout || []),

      name
    ]
  };
  return name;
}



const loadLayout = async (name) => await files.load(name)



const saveConfig = async (config) => {
  const name = `config_${Date.now()}.json`
  await files.save(name, config)
  //viewof settings.value = {
  settings.value = {
    //...viewof settings.value,
    ...settings.value,
    configs: [
      //...(viewof settings.value.configs || []),
      ...(settings.value.configs || []),
      name
    ]
  };
  return name;
}



const loadConfig = async (name) => await files.load(name)



async function saveVersion() {
  const name = `version_${Date.now()}.json`
  
  const version = ({
    //layout: viewof settings.value.layout.at(-1),
    layout: settings.value.layout.at(-1),
    //questions: viewof settings.value.questions.at(-1),
    questions: settings.value.questions.at(-1),
    //config: viewof settings.value.configs.at(-1)
    config: settings.value.configs.at(-1)
  });
  
  await files.save(name, version)
  
  //viewof settings.value = {
  settings.value = {
    //...viewof settings.value,
    ...settings.value,
    versions: [
    //  ...(viewof settings.value.versions || []),
    ...(settings.value.versions || []),
      name
    ]
  };
  
  //await files.save("settings.json", viewof settings.value);
  await files.save("settings.json", settings.value);
  
  return name;
}



const revertChanges = async function() {
  //const version = await files.load(viewof settings.value.versions.at(-1))
  const version = await files.load(settings.value.versions.at(-1))
  //viewof settings.value = {
    settings.value = {
    //...viewof settings.value,
    ...settings.value,
    configs: [
      //...(viewof settings.value.configs || []),
      ...(settings.value.configs || []),
      version.config
    ],
    questions: [
      //...(viewof settings.value.questions || []),
      ...(settings.value.questions || []),
      version.questions
    ],
    layout: [
      //...(viewof settings.value.layout || []),
      ...(settings.value.layout || []),
      version.layout
    ]
  };
  
  //await files.save("settings.json", viewof settings.value);
  await files.save("settings.json", settings.value);
  //viewof survey.dispatchEvent(new Event('input', {bubbles: true})) // reload everything
  survey.dispatchEvent(new Event('input', {bubbles: true})) // reload everything
}


// Core data inputs / mutables

//## Questions


//viewof questions = Inputs.input(new Map())
const questionsElement = Inputs.input(new Map());
const questions = Generators.input(questionsElement);
display(questionsElement)



// -- 



//## Layout


//viewof layoutData = Inputs.input([]);
const layoutDataElement = Inputs.input([]);
const layoutData = Generators.input(layoutDataElement);




//viewof surveyOutput = Inputs.input(undefined)
const surveyOutputElement = Inputs.input(undefined);
const surveyOutput = Generators.input(surveyOutputElement);


//viewof surveyUiOutput = Inputs.input(undefined);
const surveyUiOutputElement = Inputs.input(undefined);
const surveyUiOutput = Generators.input(surveyUiOutputElement);


//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const syncSurveyOutput = () => {
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
  //  ...viewof surveyConfig.value, // carry over initial state
    ...surveyConfig.value, // carry over initial state
    pageTitle: surveyUiOutput.metadata.title
  };
  
  // viewof surveyOutput.value = {
  surveyOutput.value = {
    questions,
    layout,
    config
  };
  //viewof surveyOutput.dispatchEvent(new Event('input', {bubbles: true}))
  surveyOutput.dispatchEvent(new Event('input', {bubbles: true}))
}








//viewof surveyConfig = Inputs.input()
const surveyConfigElement = Inputs.input()
const surveyConfig = Generators.input(surveyConfigElement);








// --



//!!!!!!!!!!!!!!!!!
// NOTE: re-defining to work with Framework's Mutable 
//!!!!!!!!!!!!!!!!!
//mutable initialLoadQuestions = (/* reload everything on choice change */ survey, false)
const initialLoadQuestions = Mutable(/* reload everything on choice change */ survey, false)

//const initialQuestionLoader = {
//  if (!initialLoadQuestions) {
//    mutable initialLoadQuestions = true;
//    viewof questions.value = await loadQuestions(settings.questions[settings.questions.length - 1])
//    viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
//  }
//  return "Initial Question Loader"
//}
const setInitialLoadQuestions = (value) => (initialLoadQuestions.value = value);

// One-shot loader that populates the questions input.
const initialQuestionLoader = async () => {
  if (!initialLoadQuestions.value) {
    // mark as loaded so this only runs once
    setInitialLoadQuestions(true);

    const latestQuestionsKey = settings.questions[settings.questions.length - 1];

    // Load the questions and push them into the input element.
    questionsInput.value = await loadQuestions(latestQuestionsKey);
    questionsInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return "Initial Question Loader";
};



//### Import external CSV of questions



//Question CSV import/export

//CSV → questions


//viewof questionUpload = fileInput({prompt: "Drop questions as a CSV file here"})
const questionUploadElement = fileInput({prompt: "Drop questions as a CSV file here"})
const questionUpload = Generators.input(questionUploadElement);



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
};



//!!!!!!!!!!!!!!!!!
// NOTE: Need to re-work this as an async function due to await
//!!!!!!!!!!!!!!!!!
const onQuestionUpload = async () => {
  //viewof questions.value = csvToQuestions(await questionUpload.csv());
  questions.value = csvToQuestions(await questionUpload.csv());
  //viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
  questions.dispatchEvent(new Event('input', {bubbles: true}));
};




// Questions → CSV

//### Export questions to CSV



const questionsToCSV = (questions) =>
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





const exportQuestionsCSV = questionsToCSV(questions)


const questionsCsvDataUri = URL.createObjectURL(new Blob([ await d3.csvFormat(exportQuestionsCSV) ], { type: 'text/csv' }));



//viewof questionsCsvDataUriView = Inputs.input(undefined)
const questionsCsvDataUriViewElement = Inputs.input(undefined);
const questionsCsvDataUriView = Generators.input(questionsCsvDataUriViewElement);


//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const updateQuestionsCsvDataUriView = () => {
  //viewof questionsCsvDataUriView.value = questionsCsvDataUri /* sync questionsCsvDataUri changes to the view */
  //questionsCsvDataUriView.value = questionsCsvDataUri /* sync questionsCsvDataUri changes to the view */
  questionsCsvDataUriViewElement.value = questionsCsvDataUri 
  //viewof questionsCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
  //questionsCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
  questionsCsvDataUriViewElement.dispatchEvent(new Event('input', {bubbles: true}))
}



const downloadQuestionsCsv = htl.html`<a href=${questionsCsvDataUriView} download="questions_${Date.now()}.csv">
  Download questions.csv
</a>
`





const exportQuestionsProblems = () => {
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







//### Import layout from CSV


//viewof layoutUpload = fileInput({prompt: "Drop layout as a CSV file here"})
const layoutUploadElement = fileInput({prompt: "Drop layout as a CSV file here"});
const layoutUpload = Generators.input(layoutUploadElement);



//!!!!!!!!!!!!!!!!!
// NOTE: Need to re-work this as an async function due to await
//!!!!!!!!!!!!!!!!!
const onLayoutUpload = async() => {
  //viewof layoutData.value = {data: csvToLayout(await layoutUpload.csv())}
  layoutData.value = {data: csvToLayout(await layoutUpload.csv())}
  //viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
  layoutData.dispatchEvent(new Event('input', {bubbles: true}))
};



function csvToLayout(csv) {
  return csv.reduce(
    (acc, row) => {
      acc.push(row)
      return acc
    }, []
  )
}


//### Export layout to CSV


const exportLayoutCSV = surveyOutput.layout


const layoutCsvDataUri = URL.createObjectURL(new Blob([ d3.csvFormat(exportLayoutCSV) ], { type: 'text/csv' }));



//viewof layoutCsvDataUriView = Inputs.input(undefined)
const layoutCsvDataUriViewElement = Inputs.input(undefined);
const layoutCsvDataUriView = Generators.input(layoutCsvDataUriViewElement);


//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
const updateLayoutCsvDataUriView = () => {
  //viewof layoutCsvDataUriView.value = layoutCsvDataUri
  //layoutCsvDataUriView.value = layoutCsvDataUri
  layoutCsvDataUriViewElement.value = layoutCsvDataUri
  //viewof layoutCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
  //layoutCsvDataUriView.dispatchEvent(new Event('input', {bubbles: true}))
  layoutCsvDataUriViewElement.dispatchEvent(new Event('input', {bubbles: true}))
}



const downloadLayoutCsv = htl.html`<a href=${layoutCsvDataUriView} download="layout_${Date.now()}.csv">
  Download layout.csv
</a>
${exportLayoutProblems.length > 0 ? md`<mark> Warning, some layouts are not exporting properly, you may lose data in export` : null}
`



//!!!!!!!!!!!!!!!!!
// NOTE: Adjusting this to define a Mutable and a setter function

const initialLoadLayout = Mutable(false)

//const initialLayoutLoader = {
//  if (!initialLoadLayout) {
//    mutable initialLoadLayout = true;
//    setLayout([...await loadLayout(settings.layout[settings.layout.length - 1])])
//  }
//  return "Initial Layout Loader"
//}
const initialLayoutLoader = async () => {
  if (!initialLoadLayout.value) {
    initialLoadLayout.value = true; // mark as loaded

    const latestLayoutKey = settings.layout[settings.layout.length - 1];
    const layout = await loadLayout(latestLayoutKey);
    setLayout([...layout]);
  }
  return "Initial Layout Loader";
};


const learnChoices = (data) => {
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


function setLayout(data) {
  const choices = learnChoices(data);
  
  menuOptions.data = choices["menu"]
  setOptions.data = choices["set"]
  //viewof menuOptions.dispatchEvent(new Event('input', {bubbles: true}))
  menuOptions.dispatchEvent(new Event('input', {bubbles: true}))
  //viewof setOptions.dispatchEvent(new Event('input', {bubbles: true}))
  setOptions.dispatchEvent(new Event('input', {bubbles: true}))
  
  
  layoutData.data = data;
  //viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
  layoutData.dispatchEvent(new Event('input', {bubbles: true}))
}




//### Export UI


const sampleExportUi = () => {
  questionsCsvDataUriView
  layoutCsvDataUriView
  return exportUi()
}



// NOTE: This previously referenced viewof for both URL values
const exportUi = () => {
  const now = Date.now();

  //return view`<div class="space-y-3">
  return viewUI`<div class="space-y-3">
  <div>
    <a href=${questionsCsvDataUriView.value} download="questions_${Date.now()}.csv">Download Questions</a>
  </div>

  <div>
    <a href=${layoutCsvDataUriView.value} download="layout_${Date.now()}.csv">Download Layout</a>
  </div>
</div>`
}


//### Import UI



const importUi = (afterSave) => {
  const submitFiles = async ()  => {
    if (ui.value.questionsCsv) {
      console.log('Updating questions CSV')
      //viewof questions.value = csvToQuestions(await ui.value.questionsCsv.csv());
      questions.value = csvToQuestions(await ui.value.questionsCsv.csv());
    }

    if (ui.value.layoutCsv) {
      console.log('Updating layout CSV')
      //viewof layoutData.value = {data: csvToLayout(await ui.value.layoutCsv.csv())}
      layoutData.value = {data: csvToLayout(await ui.value.layoutCsv.csv())}
    }

    if (ui.value.questionsCsv || ui.value.layoutCsv) {
      //viewof questions.dispatchEvent(new Event('input', {bubbles: true}));
      questions.dispatchEvent(new Event('input', {bubbles: true}));
      //viewof layoutData.dispatchEvent(new Event('input', {bubbles: true}))
      layoutData.dispatchEvent(new Event('input', {bubbles: true}))
    }

    if (typeof afterSave === 'function') {
      afterSave();
    }
  }
  const submit = Inputs.button(buttonLabel({label: "Save"}), {reduce: submitFiles});
  
  //const ui = view`<div class="space-y-3">
  const ui = viewUI`<div class="space-y-3">
  <h3 class="f5">Questions CSV file</h3>
  ${['questionsCsv', fileInput({prompt: "Drop questions as a CSV file here"})]}
  <h3 class="f5">Layout CSV file</h3>
  ${['layoutCsv', fileInput({prompt: "Drop layout as a CSV file here"})]}
  <div>
    ${submit}
  </div>`
  
  return ui;
}


//### Edit user choices within the layout Editors


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
  //const addForm = view`<div style="display: flex;">
   const addForm = viewUI`<div style="display: flex;">
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

  //return view`<div><details>
  return viewUI`<div><details>
      <summary>Edit choices for <b>${title}</b></summary>
      ${['...', choices]}${cautious(() => addForm)}
  `
}



//viewof menuOptions = selection("menu")
const menuOptionsElement = selection("menu");
const menuOptions = Generators.input(menuOptionsElement);



//viewof setOptions = selection("set")
const setOptionsElement = selection("set");
const setOptions = Generators.input(setOptionsElement);


//### Layout Data


//viewof layout = Inputs.input(layoutData)
const layoutElement = Inputs.input(layoutData);
const layout = Generators.input(layoutElement);
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




//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!! NOTE: Errors start below
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!






//## Data Quality Checks

//### Questions that have no layout


() => {
  const results = [...questionsNoLayout.entries()].map(([k, v]) => ({id: k, ...v}));
  if (results.length > 0) {
    return dataEditor(results, {
      columns: ["id", "type"]
    })
  } else {
    return md`✅ The are no questions with no layout`
  }
}


//### Layouts with no question


() => {
  const results = layoutsNoQuestion.map(([name, layoutArray]) => layoutArray[0]);
  if (results.length > 0) {
    return dataEditor(results)
  } else {
    return md`✅ The are no layouts with no questions`
  }
}


//### Questions with options but some of the options do not have a 'value'



() => {
  if (optionsWithoutValue.length > 0) {
    return md`⚠️ There are ${optionsWithoutValue.length} mistakes
  ${optionsWithoutValue.map(mistake => `\n- ${mistake[1].cell_name}`)}`
  } else {
    return md`✅ All options have a value defined`
  }
}



const optionsWithoutValue = [...surveyOutput.questions.entries()].map(([k, q]) => [k, reifyAttributes(q)]).filter(([name, question]) => question.options &&  !question.options.some(option => option.value))


const layoutById = d3.group(layout.data, d => d.id)


const duplicateLayouts = Object.fromEntries([...layoutById.entries()].filter(([name, layoutArr]) => layoutArr.length  > 1))


const questionsNoLayout = new Map([...questions.entries()].filter(([name, q]) => !layoutById.has(name)))


const layoutsNoQuestion = ([...layoutById.keys()].filter(name => !surveyOutput.questions.has(name))).map(k => [k, layoutById.get(k)])



const exportLayoutProblems  = () => {
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


//## Config



//viewof latestConfig = editor({
const latestConfigElement = editor({
  type: "object",
  title: "Config",
  properties: {
    pageTitle: {
      type: "string"
    },
    menuSegmentLabels: {
      type: "object",
      additionalProperties: { type: "string" }
    }
  }
}, {
  theme: "spectre",
  disable_edit_json: true,
  disable_properties: false,
  iconlib: "spectre",
  show_errors: "always",
  prompt_before_delete: "false"
});
const latestConfig = Generators.input(latestConfigElement);




//viewof configImportInput = Inputs.text({
const configImportInputElement = Inputs.text({
  placeholder: "paste new config as JSON here",
  submit: true,
  minlength: 3
});
const configImportInput = Generators.input(configImportInputElement);



//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!
// NOTE: Need to re-work this as an async function due to await
//!!!!!!!!!!!!!!!!!
const configImporter = async () => {
  const config = JSON.parse(configImportInput);
  // viewof surveyConfig.value = config
  surveyConfig.value = config
  await saveConfig(config)
  //await files.save("settings.json", viewof settings.value);
  await files.save("settings.json", settings.value);
  //viewof surveyConfig.dispatchEvent(new Event('input', {bubbles: true}))
  surveyConfig.dispatchEvent(new Event('input', {bubbles: true}))
  return "OK"
}



//!!!!!!!!!!!!!!!!!
// NOTE: Need to re-work this as an async function due to await
//!!!!!!!!!!!!!!!!!
const save_config = async function* () {
  //if (viewof surveyConfig.value && !_.isEqual(latestConfig, viewof surveyConfig.value)) {
  if (surveyConfig.value && !_.isEqual(latestConfig, surveyConfig.value)) {
    yield md`Saving...`
    //viewof surveyConfig.value = latestConfig;
    surveyConfig.value = latestConfig;
    await saveConfig(latestConfig);
    //await files.save("settings.json", viewof settings.value);
    await files.save("settings.json", settings.value);
    yield md`saved`
  } else {
    yield md`no changes`
  }
}



const sync_ui = () => {
  //viewof latestConfig.value = surveyConfig
  latestConfig.value = surveyConfig
}


//!!!!!!!!!!!!
// NOTE: This configuration needs to be checked
//!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!
// NOTE: Need to re-work this as an async function due to await
//!!!!!!!!!!!!!!!!!
const load_config = async () => {
  //viewof surveyConfig.value = settings.configs?.length > 0 
  surveyConfig.value = settings.configs?.length > 0 
                                ? await loadConfig(settings.configs[settings.configs.length - 1])
                                : {};
  //viewof surveyConfig.dispatchEvent(new Event('input', {bubbles: true}))
  surveyConfig.dispatchEvent(new Event('input', {bubbles: true}))
}


//!!!!!!!!!!!!!!!!!
// NOTE: This is newly included for testing
//!!!!!!!!!!!!!!!!!
const loaders = [initialQuestionLoader, initialLayoutLoader, load_config];
export { loaders };



//import {editor} from "@a10k/hello-json-editor"
import {editor} from "/components/hello-json-editor.js"


//## Styles


const styles = html`<style>
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


//### Styles for the in notebook demo

```html
<style>
  .survey-ui {
    overflow-y: auto;
    max-height: 600px;
    overscroll-behavior-y: contain;
  }
</style>
```



const surveyPreviewTitle = md`## Survey Preview`



//const responses = view(surveyView(surveyOutput.config.style, surveyOutput.questions, surveyOutput.layout, surveyOutput.config, new Map(), {
const responsesElement = surveyView(
  surveyOutput.config.style,
  surveyOutput.questions,
  surveyOutput.layout,
  surveyOutput.config,
  new Map(),
  {
    putFile: (name) => console.log("mock save " + name),
    getFile: (name) => console.log("mock get " + name)
  }
);
const responses = Generators.input(responsesElement);




surveyOutput.config


//## Preview Answers


responses


//## Revert changes


//viewof reollbackButton = Inputs.button("revert", {
const reollbackButtonElement = Inputs.button("revert", {
  reduce: async () => {
    await revertChanges();
  }
});
const reollbackButton = Generators.input(reollbackButtonElement);




export {
  // pass-through
  bindLogic,
  createQuestion,
  manualCredentialsElement,
  manualCredentials,
  saveCredsElement,
  saveCreds,

  // main UI
  survey,
  surveyUiElement,
  surveyUi,

  // CSV import/export
  csvToQuestions,
  questionsToCSV,
  exportUi,
  importUi,
  onQuestionUpload,
  onLayoutUpload,

  // persistence & autosave
  autosave,
  saveQuestions,
  saveLayout,
  saveConfig,
  saveVersion,
  revertChanges,
  syncSurveyOutput,
  initialQuestionLoader,
  initialLayoutLoader,
  load_config,
  save_config,

  // layout helpers
  setLayout,
  learnChoices,

  // misc / helpers
  md,
  sanitizeValue,
  surveyConfig,
  surveyOutput,
  layout,
  questions,
  styles
};
