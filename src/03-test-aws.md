# 03 test 1


```js
display(manualCredentialsElement)
```

```js
display(manualCredentials)
```

----

Demo Credentials for Testing:


        {
          "accessKeyId": "AKIAQO7DBPIFDAUBK4SL",
          "secretAccessKey": "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"
        }



---






```js echo
display(saveCredsElement);
```


```js echo
display(saveCreds);
```



---


```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(iam)
```

```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(getUser)
```


```js echo
const me = getUser()
display(me)
```

```js echo
///!!!!
// Check that this is awaited where necessary.
///!!!
const myTags = await listUserTags(me.UserName);
display(myTags)
```


```js echo
const surveys = myTags['designer'].split(" ")
display(surveys)
```

```js echo
display(listObjects)
```


```js echo
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, mfaCode, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup, manualCredentialsElement, manualCredentials, saveCredsElement, saveCreds} from '/components/aws.js';
```

```js echo
const REGION = 'us-east-2'
```


```js echo
display(listObjects)
```

```js echo
display(getObject)
```
```js echo
display(putObject)
```
```js echo
display(listUsers)
```
```js echo
display(createUser)
```
```js echo
display(deleteUser)
```
```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(getUser)
```
```js echo
display(listAccessKeys)
```
```js echo
display(createAccessKey)
```

```js echo
display(deleteAccessKey)
```
```js echo
/// We don't want to keep invoking it as it jumps across the DOM. We can bind it.
///display(manualCredentialsElement)
```
```js echo
display(manualCredentials)
```
```js echo
display(mfaCode)
```
```js echo
display(saveCreds)
```
```js echo
display(saveCreds)
```
```js echo
display(listUserTags)
```
```js echo
display(tagUser)
```
```js echo
display(untagUser)
```
```js echo
display(iam)
```
```js echo
display(s3)
```
```js echo
display(listGroups)
```
```js echo
display(listGroupsForUser)
```
```js echo
display(addUserToGroup)
```
```js echo
display(removeUserFromGroup)
```

