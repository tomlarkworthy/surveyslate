//# Survey Components
// THIS HAS NOT BEEN COMPARED AGAINST CATEGORI.SE ORIGINAL
// IT IS BACKWARD COPIED FROM GESI Self-Assessment


import * as htl from "/components/htl@0.3.1.js";

const html = htl.html

import * as Inputs from "/components/inputs_observable.js";
/// file attachments: import * as Inputs from "/components/inputs_observable.js";
import { Generators } from "observablehq:stdlib";



//import {checkbox as checkboxBase, textarea, radio as radioBase, text, number, file} from "@jashkenas/inputs"
import {checkbox as checkboxBase, textarea, radio as radioBase, text, number, file} from "/components/inputs.js";


//import {view, bindOneWay, variable, cautious} from '@tomlarkworthy/view'
import {viewUI, bindOneWay, variable, cautious} from '/components/view.js';

//import {viewroutine, ask} from '@tomlarkworthy/viewroutine'
import {viewroutine, ask} from '/components/viewroutine.js'

//import {download} from '@mbostock/lazy-download'
import {download} from '/components/lazy-download.js'

//import {mainColors, accentColors} from "@adb/brand"
import {mainColors, accentColors} from "/components/brand.js";

//import {loadStyles} from "@adb/tachyons-and-some-extras"
import {loadStyles} from "/components/tachyons-and-some-extras.js"

//import {textNodeView} from "@adb/gesi-survey-common-components"
import {textNodeView} from "/components/surveyslate-common-components.js"

//import {createSuite, expect} from '@tomlarkworthy/testing'
import {createSuite, expect} from '/components/testing.js'


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



//## Config


//import {config} from '@adb/survey-slate-configuration'
import {config} from '/components/survey-slate-configuration.js'
export { config } from '/components/survey-slate-configuration.js'

//## Questions

//### fn `questionWrapper`


export function questionWrapper({
    control,
    hidden = false,
    numbering = ""
  } = {}) {
  const hiddenVariable = variable(undefined, {name: 'hidden'})
  const wrapper = viewUI`<div class="mv3">
    ${['hidden', hiddenVariable]}
    <div class="f5 black-40 b sans-serif">
      ${['numbering', textNodeView()]}
    </div>
    ${['control', control]}
  </div>`
  hiddenVariable.addEventListener('assign', () => {
    if (hiddenVariable.value === true) {
      wrapper.style.display = 'none'
    } else if (hiddenVariable.value === false) {
      wrapper.style.display = 'block'
    } else {
      debugger;
      throw new Error("Unrecognised value for hidden")
    }
  })
  return wrapper;
}


//### fn `reifyAttributes`


// Special arg suffixes like _json, _md, _html are converted to real objects
export function reifyAttributes(args) {
  const reifyAttribute = ([k, v]) => {
    try {
      k = k.trim()
      if (k.endsWith("_json")) {
        return [k.replace(/_json$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(JSON.parse("(" + v + ")")))
                                         : reifyAttributes(JSON.parse("(" + v + ")"))] 
      }
      if (k.endsWith("_eval")) {
        return [k.replace(/_eval$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(eval("(" + v + ")")))
                                         : reifyAttributes(eval("(" + v + ")"))]    
      }
      if (k.endsWith("_js")) {
        return [k.replace(/_js$/, ''),
                Array.isArray(v) ? v.map(v => reifyAttributes(eval("(" + v + ")")))
                                         : reifyAttributes(eval("(" + v + ")"))]    
      }
      if (k.endsWith("_md")) {
        return [k.replace(/_md$/, ''), md([v])]    
      }
      
      return [k, v]  
    } catch (err) {
      throw new Error(`Cannot reify attribute ${k} with ${v} cause ${err.message} (indicates data issue)`)
    }
  }
  if (Array.isArray(args))
    return args.map(arg => reifyAttributes(arg));
  else if (typeof args === 'object')
    return Object.fromEntries(Object.entries(args).map(reifyAttribute))
  else 
    return args
} 


//Color & scoring utilities

export const contrastTextColor = (color) => d3.lab(color).l < 70 ? "#fff" : "#000"

