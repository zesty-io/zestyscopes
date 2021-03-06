'use strict'

const Alexa = require('ask-sdk')
const Request = require('request')
const ZESTY_API_BASE = `${process.env.ZESTY_IO_INSTANCE_URL}/-/custom`
const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).alexa

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
                            Request(
                                {
                                    url: `${ZESTY_API_BASE}/prompt.json?key=no_data`,
                                    json: true
                                },
                                (error, response, sorry) => {
                                    if (response.statusCode !== 200 || error) {
                                        reject()
                                    } else {
                                        resolve(
                                            handlerInput.responseBuilder
                                                .speak(sorry.text)
                                                .getResponse()  
                                        )   
                                    }
                                }
                            )
                        } else {
                            resolve(
                                handlerInput.responseBuilder
                                    .speak(speechText)
                                    .withSimpleCard(`Horoscope`, speechText)
                                    .getResponse()  
                            )    
                        }
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
                            Request(
                                {
                                    url: `${ZESTY_API_BASE}/prompt.json?key=no_data`,
                                    json: true
                                },
                                (error, response, sorry) => {
                                    if (response.statusCode !== 200 || error) {
                                        reject()
                                    } else {
                                        resolve(
                                            handlerInput.responseBuilder
                                                .speak(sorry.text)
                                                .getResponse()
                                        )
                                    }
                                }
                            )
                        } else {
                            resolve(
                                handlerInput.responseBuilder
                                    .speak(speechText)
                                    .withSimpleCard(`${starSign}: Traits`, speechText)
                                    .getResponse()  
                            )    
                        }
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
                    url: `${ZESTY_API_BASE}/alexastarsignbymascot.json?mascot=${mascot}`,
                    json: true
                }, 
                (error, response, starSign) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(starSign.speechResponse)
                                .withStandardCard(
                                    starSign.cardTitle, 
                                    starSign.cardContent,
                                    starSign.cardImage,
                                    starSign.cardImage
                                )
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
                    url: `${ZESTY_API_BASE}/alexastarsign.json?sign=${starSign}`,
                    json: true
                }, 
                (error, response, starSignInfo) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {       
                        resolve(
                            handlerInput.responseBuilder
                                .speak(starSignInfo.speechResponse)
                                .withStandardCard(
                                    starSignInfo.cardTitle, 
                                    starSignInfo.cardContent,
                                    starSignInfo.cardImage,
                                    starSignInfo.cardImage
                                )
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
        return new Promise((resolve, reject) => {
            Request(
                {
                    url: `${ZESTY_API_BASE}/prompt.json?key=end_session`,
                    json: true
                }, (error, response, goodbye) => {
                    if (response.statusCode !== 200 || error) {
                        reject()
                    } else {
                        resolve(
                            handlerInput.responseBuilder
                                .speak(goodbye.text)
                                .getResponse()         
                        )
                    }
                }
            )
        })        
    }
}

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
    },
    handle(handlerInput) {
        // any cleanup logic goes here - we don't need any.
        return handlerInput.responseBuilder.getResponse()
    }
}

const ErrorHandler = {
    canHandle() {
      return true
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`)

        return new Promise((resolve, reject) => {
            Request(
            {
                url: `${ZESTY_API_BASE}/prompt.json?key=general_error`,
                json: true
            }, (error, response, apology) => {
                if (response.statusCode !== 200 || error) {
                    reject()
                } else {
                    resolve(
                        handlerInput.responseBuilder
                            .speak(apology.text)
                            .reprompt(apology.text)
                            .getResponse()         
                    )
                }
            })
        })
    }
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

exports.handler = dashbot.handler(Alexa.SkillBuilders.custom()
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
    .lambda()
)