# Zesty Scopes

## Introduction

A project to present horoscope content managed by the Zesty.io Content Management System for delivery to multiple channels:

* [Website](http://zestyscopes.zesty.site/) (presentation and hosting also by Zesty.io)
* Amazon Alexa Skill

## Webinar

Watch me present a walkthrough of this codebase and how to use it with Zesty.io CMS in a [webinar recording on YouTube](https://www.youtube.com/watch?v=pIlA7T2TQK4).

## API Endpoints

### Get all Star Signs

```
http://zestyscopes.zesty.site/-/custom/starsigns.json
```

[Try it](http://zestyscopes.zesty.site/-/custom/starsigns.json).

### Get Star Sign by Name

```
http://zestyscopes.zesty.site/-/custom/starsign.json?sign=taurus
```

[Try it](
http://zestyscopes.zesty.site/-/custom/starsign.json?sign=taurus).

### Get all Traits for all Star Signs

```
http://zestyscopes.zesty.site/-/custom/traits.json
```

[Try it](http://zestyscopes.zesty.site/-/custom/traits.json).

### Get all Readings for all Star Signs

```
http://zestyscopes.zesty.site/-/custom/readings.json
```

[Try it](http://zestyscopes.zesty.site/-/custom/readings.json).

### Get the Mascot for a Star Sign

```
http://zestyscopes.zesty.site/-/custom/starsignbymascot.json?mascot=The%20Ram
```

[Try it](http://zestyscopes.zesty.site/-/custom/starsignbymascot.json?mascot=The%20Ram).

### Get a Prompt by Key

```
http://zestyscopes.zesty.site/-/custom/prompt.json?key=welcome
```

[Try it](http://zestyscopes.zesty.site/-/custom/prompt.json?key=welcome).

## Resources

* [Zesty.io Developer Resources](https://developer.zesty.io/)
* [Zesty.io Custom JSON Endpoints documentation](https://developer.zesty.io/docs/code-editor/customizable-json-endpoints-for-content/)
* [Alexa Skills Kit for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/)
* [Random horoscope generator](http://www.glossynews.com/funnyhitman/horoscopes.php)
