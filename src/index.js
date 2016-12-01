/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

/**
 * Alexa skill "Guess my age"
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.2cd6bfc9-1307-4c51-b3c7-f909b29f207e';

const languageStrings = {
    'en-GB': {
        translation: {
            WELCOME_MESSAGE: 'Welcome to Guess my age! Do you want to play now?',
            WELCOME_REPROMPT: 'Say yes to start the game or no to quit.',
            STEPS: [
                'Multiply the first number of your age by five and tell me ok when you are ready',
                'Add three to this number and tell me ok',
                'Double this figure',
                'Add the second number of your age to the last figure and tell me the result'
            ],
            SKILL_NAME: 'Guess my age',
            RESULT_MESSAGE: 'Your age is ',
            RESULT_MESSAGE_END: ' years.',
            HELP_MESSAGE: 'You can say guess my age, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
            REPROMPT_OK: 'Tell me ok when you are ready or stop to exit the game',
            REPROMPT_RESULT: 'Please tell me the resulting number',
            EARLY_RESULT: 'Don\'t tell me the result yet! Tell me ok when you are ready or stop to exit the game'
        }
    },
    'en-US': {
        translation: {
            WELCOME_MESSAGE: 'Welcome to Guess my age! Do you want to play now?',
            WELCOME_REPROMPT: 'Say yes to start the game or no to quit.',
            STEPS: [
                'Multiply the first number of your age by five and tell me ok when you are ready',
                'Add three to this number and tell me ok',
                'Double this figure',
                'Add the second number of your age to the last figure and tell me the result'
            ],
            SKILL_NAME: 'Guess my age',
            RESULT_MESSAGE: 'Your age is ',
            RESULT_MESSAGE_END: 'years.',
            HELP_MESSAGE: 'You can say guess my age, or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
            REPROMPT_OK: 'Tell me ok when you are ready or stop to exit the game',
            REPROMPT_RESULT: 'Please tell me the resulting number',
            EARLY_RESULT: 'Don\'t tell me the result yet! Tell me ok when you are ready or stop to exit the game'
        }
    }
};

var states = {
    START: '_START',
    STEPS: '_STEPS',
    RESULT: '_RESULT'
};


const genericHandlers = {
    'NewSession': function () {
        this.emit('GuessMyAge');
    },
    'GuessMyAge': function () {
        this.handler.state = states.START;
        this.emit(':ask', this.t('WELCOME_MESSAGE'), this.t('WELCOME_REPROMPT'));
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_MESSAGE'));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.attributes['currentStep'] = undefined;
        this.handler.state = undefined;
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

const startHandlers = {
    'OkIntent': function () {
        this.handler.state = states.STEPS;
        var currentStep = 0;
        this.attributes['currentStep'] = currentStep;
        var stepMessage = this.t('STEPS')[currentStep];
        this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
    },
    'ResultIntent': function () {
        this.emit(':ask', this.t('EARLY_RESULT'), this.t('REPROMPT_OK'));
    },
    'AMAZON.YesIntent': function () {
        this.handler.state = states.STEPS;
        var currentStep = 0;
        this.attributes['currentStep'] = currentStep;
        var stepMessage = this.t('STEPS')[currentStep];
        this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
    },
    'AMAZON.NoIntent': function(){
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

const startHandlerGroup = Alexa.CreateStateHandler(states.START, Object.assign({}, genericHandlers, startHandlers));

const stepHandlers = {
    'OkIntent': function () {
        var currentStep = this.attributes['currentStep'] + 1;
        var numberOfSteps = this.t('STEPS').length;
        if (currentStep < numberOfSteps) {
            this.attributes['currentStep'] = currentStep;
            var stepMessage = this.t('STEPS')[currentStep];
            if (currentStep == numberOfSteps - 1) {
                this.handler.state = states.RESULT;
            }
            this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
        }
    },
    'ResultIntent': function () {
        this.emit(':ask', this.t('EARLY_RESULT'), this.t('REPROMPT_OK'));
    }
};

const stepHandlerGroup = Alexa.CreateStateHandler(states.STEPS, Object.assign({}, genericHandlers, stepHandlers));

const resultHandlers = {
    'OkIntent': function () {
        this.emit(':ask', this.t('REPROMPT_RESULT'), this.t('REPROMPT_RESULT'));
    },
    'ResultIntent': function () {
        this.handler.state = undefined;
        this.attributes['currentStep'] = undefined;
        var result = parseInt(this.event.request.intent.slots.result.value);
        var age = result - 6;
        this.emit(':tell', this.t('RESULT_MESSAGE') + age.toString() + this.t('RESULT_MESSAGE_END'));
    }
};

const resultHandlerGroup = Alexa.CreateStateHandler(states.RESULT, Object.assign({}, genericHandlers, resultHandlers));

exports.handler = (event, context) => {
    console.log('Event: ' + JSON.stringify(event));
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(genericHandlers, startHandlerGroup, stepHandlerGroup, resultHandlerGroup);
    alexa.execute();
};
