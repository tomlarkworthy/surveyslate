```js
md`# Survey Slate | Admin Tools

_Create, deploy and manage surveys._
`
```

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
md`## Log In`
```

```js
md`
You must have administrative permission to utilise this interface.
`
```

```js
viewof manualCredentials
```

```js
md`Example credential format:
~~~js
{
  "accessKeyId": "LONGRANDOMSTRING",
  "secretAccessKey": "eVeN1OnGeRRaNd3MstR*%G"
}
~~~
`
```

```js
md`
For convenience and persistence across browsing sessions, you may choose to save your credentials to local storage (or clear them, should you wish).
`
```

```js
saveCreds
```

```js
md`
---
`
```

```js
md`## Applications

Deploy the core applications of Open Survey into Cloud

<ul>
<li>[Survey Designer](https://www.surveyslate.org/demo-designer/index.html)</li>
<li>[Survey Filler](https://www.surveyslate.org/demo-survey/index.html?username=demoResponder#FnMcjZO1pn1uqmMh|cell-types)</li>
<ul>
`
```

```js
CLOUD_FRONT_DISTRIBUTION_ID = config.CLOUD_FRONT_DISTRIBUTION_ID;
```

```js
md`### Deploy the *Survey Designer* Application to [CloudFront](https://d3f26ej57oauer.cloudfront.net/designer/index.html)`
```

```js
viewof uploadDesignerBtn
```

```js
designerFiles
```

```js
designerCurrentFileUpload
```

```js
designerUploader
```

```js
designerSource = "https://observablehq.com/@categorise/survey-designer"
```

```js
designerS3Target = config.PUBLIC_BUCKET + "/apps/demo-designer"
```

```js
designerInvalidationPath = "/designer/*"
```

```js
designerIndex = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Survey Slate Designer</title>
<link rel="stylesheet" type="text/css" href="./inspector.css">
<body data-standalone-designer-notebook>
${enableJavasscriptSnippet.outerHTML}
<div id="root"class="[ mw8 pa4 pt2 ml-auto mr-auto ][ brand-font ][ space-y-3 ]"></div>
<script type="module">
import define from "./index.js";
import {Runtime, Library, Inspector} from "./runtime.js";

const rootEl = document.querySelector("#root") || document.body;

new Runtime().module(define, name => {
  if (name === "styles") {
    return Inspector.into(rootEl)();
  }
  if (name === "loadStyles") {
    return Inspector.into(rootEl)();
  }
  if (name === "loginTitle") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof login") {
    return Inspector.into(rootEl)();
  }
  if (name === "credStore") {
    return Inspector.into(rootEl)();
  }
  if (name === "surveyChooserTitle") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof survey") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof settings") {
    return true;
  }
  if (name === "initialQuestionLoader") {
    return true;
  }
  if (name === "initialLayoutLoader") {
    return true;
  }
  if (name === "load_config") {
    return true;
  }
  if (name === "sync_ui") {
    return true;
  }
  if (name === "viewof surveyUi") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof surveyUiInput") {
    return true;
  }
  if (name === "syncSurveyUiInputToSurveyUi") {
    return true;
  }
  if (name === "syncSurveyUIToSurveyUiOutput") {
    return true;
  }
  if (name === "syncSurveyOutput") {
    return true;
  }
  if (name === "autosave") {
    return true;
  }
  if (name === "viewof latestConfig") {
    return Inspector.into(rootEl)();
  }
  if (name === "surveyPreviewTitle") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof responses") {
    return Inspector.into(rootEl)();
  }
  if (name === "revertTitle") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof reollbackButton") {
    return Inspector.into(rootEl)();
  }
  if (name === "deployTitle") {
    return Inspector.into(rootEl)();
  }
  if (name === "lastDeployed") {
    return Inspector.into(rootEl)();
  }
  if (name === "viewof deployButton") {
    return Inspector.into(rootEl)();
  }
});
</script>
`
```