export const binaryScoreColor = (score) => score > 0 || score === '✔️' ? "#ffbccb" : '#0000ff'

export const scoreColor = (score, binary = false) => binary ? binaryScoreColor(score) : d3.scaleLinear()
    .domain([0, 0.1, 1, 2, 3, 4, 5])
    // Earlier 0 -> '#EEEEEE', '#0000EA','#7F17D9','#CF2B92','#E577B8','#F6BECB' <- 5
    // Color scale from https://colorbrewer2.org/#type=sequential&scheme=YlGn&n=5
    .range([
  '#0000ff', // '#EEEEEE', // 0
  '#4800ff', // '#ffffcc', // 0.1
  '#5d00ff', // '#ffffcc', // 1
  '#8900e1', // '#c2e699', // 2
  '#e00095', // '#78c679', // 3
  '#f66fbb', // '#31a354', // 4
  '#ffbccb', // '#006837'  // 5
]).clamp(true)(score);


//Core input control


export const radio = (args) => {
  const base = radioBase(args || {});
  const radios = base.querySelectorAll('input[type=radio]');

  const buttonClass = "[ secondary-button ][ m2 ]";
  const buttonInactiveClass = "dn";
  const button = html`<button class="${args.value ? "" : buttonInactiveClass} ${buttonClass}">Clear selection</button>`;

  base.dataset.formType = "clearable-radio";
  
  const clearHandler = (e) => {
    // Hide clear button
    button.classList.add(buttonInactiveClass);
    
    Array.from(radios).forEach(r => { r.checked = false })
    base.value = undefined;
    base.dispatchEvent(new Event('input', {bubbles: true}))
  }

  const inputChangeHandler = (e) => {
    if (base.value !== undefined) {
      // Show clear button
      button.classList.remove(buttonInactiveClass);
    }
  }
  
  button.addEventListener('click', clearHandler);
  base.addEventListener('input', inputChangeHandler);
  invalidation.then(() => {
    base.removeEventListener('input', inputChangeHandler);
    button.removeEventListener('click',clearHandler)
  });

  const labels = base.querySelectorAll('label');
  const lastLabel = Array.from(labels)[labels.length  - 1];
  if (lastLabel && lastLabel.parentNode) {
    lastLabel.parentNode.insertBefore(button, lastLabel.nextSibling);
  }
  
  return base;
}




export const checkbox = (options) => {
  const allValues = options.options.map(o => o.value)
  if (options.includeNoneOption) {
    options.options.unshift({
      value: "NONE",
      label: options.includeNoneOption.label || (typeof options.includeNoneOption === 'string' ? options.includeNoneOption : "None of the below."),
      score: options.includeNoneOption.score
    })
  }
  if (options.includeAllOption) {
    options.options.push({
      value: "ALL",
      label: options.includeAllOption.label || (typeof options.includeAllOption === 'string' ? options.includeAllOption : "All of the above."),
      score: options.includeAllOption.score})
  }
  const base = checkboxBase(options);
  
  const ui = viewUI`<div>
    ${['...', base]}
  </div>`
  
  const form = ui.querySelector("form")
  base.dataset.formType = "checkbox-plus-plus";
  let allSelected = (options.value || []).includes("ALL");
  let noneSelected = (options.value || []).includes("NONE");
  
  base.addEventListener('input', evt => {
    console.log(evt, evt.target.elements, allValues)
    const allInput = form.querySelector(`input[value=ALL]`);
    const noneInput = form.querySelector(`input[value=NONE]`);
      
    // If all the values are selected ALL should be too
    if (evt.target.value.includes('ALL') && !allSelected) {
      console.log("A")
      // User ticks ALL
      allSelected = true
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = true
      })
      if (noneInput) noneInput.checked = false;
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('ALL') && allSelected) {
      console.log("B")
      // User unticks ALL
      allSelected = false
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = false
      })
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (evt.target.value.includes('ALL') && allSelected && !allValues.every(v => evt.target.value.includes(v))) {
      console.log("C")
      // An unticked option exists while ALL was ticked (so ALL should untick)
      allSelected = false
      allInput.checked = false
      allInput.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('ALL') && !allSelected && allValues.every(v => evt.target.value.includes(v))) {
      console.log("D")
      // All options are ticked while ALL was unticked (so ALL should tick)
      allSelected = true
      allInput.checked = true
      allInput.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (evt.target.value.includes('NONE') && !noneSelected) {
      console.log("E")
      // User ticks NONE (=> all options should untick)
      noneSelected = true
      allValues.forEach(v => {
        const input = form.querySelector(`input[value='${v}']`)
        input.checked = false
      })
      if (allInput) allInput.checked = false
      form.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('NONE') && noneSelected) {
      console.log("F")
      // User unticks NONE
      noneSelected = false
    } else if (evt.target.value.includes('NONE') && noneSelected && allValues.some(v => evt.target.value.includes(v))) {
      console.log("G")
      // An option exists while NONE was ticked (so NONE should untick)
      noneSelected = false
      const input = form.querySelector(`input[value=NONE]`)
      input.checked = false
      input.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    } else if (!evt.target.value.includes('NONE') && !noneSelected && allValues.every(v => !evt.target.value.includes(v))) {
      console.log("H")
      // Nothing is ticked and NONE is unticked (so NONE should tick)
      noneSelected = true
      const input = form.querySelector(`input[value=NONE]`)
      input.checked = true
      input.dispatchEvent(new Event('change', {bubbles:true}))
      evt.stopPropagation()
    }
  })
  
  return ui
};



