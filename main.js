const { Client, Intents, Message, MessageEmbed } = require('discord.js');

const RedditImageFetcher = require("reddit-image-fetcher");

const economy = require('./economy.json');
require('dotenv').config();


const wiki = require('wikipedia');
const fs = require('fs');
const { searchError } = require('wikipedia');
const { deprecate } = require('util');
const { randomInt } = require('crypto');
const { captureRejectionSymbol } = require('events');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.login(process.env.CLIENT_TOKEN);
prefix = process.env.PREFIX;

appId = 'TWJT4P-GP6Q4UTQ7X';

const help = new MessageEmbed()
    .setAuthor('pepejam moment')
    .setColor('#0099ff')
    .setTitle('Help')
    .addFields(
        { name: 'Education', value: 'Type `pj help education` for a list of commands\n---------------------------------------------------\n\n' },
        { name: 'Funny', value: 'Type `pj help funny` for a list of commands\n---------------------------------------------------\n\n' },
        { name: 'Money', value: 'Type `pj help money` for a list of commands\n---------------------------------------------------\n\n' },
    )

const educationHelp = new MessageEmbed()
    .setAuthor('pepejam moment')
    .setColor('#0099ff')
    .setTitle('Education')
    .addFields(
        { name: ':book:**Wikipedia**', value: 'Type `pj search wiki <query>` to search for something on Wikipedia.\n---------------------------------------------------\n' },
        { name: ':brain:**Wolfram Alpha**', value: 'Type `pj search wa <query>` to search for a query on Wolfram Alpha' }
    )
const funnyhelp = new MessageEmbed()
    .setAuthor('pepejam moment')
    .setColor('#0099ff')
    .setTitle('Funny')
    .addFields(
        { name: ':rofl:Memes', value: 'Type `pj meme` to get a randomly generated meme from reddit!' }
    )

const moneyhelp = new MessageEmbed()
    .setAuthor('pepejam moment')
    .setColor('#0099ff')
    .setTitle('Memes')
    .addFields(
        { name: ':scales:Balance', value: 'Type `pj bal` to see your bank and pocket balance\n---------------------------------------------------\n' },
        { name: ':gun:Rob', value: 'Type `pj rob <user to rob> <amount to steal>` to steal from someone' }
    )

client.on('messageCreate', function (message) {
    try {
        if (message.content.startsWith(prefix)) {
            message.content = message.content.toLowerCase();
            message.content = message.content.replace('pj ', '');
            var spaceCount = (message.content.split(' ').length - 1);
            if (message.content.startsWith('help')) {
                sendHelp(message);
            } else if (message.content.startsWith('search')) {
                search(message);
            } else if (message.content.startsWith('meme')) {
                sendMeme(message);
            } else if (message.content.startsWith('bal')) {
                message.content.replace('bal ', '');
                showBal(message, message.author.discriminator, message.author.username);
            } else if (message.content.startsWith('dep')) {
                message.content = message.content.replace('dep ', '');
                deposit(message, message.author.discriminator.toString(), message.content);
            } else if (message.content.startsWith('withdraw')) {
                message.content = message.content.replace('withdraw ', '');
                withdraw(message, message.author.discriminator.toString(), message.content);
            } else if (message.content.startsWith('rob')) {
                message.content = message.content.replace('rob ', '');
                console.log(message.mentions.members.first);
                if (message.content.split(' ').length === 1) {
                    message.channel.send('Make sure to put the amount to rob!');
                } else {
                    rob(message, message.author.discriminator, message.mentions.users.first().discriminator, message.content.split(' ')[1], message.mentions.users.first().username);
                }
            } else if (message.content.startsWith('give')) {
                message.content = message.content.replace('give ', '');
                if (message.content.split(' ').length === 1) {
                    message.channel.send('Make sure to put the amount to send!');
                } else {
                    // TODO
                }
            }
        }
    } catch (err) {
        const error = new MessageEmbed()
            .setAuthor('pepejam sad moment')
            .setTitle('Oopsie! There was an error. Contact Adam!')
        message.channel.send({ embeds: [error] });
    }
})


function sendHelp(message) {
    if (message.content.replace('help', '') === '') {
        message.channel.send({ embeds: [help] });
    } else {
        message.content = message.content.replace('help ', '');
        if (message.content == 'education') {
            message.channel.send({ embeds: [educationHelp] });
        } else if (message.content === 'funny') {
            message.channel.send({ embeds: [funnyhelp] });
        } else if (message.content === 'money') {
            message.channel.send({ embeds: [moneyhelp] });
        }
    }
}

