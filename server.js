/*
    @author Nils Whitmont <nils.whitmont@gmail.com>

    @summary Slack Bot example for MS Bot Framework
 */
'use strict';

// INIT NODE MODULES
var bb = require('botbuilder');

// Setup Restify Server
var botServer = require('restify').createServer();

botServer.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', botServer.name, botServer.url);
});

// lets us know our bot is online when visiting the deployment URL in browser
botServer.get('/', function (request, response, next) {
    response.send({ status: 'online' });
    next();
});

// status route
botServer.get('/status', function statusHandler(request, response, next) {
    response.send('Bot server online.');
    next();
});

// Create chatConnector for communicating with the Bot Framework Service
var chatConnector = new bb.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
botServer.post('/api/messages', chatConnector.listen());

// Create your bot with a function to receive messages from the user
var bot = new bb.UniversalBot(chatConnector);

bot.dialog('/', [
    function (session) {
        session.send('Hi, I am Slack Support Bot!\n\n I will show you what is possible with Bot Framework for Slack.');

        bb.Prompts.choice(session, 'Choose a demo', ['Hero Card', 'Message with Buttons', 'Basic message']);
    },
    function (session, result) {
        console.log('result:\n');
        console.log(result);

        switch (result.response.entity) {
            case 'Hero Card':
                session.beginDialog('herocard');
                break;
            case 'Basic message':
                session.beginDialog('basicMessage');
                break;
            case 'Message with Buttons':
                session.beginDialog('buttons');
                break;
            default:
                session.send('invalid choice');
                break;
        }
    }
]);

bot.dialog('herocard', [
    function (session) {
        var heroCard = new bb.Message(session)
            .textFormat(bb.TextFormat.xml)
            .attachments([
                new bb.HeroCard(session)
                    .title("Hero Card")
                    .subtitle("Space Needle")
                    .text("The <b>Space Needle</b> is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        bb.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(bb.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.endDialog(heroCard);
    }
]);

bot.dialog('basicMessage', function (session) {
    session.send('A basic message');
});

bot.dialog('exit', function (session) {
    session.endConversation('Goodbye!');
}).triggerAction({ matches: /exit/i });

bot.dialog('buttons', [
    function (session) {
        session.send('What kind of sandwich would you like?');

        bb.Prompts.choice(session, "Choose a sandwich:", ["Tuna", "Roast Beef", "Veggie Special"]);
    },
    function (session, result) {
        session.send(`You picked: ${result.response.entity}`)
    }
]).triggerAction({ matches: /button/i })

// END OF LINE
