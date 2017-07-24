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

var HeroCardName = 'Hero Card';
var SlackButtonsName = 'Slack Buttons';
var BasicTextName = 'Basic Text';
var CodeFormatTextName = 'Code Formatting';
var SlackChannelData = 'Slack Channel Data';
var DemoNames = [
    HeroCardName,
    SlackButtonsName,
    BasicTextName,
    CodeFormatTextName,
    SlackChannelData
];

bot.dialog('/', [
    function (session) {
        session.send('Hi, I am Slack Support Bot!\n\n I will show you what is possible with Bot Framework for Slack.');

        bb.Prompts.choice(session, 'Choose a demo', DemoNames);
    },
    function (session, result) {
        console.log('result:\n');
        console.log(result);

        switch (result.response.entity) {
            case HeroCardName:
                session.beginDialog('herocard');
                break;
            case SlackButtonsName:
                session.beginDialog('buttons');
                break;
            case BasicTextName:
                session.beginDialog('basicMessage');
                break;
            case CodeFormatTextName:
                session.beginDialog('code-formatting');
                break;
            case SlackChannelData:
                session.beginDialog('slack-channel-data');
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
                    .text("The Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle.")
                    .images([
                        bb.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Seattlenighttimequeenanne.jpg/320px-Seattlenighttimequeenanne.jpg")
                    ])
                    .tap(bb.CardAction.openUrl(session, "https://en.wikipedia.org/wiki/Space_Needle"))
            ]);
        session.endDialog(heroCard);
    }
]);

bot.dialog('basicMessage', function (session) {
    session.endDialog('A basic message');
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
        session.endDialog(`You picked: ${result.response.entity}`)
    }
]).triggerAction({ matches: /button/i });

bot.dialog('code-formatting', function (session) {
    session.send("Code with back-tick style code formatting: `var foo = 'bar';`");
    session.send("Code in double parens with single backtick `var code = 'formatted correctly?';`");
    session.send("Code in double parens with triple backtick: ```var code.formatted = true;```");
    session.send('Code in single parens with single backtick `var code = "formatted correctly?"`');
    session.send('Code in single parens with triple backtick: ```var code.formatted = true;```');
    session.endDialog();
}).triggerAction({ matches: /code/i });

bot.dialog('slack-channel-data', function(session) {
    var message = {};
    message.channelData = {
        text: ":tada: Code with back-tick style code formatting: `var foo = 'bar';`"
    }
    session.send("Sending first message:");
    session.send(message);

    session.send("Sending second message:");
    session.send({"channelData": { "text": "Code in double parens with triple backtick: ```var code.formatted = true;```"}});

    session.send("Sending third message:");
    session.send({"channelData": { 'text': 'Code in single parens with single backtick `var code = "formatted correctly?"`'}});

    session.send("Sending fourth message:");
    session.send({"channelData": { 'text': 'Code in single parens with triple backtick: ```var code.formatted = true;```'}});
    session.endDialog();

}).triggerAction({matches: /channel/i});

// END OF LINE