//### Table


export const id = () => Math.random().toString(36).substr(2, 9); // https://gist.github.com/gordonbrander/2230317



export function table({
  value = undefined,
  title = undefined,
  user_rows = false,
  columns = [],
  rows = [],
  grandTotalLabel = "units",
  grandTotal,
  caption = undefined
} = {}) {
  const total = textNodeView()
  const subtotals = columns.reduce((acc, c) => {
    acc[c.key] = textNodeView()
    return acc;
  }, {});
  
  const rowBuilder = (row) => {
    const labelInput = Inputs.text({value: row.label, placeholder: row.placeholder});
    
    const removeRow = (key) => {
      console.log("DELETE ROW", table.value)
      table.value = Object.fromEntries(Object.entries(table.value)
                                       .filter(([id, row]) => row.label !== key));
      table.dispatchEvent(new Event('input', {bubbles: true}));
    }

    const deleteBtn = Inputs.button('Delete', {
      reduce: () => removeRow(labelInput.value),
      disabled: !labelInput.value
    });
    const deleteBtnEl = deleteBtn.querySelector('button');
    deleteBtnEl.classList.add('secondary-button');
    
    if (row.onEnterPressed) {
      labelInput.addEventListener('keyup', (evt) => {
        if (evt.keyCode === 13) {
          row.onEnterPressed(evt);
        }
      });
    }
    return viewUI`<tr>
          <th>${user_rows ? ['label', labelInput] : md`${row.label}`}</th>
          ${['...', Object.fromEntries(columns.map(
            column => [column.key, viewUI`<td>
              ${['...', htl.html`<input type="number" value="${row?.[column.key] || 0}" min="0">`]}
            </td>`]))]}
          ${user_rows ? viewUI`<td>${deleteBtn}</td>` : ''}
        </tr>`
  }
  const newRow = cautious((done) => {
    return rowBuilder({
      placeholder: "add a new row",
      onEnterPressed: (evt) => {
        table.value = {
          ...table.value,
          [id()]: newRow.value
        }
        newRow.value.label = ""
        table.dispatchEvent(new Event('input', {bubbles: true}))
        done(evt);
      }
    });
  }, {nospan: true});
  
  
  let table = viewUI`<div>
    <h2>${title}</h2>
    <div class="table-ui-wrapper">
      <table class="table-ui">
        <thead class="bb bw1 b--light-gray">
          <th></th>
          ${columns.map(column => viewUI`<th>${column.label}</th>`)}
        </thead>
        <tbody>
          ${['...', {}, rowBuilder]}
        </tbody>
        <tfoot class="bt bw1 b--light-gray">
          ${user_rows ? newRow : ''}
          ${columns[0].total ?
            viewUI`<tr>
              <th>Sub-Totals:</th>
              ${columns.map(c => viewUI`<td><div class="subtotal"><strong>${subtotals[c.key]} ${c.total}</strong></div></td>`)}
            </tr>`
          : null}
          ${grandTotal ?
            viewUI`<tr>
              <th><h3>${grandTotal}</h3></th>
              <td colspan="${columns.length}"><h3>${total} ${grandTotalLabel}</h3></td>
            </tr>`
          : null}
        </tfoot>
      </table>
    </div>
    <div class="table-ui-caption">${caption}</div>
  </div>`
  
  // Set rows from value
  // if the table is not editable with preconfigured with rows & columns
  // the rows and column definitions are the source of truth
  // as we might want to change them in the definitions
  // So the passed-in value can only affect intersecting data
  const structuredValue = Object.fromEntries(
    rows.map(row => [row.key, Object.fromEntries(
      columns.map(col => [col.key,
                          value?.[row.key]?.[col.key] || 0]
                 ).concat([["label", row.label]])
    )])
  );
  if (value && user_rows) {
    table.value = value
  } else {
    table.value = structuredValue
  }
  
  
  function recomputeTotals() {
    let totalSum = 0;
    Object.keys(subtotals).forEach(k => {
      let sum = 0;
      Object.keys(table.value).forEach(key => {
        sum += Number.parseInt(table.value[key][k])
      })
      subtotals[k].value = sum
      totalSum += sum
    })
    total.value = totalSum;
  }
  
  table.addEventListener('input', () => {
    recomputeTotals()
  })
  recomputeTotals()
  return table
}



