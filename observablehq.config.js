// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Survey Slate",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],


 pages: [
      {
       name: "Tests",
       open: true,
       pages: [
         //not necessary in context
         {name: "AWS Helpers", path: "/03-test-aws"},
       ]
     },
       {
       name: "Survey Slate",
       open: true,
       pages: [
         //not necessary in context
         {name: "Overview for Application Administrators", path: "/surveyslate-docs"},
         
         //missing
         //{name: "Guide for Survey Designers", path: "/user-guide-for-gesi-survey-designer"},
         
         { name: "Admin Tools", path: "/surveyslate-admin-tools.md" },
         { name: "Admin UI", path: "/surveyslate-admin-ui.md" },

         { name: "Designer Tools", path: "/surveyslate-designer-tools" },
         { name: "Designer UI", path: "/surveyslate-designer-ui.md" },

         
         // identify and renmove duplicate
         { name: "Survey Components", path: "/survey-components" },
         { name: "Survey Slate Components", path: "/surveyslate-components" },
         { name: "Survey Slate Styling", path: "/survey-slate-styling" },
         { name: "Common Components", path: "/surveyslate-common-components" },
         
         { name: "Common Components", path: "/surveyslate-common-components" },

         //looks scary for the moment
         //{ name: "Survey Slate Configuration", path: "/survey-slate-configuration" },
       ]
     },

{
  name: "Dependencies",
  open: false,
  pages: [
    { name: "Accessing a Notebook's Runtime", path: "/notebook-dependencies/access-runtime" },
    { name: "aws4fetch", path: "/notebook-dependencies/aws4fetch" },
    { name: "Color Legend", path: "/notebook-dependencies/color-legend" },
    { name: "Common Components", path: "/notebook-dependencies/common-components" },
    { name: "Copier", path: "/notebook-dependencies/copier" },
    { name: "DOM view", path: "/notebook-dependencies/dom-view" },
    { name: "Feather Icons", path: "/notebook-dependencies/feather-icons" },
    { name: "CORS Proxy fetchp", path: "/notebook-dependencies/fetchp" },
    { name: "Draggable LocalFile fileInput", path: "/notebook-dependencies/fileinput" },
    { name: "Firebase Admin and Google API helpers in the browser", path: "/notebook-dependencies/firebase-admin" },
    { name: "Convert cell computation to a Promise with cell flowQueue", path: "/notebook-dependencies/flow-queue" },
    { name: "Hypertext Literal", path: "/notebook-dependencies/htl" },
    { name: "Indented ToC", path: "/notebook-dependencies/indented-toc" },
    { name: "Inputs (Refactored, Jeremy Ashkenas)", path: "/notebook-dependencies/inputs" },
    { name: "@observablehq/inspector@5.0.1", path: "/notebook-dependencies/inspector" },
    { name: "jest-expect-standalone@24.0.2", path: "/notebook-dependencies/jest-expect-standalone" },
    { name: "Squeezing more Juice out of UI libraries", path: "/notebook-dependencies/juice" },
    { name: "Lazy Download", path: "/notebook-dependencies/lazy-download" },
    { name: "LocalFile", path: "/notebook-dependencies/localfile" },
    { name: "Local Storage View: Non-invasive local persistence", path: "/notebook-dependencies/local-storage-view" },
    { name: "Facilities in Households, Nepal, 2011", path: "/notebook-dependencies/nepal-cbs-2011-census-household-facilities" },
    { name: "Radar Chart", path: "/notebook-dependencies/radar-chart" },
    { name: "Secure random ID", path: "/notebook-dependencies/randomid" },
    { name: "Hypertext literal reconciliation with nanomorph", path: "/notebook-dependencies/reconcile-nanomorph" },
    { name: "Resize FileAttachments on the fly with serverless-cells", path: "/notebook-dependencies/resize" },
    { name: "Reversible attachment", path: "/notebook-dependencies/reversible-attachment" },
    { name: "Runtime SDK", path: "/notebook-dependencies/runtime-sdk" },
    { name: "Safe Local Storage", path: "/notebook-dependencies/safe-local-storage" },
    { name: "Signature - A Documentation Toolkit", path: "/notebook-dependencies/signature" },
    { name: "RxJS inspired stream operators for views", path: "/notebook-dependencies/stream-operators" },
    { name: "Survey Slate Configuration", path: "/notebook-dependencies/survey-slate-configuration" },
    { name: "Reactive Unit Testing and Reporting Framework", path: "/notebook-dependencies/testing" },
    { name: "TOC", path: "/notebook-dependencies/toc" },
    { name: "URL querystrings and hash parameters", path: "/notebook-dependencies/url-querystrings-and-hash-parameters" },
    { name: "Utils", path: "/notebook-dependencies/utils" },
    { name: "Composing viewofs with the view literal", path: "/notebook-dependencies/view" },
    { name: "Composing views across time: viewroutine", path: "/notebook-dependencies/viewroutine" }
  ]
}

  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
