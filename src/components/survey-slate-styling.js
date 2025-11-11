//# GESI Survey | Styling


//======================================
// Imports
//======================================

import * as htl from "/components/htl@0.3.1.js";

const html = htl.html

import markdownit from "npm:markdown-it";

import {FileAttachment} from "observablehq:stdlib";


//import {viewof manualCredentials, viewof survey, saveCreds, questions, layout, viewof surveyConfig, initialQuestionLoader, initialLayoutLoader, load_config, createQuestion, bindLogic} from '@adb/gesi-survey-designer-tools'
import {
  manualCredentials,
  survey,
  saveCreds,
  questions,
  layout,
  surveyConfig,
  initialQuestionLoader,
  initialLayoutLoader,
  load_config,
  createQuestion,
  bindLogic
} from "/components/gesi-survey-designer-tools.js";

//import {styles as componentStyles, pagination} from '@adb/gesi-survey-components'
import {
  styles as componentStyles,
  pagination
} from "/components/gesi-survey-components.js";

//import {button, text} from "@jashkenas/inputs";
import { button, text } from "/components/inputs.js";

//import {view} from '@tomlarkworthy/view'
import { viewUI } from "/components/view.js";

//import {mainColors, accentColors} from "@adb/brand"
import { mainColors, accentColors } from "/components/brand.js";

//import {loadStyles} from '@adb/tachyons-and-some-extras'
import { loadStyles } from "/components/tachyons-and-some-extras.js";

//import {pageHeader, pageFooter} from "@adb/gesi-survey-common-components"
import { pageHeader, pageFooter } from "/components/gesi-survey-common-components.js";


//======================================
// Markdown helper
//======================================

const Markdown = new markdownit({ html: true });

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


//======================================
// Loaders for configuration
//======================================

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!! -- NOTE THIS SHOULD BE WORKING //  REVERT ONCE IMPORT ABOVE IS FIXED
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//const loaders = initialQuestionLoader, initialLayoutLoader, load_config
//const loaders = [initialQuestionLoader, initialLayoutLoader, load_config];
import { loaders } from "/components/gesi-survey-designer-tools.js";
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


//## Brand