```js
import {
  viewof uploadButton as uploadDesignerBtn,
  currentFile as designerCurrentFileUpload,
  uploader as designerUploader,
  deployed as designerDeployed,
  files as designerFiles
} with {
  designerIndex as indexHtml,
  designerInvalidationPath as INVALIDATION_PATH,
  designerSource as notebookURL,
  designerS3Target as s3Target,
  manualCredentials, CLOUD_FRONT_DISTRIBUTION_ID}
from '@tomlarkworthy/notebook-deploy-to-s3'
```

```js
md`### Deploy *Survey Filler* Application to CloudFront

- [Amazon CloudFront introduction](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [Survey Filler testUser on CloudFront](https://d3f26ej57oauer.cloudfront.net/survey/index.html?username=testUser&0.3111558664622356#Kp0YtJIgI6RuUWUo)
- [Survey Filler testUser on S3](https://public-publicwrfxcsvqwpcgcrpx.s3.us-east-2.amazonaws.com/apps/survey/index.html?username=testUser&survey=testProject3&0.3111558664622356#Kp0YtJIgI6RuUWUo|intro) useful for bisecting deployment problems as CloudFront reads from S3.
`
```

```js
viewof runFillerTests = Inputs.toggle({
  label: md`<b>I have run the [integration tests](https://observablehq.com/@categorise/opensurvey?username=demoResponder#FnMcjZO1pn1uqmMh|cell-types)?<b>`
})
```

```js
{
  if (runFillerTests) return viewof uploadFillerBtn
  else return md`Run the integration tests before deploying.`
}
```

```js
fillerFiles
```

```js
fillerUploader
```

```js
fillerCurrentFileUpload
```

```js
fillerSource = "https://observablehq.com/@categorise/surveyslate-filler"
```

```js
fillerS3Target = config.PUBLIC_BUCKET + "/apps/demo-survey"
```

```js
fillerInvalidationPath = "/survey/*"
```

```js
fillerIndex = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Survey Slate Filler</title>
<link rel="stylesheet" type="text/css" href="./inspector.css">
<body data-standalone-survey="true">
${enableJavasscriptSnippet.outerHTML}
<script type="module">
import define from "./index.js";
import {Runtime, Library, Inspector} from "./runtime.js";

new Runtime().module(define, name => {
  if (name === "viewof responses") {
    return Inspector.into(document.body)();
  }
  if (name === "auto_save") {
    return true;
  }
});
</script>
`
```

```js
import {
  viewof uploadButton as uploadFillerBtn,
  currentFile as fillerCurrentFileUpload,
  uploader as fillerUploader,
  deployed as fillerDeployed,
  files as fillerFiles
} with {
  fillerInvalidationPath as INVALIDATION_PATH,
  fillerSource as notebookURL,
  fillerS3Target as s3Target,
  fillerIndex as indexHtml,
  manualCredentials, CLOUD_FRONT_DISTRIBUTION_ID}
from '@tomlarkworthy/notebook-deploy-to-s3'
```

```js
md`## Operations`
```

```js
md`### Survey

Each survey has a folder in the in s3 at \`PRIVATE_BUCKET/surveys/{name}\`. 

Projects are surveys: the text, questions, and logical connections defined by survey designer. 
`
```

```js
md`#### List Surveys`
```

```js
Inputs.table(surveys)
```

```js
md`#### Create Survey`
```

```js
viewof newSurveyName = Inputs.text({
    label: "Survey name",
    submit: "create",
    pattern: "^[a-Z]*$",
    minlength: 3
  });

```

```js
{
  await putObject(config.PRIVATE_BUCKET, `surveys/${newSurveyName}/settings.json`, `{"name":"${newSurveyName}"}`, {
    tags: {
      "survey": newSurveyName
    }
  })
  viewof newSurveyName.value = undefined
  mutable refreshProjects++;
  return md`<mark>${newSurveyName} created</mark>`
}
```

```js
surveys = refreshProjects && (await listObjects(config.PRIVATE_BUCKET, "surveys/")).map(r => ({name: /surveys\/([^/]*)\//.exec(r.Prefix)[1]}))
```

```js
mutable refreshProjects = 1
```

```js
md`
---
`
```

```js
md`### Accounts

Each account has a folder in the in s3 at \`CONFIDENTIAL_BUCKET/accounts/{name}\`. 

Accounts contain survey responses: answers supplied to survey questions by survey fillers. Accounts are assigned to projects.
`
```

```js
md`#### List Accounts`
```

```js
Inputs.table(accounts)
```

```js
md`#### Create Account`
```

```js
viewof newAccountName = Inputs.text({
    label: "New account",
    submit: "create",
    pattern: "^[a-Z]*$",
    minlength: 3
  });
```

```js
{
  await putObject(config.CONFIDENTIAL_BUCKET, `accounts/${newAccountName}/settings.json`, `{"name":"${newAccountName}"}`, {
    tags: {
      "account": newAccountName
    }
  });
  viewof newAccountName.value = undefined
  mutable refreshAccounts++;
  return md`<mark>${newAccountName} created</mark>`
}
```

```js
accounts = refreshAccounts && (await listObjects(config.CONFIDENTIAL_BUCKET, "accounts/")).map(r => ({name: /accounts\/([^/]*)\//.exec(r.Prefix)[1]}))
```

```js
mutable refreshAccounts = 1
```

```js
md`
---
`
```

```js
md`### Users

Users have IAM user credentials, which allow access to the application or backend.

We use AWS IAM tags to add information such as access to survey projects or account response locations.
` 
```

#### List Users

```js
Inputs.table(users, {
  columns: ['UserName', 'UserId', 'Tags', 'PasswordLastUsed', 'CreateDate']
})
```

```js
md`#### Create User`
```

```js
viewof newUsername = Inputs.text({
    label: "New user",
    submit: "create",
    pattern: "^[a-Z]*$",
    minlength: 3
  });
```

```js
{
  await createUser(newUsername)
  await addUserToGroup(newUsername, "user")
  viewof newUsername.value = undefined
  mutable refreshUsers++;
  return md`<mark>${newUsername} created</mark>`
}
```

```js
md`#### Delete User`
```

```js
viewof deleteUsername = Inputs.text({
    label: "Delete user",
    submit: "delete",
    pattern: "^[a-Z]*$",
    minlength: 3
  });
```

```js
{
  const groups = await listGroupsForUser(deleteUsername);
  await Promise.all(groups.map(group => removeUserFromGroup(deleteUsername, group.GroupName)))
  await deleteUser(deleteUsername)
  viewof deleteUsername.value = undefined
  mutable refreshUsers++;
  return md`<mark>${deleteUsername} delete</mark>`
}
```

```js
users = refreshUsers && await listUsers()
```

```js
mutable refreshUsers = 1;
```

```js
md`### User Permissions

Actions that a user may perform are explicitly defined by user permissions. We have fillers (survey respondents) and designers and members of account.

A user can only fill in a survey for an account if they have permission on that account. Similarly, a user can only design and modify a survery project if they have are tagged as a designer. 
`
```

```js
viewof username = Inputs.bind(Inputs.select(users.map(u => u.UserName), {
  label: "Choose a user to configure"
}), localStorageView("username"))
```

```js
user = users.find(r => r.UserName === username)
```

```js
Inputs.table(userGroups, {
  columns: ["GroupName", "GroupId", "Arn", "CreateDate"]
})
```

```js
userGroups = listGroupsForUser(username)
```

```js
md`#### IAM Access Keys (${username})`
```

```js
Inputs.table(userAccessKeys)
```

```js
md`##### Add access key`
```

```js
md`##### Create an internal access key for this user

remember to record the secret as it will not be visible ever again. Suitable for staff.
`
```

```js
{
  if (userAccessKeys.length >= 2) return md`⚠️ max 2 access keys reached per user, delete an access key first`
  else return Inputs.button("Create INTERNAL access key", {
    reduce: async () => {
      const newKey = await createAccessKey(username);
      mutable lastAccessKey = JSON.stringify({
        "accessKeyId": newKey.AccessKeyId,
        "secretAccessKey": newKey.SecretAccessKey
      }, null, 2)
      mutable refreshUsers++;
    }
  })
}
```

```js
mutable lastAccessKey = undefined
```

```js
md`##### Create an external access code (suitable for Survey Fillers)

This creates an access key like the internal access key, but stores it encrypted publically in S3. The password is stored in the PRIVATE_BUCKET so it can be used to generate access URLs.

You can generate multiple access links off this credentials using [access_links](#access_links)
`
```

```js
{
  if (userAccessKeys.length >= 2) return md`⚠️ max 2 access keys reached per user, delete an access key first`
    else return Inputs.button("Add EXTERNAL access key", {
    reduce: async () => {
      try {
        const password = await randomId(16);
        const newKey = await createAccessKey(username);
        const payload = await encrypt({
          secret: JSON.stringify({
            "accessKeyId": newKey.AccessKeyId,
            "secretAccessKey": newKey.SecretAccessKey
          }, null, 2),
          password
        });

        const path = `credentials/${await new hashes.SHA256().hex(username)}.json`;
        await putObject(config.PUBLIC_BUCKET, path, JSON.stringify(payload, null, 2));
        await putObject(config.PRIVATE_BUCKET, `passwords/${await new hashes.SHA256().hex(username)}`, password);
      } catch (err) {
        console.error(err);
      }
      mutable refreshUsers++;
    }
  });
}
```

```js
md`##### Delete access key`
```

```js
viewof deleteAccessKeyInput = Inputs.text({
    label: "Delete AccessKeyId",
    submit: "delete",
    pattern: "^[a-Z]*$",
    minlength: 3
  });
```

```js
{
  const key = deleteAccessKeyInput.trim()
  if (key == "") return;
  await deleteAccessKey(username, key)
  viewof deleteAccessKeyInput.value = " "
  viewof deleteAccessKeyInput.dispatchEvent(new Event('input', {bubbles: true}));
  mutable refreshUsers++;
  return md`<mark>${deleteAccessKey} deleted</mark>`
}
```

```js
userAccessKeys = listAccessKeys(username)
```

```js
md`#### Survey Designer Access Tags (${username})

For a user to be able to use the survey builder for a project, they must be added as a designer to the survey.
`
```

```js
Inputs.table(userSurveys.map(r => ({project: r})))
```

```js
viewof userSurvey = Inputs.select(surveys.map(p => p.name), {label: "select survey for operation"})
```

```js
md`##### Add user as a designer to a survey`
```

```js
Inputs.button(md`add *${username}* to *${userSurvey}* as a designer`, {
  reduce: async () => {
    await tagUser(username, {
      "designer": [...new Set(userSurveys.concat(`${userSurvey}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
md`##### Remove user as a designer from a survey`
```

```js
Inputs.button(md`remove *${username}* from *${userSurvey}* as a designer`, {
  reduce: async () => {
    await tagUser(username, {
      "designer": [...new Set(userSurveys.filter(p => p !== `${userSurvey}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
userSurveys = (userTags["designer"] || "").split(" ").filter(v => v !== "")
```

```js
md`#### Survey Filler Access Tags (${username})

For a user to fill out a survey, they must 1. be added as a filler for that project (and 2. also as a member of an account, which is next).

`
```

```js
Inputs.table(userFills.map(r => ({represents: r})))
```

```js
viewof userFiller = Inputs.select(surveys.map(p => p.name), {label: "select survey for operation"})
```

```js
md`##### Add user as a filler to a survey project`
```

```js
Inputs.button(md`add *${username}* to *${userFiller}* as a filler`, {
  reduce: async () => {
    await tagUser(username, {
      "filler": [...new Set(userFills.concat(`${userFiller}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
md`##### Remove user as a filler to a survey project`
```

```js
Inputs.button(md`remove *${username}* from *${userFiller}* as a filler`, {
  reduce: async () => {
    await tagUser(username, {
      "filler": [...new Set(userFills.filter(p => p !== `${userFiller}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
userFills = (userTags["filler"] || "").split(" ").filter(v => v !== "")
```

```js
md`#### Survey Filler Account Tags (${username})

A filler must be a member of an account to fill out a survey.
`
```

```js
Inputs.table(userAccounts.map(r => ({represents: r})))
```

```js
viewof userAccount = Inputs.select(accounts.map(p => p.name), {label: "select account for operation"})
```

```js
md`##### Add user as a survery filler to a survey project`
```

```js
Inputs.button(md`Allow *${username}* to respond on behalf of *${userAccount}*`, {
  reduce: async () => {
    await tagUser(username, {
      "account": [...new Set(userAccounts.concat(`${userAccount}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
md`##### Remove user as a survery filler from a survey project`
```

```js
Inputs.button(md`Deny *${username}* to respond on behalf of *${userAccount}*`, {
  reduce: async () => {
    await tagUser(username, {
      "customer": [...new Set(userAccounts.filter(p => p !== `${userAccount}`))].join(" ")
    })
    mutable refreshTags++;
  }
})
```

```js
access_links = md`#### Access links

Access links are web links to the survey application. Survey fillers can access a survery via a secret URL, which avoids them having to deal with credentials.
`
```

```js
Inputs.button(md`Generate access link for *${username}*`, {
  reduce: async () => {
    const password = `${await getObject(config.PRIVATE_BUCKET, `passwords/${await new hashes.SHA256().hex(username)}`)}`  
    
    viewof access_link.value = `${config.FILLER_APP_URL}?username=${encodeURIComponent(username)}#${password}`
  }
})
```

```js
viewof access_link = {
  const link = document.createElement("a")
  link.target = "_blank"
  return Object.defineProperty(link, 'value', {
    get: () => link.href,
    set: (newLink) => {
      link.href = newLink;
      link.innerHTML = newLink
    },
    enumerable: true
  });                          
}
```

```js
userAccounts = (userTags["account"] || "").split(" ").filter(v => v !== "")
```

```js
md`#### All tags for a user (${username})

This shows all tags at are active on a user account (useful for debugging)
`
```

```js
Inputs.table(Object.entries(userTags).map(r => ({"key": r[0], "value": r[1]})), {
  
})
```

```js
userTags = refreshTags && listUserTags(username)
```

```js
mutable refreshTags = 1;
```

```js
md`## AWS Configuration`
```

```js
REGION = "us-east-2"
```

```js
md`### IAM User Groups

User groups broadly control access policy. Groups are preconfigured outside of this application, in the AWS IAM console. 

Our application distinguishes only between 'admins' (users with control of the AWS account) and 'users' (those who may create and maintain surveys and discover their fine-grained permissions). Fine-grained permissions are toggled with user tags in the [user permissions](#user-permissions) section.
` 
```

```js
Inputs.table(groups, {
  columns: ["GroupName", "GroupId", "Arn", "CreateDate"]
})
```

```js
md`
All users can query information about themselves and their own tags, so that they can self-discover resource access.

~~~js
{
  "Effect": "Allow",
  "Action": [
    "iam:GetUser",
    "iam:ListUserTags"
  ],
  "Resource": "arn:aws:iam::032151534090:user/\${aws:username}"
}
~~~

Enforcing that a user can only access projects they are assigned is acheived by a policy on the object tags in the S3 bucket:

~~~js
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::private-mjgvubdpwmdipjsn/*",
  "Condition": {
    "StringLike": {
      "aws:PrincipalTag/designer": "*\${s3:ExistingObjectTag/project}*"
    }
  }
}
~~~

We enforce that designers can only upload files for their projects:

~~~js
{
    "Effect": "Allow",
    "Action": [
        "s3:putObjectTagging"
        "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::private-mjgvubdpwmdipjsn/*",
    "Condition": {
        "StringLike": {
            "aws:PrincipalTag/designer": "*\${s3:RequestObjectTag/project}*"
        }
    }
}
~~~
`
```

```js
groups = listGroups()
```

```js
import {config} from '@categorise/surveyslate-components'
```

```js
md`## Imports`
```

```js
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, viewof manualCredentials, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup, createInvalidation} with {REGION as REGION} from '@tomlarkworthy/aws'
```

```js
import {toc} from "@bryangingechen/toc"
```

```js
import {encrypt} from '@endpointservices/notebook-secret'
```

```js
import {randomId} from '@tomlarkworthy/randomid'
```

```js
import {localStorageView} from '@tomlarkworthy/local-storage-view'
```

```js
import {enableJavasscriptSnippet} from '@categorise/gesi-styling'
```

```js
hashes = require("jshashes")
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
