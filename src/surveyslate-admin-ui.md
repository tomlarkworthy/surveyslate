# Survey Slate | Admin UI

_A simple user interface for Survey Slate's [Admin Tools](https://observablehq.com/@categorise/surveyslate-admin-tools)._

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js echo
viewof loginView = html`<div class="flex flex-column brand-font bg-near-white" style="overflow-y: auto; height:600px;">
  <header class="solid-shadow-y-1">
    ${pageHeader(["GESI Survey", "Admin", "Users"])}
  </header>
  <main class="pa3 space-y-3">
    <div class="[ card ][ solid-shadow-1 mt4 ml-auto mr-auto mw6 space-y-3 ]">
        ${Inputs.text({label: "Secret Access Key"})}
        ${Inputs.button("Login")}
    </div>
  </main>
  <div style="margin-top: auto">${pageFooter()}</div>
` 
```

```js echo
viewof usersPage = html`<div class="flex flex-column brand-font bg-near-white" style="overflow-y: auto; height:600px;">
  <header class="solid-shadow-y-1">
    ${pageHeader(["GESI Survey", "Admin", "Users"])}
    ${nav([
      {label: "Users", href:"#users", active: true},
      {label: "Accounts", href:"#accounts"},
      {label: "Surveys", href:"#surveys"},
    ])}
  </header>
  <main class="pa3 space-y-3">
    <div class="toolbar flex justify-end">
      <div class="button-group">
        ${Inputs.button(buttonLabel({label: "Add user", iconLeft: "plus"}))}
      </div>
    </div>

    <div class="[ card ][ solid-shadow-1 ]">
      <div class="c-table">${usersTable}</div>
    </div>
  </main>
  <div style="margin-top: auto">${pageFooter()}</div>
` 
```

```js echo
usersTable = md`|User  | Accounts |
|:--|:--|
|[James Moriarty](#)| BM-ABC, UO-MATH|
|[John Watson](#)| BE-SY|
|[Mycroft Holmes](#)| BE-SY|`
```

## Components

### Navigation

```js echo
nav([
  {label: "Users", href:"#", active: true},
  {label: "Accounts", href:"#"},
  {label: "Surveys", href:"#"},
])
```

```js echo
nav = (links = []) => {
  const linkClasses = "[ nav nav-1 dib ph3 pv2 nowrap ][ link pointer no-underline text-on-brand hover-text-on-brand hover-bg-accent ]";
  const activeLinkClasses = "[ bg-accent active ]";
  
  return html`<nav class="f6 fw6 tracked-light">
  <div class="[ flex pl5-ns overflow-x-auto no-scrollbar ][ bg-brand ]">
    ${links.map(l => html`<a class="${linkClasses}${l.active ? activeLinkClasses : "" }" href="${l.href}">${l.label}</a>`)}
  </div>
</nav>
`
}
```

## Styles

`stylesForNotebooks` contains styles to show the demos within Observable notebooks properly. It corrects some Observable CSS interfering with Tachyons CSS.

```js echo
stylesForNotebooks = html`<style>
a[href].nav {
  color: var(--text-on-brand);
}

a[href].nav:hover {
  text-decoration: none;
}`
```

## Styles for the demo

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
tachyonsExt({
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

```js echo
styles
```

```js echo
prototypeStyles = html`<style>
.c-table table {
  margin: 0;
  max-width: 100%;
}
</style>`
```

## Imports

```js
import {view} from "@tomlarkworthy/view"
```

```js
import {mainColors, accentColors} from "@categorise/brand"
```

```js
import {tachyonsExt} from "@categorise/tachyons-and-some-extras"
```

```js
import {pageHeader, pageFooter, buttonLabel, styles} from "@categorise/surveyslate-common-components"
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
