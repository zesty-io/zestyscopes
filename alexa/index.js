'use strict'

const Alexa = require('ask-sdk')
const Request = require('request')
const ZESTY_API_BASE = 'http://zestyscopes.zesty.site/-/custom'

let skill

exports.handler = async function (event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        StarSignDatesIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create()
  }
  
  return skill.invoke(event,context)
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
    },
    handle(handlerInput) {
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!'

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse()
    }
}

const StarSignDatesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StarSignDatesIntent'
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            const starSign = handlerInput.requestEnvelope.request.intent.slots.star_sign.resolutions.resolutionsPerAuthority[0].values[0].value.name

            Request(
                {
                    url: `${ZESTY_API_BASE}/starsign.json?sign=${starSign}`,
                    json: true
                }, 
                (error, response, starSignInfoArr) => {
                    let speechText

                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        const starSignInfo = starSignInfoArr[0]
                        speechText = `People with birthdays between ${starSignInfo.startDate} and ${starSignInfo.endDate} have ${starSign} as their sign.`
        
                        resolve(
                            handlerInput.responseBuilder
                                .speak(speechText)
                                .withSimpleCard(`Dates for ${starSign}`, speechText)
                                .getResponse()  
                        )    
                    }
                }
            )
        })
    }
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!'

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse()
    }
}

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!'

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse()
    }
}

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse()
    }
}

const ErrorHandler = {
    canHandle() {
      return true
    },
    handle(handlerInput, error) {
      console.log("Error handled: "+error.message+"}")
  
      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse()
    },
  }