function search(message) {
    message.content = message.content.replace('search ', '');
    if (message.content.startsWith('wa')) {
        message.content = message.content.replace('wa ', '');
        const res = new MessageEmbed().setImage(`http://api.wolframalpha.com/v1/simple?appid=${appId}&i=${encodeURIComponent(message.content)}`);
        message.channel.send({ embeds: [res] });
    } else if (message.content.startsWith('wiki')) {
        message.content = message.content.replace('wiki ', '');
        (async () => {
            try {
                const page = await wiki.page(`${message.content}`);
                const summary = await page.summary();
                console.log(summary);
                const wikiembed = new MessageEmbed()
                    .setAuthor('pepejam moment')
                    .setColor('#0099ff')
                    .setURL(`${page.fullurl}`)
                    .setTitle(`${summary.title}`)
                    .setDescription(`${summary.description}`)
                    .addFields(
                        { name: `${summary.title}`, value: `${summary.extract}` }
                    )
                message.channel.send({ embeds: [wikiembed] });
            } catch (error) {
                console.log(error);
            }
        })();
    }
}

function sendMeme(message) {
    RedditImageFetcher.fetch({
        type: 'custom',
        subreddit: ['shitposts'],
    }).then(result => {
        console.log(result['0'].image);
        const meme = new MessageEmbed()
            .setImage(`${result['0'].image}`)
        message.channel.send({ embeds: [meme] });
    });
}

function showBal(message, user, username) {
    fs.readFile('./economy.json', (err, jsonstr) => {
        if (err) return console.log(err);
        const data = JSON.parse(jsonstr);
        const balance = new MessageEmbed()
            .setAuthor('pepejam moment')
            .setColor('#0099ff')
            .setTitle(`${username}'s balance`)
            .addFields(
                { name: 'Pocket Money', value: `${data[`${user.toString()}`].pocket.toString()}$` },
                { name: 'Bank Money', value: `${data[`${user.toString()}`].bank.toString()}$` }
            )
        message.channel.send({ embeds: [balance] });
    })
}

function deposit(message, user, amount) {
    if (economy[`${user}`].bank + parseInt(amount) > (economy[`${user}`].pocket + economy[`${user}`].bank)) {
        message.channel.send('and with what money r u gonna do that?');
    } else {
        economy[`${user}`].bank += parseInt(amount);
        economy[`${user}`].pocket -= parseInt(amount);
        fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
            if (err) return console.log(err);
        })
    }
}

function withdraw(message, user, amount) {
    if (economy[`${user}`].pocket + parseInt(amount) > (economy[`${user}`].bank + economy[`${user}`].pocket)) {
        message.channel.send('and with what money r u gonna do that?');
    } else {
        economy[`${user}`].bank -= parseInt(amount);
        economy[`${user}`].pocket += parseInt(amount);
        fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
            if (err) return console.log(err);
        })
    }
}

function rob(message, userRobbing, userToRob, amount, victimname) {
    const success = randomInt(1, 10);
    amount = parseInt(amount);
    if (success % 2 === 0) {
        if (economy[`${userToRob}`].pocket < amount) {
            message.channel.send('User doesn\'t have enough money in their pocket!');
        } else {
            economy[`${userRobbing}`].pocket += amount;
            economy[`${userToRob}`].pocket -= amount;
            const robbed = new MessageEmbed()
                .setAuthor('pepejam moment')
                .setTitle(`You successfully stole ${amount}$ from ${victimname}!`)
            message.channel.send({ embeds: [robbed] });
            fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
                if (err) return console.log(err);
            })
        }
    } else {
        const lost = amount * 0.25
        economy[`${userRobbing}`].pocket -= lost;
        economy[`${userToRob}`].pocket += lost;
        const caught = new MessageEmbed()
            .setAuthor('pepejam moment')
            .setTitle(`You were caught and payed ${victimname}  ${lost}$`)
        message.channel.send({ embeds: [caught] });
        fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
            if (err) return console.log(err);
        });
    }
}

function give(message, giver, receiver, amount, givername, receivername) {
    if ((economy[`${giver}`].pocket + economy[`${giver}`].bank) < amount) {
        message.channel.send('You dont have enough money to do that...');
    } else {
        if (economy[`${giver}`].pocket < amount) {

        }
        fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
            if (err) return console.log(err);
        });
    }
}


// economy['1449'].pocket = economy['1449'].pocket + 1;
// fs.writeFile('./economy.json', JSON.stringify(economy, null, 2), function writeJson(err) {
//     if (err) return console.log(err);
// })