// This config needs to be part of account or survey config
export const brandConfig = {
  colors: {
    brand: mainColors[900], // or, provide and color hex code
    accent: accentColors[900], // or, provide and color hex code
    // The color of text which are usually displayed on top of the brand or accent colors.
    "text-on-brand": "#ffffff"
  },
  fonts: {
    "brand-font": `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
  }
};

// Install styles (for Observable-like environments)
export const installBrandStyles = () => {
  loadStyles(brandConfig);
  return md`*Install CSS styles for use within Observable even if \`surveyView\` is not executed*`;
};


//### Config (menu script injection)

export const script = ({ hashPrefix = "" } = {}) => html`<script>
  // Attach updateMenu to hash changes if it exists on window
  window.addEventListener("hashchange", function () {
    if (window.updateMenu) window.updateMenu();
  });
  if (window.updateMenu) window.updateMenu();
</script>`;


//### Enable Javascript Snippet

const enableJavascriptContent = md`⚠️ Javascript is required to run this application. Please enable Javascript on your browser to continue.`;

const enableJavasscriptSnippet = html`<noscript class="noscript">
   ${enableJavascriptContent.outerHTML}
</noscript>`;

// Keep original (typo) name, but also export a correctly spelled alias
export { enableJavasscriptSnippet };
export const enableJavascriptSnippet = enableJavasscriptSnippet;


//## Survey View – high-level entrypoint

//#### Custom CSS

export const custom_css = () => html`
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
    z-index: 1;
    position: sticky;
    top: 0;
  }
  .sticky-bottom {
    z-index: 1;
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
`;


// Used for menu highlighting
const navActiveClasses = ["bg-accent", "active"]; // 'active' not used for styling. It's retained just in case it is used JS


//======================================
// Menu tree helpers
//======================================

const organizeSections = (sections) =>
  d3.rollup(
    [...sections.keys()].map((path) => path.split("/")),
    (children) => children.map((child) => child[1]).filter((_) => _),
    (d) => d[0]
  );

export const paginationKeys = (sections, key) => {
  const tree = organizeSections(sections);
  const keys = [...tree.keys()].reduce((acc, parent) => {
    const subsections = tree.get(parent);
    if (subsections.length > 0) {
      return [...acc, ...(subsections.map((sb) => `${parent}/${sb}`))];
    }
    return [...acc, parent];
  }, []);

  let previous;
  let next;

  const currentIndex = keys.findIndex((k) => k === key);
  if (currentIndex > 0) {
    previous = keys[currentIndex - 1];
  }

  if (currentIndex < keys.length - 1) {
    next = keys[currentIndex + 1];
  }

  return {
    previous,
    next
  };
};


//======================================
// Menu behaviour + hash navigation
//======================================

const isSurveyStandalone = () =>
  document.body.dataset.standaloneSurvey === "true";

const scrollToTop = () => window.scrollTo(0, 0);

// Expose a global hook for inline scripts, if desired
export const updateMenu = (dom = document) => {
  console.log("updateMenu");
  if (!dom.querySelectorAll) dom = document;

  // The top layer of the menu is always visible, but only one tab is highlighted
  [...dom.querySelectorAll(".nav-1")].forEach((nav) => {
    const navHash = "#" + nav.href.split("#")[1].split("/")[0];
    if (window.location.hash.startsWith(navHash)) {
      nav.classList.add(...navActiveClasses);
    } else {
      nav.classList.remove(...navActiveClasses);
    }
  });

  // The 2nd layer of menu only has the options relevant to the top layer
  // And then the specific section within that layer is highlighted
  [...dom.querySelectorAll(".nav-2")].forEach((nav) => {
    const navHash = nav.href.split("#")?.[1];
    const topLayerNav = navHash.split("/")?.[0];
    if (window.location.hash.length < 1) return;
    const topLayerWindow = window.location.hash.split("#")[1].split("/")[0];

    const nav2ActiveClasses = [...navActiveClasses, "text-on-brand"];
    if (topLayerNav !== topLayerWindow) {
      nav.classList.add("hide");
    } else {
      nav.classList.remove("hide");
      if ("#" + navHash === window.location.hash) {
        nav.classList.add(...nav2ActiveClasses);
      } else {
        nav.classList.remove(...nav2ActiveClasses);
      }
    }
  });

  // Due to Observablehq framing, the CSS :target selector for show/hide sections based on hash does not
  // work properly. So we manually toggle it.
  [...dom.querySelectorAll("[data-survey-section]")].forEach((section) => {
    if (`#${section.id}` === window.location.hash) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });

  if (document.question) {
    // scroll to a specific question
    var element = document.getElementById(document.question);
    var headerOffset = 140;
    var elementPosition = element.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    console.log("scrollTo", {
      top: offsetPosition
    });

    window.scrollTo({
      top: offsetPosition
    });
    // clear the instruction
    document.question = undefined;
  } else if (isSurveyStandalone()) {
    scrollToTop();
  }
};

// attach to window for use from inline <script> blocks if needed
if (typeof window !== "undefined") {
  window.updateMenu = updateMenu;
}

export const addMenuBehaviour = () => {
  window.addEventListener("hashchange", updateMenu);

  // Observable notebook compatibility – guard so it doesn't break in plain JS
  if (typeof invalidation !== "undefined" && invalidation?.then) {
    invalidation.then(() =>
      window.removeEventListener("hashchange", updateMenu)
    );
  }

  updateMenu();
};


//## Body Header

export const header = (
  sections,
  config,
  { hashPrefix = "", layout: headerLayout = "sticky-top" } = {}
) =>
  html`<header class="[ ${headerLayout} nav-custom shadow-1 ][ w-100 ]">
${pageHeader([config.pageTitle])}
<!--<span class="[ pl2 dib mr3 mt1 mb2 ][ f4 ][ white ]">${config.pageTitle}</span>-->
${pageMenu(sections, config, {
  hashPrefix
})}
</header>`;

// (Notebook-only demo call – commented out for module use)
// header(d3.group(layout.data, d => d['menu']), surveyConfig, {
//   layout: 'relative'
// });


//## Menu

export const pageMenu = (sections, config, { hashPrefix = "" } = {}) => {
  // organize
  const tree = organizeSections(sections);
  const menuDOM = html`
  <nav class="f6 fw6 tracked-light">
    <div class="[ flex pl5-ns overflow-x-auto no-scrollbar ][ bg-brand ]">
    ${[...tree.keys()].map((code) => {
      if (code === "hidden") return "";
      // if the menu has children
      const link = `#${hashPrefix}${
        tree.get(code).length > 0
          ? `${code}/${tree.get(code)[0]}`
          : `${code}`
      }`;
      const label = config.menuSegmentLabels?.[code] || code;
      return htl.html.fragment`<a
          class="[ nav nav-1 dib ph3 pv2 nowrap ][ no-underline text-on-brand hover-text-on-brand hover-bg-accent ] ${window.location.hash.startsWith(
            link
          )
            ? navActiveClasses.join(" ")
            : ""}"
          href="${link}">${label}</a>`;
    })}
    </div>
    <div class="[ flex pl5-ns overflow-x-auto no-scrollbar ][ bg-text-on-brand ]">
      ${[...tree.keys()].map((parent) => {
        return htl.html.fragment`${tree.get(parent).map((code) => {
          const link = `#${hashPrefix}${`${parent}/${code}`}`;
          const label = config.menuSegmentLabels?.[code] || code;
          return html`<a
              class="[ nav nav-2 dib nowrap pa2 ph3 ][ no-underline tc black-90 hover-text-on-brand hover-bg-accent ]"
              href="${link}">${label}</a>`;
        })}`;
      })}
    </div>
  </nav>
`;
  updateMenu(menuDOM);
  return menuDOM;
};

