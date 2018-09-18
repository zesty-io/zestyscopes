'use strict'

const Alexa = require('ask-sdk')
const Request = require('request')
const ZESTY_API_BASE = `${process.env.ZESTY_IO_INSTANCE_URL}/-/custom`

let skill

exports.handler = async function (event, context) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HoroscopeIntentHandler,
        StarSignDatesIntentHandler,
        MascotForStarSignIntentHandler,
        TraitsForStarSignIntentHandler,
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
        return new Promise((resolve, reject) => {
            Request(
                {
                    url: `${ZESTY_API_BASE}/prompt.json?key=welcome`,
                    json: true
                }, (error, response, welcome) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(welcome.text)
                                .reprompt(welcome.text)
                                .withSimpleCard('Welcome', welcome.text)
                                .getResponse()         
                        )
                    }
                }
            )
        })
    }
}

const HoroscopeIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HoroscopeIntent'
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            // star_sign will always be present.
            const starSign = getSlotValue('star_sign', handlerInput)
            
            // week is not guaranteed to be present so default to This week.
            let week = getSlotValue('week', handlerInput)

            if (week === undefined) {
                week = 'This week'
            }

            // TODO filter this on Zesty side...
            Request(
                {
                    url: `${ZESTY_API_BASE}/readings.json`,
                    json: true
                }, 
                (error, response, horoscopesArr) => {
                    let speechText = ''

                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        for (let horoscope of horoscopesArr) {
                            if (horoscope.sign === starSign && horoscope.date === week) {
                                speechText = `Horoscope for ${week.toLowerCase()} for ${starSign}: ${horoscope.reading}`
                                break;
                            }
                        }

                        if (speechText.length === 0) {
                            // Catch all in unlikely case of no match.
                            // http://zestyscopes.zesty.site/-/custom/prompt.json?key=no_data
                            speechText = `Sorry I can't help with that right now.`
                        }
        
                        resolve(
                            handlerInput.responseBuilder
                                .speak(speechText)
                                .withSimpleCard(`Horoscope`, speechText)
                                .getResponse()  
                        )    
                    }
                }
            )
        })
    }    
}

const TraitsForStarSignIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TraitsForStarSignIntent'
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            const starSign = getSlotValue('star_sign', handlerInput)

            Request(
                {
                    url: `${ZESTY_API_BASE}/traits.json`,
                    json: true
                }, 
                (error, response, traitsArr) => {
                    let speechText = ''

                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        for (let traits of traitsArr) {
                            if (traits.sign === starSign) {
                                // Remove list formatting from the traits...
                                const characteristics = traits.traits.split('<ul>').join('').split('</ul>').join('').split('</li>').join('').trim().split('<li>')

                                speechText = `Those born under the sign of ${traits.sign} are said to be: `

                                for (let characteristic of characteristics) {
                                    const trimmedCharacteristic = characteristic.trim()

                                    if (trimmedCharacteristic.length > 0) {
                                        speechText = `${speechText} ${trimmedCharacteristic}. `
                                    }
                                }
                                
                                break
                            }
                        }

                        if (speechText.length === 0) {
                            // Catch all in unlikely case of no match.
                            // http://zestyscopes.zesty.site/-/custom/prompt.json?key=no_data
                            speechText = `Sorry I can't help with that right now.`
                        }
        
                        resolve(
                            handlerInput.responseBuilder
                                .speak(speechText)
                                .withSimpleCard(`${starSign}: Traits`, speechText)
                                .getResponse()  
                        )    
                    }
                }
            )
        })
    }
}

const MascotForStarSignIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MascotForStarSignIntent'
    },    
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            const mascot = getSlotValue('mascot', handlerInput)

            Request(
                {
                    url: `${ZESTY_API_BASE}/starsignbymascot.json?mascot=${mascot}`,
                    json: true
                }, 
                (error, response, starSign) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        const speechText = `${starSign.name} has ${starSign.mascot} as its symbol.`
        
                        resolve(
                            handlerInput.responseBuilder
                                .speak(speechText)
                                .withSimpleCard(`Star Sign Symbol`, speechText)
                                .getResponse()  
                        )    
                    }
                }
            )
        })
    }

}

const StarSignDatesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StarSignDatesIntent'
    },
    handle(handlerInput) {
        return new Promise((resolve, reject) => {
            const starSign = getSlotValue('star_sign', handlerInput)

            Request(
                {
                    url: `${ZESTY_API_BASE}/starsign.json?sign=${starSign}`,
                    json: true
                }, 
                (error, response, starSignInfo) => {
                    let speechText

                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
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
        return new Promise((resolve, reject) => {
            Request(
                {
                    url: `${ZESTY_API_BASE}/prompt.json?key=help`,
                    json: true
                }, (error, response, help) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(help.text)
                                .reprompt(help.text)
                                .withSimpleCard('Help', help.text)
                                .getResponse()         
                        )
                    }
                }
            )
        })
    }
}

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    },
    handle(handlerInput) {
        const speechText = 'TODO Goodbye!'

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('TODO Hello World', speechText)
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
        // http://zestyscopes.zesty.site/-/custom/prompt.json?general_error
        .speak('Sorry, I can\'t understand that. Please try again.')
        .reprompt('Sorry, I can\'t understand that. Please try again.')
        .getResponse()
    },
  }

  const getSlotValue = (slotName, handlerInput) => {
    const requestSlots = handlerInput.requestEnvelope.request.intent.slots

    if (! requestSlots.hasOwnProperty(slotName)) {
        return undefined
    }

    if (! requestSlots[slotName].hasOwnProperty('resolutions')) {
        return undefined
    }

    for (let r of requestSlots[slotName].resolutions.resolutionsPerAuthority) {
        if (r.hasOwnProperty('values')) {
            return r.values[0].value.name
        }
    }

    return undefined
  }