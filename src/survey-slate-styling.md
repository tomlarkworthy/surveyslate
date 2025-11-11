# Survey Slate | Styling

_Exposing a method to take survey information and wrap it in HTML for display._



```js
import markdownit from "markdown-it";
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




<style>
  /* Base (light) theme */
  .welcome-note {
    --note-bg: #e0ffff;     /* Light: pale cyan */
    --note-fg: #0b3d3d;     /* Light: deep teal text */
    --note-border: #9edede; /* Light: soft border */
    max-width: ${width/1.75}px;
    margin: 30px 0;
    padding: 15px 30px;
    background-color: var(--note-bg);
    color: var(--note-fg);
    border: 1px solid var(--note-border);
    border-radius: 10px;
    font: 700 18px/24px sans-serif;
  }

  /* Dark theme override when the browser prefers dark mode */
  @media (prefers-color-scheme: dark) {
    .welcome-note {
      --note-bg: #0f1f24;     /* Dark: deep blue-green */
      --note-fg: #d8ffff;     /* Dark: soft cyan text */
      --note-border: #245a61; /* Dark: subtle border */
    }
  }
</style>

<div class="welcome-note">${md`👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨`}</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->


test credentials for demoEditor

        ~~~js
        {
          "accessKeyId": "AKIAQO7DBPIFDAUBK4SL",
          "secretAccessKey": "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"
        }
        ~~~


```js echo
//viewof manualCredentials
display(manualCredentialsElement)
//manualCredentials
```


```js echo
display(saveCredsElement)
//saveCreds
```

### Choose Survey Source for demo data

```js echo
//viewof survey
display(surveyElement)
//survey
```
```js echo
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, mfaCode, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} from '/components/aws.js';
```

```js echo
//import {viewof manualCredentials, viewof survey, saveCreds, questions, layout, viewof surveyConfig, initialQuestionLoader, initialLayoutLoader, load_config, createQuestion, bindLogic} from '@categorise/surveyslate-designer-tools'
//import {manualCredentials, survey, saveCreds, questions, layout, surveyConfig, initialQuestionLoader, initialLayoutLoader, load_config, createQuestion, bindLogic} from '/components/surveyslate-designer-tools.js'
//import {survey, surveyElement, questions, layout, surveyConfig, initialQuestionLoader, initialLayoutLoader, load_config, createQuestion, bindLogic} from '/components/surveyslate-designer-tools.js'

import {initialQuestionLoader, initialLayoutLoader, load_config, createQuestion, bindLogic} from '/components/surveyslate-designer-tools.js'

import {localStorageView} from '/components/local-storage-view.js';

import {config} from '/components/survey-slate-configuration.js';
```

```js echo
const me = await getUser();
display(me)

const myTags = await listUserTags(me.UserName);
display(myTags)

const surveys = myTags['designer'].split(" ");

const surveyElement = Inputs.bind(
  Inputs.select(surveys, { label: "survey" }),
  localStorageView("designer-project", {
    defaultValue:
      new URLSearchParams(location.search).get("survey") ||
      surveys[0]
  })
);
const survey = Generators.input(surveyElement);

const questionsElement = Inputs.input(new Map());
const questions = Generators.input(questionsElement);

const layoutDataElement = Inputs.input([]);
const layoutData = Generators.input(layoutDataElement);

const layoutElement = Inputs.input(layoutDataElement);
const layout = Generators.input(layoutElement);

const surveyConfigElement = Inputs.input()
const surveyConfig = Generators.input(surveyConfigElement);


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

const settingsElement = Inputs.input(await files.load('settings.json'));
const settings = Generators.input(settingsElement);


const loadConfig = async (name) => await files.load(name)
```

```js echo
import {manualCredentialsElement, manualCredentials, saveCredsElement, saveCreds} from '/components/aws.js'
```



```js echo
//import {styles as componentStyles, pagination} from '@categorise/survey-components'
//import {styles as componentStyles, pagination} from '/components/survey-components.js';

const ns = Inputs.text().classList[0]

