/*
    @author Nils Whitmont <nils.whitmont@gmail.com>

    @summary Slack Bot example for MS Bot Framework
 */
'use strict';

// INIT NODE MODULES
var botframework = require('botbuilder');

// Setup Restify Server
var botServer = require('restify').createServer();

botServer.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', botServer.name, botServer.url);
});

botServer.get('/', function (request, response, next) {
    response.send({ status: 'online'});
    next();
});

// status route
botServer.get('/status', function statusHandler(request, response, next) {
    response.send('Bot server online.');
    next();
});

// Create chatConnector for communicating with the Bot Framework Service
var chatConnector = new botframework.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
botServer.post('/api/messages', chatConnector.listen());

// Create your bot with a function to receive messages from the user
var bot = new botframework.UniversalBot(chatConnector, function (session) {
    session.send("You said: %s", session.message.text);
});

bot.dialog('exit', function(session) {
    session.endConversation('Goodbye!');
}).triggerAction({ matches: /exit/i });

// END OF LINE