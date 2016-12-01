/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

/**
 * Alexa skill "Guess my age"
 *
 * Guess my age is a small gag Alexa skill that asks you to perform some calculations with the digits of your age.
 * When you tell the final figure of your calculations, it will tell your age in years.
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.2cd6bfc9-1307-4c51-b3c7-f909b29f207e';

/**
 * Localized texts
 */
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

/**
 * States of the skill
 */
var states = {

    /** The skill is being started */
    START: '_START',

    /** The skill is asking the user to perform the calculations */
    STEPS: '_STEPS',

    /** The skill is waiting for the calculation result from the user */
    RESULT: '_RESULT'
};

/**
 * Generic intent handlers valid in all states
 */
const genericHandlers = {

    // Start a new game
    'NewSession': function () {
        this.emit('GuessMyAge');
    },

    // Initial intent
    'GuessMyAge': function () {
        this.handler.state = states.START;
        this.emit(':ask', this.t('WELCOME_MESSAGE'), this.t('WELCOME_REPROMPT'));
    },

    // Cancel the game
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    // Stop the game
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    // Session ended, clear session variables (in future when they might be persisted)
    'SessionEndedRequest': function () {
        this.attributes['currentStep'] = undefined;
        this.handler.state = undefined;
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

/**
 * Specific handlers valid in START state
 */
const startHandlers = {

    // Starts the game: initializes session variables and asks the first calculation step
    'AMAZON.YesIntent': function () {
        this.handler.state = states.STEPS;
        var currentStep = 0;
        this.attributes['currentStep'] = currentStep;
        var stepMessage = this.t('STEPS')[currentStep];
        this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
    },

    // TODO: why does this.emit('AMAZON.YesIntent') does not work?
    'OkIntent': function () {
        this.handler.state = states.STEPS;
        var currentStep = 0;
        this.attributes['currentStep'] = currentStep;
        var stepMessage = this.t('STEPS')[currentStep];
        this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
    },

    // Too early to say the result yet
    'ResultIntent': function () {
        this.emit(':ask', this.t('EARLY_RESULT'), this.t('REPROMPT_OK'));
    },

    // User does not want to play
    'AMAZON.NoIntent': function(){
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

    // Help intent
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_MESSAGE'));
    }
};

/**
 * The union of generic state handlers and start handlers, to be associated with the START state
 */
const startHandlerGroup = Alexa.CreateStateHandler(states.START, Object.assign({}, genericHandlers, startHandlers));

/**
 * Specific handlers valid in STEP state
 */
const stepHandlers = {

    // This intent iterates through all steps. It saves the current step index to the session variables
    'OkIntent': function () {
        var currentStep = this.attributes['currentStep'] + 1;
        var numberOfSteps = this.t('STEPS').length;
        if (currentStep < numberOfSteps) {
            this.attributes['currentStep'] = currentStep;
            var stepMessage = this.t('STEPS')[currentStep];
            // If this is the last step, switch to RESULT state
            if (currentStep == numberOfSteps - 1) {
                this.handler.state = states.RESULT;
            }
            this.emit(':ask', stepMessage, this.t('REPROMPT_OK'));
        }
    },

    // Too early to say the result yet
    'ResultIntent': function () {
        this.emit(':ask', this.t('EARLY_RESULT'), this.t('REPROMPT_OK'));
    }
};

/**
 * The union of generic state handlers and step handlers, to be associated with the START state
 */
const stepHandlerGroup = Alexa.CreateStateHandler(states.STEPS, Object.assign({}, genericHandlers, stepHandlers));

/**
 * Specific handlers valid in RESULT state
 */
const resultHandlers = {

    // We are expecting the result now
    'OkIntent': function () {
        this.emit(':ask', this.t('REPROMPT_RESULT'), this.t('REPROMPT_RESULT'));
    },

    // Calculate the age based on the result of the user
    'ResultIntent': function () {
        this.handler.state = undefined;
        this.attributes['currentStep'] = undefined;
        var result = parseInt(this.event.request.intent.slots.result.value);
        var age = result - 6;
        this.emit(':tell', this.t('RESULT_MESSAGE') + age.toString() + this.t('RESULT_MESSAGE_END'));
    }
};

/**
 * The union of generic state handlers and result handlers, to be associated with the START state
 */
const resultHandlerGroup = Alexa.CreateStateHandler(states.RESULT, Object.assign({}, genericHandlers, resultHandlers));

/**
 * Lambda handler, simple launches Alexa SDK
 */
exports.handler = (event, context) => {
    console.log('Event: ' + JSON.stringify(event));
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(genericHandlers, startHandlerGroup, stepHandlerGroup, resultHandlerGroup);
    alexa.execute();
};