const colorBoxStyle = html`<style>
  .color-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: #ccc;
    height: 2rem;
    width: 2rem;
    border-radius: .25rem;
    font-weight: bold;
    color: white;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .color-box--lg {
    height: 2.5rem;
    width: 2.5rem;
  }
</style>`

const aggregateSummaryStyle = html`<style>
  .aggregate-summary {}  
</style>`

const tableStyles = html`<style>
form.${ns} {
  width: auto;
}

.table-ui-wrapper {
  overflow-x: auto;
}

.table-ui {
  width: 100%;
  border-collapse: collapse;
}

.table-ui td,
.table-ui th {
  padding: 0.25rem 0.5rem 0.25rem 0;
  vertical-align: middle;
}

.table-ui th {
  text-align: left;
}

.table-ui th > * {
  margin: 0;
}

.table-ui td > input[type=number] {
  width: 60px;
}

.table-ui .subtotal {
  padding: 0.25rem 0;
}

.table-ui th .${ns}-input {
  min-width: 120px;
}

/* Match Observable Input description styles */
.table-ui-caption {
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 3px;
}

/* Don't reduce font size lower than 0.85rem with <small> */
.table-ui-caption small {
  font-size: 0.85rem;
}
</style>`;

const formInputStyles = html`<style>
/* For @jashkenas/inputs */
/* Important seems to be the only way to override inline styles */
form label[style] {
  font-size: 1rem !important;
  display: block !important;
}

form div div,
form label[style] {
  line-height: var(--lh-copy, 1.3) !important; /* .lh-copy */
  margin: 0 !important;
}

form div + label[style], 
form label[style] + label[style], 
form label[style] + button + div,
form label[style] + div { 
  margin-top: var(--spacing-small, .5rem) !important;
} 

form textarea[style] {
  width: 100% !important;
}

form[data-form-type="checkbox-plus-plus"] label[style] ,
form[data-form-type="clearable-radio"] label[style] {
  display: grid !important;
  grid-template-columns: 1em auto;
  gap: var(--spacing-extra-small, .25rem);
  align-items: start;
}

form[data-form-type="clearable-radio"] input[type="radio"],
form[data-form-type="checkbox-plus-plus"] input[type="checkbox"] {
  margin-left: 0 !important;
  margin-top: 0.25rem !important;
}

form[data-form-type="clearable-radio"] div {
  grid-template-columns: 1fr minmax(120px, max-content);
  grid-gap: 0 1rem;
  grid-auto-flow: column;
}

form[data-form-type="clearable-radio"] div > *  {
  grid-column: 1;
}

form[data-form-type="clearable-radio"] div > div:first-child,
form[data-form-type="clearable-radio"] div > div:last-child {
  grid-column: 1/-1;
}

form[data-form-type="clearable-radio"] div > button  {
  grid-column: 2;
  align-self: start;
  justify-self: end;
}

form[data-form-type="clearable-radio"] div > button {
  margin-top: .5rem;
}

@media screen and (min-width: 30em) {
  form[data-form-type="clearable-radio"] > div {
    display: grid;
  }
}

.secondary-button {
  font-size: .875rem; /* .f6 */
  border: 1px solid currentColor;
  padding: var(--spacing-extra-small);
  color: var(--brand) !important;
  background-color: white;
  font-family: var(--brand-font);
  border-radius: var(--border-radius-1);
}

.secondary-button:hover,
.secondary-button:focus,
.secondary-button:active {
  background-color: #f4f4f4; /* near-white */
}

.secondary-button[disabled] {
  color: #999 !important; 
  background-color: white;
  cursor: not-allowed;
}

/* For @observable/inputs */
form.${ns} label {
  display: block;
}
</style>`


const componentStyles = html`<style>
  ${colorBoxStyle.innerHTML}
  ${aggregateSummaryStyle.innerHTML}
  ${tableStyles.innerHTML}
  ${formInputStyles.innerHTML}
</style>`