// (Notebook-only demo call – commented out for module use)
// pageMenu(d3.group(layout.data, d => d['menu']), surveyConfig);

// (Notebook-only expression – commented out)
// [...d3.group(layout.data, d => d['menu']).keys()];


//## Images

export const images = {
  mainstream: await FileAttachment("core_mainstream@1.jpg").url(),
  operation: await FileAttachment("core_operation@1.jpg").url(),
  intro: await FileAttachment("intro@3.jpg").url(),
  default: await FileAttachment("core_intro@1.jpg").url()
};

export function imageFor(section) {
  if (section.includes("mainstream")) {
    return images.mainstream;
  } else if (section.includes("operation")) {
    return images.operation;
  } else if (section.includes("intro")) {
    return images.intro;
  } else {
    return images["default"];
  }
}


//## Content

export const sectionsView = (
  questionsMap,
  layoutData,
  config,
  sections,
  answers = new Map(),
  {
    hashPrefix = "",
    putFile,
    getFile
  } = {}
) => {
  const cells = new Map(
    [...questionsMap.entries()].map(([id, q], index) => [
      id,
      createQuestion(
        {
          ...q,
          value: answers.get(id)
        },
        index,
        {
          putFile,
          getFile
        }
      )
    ])
  );

  // We inject the views as just pure presentation
  // This tells the cells which section they are in so we can backlink
  const sectionViews = [...sections.keys()].map((sectionKey) =>
    sectionView(config, cells, sections, sectionKey, {
      hashPrefix
    })
  );

  bindLogic(cells, layoutData);

  // But we also want the questions inside the sections bound as a single flat list of questions.
  // It should be flat as we don't want layout information leaking into data access model, e.g. we don't want
  // moving a question to a different section to invalidate persisted answers.
  let questionViews = sectionViews.reduce((questions, section) => {
    // Copy over section properties (which are views of questions) into growing mega object of views)
    return Object.assign(questions, section);
  }, {});

  // Some questions are undefined if they cannot be looked up, we need to filter those out
  questionViews = Object.fromEntries(
    Object.entries(questionViews).filter(([k, v]) => v)
  );

  const container = view`<div class="black-80">
        ${sectionViews}
      ${/* put our questions as hidden view*/ ['_...', questionViews]}
    </div>`;
  return container;
};

