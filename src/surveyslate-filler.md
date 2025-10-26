# Survey Slate | Survey Filler UI

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

The survey filler app is login with magic link, the following links load the application is Observable or on a white label domain.

[demoResponder on observablehq](https://observablehq.com/@categorise/surveyslate-filler?username=demoResponder#FnMcjZO1pn1uqmMh|cell-types) <-- do this

[demoResponder on surveyslate.org](https://www.surveyslate.org/demo-survey/index.html?username=demoResponder#FnMcjZO1pn1uqmMh|cell-types)

```js
viewof responses = {
  console.log("Initializing viewof responses");
  initializeStyles();
  addMenuBehaviour
  if ('#' + urlCreds.password === location.hash) {
    // We just logged in so go to intro
    location.hash = `#${urlCreds.password}${urlCreds.deliminator}intro`
  }
  debugger;
  const view = surveyView(questions, layout, surveyConfig, pageLoadAnswers.answers, {
    hashPrefix: urlCreds.password + urlCreds.deliminator,
    putFile: putFile,
    getFile: getFile
  })
  
  return view
}
```

```js
stylesForNotebooks
```

```js
viewof responses.value
```

```js echo
viewof survey = Inputs.bind(Inputs.select(mySurveys, {label: "survey"}), localStorageView("filler-project", {
  defaultValue: 
    new URLSearchParams(location.search).get("survey") ||
    mySurveys.includes('demo') ? 'demo' : undefined || 
    mySurveys[0]
}))
```

```js echo
viewof account =  Inputs.bind(Inputs.select(myAccounts, {label: "account"}), localStorageView("filler-account", {
  defaultValue: myAccounts[0]
}))
```

```js echo
putFile = async (name, buffer) => {
  console.log("Uploading ", name);
  await putObject(config.CONFIDENTIAL_BUCKET, `accounts/${account}/surveys/${survey}/files/${name}`,     
    buffer, {
    tags: {
      "survey": survey,
      "account": account,
    }
  });
} 
```

```js echo
getFile = async (name) => {
  return await getObject(config.CONFIDENTIAL_BUCKET, `accounts/${account}/surveys/${survey}/files/${name}`);
}
```

```js
md`---`
```

```js echo
pageLoadAnswers = {
  console.log("Initializing pageLoadAnswers")
  const projectAnswers = accountSettings?.surveys?.[survey]?.["answers"];
  if (projectAnswers) {
    const name = projectAnswers[projectAnswers.length - 1];
    const prev = JSON.parse(await getObject(config.CONFIDENTIAL_BUCKET, `accounts/${account}/surveys/${survey}/${name}`));
    prev.answers = new Map(prev.answers || [])
    return prev
  } else {
    return ({
      answers: new Map()
    })
  }
}
```

```js echo
auto_save = {
  console.log("Initializing auto_save");
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
  
  
  return Generators.observe(next => {
    const autosave = debounce(async () => {
      console.log("saving")
      const answers = await saveState()
      viewof lastSave.value = answers;
      viewof lastSave.dispatchEvent(new Event('input', {bubbles: true}))
      next(answers)
    });
    viewof responses.addEventListener('input', autosave);
    invalidation.then(() => viewof responses.removeEventListener('input', autosave))
    
    next("Autosave initialized")
  })
  
}
```

```js
viewof lastSave = Inputs.input(undefined)
```

```js echo
surveySettings = {
  console.log("Initializing surveySettings")
  return JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/settings.json`));
}
```

```js echo
accountSettings = {
  console.log("Account settings loaded")
  return JSON.parse(await getObject(config.CONFIDENTIAL_BUCKET, 
                                    `accounts/${account}/settings.json`));
}
```

```js echo
version = {
  console.log("Loading persisted version");
  return JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/${surveySettings.versions[surveySettings.versions.length - 1]}`));
}
```

```js echo
layout = {
  console.log("Initializing layout")
  return JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/${version.layout}`));
}
```

```js echo
surveyConfig = {
  console.log("Initializing config")
  return JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/${version.config}`));
}
```

```js echo
questions = {
  console.log("Initializing questions")
  return new Map(JSON.parse(await getObject(config.PRIVATE_BUCKET, `surveys/${survey}/${version.questions}`)));
}
```

```js echo
urlCreds = {
  const deliminator = location.hash.includes('%7C') ? '%7C' : '|';
  let hash = location.hash.substring(1).replace("%7C", "|");
  if (!hash.split("|")[0]) return invalidation;
  const password = hash.split("|")[0];
  const username = new URLSearchParams(location.search).get("username")
  const url = `https://${config.PUBLIC_BUCKET}.s3.${REGION}.amazonaws.com/credentials/${await new hashes.SHA256().hex(username)}.json`
  const response = await fetch(url);
  const payload = await response.text();
  return {...JSON.parse(await decode(await password, payload)), password: password, deliminator};
}
```

```js echo
location.hash
```

```js echo
me = getUser()
```

```js echo
myTags = listUserTags(me.UserName)
```

```js echo
mySurveys = (myTags["filler"] || "").split(" ").filter(v => v !== "")
```

```js echo
myAccounts = (myTags["account"] || "").split(" ").filter(v => v !== "")
```

```js echo
saveState = {
  console.log("Initializing saveState")
  return async function saveState() {
    console.log("saveState saving...");
    const answers = Object.entries(viewof responses.value).reduce(
      (map, [cell_name, q]) => {
        if (q && q.control && q.control !== "undefined" && (q.control.length > 0 || q.control.length === undefined))
          map.set(cell_name, q.control)
        return map;
      },
      new Map()
    )


    const name = `answers_${Date.now()}.json`
    const state = ({
      answers: [...answers.entries()],
      questions: version.questions,
      layout: version.layout
    });

    await putObject(config.CONFIDENTIAL_BUCKET, `accounts/${account}/surveys/${survey}/${name}`,     
                    JSON.stringify(state), {
                    tags: {
                      "surveys": survey,
                      "account": account,
                    }
    });
    const newSettings = accountSettings;
    newSettings["surveys"] = newSettings["surveys"] || {};
    newSettings["surveys"][survey] = newSettings["surveys"][survey] || {};
    newSettings["surveys"][survey]["answers"] = newSettings["surveys"][survey]["answers"] || [];
    newSettings["surveys"][survey]["answers"] = [...newSettings["surveys"][survey]["answers"], name];

    await putObject(config.CONFIDENTIAL_BUCKET, `accounts/${account}/settings.json`,     
                    JSON.stringify(newSettings), {
                    tags: {
                      "survey": survey,
                      "account": account,
                    }
    });
    console.log("saveState done");
    return answers;
  }
}
```

```js
REGION = "us-east-2"
```

## Integration tests

Log in with the URL [demoResponder](https://observablehq.com/@categorise/opensurvey?username=demoResponder#FnMcjZO1pn1uqmMh|cell-types) to run the intergration tests.

```js echo
testing = {
  viewof responses // Delay loading modules until survey is setup
  if (!document.location.search.includes("username=demoResponder")) return invalidation
  const [{ Runtime }, { default: define }] = await Promise.all([
    import(
      "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"
    ),
    import(`https://api.observablehq.com/@tomlarkworthy/testing.js?v=3`)
  ]);
  const module = new Runtime().module(define);
  return Object.fromEntries(
    await Promise.all(
      ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
    )
  );
}
```

```js echo
viewof tests = testing.createSuite({
  name: "Survey Filler Integration Tests",
  timeout_ms: 10000
})
```

```js echo
tests.test("text_question is saved to responses", async (done) => {
  const nonce = "test " + Math.random().toString(15).substring(3);
  const control = document.querySelector("#text_question");
  const textarea = control.querySelector("textarea");

  // set it to something random
  textarea.value = nonce;
  // trigger dataflow
  textarea.dispatchEvent(new Event('input', {bubbles: true}));
  await until(() => viewof lastSave.value?.get('text_question') === nonce);
  done()
})
```

```js echo
/**
 * Thanks sscovil!
 * https://gist.github.com/sscovil/6502c72de3e24232f66b5bf86de04680
 * Utility that waits for @predicate function to return truthy, testing at @interval until @timeout is reached.
 *
 * Example: await until(() => spy.called);
 *
 * @param {Function} predicate
 * @param {Number} interval
 * @param {Number} timeout
 *
 * @return {Promise}
 */
async function until(predicate, interval = 500, timeout = 30 * 1000) {
  const start = Date.now();

  let done = false;

  do {
    if (predicate()) {
      done = true;
    } else if (Date.now() > (start + timeout)) {
      throw new Error(`Timed out waiting for predicate to return true after ${timeout}ms.`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  } while (done !== true);
}
```

```js
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, viewof manualCredentials, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} with {REGION as REGION, urlCreds as credentials} from '@tomlarkworthy/aws'
```

```js
hashes = require("jshashes")
```

```js
import {decode} from '@endpointservices/notebook-secret'
```

```js
import {localStorageView} from '@tomlarkworthy/local-storage-view'
```

```js
import {view, cautious} from '@tomlarkworthy/view'
```

```js
import {createQuestion, bindLogic, setTypes, config, stylesForNotebooks} from '@categorise/survey-components'
```

```js
import {surveyView, addMenuBehaviour, initializeStyles} from '@categorise/gesi-styling'
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