const pagination = ({previous, next, hashPrefix = "", previousLabel = "← Go back", nextLabel ="Proceed →"} = {}) => {
  const prevLink = previous ? html`<a class="[ pagination_previous ][ brand no-underline underline-hover ]" href="#${hashPrefix}${previous}">${previousLabel}</a>` : "";
  const nextLink = next ? html`<a class="[ pagination_next ][ ml-auto pv2 ph3 br1 ][ bg-brand text-on-brand hover-bg-accent no-underline ]" href="#${hashPrefix}${next}">${nextLabel}</a>` : "";

  return html`<nav class="[ pagination ][ f5 ][ flex items-center ]">
  ${prevLink} ${nextLink}
</nav>`
}


display(componentStyles);
display(pagination);
```

```js echo
const loaders = [initialQuestionLoader, initialLayoutLoader, load_config]
```

## Brand

```js echo
//viewof brand = Inputs.color({label: "Brand Color", value: mainColors[900]})
const brand = view(Inputs.color({label: "Brand Color", value: mainColors[900]}))
```

```js echo
//viewof accent = Inputs.color({label: "Accent Color", value: accentColors[900]})
const accent = view(Inputs.color({label: "Accent Color", value: accentColors[900]}))
```

```js echo
//viewof font = Inputs.textarea({label: "Font Stack", value: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'})
const font = view(Inputs.textarea({label: "Font Stack", value: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'}))
```

```js echo
// This config needs to be part of account or survey config
const brandConfig = ({
  colors: {
    brand: brand, // or, provide and color hex code
    accent: accent, // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff",
  },
  fonts: {
    "brand-font": font
  }
})
```

```js echo
() => {
  loadStyles(brandConfig)
  return md`*Install CSS styles for use within Observable even if \`surveyView\` is not executed*`
}
```

```js
md`### Config`
```

```
js echo
//!!!!!!!!!!!!!!!!!!!!!!!!
//NOTE: We have to re-enable this after we get other code working.
//!!!!!!!!!!!!!!!!!!!!!!!!
//const script = ({
//  hashPrefix = ''
//} = {}) => html`<script>
//  ${updateMenu}
//  window.addEventListener('hashchange', () => updateMenu);
//  updateMenu();
//</script>`
```

### Enable Javascript Snippet

```
js
//const enableJavascriptContent = md`⚠️ Javascript is required to run this application. Please enable Javascript on your browser to continue.`
```

```
js echo
//!!!!!!!!!!!!!!!!!!!!!!!!
//NOTE: We have to re-enable this after we get other code working.
//!!!!!!!!!!!!!!!!!!!!!!!!
//const enableJavasscriptSnippet = html`<noscript class="noscript">
//   ${enableJavascriptContent.outerHTML}
//</noscript>`
```

## Survey View

```js echo
const surveyView = (questions, layout, config, answers, options) => {
  addMenuBehaviour
  loadStyles(brandConfig)
  const sections = d3.group(layout, d => d['menu'])
  const survey = viewUI`
    ${custom_css()}
    ${header(sections, config, options)}
    <main id="main-content" class="bg-near-white">
      <article data-name="article-full-bleed-background">
      ${['...', sectionsView(questions, layout, config, sections, answers, options)]}
      </article>
    </main>
    ${pageFooter()}
  `
  return survey;
}
```

```js echo
//viewof exampleSurvey = surveyView(questions, layout.data, surveyConfig, new Map(), {
const exampleSurvey = view(surveyView(questions, layout.data, surveyConfig, new Map(), {
  hashPrefix: 'foo|'
}))
```

```js echo
exampleSurvey
```

#### Custom CSS

```js echo
const custom_css = () => html`
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap');
  body {
    font-family: ${brandConfig.fonts['brand-font']}
  }
  :root {
    --lh-copy: 1.3;
  }
  .nav {}

  .hide { display: none;}

  .sticky-top {
    position: sticky;
    top: 0;
  }
  .sticky-bottom {
    bottom: 0;
  }
  .lh-copy {
      line-height: var(--lh-copy);
  }

  a:not(class) {
    text-decoration: none;
    color: var(--brand);
  }

  a:not(class):hover,
  a:not(class):focus,
  a:not(class):active {
    text-decoration: underline;
  }

  ${componentStyles.innerHTML}
</style>
`
```

```js echo
const navActiveClasses = ["bg-accent", "active"] // 'active' not used for styling. It's retained just in case it is used JS
```

## Body Header

```js echo
header(d3.group(layout.data, d => d['menu']), surveyConfig, {
  layout: 'relative',
  hashPrefix: "foo|"
})
```

```js echo
const header = (sections, config, {
  hashPrefix = '',
  layout = "sticky-top"
} = {}) => html`<header class="[ ${layout} nav-custom shadow-1 ][ w-100 ]">
${pageHeader([config.pageTitle])}
<!--<span class="[ pl2 dib mr3 mt1 mb2 ][ f4 ][ white ]">${config.pageTitle}</span>-->
${pageMenu(sections, config, {
  hashPrefix
})}
</header>`
```

## Menu

```js echo
pageMenu(d3.group(layout.data, d => d['menu']), surveyConfig)
```

```js echo
const pageMenu = (sections, config, {
  hashPrefix = ''
} = {}) => {
  // organize
  const tree = organizeSections(sections); 
  const menuDOM = html`
  <nav class="f6 fw6 tracked-light">
    <div class="[ flex pl5-ns overflow-x-auto no-scrollbar ][ bg-brand ]">
    ${[...tree.keys()].map(code => {
        if (code === 'hidden') return '';
        // if the menu has children  
        const link = `#${hashPrefix}${tree.get(code).length > 0 ? `${code}/${tree.get(code)[0]}` : `${code}`}`
        const label = config.menuSegmentLabels?.[code] || code;
        return htl.html.fragment`<a
          class="[ nav nav-1 dib ph3 pv2 nowrap ][ no-underline text-on-brand hover-text-on-brand hover-bg-accent ] ${window.location.hash.startsWith(link) ? navActiveClasses.join(' ') : ''}"
          href="${link}">${label}</a>`
      }
    )}
    </div>
    <div class="[ flex pl5-ns overflow-x-auto no-scrollbar ][ bg-text-on-brand ]">
      ${[...tree.keys()].map(parent => {
        return htl.html.fragment`${
          tree.get(parent).map(code => {
            const link = `#${hashPrefix}${`${parent}/${code}`}`;
            const label = config.menuSegmentLabels?.[code] || code;
            const topLayerNav = link.split("/")[0];
            return html`<a
              class="[ nav nav-2 dib nowrap pa2 ph3 ][ no-underline tc black-90 hover-text-on-brand hover-bg-accent ]"
              href="${link}">${label}</a>`;
          })}`;
        })  
      }
    </div>
  </nav>
`
  updateMenu(menuDOM);
  return menuDOM;
}
```

```js echo
const organizeSections = (sections) => d3.rollup([...sections.keys()].map(path => path.split("/")), (children) => children.map(child => child[1]).filter(_ => _), d => d[0])
```

```js echo
const addMenuBehaviour = () => {
  window.addEventListener('hashchange', updateMenu);
  invalidation.then(() => window.removeEventListener('hashchange', updateMenu));
  updateMenu()

}
```

```js echo
const updateMenu = (dom = document) => {
  if (!dom.querySelectorAll) dom = document;
  
  // The top layer of the menu is always visible, but only one tab is highlighted
  [...dom.querySelectorAll(".nav-1")].forEach(nav => {
    const navHash = "#" + nav.href.split("#")[1].split("/")[0]
    if (window.location.hash.startsWith(navHash)) {
      nav.classList.add(...navActiveClasses);
    } else {
      nav.classList.remove(...navActiveClasses)
    }
  });
  // The 2nd layer of menu only has the options relevant to the top layer
  // And then the specific section within that layer is highlighted
  [...dom.querySelectorAll(".nav-2")].forEach(nav => {
    const navHash = nav.href.split("#")?.[1]
    const topLayerNav = navHash.split("/")?.[0];
    if (window.location.hash.length < 1) return;
    const topLayerWindow = window.location.hash.split('#')[1].split("/")[0];
    console.log(topLayerNav, topLayerWindow)

    const nav2ActiveClasses = [...navActiveClasses, "text-on-brand"];
    if (topLayerNav !== topLayerWindow) {
      nav.classList.add("hide")
    } else {
      nav.classList.remove("hide")
      if ("#" + navHash === window.location.hash) {
        nav.classList.add(...nav2ActiveClasses)
      } else {
        nav.classList.remove(...nav2ActiveClasses)
      }
    }
  });
  // Due to Observablehq framing, the CSS :target selector for show/hide sections based on hash does not
  // work properly. So we manually toggle it.
  [...dom.querySelectorAll("[data-survey-section]")].forEach(section => {
    if (`#${section.id}` === window.location.hash) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });

  if (isSurveyStandalone()) {
    scrollToTop();
  }
}
```

```js echo
const isSurveyStandalone = () => document.body.dataset.standaloneSurvey === "true";
```

```js echo
const scrollToTop = () => window.scrollTo(0,0);
```

```js echo
[...d3.group(layout.data, d => d['menu']).keys()]
```

## Images

```js echo
async function resolveObject(obj) {
  return Object.fromEntries(await Promise.all(
    Object.entries(obj).map(async ([k, v]) => [k, await v])
  ));
}
```

```js echo
const images = resolveObject({
  "mainstream": FileAttachment("core_mainstream@1.jpg").url(),
  "operation": FileAttachment("core_operation@1.jpg").url(),
  "intro": FileAttachment("intro@3.jpg").url(),
  "default": FileAttachment("core_intro@1.jpg").url(),
})
```

```js echo
function imageFor(section) {
  if (section.includes("mainstream")) {
    return images.mainstream;
  } else if (section.includes("operation")) {
    return images.operation;
  } else if (section.includes("intro")) {
    return images.intro;
  } else {
    return images['default']
  }
}
```

## Content

Note you need a menu option selected for the example below to render


```js echo
//viewof sectionViewExample = sectionsView(questions, layout.data, surveyConfig, d3.group(layout.data, d => d['menu']))
const sectionViewExample = view(sectionsView(questions, layout.data, surveyConfig, d3.group(layout.data, d => d['menu'])))
```

```js echo
sectionViewExample
```

```js echo
const sectionsView = (questions, layout, config, sections, answers = new Map(), {
    hashPrefix = '',
    putFile,
    getFile
  } = {}) => {
  const cells = new Map([...questions.entries()].map(([id, q], index) => [id, createQuestion({
    ...q,
    value: answers.get(id)
  }, index, {
    putFile, getFile
  })]));
  
  bindLogic(cells, layout)
  
  // We inject the views as just pure presentation
  const sectionViews = [...sections.keys()].map(sectionKey => sectionView(config, cells, sections, sectionKey, {
    hashPrefix
  }))
  // But we also want the questions inside the sections bound as a single flat list of questions.
  // It should be flat as we don't want layout information leaking into data access model, e.g. we don't want
  // moving a question to a different section to invalide persisted answers.
  let questionViews = sectionViews.reduce(
    (questions, section) => {
      // Copy over section propties (which are views of questions) into growing mega object of views)
      return Object.assign(questions, section)
    }, {}
  )
  // Some questions are undefined if they cannot be looked up, we need to filter those out
  questionViews = Object.fromEntries(Object.entries(questionViews).filter(([k , v]) => v));
  
  const container = viewUI`<div class="black-80">
        ${sectionViews}
      ${/* put our questions as hidden view*/ ['_...', questionViews]}
    </div>`
  return container;
}
```

```js echo
//viewof exampleSectionView = {
const exampleSectionView = view(() => {
  const sections = d3.group(layout.data, d => d['menu']);
  return sectionView(surveyConfig, 
  new Map([...questions.entries()].map(([id, q]) => [id, createQuestion(q)])), 
  sections,
  layout.data[0].menu)
})
```

```js echo
exampleSectionView
```

```js echo
const sectionView = (config, cells, sections, sectionKey, {
    hashPrefix = ''
  } = {}) => {
  const suffix = sectionKey.split("/").pop();
  const subtitle = config.menuSegmentLabels?.[suffix] || suffix;
  
  const orderedQuestions = sections.get(sectionKey).map(layoutRow => {
    let cell = cells.get(layoutRow.id)
    if (cell === undefined) {
      cell = md`<mark>Error question not-found for ${layoutRow.id}</mark>`
    }
    cell.id = layoutRow.id
    return cell;
  });
  
  const pageKeys = paginationKeys(sections, sectionKey);
  const paginationEl = pagination({...pageKeys, hashPrefix});
                        
  // background-position-x is set to 4rem, which is approximate height of the header
  return viewUI`<section id="${hashPrefix}${sectionKey}" 
                       data-survey-section="${hashPrefix}${sectionKey}"
                       class="pa2 pa4-ns pl5-l"
                       style="background: #f4f4f4 url(${imageFor(sectionKey)});
                              background-size: cover;
                              background-attachment: fixed;
                              background-position: center 4rem;
                              background-repeat: no-repeat;
                              display: ${location.hash === `#${hashPrefix}${sectionKey}`? 'block' : 'none'};
                             ">
  <div class="bg-white shadow-2 f4 measure-wide mr-auto">
    <div class="ph4 pt3 pb0 f5 lh-copy">
      <!-- <h1 class="mt0 mb4">${subtitle}</h1> -->
      <div class="db">
        ${['...', orderedQuestions.reduce((acc, q) => Object.defineProperty(acc, q.id, {value: q, enumerable: true}), {})]}
      </div>
    </div>
    
    <div class="sticky bottom-0">
      <div class="ph4 pv3 bt b--black-10 bg-near-white">
      ${paginationEl}
      </div>
    </div>
  </div>
</section>`
}
```

```js echo
const paginationKeys = (sections, key) => {
  const tree = organizeSections(sections);
  const keys = [...tree.keys()].reduce((acc, parent) => {
    const subsections = tree.get(parent);
    if (subsections.length > 0) {
      return [
        ...acc,
        ...(subsections.map(sb => `${parent}/${sb}`))
      ]
    }
    return [...acc, parent];
  }, []);

  let previous;
  let next;

  const currentIndex = keys.findIndex(k => k === key);
  if (currentIndex > 0) {
    previous = keys[currentIndex - 1];
  }

  if (currentIndex < (keys.length - 1)) {
    next = keys[currentIndex + 1];
  }

  return {
    previous, next,
  }
}
```

```js echo
questions
```

---


## Styles for the demos in this notebook

These styles are to negate Observable styles overriding the component styles.

```js echo
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!NOTE: We need to re-introduce these once we have everything working.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//const stylesForNotebooks = html`<style>
//a[href].nav {
//  color: var(--text-on-brand);
//}
//
//a[href].nav:hover {
//  text-decoration: none;
//}
//
//.black-90 {
//  color: rgba(0,0,0,.9) !important;
//}`
```

```js
function getDownloadUrlForHtml(html) {
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}
```

```js echo
//import {button, text} from "@jashkenas/inputs"
import {button, text} from "/components/inputs.js"

```

```js echo
//import {view} from '@tomlarkworthy/view'
import {viewUI} from '/components/view.js'
```

```js echo
//import {mainColors, accentColors} from "@categorise/brand"
import {mainColors, accentColors} from "/components/brand.js"

```

```js echo
//import {loadStyles} from '@categorise/tachyons-and-some-extras'
import {loadStyles} from '/components/tachyons-and-some-extras.js'
```

```js echo
//import { pageHeader, pageFooter } from "@categorise/gesi-survey-common-components"
import { pageHeader, pageFooter } from "/components/surveyslate-common-components.js"
```


```js
//import { substratum } from "@categorise/substratum"
```

```js
//substratum({ invalidation })
```