//### File attachment


export const file_attachment = (options) => {
  const row = file => viewUI`<li>${['name', textNodeView(file.name)]}
      ${download(async () => {
        return new Blob(
          [await options.getFile(file.name)], 
          {type: "*/*"}
        )
      }, file.name, "Retrieve")}`
  
  let ui = viewUI`<div class="sans-serif">
    <p class="b">Existing files</p>
    <ul class="uploads">
      ${['uploads', [], row]}
    </ul>
    ${viewroutine(async function*() {
      while (true) {
        const filesView = file({
          ...options,
          multiple: true
        });
        yield* ask(filesView);
        // A bug with file means files have to be collected from a nested value, rather than the result of ask.
        const toUpload = filesView.input.files; 
        let uploaded = false;
        const uploads = [...toUpload].map(async file => {
          await options.putFile(file.name, await file.arrayBuffer())
          console.log("push", file.name)
          ui.value.uploads = _.uniqBy(ui.value.uploads.concat({name: file.name}), 'name');
          ui.dispatchEvent(new Event('input', {bubbles: true}))
          return;
        })

        Promise.all(uploads).then(() => uploaded = true);

        while (!uploaded) {
          yield md`uploading .`
          await new Promise(resolve => setTimeout(resolve, 100));
          yield md`uploading ..`
          await new Promise(resolve => setTimeout(resolve, 100));
          yield md`uploading ...`
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    })
  }</div>`;
  
  // Initial list contents
  ui.value.uploads = options?.value?.uploads || [];
  return ui;
}




//### Summary


export const colorBoxStyle = html`<style>
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


/// Summary UIs (now safe, colors exist)

export const summary = ({
  sourceId,
  link,
  label,
  score,
  binary = false, // for tick box scores
  counter_group,
  counter_value = undefined
} = {}) => {
  counter_value = counter_value && Number.parseInt(counter_value)
  const counterName = `yiwkmotksl-${counter_group}`;
  if (!window[counterName]) { // Initialize counter if its not been started
      window[counterName] = counter_value || 1;
  }
  counter_value = counter_value || window[counterName]; // Ensure we have a counter value
  window[counterName] = counter_value + 1; // Increment counter now we used it
  
  const colorVar = variable(scoreColor(score, binary));
  const linkVar = variable(link);
  const sourceIdVar = variable(sourceId);
  const textColorVar = variable(contrastTextColor(colorVar))
  const scoreToLabel = score => binary ? score > 0 ? '✔️' : '?' : score;
  const ui = viewUI`<div class="[ flex items-center mv2 ][ sans-serif ]">
  <div class="[ flex items-center]  w-100">
    ${["_link", linkVar]}
    ${["_sourceId", sourceIdVar]}
    <a class="b" style="flex: 0 0 8em" href=${link}
      onclick=${() => {
        console.log("clicked:", sourceIdVar.value)
        document.question = sourceIdVar.value
      }}>
      ${['numbering', textNodeView(`${counter_group || ''} ${counter_value || ''}.`)]}
    </a> 
    <div class="[mid-gray ]" style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis;white-space: nowrap;">
      ${['label', textNodeView(label)]}
    </div>
    <div class="color-box f6"
         style="background-color: ${['color', colorVar]};
                color: ${['text-color', textColorVar]};
                position: relative;
                top: -5px;">
      <span>${['score', textNodeView(scoreToLabel(score))]}<span>
    </div>
  </div>