// Notebook demo – commented out but preserved
// //viewof sectionViewExample = sectionsView(questions, layout.data, surveyConfig, d3.group(layout.data, d => d['menu']))
// const sectionViewExampleElement = view(sectionsView(questions, layout.data, surveyConfig, d3.group(layout.data, d => d['menu'])));
// const sectionViewExample = Generators.inputs(sectionViewExampleElement);
//
// sectionViewExampleElement
// sectionViewExample


export const sectionView = (
  config,
  cells,
  sections,
  sectionKey,
  { hashPrefix = "" } = {}
) => {
  const suffix = sectionKey.split("/").pop();
  const subtitle = config.menuSegmentLabels?.[suffix] || suffix;

  const orderedQuestions = sections.get(sectionKey).map((layoutRow) => {
    let cell = cells.get(layoutRow.id);
    if (cell === undefined) {
      cell = md`<mark>Error question not-found for ${layoutRow.id}</mark>`;
    }
    cell.id = layoutRow.id;
    cell.section = sectionKey;
    return cell;
  });

  const pageKeys = paginationKeys(sections, sectionKey);
  const paginationEl = pagination({ ...pageKeys, hashPrefix });

  // background-position-x is set to 4rem, which is approximate height of the header
  return view`<section id="${hashPrefix}${sectionKey}" 
                       data-survey-section="${hashPrefix}${sectionKey}"
                       class="pa2 pa4-ns pl5-l"
                       style="background: #f4f4f4 url(${imageFor(sectionKey)});
                              background-size: cover;
                              background-attachment: fixed;
                              background-position: center 4rem;
                              background-repeat: no-repeat;
                              display: ${location.hash === `#${hashPrefix}${sectionKey}` ? 'block' : 'none'};
                             ">
  <div class="bg-white shadow-2 f4 measure-wide mr-auto">
    <div class="ph4 pt3 pb0 f5 lh-copy">
      <!-- <h1 class="mt0 mb4">${subtitle}</h1> -->
      <div class="db">
        ${['...', orderedQuestions.reduce(
          (acc, q) =>
            Object.defineProperty(acc, q.id, {
              value: q,
              enumerable: true
            }),
          {}
        )]}
      </div>
    </div>
    
    <div class="sticky bottom-0">
      <div class="ph4 pv3 bt b--black-10 bg-near-white">
      ${paginationEl}
      </div>
    </div>
  </div>
</section>`;
};

// Notebook demo – commented out but preserved
// //viewof exampleSectionView = sectionView(surveyConfig, 
// const exampleSectionViewElement = sectionView(
//   surveyConfig,
//   new Map([...questions.entries()].map(([id, q]) => [id, createQuestion(q)])),
//   d3.group(layout.data, d => d['menu']),
//   "extended_survey/internal_operations"
// );
// const exampleSectionView = Generators.input(exampleSectionViewElement);
//
// exampleSectionViewElement
// exampleSectionView


//## Survey View main function

export const surveyView = (
  questionsMap,
  layoutData,
  config,
  answers,
  options = {}
) => {
  addMenuBehaviour();
  loadStyles(brandConfig);

  const sections = d3.group(layoutData, (d) => d["menu"]);
  const surveyDom = viewUI`
    ${custom_css()}
    ${header(sections, config, options)}
    <main id="main-content" class="bg-near-white">
      <article data-name="article-full-bleed-background">
      ${['...', sectionsView(questionsMap, layoutData, config, sections, answers, options)]}
      </article>
    </main>
    ${pageFooter()}
  `;
  return surveyDom;
};


//AFTER THIS THE CSS STYLES ARE CONFLICTING WITH FRAMEWORK


//## Styles for the demos in this notebook

export const stylesForNotebooks = html`<style>
a[href].nav {
  color: var(--text-on-brand);
}

a[href].nav:hover {
  text-decoration: none;
}

.black-90 {
  color: rgba(0,0,0,.9) !important;
}
</style>`;


export function getDownloadUrlForHtml(htmlString) {
  const blob = new Blob([htmlString], { type: "text/html" });
  return URL.createObjectURL(blob);
}