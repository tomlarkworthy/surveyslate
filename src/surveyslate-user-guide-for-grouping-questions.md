# User Guide for Survey Slate Designer

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure.  Check out the [Technical Overview](https://observablehq.com/@categorise/surveyslate-docs) to get started! ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js
toc({
  headers: "h2,h3,h4,h5"
})
```

## Grouping Questions

Each question can be made part of one or more group. You can create a group by providing a group identifier. All the questions marked with the same group identifier will be part of that group.

You can use grouping for two purposes:
1. To create logical flow based on answers to the questions. Example: You want to show question, Q2 if the respondent chose 'Yes' to the question Q1.
2. To compute score based on a group of questions.

### Creating Logical Flows

#### Adding a key question

1. First create a question with label and necessary options if it is a checkbox or radio.
2. In Grouping section, under Group column type in a group identifier. For example, let's use the identifier `group_one`.
3. Then, under the column role, pick `yesnomaybe`.

By doing this, you have created a group with identifier `group_one` and made this question as **the key question** in the group. 

⚠️ _A group can have only one key question._

#### Adding a dependent question

1. Now, let create another question. Within its grouping section, under the Group column, type in `group_one`.
2. Pick a role `ifyes`.

Now you created **a dependent question** within the group, `group_one`. By choosing the role, `ifyes`,  question will be only visible to the respondent if the answer to the key question is `yes`. You can choose `ifno` if you want to show this question in case of `no` to the first question.

ℹ️ _A group can have any number of dependent questions._

### Custom Scoring

Similar to creating logical flows. Create some questions. In the grouping section of each question, type in `group_two` and set the role as `scored`. Thus, we are making those questions part of the `group_two`. Since we have marked their role as `scored`, their scores can be combined and shows using `summary` or `aggregateSummary` UI.

### Roles

|Role |Aspect of the question the role applies to|Description |
|:--|:--|:--|
|`scored` | Output| _This is the default value_. The output of this question can be used by Summary or Aggregate Summary component to show score summaries. |
|`yesnomaybe` | Output | Denotes that the answer to this question can be `Yes`, `No`, or `May be`.|
|`yes`|Output| Denotes that the answer to this question can be `Yes` or `No`.|
|`ifyes` | Visibility| The question will be visible if the answer to the key question (source question) is `yes`|
|`ifno` | Visibility|The question will be visible if the answer to the key question (source question) is `no`|
|`calculation` | Input | Used by Summary and Aggregate Summary components. Once marked a group by this role, the scores from that group will be shown output. |

## Discussions
*Saneef*:_I'm referring to this feature as 'grouping' instead of 'connections'. I feel the idea of group is more suitable to create logical flows and scoring sets._

*Saneef*: The part I understood is the role `scored` can be used to emit a value. Then, the `calculation` can be used to pick an emitted value.

I created a group of questions with group ID `group_three` and role `scored`. To show their _summary_, I can use a `summary` UI which is part of the group `group_three` and marked as role `calculation`. _Roles of questions are not relevant here_. 

*tom*: You *always* have to have a role when joining a group. The role of the summary is to "calculate", the role of the questions is to provide a "score" hence "scored". The logic is *list of (question_id, group_id, role)*. You might be suggesting that the default role should be *scored* which is perhaps a good idea.

*aaron*: _summary_ will calculate values on all members in a `set`, role does matters to the calculation: for example,  a top-level 'yes' answer tells the calculation to ignore values saved under the 'no' conditional so as not to skew the score and conversely a top-level 'no' will similarly ignore yes answers


I can show _an aggregate summary_ of a group of _summaries_, using a `aggregateSummary` UI. Mark the summaries and aggregate summary as part of a group, say `group_four`. Then mark role in the summaries as `scored`. Then use role `calculation` in the `aggregateSummary` UI. 

Is this understanding correct?

tom: *yes!*

*aaron*:  _aggregate summary_ is a calculation of `mean` across all question `sets` where the results are  binned into a 5-level "Likert" scale.  Because the lower level summary calculates the score of each set, all that _aggregate summary_ is doing is taking the values of those calculations and running another `mean` overtop of them.




*Tom :*
- Default to scored is a good idea, though I think its nice to jsut start the chooser in the scored state
- "ifyes" should be "show if yes".
- There is alternate world where we ditch group_id (set), and just have calculation nodes reference question_id 

```js
import {toc} from "@nebrius/indented-toc"
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