</div>
`
  

  ui.calculate = (scores) => {
    ui.value.score = scoreToLabel(d3.sum(scores));
    ui.score.dispatchEvent(new Event('input', {bubbles: true}))
  }
  
  bindOneWay(colorVar, ui.score, {
    transform: () => {
      return scoreColor(ui.value.score, binary);
    }
  })
  
  colorVar.addEventListener('assign', () => {
    ui.querySelector(".color-box").style['background-color'] = colorVar.value;
    ui.querySelector(".color-box").style['color'] = contrastTextColor(colorVar.value);
  })

  linkVar.addEventListener('assign', () => {
    ui.querySelector("a").href = linkVar.value
  })
  
  return ui;
}







//### Aggregate Summary


export const aggregateSummary = ({
  sourceId,
  link,
  label,
  score = 0,
  prependScoreLevel = "L"
} = {}) => {
  const scoreLevel = (score) => Math.ceil(score);
  const colorVar = variable(scoreColor(score));
  const linkVar = variable(link);
  const sourceIdVar = variable(sourceId);
  const textColorVar = variable(contrastTextColor(colorVar))
  const ui = viewUI`<div class="[ aggregate-summary ][ flex items-center mv2 ][ sans-serif ]">
  <div class="flex items-center w-100">
    ${["_link", linkVar]}
    ${["_sourceId", sourceIdVar]}
    <a class="[ aggregate-summary__title ][ b lh-title ][ pr3 ]"
       href=${link}
       onclick=${(evt) => {
         console.log("clicked:", sourceIdVar.value);
         if (window.location.hash === linkVar.value) {
           // Bugfix, if we are on the same page the hashchange does not fire
           // but we still want to scroll to the question
           // unfortunately the click also scrolls, so we need to trigger scrolling
           // after a small delay
           setTimeout(() => {
             // window.dispatchEvent(new HashChangeEvent("hashchange"));
             document.getElementById(sourceIdVar.value).scrollIntoView();
           }, 100);
         } else {
          document.question = sourceIdVar.value
         }
      }}>

      ${['label', textNodeView(label)]}
    </a>
    <div class="[ aggregate-summary__score ][ mid-gray mr-auto ]">
      ${['score', textNodeView(+score.toFixed(2))]}
    </div>
  </div>
  <div class="color-box color-box--lg" style="background-color: ${['color', colorVar]}; color: ${['text-color', textColorVar]}">
    <span>${['prependScoreLevel', textNodeView(prependScoreLevel)]}${['level', textNodeView(scoreLevel(score))]}<span>
  </div>
</div>`
  
  ui.calculate = (scores) => {
    ui.value.score = +d3.mean(scores).toFixed(2);
    ui.value.level = scoreLevel(ui.value.score);
    ui.score.dispatchEvent(new Event('input', {bubbles: true}))
  }
  
  bindOneWay(colorVar, ui.score, {
    transform: () => {
      return scoreColor(ui.value.score);
    }
  });
  
  colorVar.addEventListener('assign', () => {
    ui.querySelector(".color-box--lg").style['background-color'] = colorVar.value;
    ui.querySelector(".color-box").style['color'] = contrastTextColor(colorVar.value);
  })

  linkVar.addEventListener('assign', () => {
    ui.querySelector("a").href = linkVar.value
  })
  
  return ui;
}



export const aggregateSummaryStyle = html`<style>
  .aggregate-summary {}  
