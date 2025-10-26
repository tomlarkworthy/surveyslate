# Survey Slate | Technical Overview

_Documentation for getting started with your own survey application & orientation to application components._

```js
md`
<div style="max-width: ${width/1.75}px; margin: 30px 0; padding: 15px 30px; background-color: #e0ffff; font: 700 18px/24px sans-serif;">👋 Welcome!  This notebook is about **Survey Slate**&mdash;an [assemblage of Observable web-based notebooks](https://observablehq.com/collection/@categorise/survey-slate) allowing organizations to host custom surveys for end users on their own AWS infrastructure. ✨</div>

<!-- Notification design borrowed from https://observablehq.com/@jashkenas/inputs -->
`
```

```js
md`
---
`
```

```js
md`
Survey Slate allows organizations to host custom surveys for end users on their own AWS infrastructure. The Survey Slate system is comprised of an [assemblage of Observable web-based notebooks](#core-application-notebooks), each of which can be **forked** and customized **programmatically** using just a browser.

The main objectives in creating the Survey Slate application are:

  - Infinite customizability for future extensibility
  - Secure data isolation
  - Sign-in with link
  - BYO Cloud buckets for data compliance.

This notebook introduces the Survey Slate's architecture and walks through the process of deploying the application to help others implement and adapt it.  Have question or wish to help us improve?  Please feel welcome to open a comment or send a suggestion!  And thank you for your time and interest!
`
```

```js
toc()
```

```js
import {toc} from "@bryangingechen/toc"
```

```js
md`## Application Software`
```

### Core Application Notebooks

Three notebooks comprise the main entry points for the different types of system users:

| Notebook | Audience | Purpose | 
|---|---|---|---|---|
| [Filler](https://observablehq.com/@categorise/opensurvey?collection=@categorise/gesi-survey) | End Users / Those Answering Questions | Provides a view of the survey to be completed.  Access is to survey fillers by way of authorized links. |  |  |  |
| [Designer](https://observablehq.com/@categorise/survey-designer?collection=@categorise/gesi-survey) | Survey Creators /  Those asking questions | Provides an interface to create and edit survey content. |  |  |  |
| [Admin](https://observablehq.com/@categorise/survey-admin?collection=@categorise/gesi-survey) | Technical Owners / IT Administrators | Provides utilities for survey & user management, including definition of permissions / access controls and a means of deploying created surveys to CloudFront. |  |  |  |

Each application notebook can be accessed from the Observablehq domain, however the best way to view each page is through AWS S3/CloudFront, as doing so avoids potential style conflicts.  Once deployed, each survey application is can be accessed and used without a dependency on Observable servers.

### Application Customizations & Extension Notebooks

To extend and adapt application functionality and to customize application services programmatically, we utilize two additional notebooks:

| Notebook | purpose 
|---|---|---|---|---|
| [Components](https://observablehq.com/@categorise/survey-components) | Survey component library and global configuration|  |  |  |
| [Styling](https://observablehq.com/@categorise/gesi-styling) | Page layout and CSS for presenting a survey

### Ecosystem Helper Notebooks

Survey Slate is built using other resources contributed and shared openly by our team members and others.  These open source notebooks are found within the Observable ecosystem. We'd like to highlight some of the bigger contributions:

| Notebook | Purpose 
|---|---|---|---|---|
| [AWS Helpers](https://observablehq.com/@tomlarkworthy/aws) | Helpers for accessing resources hosted on AWS based on the AWS SDK for JavaScript.|  |  |  |
| [Deploy Notebook to S3](https://observablehq.com/@tomlarkworthy/notebook-deploy-to-s3) | An architecture based on the AWS Helpers to help more easily deploys notebook to S3 (and invalidating CloudFront cache). | 
| [Notebook Secret](https://observablehq.com/@endpointservices/notebook-secret) | A means of encrypting notebook secrets.
| [View literal](https://observablehq.com/@tomlarkworthy/view) | A helper function (and corresponding explanatory notes) intended to ease the burden of building complex UIs.
| [UI development](https://observablehq.com/@tomlarkworthy/ui-development) | A tutorial on building complex UIs
| [Jeremy Ashkenas' Inputs](https://observablehq.com/@jashkenas/inputs) | A set of UI components first published in 2018 and initially the 'go-to' means of adding interactive inputs to Observable notebooks.
| [Observable's Inputs](https://observablehq.com/@observablehq/inputs) | Another set of UI components, released in 2021 and intended to help ensure greater inputs accessibility (for both humans and machines). 


## Cloud Hosting Architecture

Survey Slate uses AWS application hosting, data storage and user management. Service components are as follows:

| AWS Service | purpose 
|---|---|---|---|---|
| [S3](https://us-east-2.console.aws.amazon.com/console/home?region=us-east-2) | Cloud file storage. Separate buckets are used for surveys, responses and configuration.
| [IAM](https://console.aws.amazon.com/iam/home?region=us-east-2) | User management and access policies.
| [Cloud Front](https://console.aws.amazon.com/cloudfront/v3/home?region=us-east-2) | Content delivery (for application serving).

The design concept aims for Cloud simplicity:

- There is no database, only files and folder in S3 buckets which can be manipulated directly
- There are no deployed compute resources.
- Authorization is achieved with IAM resource policies on resource tags.

Static configuration for resource layout is in the [component](https://observablehq.com/@categorise/survey-components) notebook in a cell named [config](https://observablehq.com/@categorise/survey-components#config).


### S3 structure

For security and ease of comprehension, data are divided across three S3 buckets. Each bucket is prefixed by its security theme.

| Bucket name prefix | purpose 
|---|---|---|---|---|
| confidential | Contains end user data (survey responses).
| private | Contains private org data (survey content and settings).
| public | Contains externally accessible data (application software and encrypted end user credentials).

Within each bucket are several for-purposes directories, as described below.


#### Confidential Bucket

External customer data is confidential, and ringfenced within a dedicated bucket, organized as follows:

| path | purpose 
|---|---|---|---|---|
| `/accounts/<account_id>/settings.json` | Per-account data.
| `/accounts/<account_id>/survey/<survey_id>/answers_<timestamp>.json` | Survey answers.

Each directory folder under `/accounts/survey/` represents a specific survey (set of questions), with an unlimited number of surveys being possible for each account. When an authorized account respondent (survey filler) responds or updates a survey, answers are stored in a time-stamped file. The per-account data file contains a pointer to the latest set of answers.


#### Private Bucket

The private bucket is for internal organizational data

- survey design data
- passwords for authorized link access.

| path | purpose 
|---|---|---|---|---|
| `/surveys/<survey_id>/settings.json` | Survey metadata
| `/surveys/<survey_id>/layout_<timestamp>.json` | Survey layout
| `/surveys/<survey_id>/questions_<timestamp>.json` | Survey questions
| `/surveys/<survey_id>/version_<timestamp>.json` | Survey versions
| `/passwords/<username hash>` | Password for magic URLs 


#### Public Bucket

The public bucket is for access on the open internet

- exported app notebooks
- password protected encrypted IAM credentials

| path | purpose 
|---|---|---|---|---|
| `/apps/designer/index.html` | Exported Designer notebook entrance point
| `/apps/survey/index.html` | Exported Filler notebook entrance point
| `/credentials/<username hash>` | Encrypted IAM credentials for AWS access


### IAM and security

Buckets contain sensitive data, access to the S3 is protected with AWS IAM policies. We achieve Attribute Based Access Control by extensive use of Resource Tags.

- relevant AWS article [Controlling access to AWS resources using tags](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_tags.html).

Organization staff and end users are grouped together under one IAM user group called "Users". However, what particular objects in s3 can be access depends on 

- Tags on the user's Principle (see [Controlling access to and for IAM users and roles using tags](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_iam-tags.html))
- Tags on the object being access in S3 (see [Controlling access to AWS resources using tags](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_tags.html))

Thus, a single IAM user *may* be a designer for one survey, and a survey filler for another.



#### IAM User Groups

We use two IAM user groups

- Admins (technical staff like developers who access the AWS console)
- Users (All other users, including Survey Slate admins, designers and fillers)

#### Principle Tags

IAM users who are members of the group "Users" are tagged to represent data access

| Principle tag key | value
|---|---|---|---|---|
| `designer` | List of surveys the user is authorized to modify
| `account` | List of organizations the user is part of
| `filler` | List of surveys the user can respond to

We make extensive use of embedded lists in values, using `" "` to delimited entries.*

_* In retrospect, we would use `"|"`&mdash;including on the start and end of the value&mdash;to simplify the AWS policy expression._


#### S3 Object Tags

Objects in S3 are tagged to denote who has read/write access to them.

| Bucket | Resource tag key | value
|---|---|---|---|---|
| `private` | `survey` | The survey this object belongs to
| `confidential` | `account` | The organization this object belongs to


#### IAM User-Resource Policy

A single IAM policy is attached to the 'Users' group which enforces constraints such as
- Only users tagged as designers containing the value "survey1" can *read/write* S3 objects tagged with survey "survey1" in the private bucket
- Only users tagged as filler containing the value "survey2" can *read* S3 objects tagged with survey "survey1" in the private bucket
- Only users tagged as account containing the value "org1" can *read/write* S3 objects tagged with account "org1" in the confidential bucket

The main trick to the IAM policy is using StringLike condition which will perform substring matching, which is the semantic we need to perform "containing" logic between a SCALAR and a LIST. See the following example. Note __*__ is wildcard matching.

```js
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::private/*", // Rule applies to access in the private bucket
            "Condition": {
                "StringLike": {
                    // look for "project" SCALAR inside 'designer' LIST  
                    "aws:PrincipalTag/designer": "*\${s3:ExistingObjectTag/project}*"
                }
            }
```

#### IAM User Capability Self-Discovery

Users are granted permission to read their own tags so they can discover what they have access too.

```js
            "Effect": "Allow",
            "Action": [
                "iam:GetUser",
                "iam:ListUserTags"
            ],
            "Resource": "arn:aws:iam::032151534090:user/\${aws:username}"
        }
```

```js
md`### Reference Policy`
```

```js
policy = ({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "UserListOwnTags",
            "Effect": "Allow",
            "Action": [
                "iam:GetUser",
                "iam:ListUserTags"
            ],
            "Resource": "arn:aws:iam::032151534090:user/${aws:username}"
        },
        {
            "Sid": "DesignerReadSurvey",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::private-mjgvubdpwmdipjsn/*",
            "Condition": {
                "StringLike": {
                    "aws:PrincipalTag/designer": "*${s3:ExistingObjectTag/survey}*"
                }
            }
        },
        {
            "Sid": "DesignerWriteSurvey",
            "Effect": "Allow",
            "Action": [
                "s3:putObjectTagging",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::private-mjgvubdpwmdipjsn/*",
            "Condition": {
                "StringLike": {
                    "aws:PrincipalTag/designer": "*${s3:RequestObjectTag/survey}*"
                }
            }
        },
        {
            "Sid": "FillerReadAccount",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::confidential-bspqugxjstgxwjnt/*",
            "Condition": {
                "StringLike": {
                    "aws:PrincipalTag/account": "*${s3:ExistingObjectTag/account}*"
                }
            }
        },
        {
            "Sid": "FillerWriteAccount",
            "Effect": "Allow",
            "Action": [
                "s3:putObjectTagging",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::confidential-bspqugxjstgxwjnt/*",
            "Condition": {
                "StringLike": {
                    "aws:PrincipalTag/account": "*${s3:RequestObjectTag/account}*"
                }
            }
        },
        {
            "Sid": "FillerReadSurvey",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::private-mjgvubdpwmdipjsn/*",
            "Condition": {
                "StringLike": {
                    "aws:PrincipalTag/filler": "*${s3:ExistingObjectTag/survey}*"
                }
            }
        }
    ]
})
```

### Magic Link Login Journey

Here we outline the provisioning of an end user credentials that lead to a link which can complete surveys

- Provision an IAM User
- Generate access keys
- Generate password
- Encrypt access keys with password and place in public bucket `/credentials/<username hash>.json`
- Place password in private bucket `/password/<username hash>.json`
- Generate magic link `<URL to survey filler application>?username=<username>#<password>`

The user is sent the magic link via email, which takes them directly to the survey filler app. Then

  - The application hashes the username
  - Looks up the encrypted IAM credential in `/credentials/<username hash>.json`
  - Decrypts the payload with the password (found in URL hash)

At this point the browser will be in possession of IAM access keys and can issue authenticated request to the AWS SDK. The first step will be querying for IAM tags, which will tell the user what surveys and accounts they have access to. From there they can read the relevant `**/settings.json` for survey/account metadata.

**note:**
- The password in the URL is after the hash to avoid transmission over the internet.
- Staff members can be issued IAM access keys directly to avoid storing them encrypted on S3
- AWs limits access keys to two per user => we need to retain access to a users IAM keys indefinitely if we wish to reissue magic links without invalidating old links.
- Storing passwords in S3 seems weird, but its not different to storing them in a DB (it's a KV store)
- It is unusual to store passwords in plain text, but we need to be able generate new magic links on demand. Perhaps we could do better. At least s3 encrypts at-rest.


### CloudFront Application Hosting

The applications are implemented as Notebooks for ease of development. For deployment, the notebooks are exported as a tarball, and placed
in S3. AWS's CDN CloudFront then severs the content over HTTPS from the S3 bucket..

The notebook [deploy notebook to s3](https://observablehq.com/@tomlarkworthy/notebook-deploy-to-s3) is used to provide a top level HTML framing, over Observable's [export notebook](https://observablehq.com/@observablehq/downloading-and-embedding-notebooks#cell-291) tarball.


## Installing on your own AWS account

Our notebooks are attached to a private AWS account with no public access. This section will explain how to move these applications onto your own AWS infrastructure. We have no spent much engineering time on this story yet, but we welcome external contributions to streamline it.

### Provision AWS resources

You need three buckets, a "user" IAM group with an attached "user" IAM policy.

You will need to update the IAM policy to reference your AWS account number and your chosen bucket names.

CloudFront is not so important and can be done later.

### Fork notebooks and update dependencies

Fork the core and support notebooks. Ensure the forked core notebook dependencies point to the new support notebooks.

### Set AWS configuration

Update the configuration found in the forked notebook of [survey-components](https://observablehq.com/@categorise/survey-components)
~~~js
config = ({
  // All artifacts in the PUBLIC bucket are on the internet
  PUBLIC_BUCKET: "public-publicwrfxcsvqwpcgcrpx",
  // The private bucket requires credentials to access, should be for system wide things like user lists
  PRIVATE_BUCKET: "private-mjgvubdpwmdipjsn",
  // The confidential bucket is for customer data, it is encrypted and access should be minimized.
  CONFIDENTIAL_BUCKET: "confidential-bspqugxjstgxwjnt",
  // The URL to redirect users to
  FILLER_APP_URL: "https://observablehq.com/@categorise/opensurvey",
  // Cloud Front distribution ID
  CLOUD_FRONT_DISTRIBUTION_ID: 'EG13QGKCG6LI9',
  // URL that hosts applications
  CLOUD_FRONT_URL: 'https://d3f26ej57oauer.cloudfront.net',
})
~~~

### Create a Admin access key

Create access keys for the person who should be able to create users. Those credentials will be be used with the [admin app](https://observablehq.com/@categorise/survey-admin).

### Create a test survey

Using the [admin app](https://observablehq.com/@categorise/survey-admin) and the admin credentials. 

- "Create New Survey"


### Provision a test user with internal and external access

- "Create a new User"
- "Choose a user to configure" -> select your test user
- "Create an external access code (suitable for Survey Fillers)"
- "Access links" -> "Generate Access link" and **_make a note_**  of the access link
- "Create an internal access key (suitable for designers)"  and **_make a note_**  of the access key


### Provision a test accounts

- "Create a new account"


### Grant the test user design and filler permissions to your test project and test account.

First select your test user
- "Choose a user to configure" -> select your test user


Then make them a designer
- "Survey Designer Access Tags " -> "Select project for operation" -> select your test survey
- "add <user> to <survey> as designer"

Grant them filler access
- "Survey Filler Access Tags " -> "Select project for operation" -> select your test survey
- "add <user> to <survey> as filler"

Grant them access to the test organization
- "Survey Filler Account Tags" -> "select account for operation" -> select your test account
- "Allow <user> to respond on behalf of <account>"

### Test your user

You should be able to use the internal access key to use the forked [Designer app](https://observablehq.com/@categorise/survey-designer?collection=@categorise/gesi-survey). You should be able to use the external access link to use the forked [Filler app](https://observablehq.com/@categorise/opensurvey?collection=@categorise/gesi-survey). You can tell if the access keys are working if you see the account/project/survey drop downs get populated. 

⚠️ Check the Console logs if you encounter problems (option + command + i usually Chrome)


```js
md`
---
`
```

```js
md`
A tiny helper for page jumping, contributed by [@mootari](https://observablehq.com/@mootari) below (undefined).
`
```

```js
{
  const onclick = e => {
    if(e.target.tagName !== 'A') return;
    const href = e.target.getAttribute('href');
    if(href.startsWith('#')) {
      const t = document.querySelector(href);
      if(!t) return;
      e.preventDefault();
      t.scrollIntoView();
    }
  };
  document.body.addEventListener('click', onclick);
  invalidation.then(() => document.body.removeEventListener('click', onclick));
}
```

---

```js
import { substratum } from "@categorise/substratum"
```

```js
substratum({ invalidation })
```