</style>`






///Radar helpers (used by overview charts)


//### OverviewRadar


//import {radarChart} from '@adb/radar-chart'
import {radarChart} from '/components/radar-chart.js'


//#### DataViz wrangling -- Convert value to Object



export const pivotedRadarChart = ({
  maxValue = undefined,
  margin,
  value = {},
} = {}) => radarChart(
  Object.entries(value || {}).map(([attribute, value]) => ({
    attribute, value
  })), {
    maxValue,
    margin
  }
)



//viewof v = pivotedRadarChart({
export const vElement = pivotedRadarChart({
  value: {f1: 4, f2: 3, f4: 5}
});
const v = Generators.input(vElement);





//#### DataViz wrangling -- Add backwritability and fixed field list



//import {juice} from '@tomlarkworthy/juice'
import {juice} from '/components/juice.js'



export const overviewRadar = ({
  value = {},
  fields = {}
} = {}) => {
  const ui = juice(
    pivotedRadarChart,
    Object.fromEntries(
      Object.entries(fields).map(([code, label]) => [code, `[0].value['${label}']`])))({
    // Initial value is the field values overwritten with passed in values
    value: Object.assign(
      Object.fromEntries(Object.entries(fields).map(([code, label]) => [label, 0])),
      Object.fromEntries(Object.entries(value).map(([code, value]) => [fields[code], value]))),
    maxValue: 5,
    margin: 100
  });

  const shouldCalculateOverall = Object.keys(fields).includes("overall");

  Object.defineProperty(ui, "calculate",{
    value: (scores, {set} = {}) => {
      ui.value[set] = d3.mean(scores);
      // recalc overall
      if (shouldCalculateOverall) {
        ui.value["overall"] = d3.mean(
          Object
            .keys(ui.value)
            .filter(k => k !== "overall")
            .map(k => ui.value[k])
        );
      }
    },
    enumerable: true
  });
  return ui;
}




///Question factory & scoring logic (now that all control types exist)







//### fn `createQuestion`


export const createQuestion = (q, index, options) => {
  const args = reifyAttributes(q);
  
  function createControl() {
    try {
      if (Object.keys(args).length == 0
         || (Object.keys(args).length == 1 && args[""] == "")) {
        return htl.html` `
      }

      if (args.content || args.md) {
        return md`${args.content || args.md}`
      }

      if (args.type === 'checkbox') {
        return checkbox({
          options: [args.title],
          ...args
        })
      }

      if (args.type === 'textarea') {
        return textarea({
          ...args
        })
      }

      if (args.type === 'radio') {
        return radio({
          ...args
        })
      }

      if (args.type === 'number') {
        return number({
          ...args
        })
      }

      if (args.type === 'table') {
        return table({
          ...args
        })
      }

      if (args.type === 'file_attachment') {
        return file_attachment({
          ...args,
          putFile: options.putFile,
          getFile: options.getFile,
        })
      }
      
      if (args.type === 'summary') {
        return summary({
          ...args
        })
      }
      
      if (args.type === 'aggregate') {
        return aggregateSummary({
          ...args
        })
      }

      if (args.type === 'overviewRadar') {
        return overviewRadar({
          ...args
        })
      }

    } catch (err) {
      console.log("Error creating question for ", q, index, options)
      console.log(err)
    }


    return htl.html`<div><mark>${index}. ${JSON.stringify(q)}</mark></div>`
  }
  
  const control = createControl();
  
  const logic = questionWrapper({
    control
  });
  logic.args = args;
  return logic
}




//### fn `scoreQuestion`


export const scoreQuestion = (q) => {
  if (!q) return 0;
  if (q.hidden.value === true) return 0;
  if (q.args.type === 'checkbox') {
    // Max score function
    return q.control.value.reduce((maxSoFar, value) => {
      // find option with highest score
      const option = q.args.options.find(option => option.value === value)
      return Math.max(option.score, maxSoFar);
    }, /* default to minimum score */ Math.min(...q.args.options.map(option => option.score)))
  }
  if (q.args.type === 'radio') {
    const option = q.args.options.find(option => option.value === q.control.value)
    if (option) return option.score;
    else /* default to minimum score */ {
      return Math.min(...q.args.options.map(option => option.score));
    }
  };
  
  if (q.args.type === 'table') {
    // We score the table as just the total, its obviously very arbitrary but we can see if someone filled it in
    const tableValue = q.value.control;
    const rows = Object.entries(tableValue);
    const tableTotal = rows.reduce(
      (totalSoFar, [rowKey, rowData]) => {
        const elements = Object.entries(rowData);
        const rowTotal = elements.reduce(
          (rowTotalSoFar, [columnKey, value]) => {
            if (columnKey === "label") return rowTotalSoFar; // User editable tables have key label for the row name
            return rowTotalSoFar + parseInt(value);
          }, 0);
        return totalSoFar + rowTotal;
      }, 0);
    return tableTotal;
  };

  if (q.args.type === 'textarea' && q.args.score) {
    return q.value.control.length
  };
  
  if (q.args.type === 'summary') {
    return q.control.score.value;
  };
}




// Survey view selector



















//---



//## Component Styles


const ns = Inputs.text().classList[0]



//---

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
</style>`



//viewof basicTable = table({
const basicTableElement = table({
  value: {
    "cool": {label:"very cool", c1: "27"}
  },
  columns: [{key: "c1", label: "c1"}],
  user_rows: true});
const basicTable = Generators.input(basicTableElement);


//viewof prefilledUserEditableTable = table({
const prefilledUserEditableTableElement = table({
  columns: [{key: "w", label:"Women"}, {key: "m", label:"Men"},{key: "unknown", label: "No Data"}],
  rows: [{key: "orthopedic", label: "Orthopedic"},{key: "vision", label: "Vision"},{key: "hearing", label: "Hearing"},{key: "speech", label: "Speech"},{key: "learning", label: "Learning/Reading (e.g., dyslexia)"}]
});
const prefilledUserEditableTable = Generators.input(prefilledUserEditableTableElement);



Inputs.button("backwrite", {
  reduce: () => {
    //viewof basicTable.value = {"r1": {label: "r1", "c1": "3"}, "r2": {label: "r2", "c1": "2"}};
    basicTable.value = {"r1": {label: "r1", "c1": "3"}, "r2": {label: "r2", "c1": "2"}};
    //viewof basicTable.dispatchEvent(new Event('input', {bubbles: true}))
    basicTable.dispatchEvent(new Event('input', {bubbles: true}))
  }
})


//### Clearable Radio



//### textarea



//### Checkbox++



//viewof checkboxTests = createSuite({
const checkboxTestsElement = createSuite({
  name: "checkbox tests",
  timeout_ms: 1000
})
const checkboxTests = Generators.input(checkboxTestsElement);



//viewof testCheckboxAll = checkbox({
const testCheckboxAllElement = checkbox({
    includeAllOption: {label: "ALL"},
    options: [
      {value: 'a', label: "A"},
      {value: 'b', label: "B"}
    ],
  });
const testCheckboxAll = Generators.input(testCheckboxAllElement);



function check(checkbox, value, checked = true) {
  const option = checkbox.querySelector(`input[value=${value}]`);
  if (!option) throw new Error("Could not find " + value + " in options");
  option.checked = checked
  option.dispatchEvent(new Event('change', {bubbles: true}))
};





//### Pagination


export const pagination = ({previous, next, hashPrefix = "", previousLabel = "← Go back", nextLabel ="Proceed →"} = {}) => {
  const prevLink = previous ? html`<a class="[ pagination_previous ][ brand no-underline underline-hover ]" href="#${hashPrefix}${previous}">${previousLabel}</a>` : "";
  const nextLink = next ? html`<a class="[ pagination_next ][ ml-auto pv2 ph3 br1 ][ bg-brand text-on-brand hover-bg-accent no-underline ]" href="#${hashPrefix}${next}">${nextLabel}</a>` : "";

  return html`<nav class="[ pagination ][ f5 ][ flex items-center ]">
  ${prevLink} ${nextLink}
</nav>`
}



//### Inputs


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


///---

export const styles = html`<style>
  ${colorBoxStyle.innerHTML}
  ${aggregateSummaryStyle.innerHTML}
  ${tableStyles.innerHTML}
  ${formInputStyles.innerHTML}
</style>`


///---