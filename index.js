
const axios = require('axios');
const res = require('express/lib/response');
require('dotenv').config()
const { Client, Intents, MessageEmbed, Channel } = require('discord.js');
const client = new Client(
    { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }
);
// Notify progress
client.on('ready', function (e) {
    console.log(`Logged in as ${client.user.tag}!`)
})
// Authenticate
client.login(process.env.DISCORD_TOKEN)

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI
const clientDB = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
var mode = ''
var cc = ''
var check = ''
var agent = ''
var score = 0
var kills = 0
var deaths = 0
var assists = 0
var headshots = 0
var bodyshots = 0
var legshots = 0
var count = 0
var dmgm = 0
var dmgr = 0
var rw = 0
var rl = 0
let icon = ''
let streak = ''
let foot = ''
let rr = 0
let n = 0
let rep = ''


client.on('messageCreate',
    async function (msg) {
        if (msg.content.includes("!verify ")) {
            var data = msg.content.replace(/!verify /g, '');
            let name = data.split('#')
            let userID = name[0]
            let tag = name[1]

            clientDB.connect(err => {
                const collection = clientDB.db("valo").collection("verified");
                var query = { user: `${msg.author.id}` }
                collection.find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        msg.author.send("You're already verified, try !update if your rank role is not displayed")
                    }
                    else {
                        axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${userID}/${tag}?force=true`).then((response) => {
                            arr = response.data.data
                            let info = arr[1].players.all_players
                            let info2 = arr[0].players.all_players
                            info.forEach(element => {
                                if (element.name === `${userID}`) {
                                    checkNome = element.character
                                    info2.forEach(element => {
                                        if (element.name === `${userID}`) {
                                            puuid = element.puuid
                                            check = element.player_card
                                            rank = element.currenttier_patched.split(' ')[0]
                                            x = element.character
                                            axios.get(`https://valorant-api.com/v1/playercards/`).then((res) => {
                                                let arr = res.data.data
                                                arr.forEach(element => {
                                                    if (element.displayName === `VALORANT ${x} Card`) {
                                                        cc = element.uuid
                                                    }
                                                })
                                                axios.get(`https://valorant-api.com/v1/playercards/${check}`).then((res) => {
                                                    nome = res.data.data.displayName
                                                    if (/* nome === `VALORANT ${checkNome} Card` */1 === 1) {
                                                        axios.get('https://api.henrikdev.xyz/valorant/v2/leaderboard/eu').then((response) => {
                                                            let leaderboard = response.data.players
                                                            leaderboard.forEach(element => {
                                                                if (element.puuid === `${puuid}`) {
                                                                    if (element.competitiveTier < 24) {
                                                                        rank = 'Immortal'
                                                                    } else rank = 'Radiant'
                                                                    console.log('Rank retrieved through leaderboard')
                                                                }
                                                            })
                                                        })
                                                        let role = msg.guild.roles.cache.find(role => role.name === `${rank}`);
                                                        msg.member.roles.add(role.id)
                                                        msg.author.send(`Verified! Added role ${rank}`)
                                                        addVerified(puuid, msg.author.id, rank)
                                                    } else {
                                                        let Embed = new MessageEmbed()
                                                            .setTitle(`Authentication not completed`)
                                                            .setDescription(`Please change your player card to VALORANT ${x} Card, play a game and try again`)
                                                            .setImage(`https://media.valorant-api.com/playercards/${cc}/largeart.png`)
                                                        msg.author.send({ embeds: [Embed] });

                                                    }
                                                })
                                            })


                                        }
                                    });

                                }
                            });

                        }).catch(error => {
                            if (error.response.status === 404) msg.reply('User not found.')
                            else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                            else console.log(error)
                        })
                    }
                })
            })
            msg.delete()
        }
        else if (msg.content.includes("!last <@")) getLastMention(msg)
        else if (msg.content.includes("!last ")) getLast(msg)
        else if (msg.content.includes("!last")) getLastV(msg)
        else if (msg.content.includes("!stats <@")) getStatsMention(msg)
        else if (msg.content.includes("!stats ")) {
            let msgArr = msg.content.split(" ")
            let data = msgArr[1]
            let name = data.split('#')
            let userID = name[0]
            let tag = name[1]
            axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${userID}/${tag}?force=true`).then((response) => {
                arr = response.data.data
                arr.forEach(element => {
                    pl = element.players.all_players
                    pl.forEach(elm => {
                        if (elm.name === `${userID}`) {
                            foot = elm.assets.card.small
                            count++
                            kills = kills + elm.stats.kills
                            deaths = deaths + elm.stats.deaths
                            assists = assists + elm.stats.assists
                            headshots = headshots + elm.stats.headshots
                            bodyshots = bodyshots + elm.stats.bodyshots
                            legshots = legshots + elm.stats.legshots
                        }


                    })

                })

                let KDA = (kills + assists) / deaths
                var KD = kills / deaths
                var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                var EmbRep = new MessageEmbed()
                    .setTitle(`${userID}#${tag}'s last 5 games stats:`)
                    .setThumbnail(icon)
                    .addFields(
                        { name: 'Kills', value: `${kills}`, inline: true },
                        { name: 'Deaths', value: `${deaths}`, inline: true },
                        { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                        { name: 'KDA', value: `${parseFloat(KDA).toFixed(2)}`, inline: true },
                        { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                    )
                    .setFooter({ text: `${userID}#${tag}`, iconURL: `${foot}` })

                msg.reply({ embeds: [EmbRep] })
                reset()
            }).catch(error => {
                if (error.response.status === 404) msg.reply('User not found.')
                else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                else console.log(error)
            })
        }
        else if (msg.content.includes("!stats")) getStatsV(msg)
        else if (msg.content.includes("!update")) {
            rank = ''
            userd = msg.author.id
            clientDB.connect(err => {
                const collection = clientDB.db("valo").collection("verified");
                var query = { user: `${userd}` }
                collection.find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        axios.get('https://api.henrikdev.xyz/valorant/v2/leaderboard/eu').then((response) => {
                            let leaderboard = response.data.players
                            let puuid = result[0].puuid
                            let checker = false
                            leaderboard.forEach(element => {
                                if (element.puuid === `${puuid}`) {
                                    checher = true
                                    if (element.competitiveTier < 24) {
                                        rank = 'Immortal'
                                    } else rank = 'Radiant'
                                    let role = msg.guild.roles.cache.find(role => role.name === `${rank}`);
                                    removeRoles(msg)
                                    msg.member.roles.add(role.id)
                                    msg.reply("Rank updated through leaderboard!")
                                    updateVerified(puuid, rank)
                                }
                            })

                            axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/eu/${puuid}`).then((response) => {
                                leaderboard.forEach(element => {
                                    if (element.puuid === `${puuid}`) {
                                        checker = true
                                    }
                                })
                                if (checker === false) {
                                    rank = response.data.data.currenttierpatched.split(" ")[0]
                                    let role = msg.guild.roles.cache.find(role => role.name === `${rank}`);
                                    removeRoles(msg)
                                    msg.member.roles.add(role.id)
                                    msg.reply("Rank updated!")
                                    updateVerified(puuid, rank)
                                }



                            }).catch(error => {
                                if (error.response.status === 404) msg.reply('User not found.')
                                else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                                else console.log(error)
                            })

                        }).catch(error => {
                            if (error.response.status === 404) msg.reply('User not found.')
                            else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                            else console.log(error)
                        })
                    }
                    else msg.reply('Please verify')
                });
            })

        }
        else if (msg.content.includes("!leaderboard")) {
            if (!msg.member.roles.cache.find(r => r.name === "Immortal") && !msg.member.roles.cache.find(r => r.name === "Radiant")) {
                msg.reply('Leaderboard only displays rank Immortal or higher')
            } else {
                userd = msg.author.id
                clientDB.connect(err => {
                    const collection = clientDB.db("valo").collection("verified");
                    var query = { user: `${userd}` }
                    collection.find(query).toArray(function (err, result) {
                        if (err) throw err;
                        if (result[0]) {
                            axios.get('https://api.henrikdev.xyz/valorant/v2/leaderboard/eu').then((response) => {
                                let leaderboard = response.data.players
                                let puuid = result[0].puuid
                                leaderboard.forEach(element => {
                                    if (element.puuid === `${puuid}`) {
                                        msg.reply(`You're currently #${element.leaderboardRank} in the VALORANT leaderboard`)
                                        checker = true
                                    }
                                })
                            }).catch(error => {
                                if (error.response.status === 404) msg.reply('User not found.')
                                else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                                else console.log(error)
                            })
                        }
                        else msg.reply(`Please verify`)
                    });
                })
            }
        }
        else if (msg.content.includes("!current ")) {
            var data = msg.content.replace(/!current /g, '');
            let name = data.split('#')
            let userID = name[0]
            let tag = name[1]
            if (userID[userID.length - 1] === ' ') userID = userID.substring(0, userID.length - 1)
            axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${userID}/${tag}?force=true`).then((response) => {
                let puuidx = response.data.data.puuid
                axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${puuidx}`).then((response) => {
                    if (response.data.data.length > 0) {
                        rep = `${userID}#${tag}'s current rank is ${response.data.data[0].currenttierpatched} - ${response.data.data[0].elo % 100}RR`
                    } else rep = `${userID}#${tag} is currently Unrated`
                    msg.reply(rep)
                }).catch(error => {
                    if (error.response.status === 404) msg.reply('User not found.')
                    else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                    else console.log(error)
                })
            }).catch(error => {
                if (error.response.status === 404) msg.reply('User not found.')
                else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                else console.log(error)
            })
        }
        else if (msg.content.includes("!current")) {

            userd = msg.author.id

            clientDB.connect(err => {
                const collection = clientDB.db("valo").collection("verified");
                var query = { user: `${userd}` }
                collection.find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result[0]) {
                        axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${result[0].puuid}`).then((response) => {
                            let rep = `Your current rank is ${response.data.data[0].currenttierpatched} - ${response.data.data[0].elo % 100}RR`
                            msg.reply(rep)
                        }).catch(error => {
                            if (error.response.status === 404) msg.reply('User not found.')
                            else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                            else console.log(error)
                        })
                    }
                    else msg.reply("Please Verify")

                })
            })
        }
    })

function getLastV(msg) {

    userd = msg.author.id

    clientDB.connect(err => {
        const collection = clientDB.db("valo").collection("verified");
        var query = { user: `${userd}` }
        collection.find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result[0]) {
                axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${result[0].puuid}`).then((response) => {
                    for (i = 0; i < 5; i++) {
                        if (response.data.data[i].mmr_change_to_last_game > 0) streak = streak + 'W'
                        else if (response.data.data[i].mmr_change_to_last_game == 0) streak = streak + 'D'
                        else if (response.data.data[i].mmr_change_to_last_game < 0) streak = streak + 'L'
                    }
                    let rr = response.data.data[0].mmr_change_to_last_game
                    if (rr > 0) rr = '+' + rr
                    let id = response.data.name
                    let tag2 = response.data.tag
                    axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${id}/${tag2}?force=true`).then((response) => {
                        date = response.data.data[0].metadata.game_start_patched
                        mode = response.data.data[0].metadata.mode
                        rounds = response.data.data[0].teams
                        pl = response.data.data[0].players.all_players
                        pl.forEach(elm => {
                            if (elm.name === `${id}`) {
                                foot = `https://media.valorant-api.com/playercards/${elm.player_card}/displayicon.png`
                                icon = elm.assets.agent.small
                                count++
                                score = score + elm.stats.score
                                kills = kills + elm.stats.kills
                                deaths = deaths + elm.stats.deaths
                                assists = assists + elm.stats.assists
                                headshots = headshots + elm.stats.headshots
                                bodyshots = bodyshots + elm.stats.bodyshots
                                legshots = legshots + elm.stats.legshots
                                agent = elm.character
                                dmgm = dmgm + elm.damage_made
                                dmgr = dmgr + elm.damage_received
                                if (elm.team === 'Red') {
                                    rw = rounds.red.rounds_won
                                    rl = rounds.red.rounds_lost
                                } else if (elm.team === 'Blue') {
                                    rw = rounds.blue.rounds_won
                                    rl = rounds.blue.rounds_lost
                                }

                            }
                        })
                        var KD = kills / deaths
                        var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                        var EmbRep = new MessageEmbed()
                            .setTitle(`${msg.author.username}'s last game:`)
                            .setThumbnail(icon)
                            .addFields(
                                { name: 'Agent played', value: `${agent}`, inline: true },
                                { name: 'Rounds won', value: `${rw}`, inline: true },
                                { name: 'Rounds lost', value: `${rl}`, inline: true },
                                { name: 'Kills', value: `${kills}`, inline: true },
                                { name: 'Deaths', value: `${deaths}`, inline: true },
                                { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                                { name: 'Damage dealt', value: `${dmgm}`, inline: true },
                                { name: 'Damage taken', value: `${dmgr}`, inline: true },
                                { name: 'Game mode', value: `${mode}`, inline: true },
                                { name: 'RR', value: `${rr}`, inline: true },
                                { name: 'Streak', value: `${streak}`, inline: true }
                            )
                            .setFooter({ text: `Game date: ${date}`, iconURL: `${foot}` })

                        msg.reply({ embeds: [EmbRep] })
                        reset()
                    }).catch(error => {
                        if (error.response.status === 404) msg.reply('User not found.')
                        else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                        else console.log(error)
                    })

                }).catch(error => {
                    if (error.response.status === 404) msg.reply('User not found.')
                    else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                    else console.log(error)
                })
            }
            else msg.reply('Please verify')
        });
    })

}
function getLast(msg) {
    var data = msg.content.replace(/!stats last /g, '');
    let name = data.split('#')
    let userID = name[0]
    let tag = name[1]
    if (userID[userID.length - 1] === ' ') userID = userID.substring(0, userID.length - 1)
    axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${userID}/${tag}?force=true`).then((response) => {
        let temp = response.data.data
        temp.forEach(element => {
            if (element.metadata.mode === 'Competitive') {
                n = n + 1
            }
        })
        arr = response.data.data[0].players.all_players
        arr.forEach(element => {
            if (element.name === `${userID}`) {
                puuid = element.puuid
                date = response.data.data[0].metadata.game_start_patched
                mode = response.data.data[0].metadata.mode
                rounds = response.data.data[0].teams
                pl = response.data.data[0].players.all_players
                pl.forEach(elm => {
                    if (elm.name === `${userID}`) {
                        console.log(elm)
                        foot = `https://media.valorant-api.com/playercards/${elm.player_card}/displayicon.png`
                        icon = elm.assets.agent.small
                        count++
                        score = score + elm.stats.score
                        kills = kills + elm.stats.kills
                        deaths = deaths + elm.stats.deaths
                        assists = assists + elm.stats.assists
                        headshots = headshots + elm.stats.headshots
                        bodyshots = bodyshots + elm.stats.bodyshots
                        legshots = legshots + elm.stats.legshots
                        agent = elm.character
                        dmgm = dmgm + elm.damage_made
                        dmgr = dmgr + elm.damage_received
                        var KD = kills / deaths
                        var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                        if (elm.team === 'Red') {
                            rw = rounds.red.rounds_won
                            rl = rounds.red.rounds_lost
                        } else if (elm.team === 'Blue') {
                            rw = rounds.blue.rounds_won
                            rl = rounds.blue.rounds_lost
                        }
                        if (n > 0) {
                            axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${puuid}`).then((response) => {
                                for (i = 0; i < n && i < 5; i++) {
                                    console.log(response.data)
                                    if (response.data.data[i].mmr_change_to_last_game > 0) streak = streak + 'W'
                                    else if (response.data.data[i].mmr_change_to_last_game === 0) streak = streak + 'D'
                                    else if (response.data.data[i].mmr_change_to_last_game < 0) streak = streak + 'L'
                                }
                                rr = response.data.data[0].mmr_change_to_last_game
                                if (rr > 0) rr = '+' + rr
                                var EmbRep = new MessageEmbed()
                                    .setTitle(`${userID}#${tag}'s last game:`)
                                    .setThumbnail(icon)
                                    .addFields(
                                        { name: 'Agent played', value: `${agent}`, inline: true },
                                        { name: 'Rounds won', value: `${rw}`, inline: true },
                                        { name: 'Rounds lost', value: `${rl}`, inline: true },
                                        { name: 'Kills', value: `${kills}`, inline: true },
                                        { name: 'Deaths', value: `${deaths}`, inline: true },
                                        { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                        { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                                        { name: 'Damage dealt', value: `${dmgm}`, inline: true },
                                        { name: 'Damage taken', value: `${dmgr}`, inline: true },
                                        { name: 'Game mode', value: `${mode}`, inline: true },
                                        { name: 'RR', value: `${rr}`, inline: true },
                                        { name: 'Streak', value: `${streak}`, inline: true }
                                    )
                                    .setFooter({ text: `Game date: ${date}`, iconURL: `${foot}` })
                                msg.reply({ embeds: [EmbRep] })

                                reset()
                            }).catch(error => {
                                if (error.response.status === 404) msg.reply('User not found.')
                                else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                                else console.log(error)
                            })
                        }
                        else {
                            var EmbRep = new MessageEmbed()
                                .setTitle(`${userID}#${tag}'s last game:`)
                                .setThumbnail(icon)
                                .addFields(
                                    { name: 'Agent played', value: `${agent}`, inline: true },
                                    { name: 'Rounds won', value: `${rw}`, inline: true },
                                    { name: 'Rounds lost', value: `${rl}`, inline: true },
                                    { name: 'Kills', value: `${kills}`, inline: true },
                                    { name: 'Deaths', value: `${deaths}`, inline: true },
                                    { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                    { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                                    { name: 'Damage dealt', value: `${dmgm}`, inline: true },
                                    { name: 'Damage taken', value: `${dmgr}`, inline: true },
                                    { name: 'Game mode', value: `${mode}`, inline: true },
                                )
                                .setFooter({ text: `Game date: ${date}`, iconURL: `${foot}` })

                            msg.reply({ embeds: [EmbRep] })
                            reset()
                        }

                    }
                })
            }
        })
    }).catch(error => {
        if (error.response.status === 404) msg.reply('User not found.')
        else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
        else console.log(error)
    })

}
function getLastMention(msg) {
    {
        userd = msg.mentions.members.first().id
        console.log(msg.mentions.members.first().user.username)

        clientDB.connect(err => {
            const collection = clientDB.db("valo").collection("verified");
            var query = { user: `${userd}` }
            collection.find(query).toArray(function (err, result) {
                if (err) throw err;
                if (result[0]) {
                    axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${result[0].puuid}`).then((response) => {
                        for (i = 0; i < 5; i++) {
                            if (response.data.data[i].mmr_change_to_last_game > 0) streak = streak + 'W'
                            else if (response.data.data[i].mmr_change_to_last_game == 0) streak = streak + 'D'
                            else if (response.data.data[i].mmr_change_to_last_game < 0) streak = streak + 'L'
                        }
                        let rr = response.data.data[0].mmr_change_to_last_game
                        if (rr > 0) rr = '+' + rr
                        let id = response.data.name
                        let tag2 = response.data.tag
                        axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${id}/${tag2}?force=true`).then((response) => {
                            date = response.data.data[0].metadata.game_start_patched
                            mode = response.data.data[0].metadata.mode
                            rounds = response.data.data[0].teams
                            pl = response.data.data[0].players.all_players
                            pl.forEach(elm => {
                                if (elm.name === `${id}`) {
                                    foot = `https://media.valorant-api.com/playercards/${elm.player_card}/displayicon.png`
                                    icon = elm.assets.agent.small
                                    count++
                                    score = score + elm.stats.score
                                    kills = kills + elm.stats.kills
                                    deaths = deaths + elm.stats.deaths
                                    assists = assists + elm.stats.assists
                                    headshots = headshots + elm.stats.headshots
                                    bodyshots = bodyshots + elm.stats.bodyshots
                                    legshots = legshots + elm.stats.legshots
                                    agent = elm.character
                                    dmgm = dmgm + elm.damage_made
                                    dmgr = dmgr + elm.damage_received
                                    if (elm.team === 'Red') {
                                        rw = rounds.red.rounds_won
                                        rl = rounds.red.rounds_lost
                                    } else if (elm.team === 'Blue') {
                                        rw = rounds.blue.rounds_won
                                        rl = rounds.blue.rounds_lost
                                    }

                                }
                            })
                            var KD = kills / deaths
                            var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                            var EmbRep = new MessageEmbed()
                                .setTitle(`${msg.mentions.members.first().user.username}'s last game:`)
                                .setThumbnail(icon)
                                .addFields(
                                    { name: 'Agent played', value: `${agent}`, inline: true },
                                    { name: 'Rounds won', value: `${rw}`, inline: true },
                                    { name: 'Rounds lost', value: `${rl}`, inline: true },
                                    { name: 'Kills', value: `${kills}`, inline: true },
                                    { name: 'Deaths', value: `${deaths}`, inline: true },
                                    { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                    { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                                    { name: 'Damage dealt', value: `${dmgm}`, inline: true },
                                    { name: 'Damage taken', value: `${dmgr}`, inline: true },
                                    { name: 'Game mode', value: `${mode}`, inline: true },
                                    { name: 'RR', value: `${rr}`, inline: true },
                                    { name: 'Streak', value: `${streak}`, inline: true }
                                )
                                .setFooter({ text: `Game date: ${date}`, iconURL: `${foot}` })

                            msg.reply({ embeds: [EmbRep] })
                            reset()
                        }).catch(error => {
                            if (error.response.status === 404) msg.reply('User not found.')
                            else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                            else console.log(error)
                        })

                    }).catch(error => {
                        if (error.response.status === 404) msg.reply('User not found.')
                        else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                        else console.log(error)
                    })
                }
                else msg.reply('User is not verified')
            });
        })
    }
}
function getStatsV(msg) {
    userd = msg.author.id

    clientDB.connect(err => {
        const collection = clientDB.db("valo").collection("verified");
        var query = { user: `${userd}` }
        collection.find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result[0]) {
                axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${result[0].puuid}`).then((response) => {
                    let userID = response.data.name
                    let tag = response.data.tag
                    axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${userID}/${tag}?force=true`).then((response) => {
                        arr = response.data.data
                        arr.forEach(element => {
                            pl = element.players.all_players
                            pl.forEach(elm => {
                                if (elm.name === `${userID}`) {
                                    foot = elm.assets.card.small
                                    count++
                                    kills = kills + elm.stats.kills
                                    deaths = deaths + elm.stats.deaths
                                    assists = assists + elm.stats.assists
                                    headshots = headshots + elm.stats.headshots
                                    bodyshots = bodyshots + elm.stats.bodyshots
                                    legshots = legshots + elm.stats.legshots
                                }


                            })

                        })

                        let KDA = (kills + assists) / deaths
                        var KD = kills / deaths
                        var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                        var EmbRep = new MessageEmbed()
                            .setTitle(`${msg.author.username}'s last 5 games stats:`)
                            .setThumbnail(icon)
                            .addFields(
                                { name: 'Kills', value: `${kills}`, inline: true },
                                { name: 'Deaths', value: `${deaths}`, inline: true },
                                { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                { name: 'KDA', value: `${parseFloat(KDA).toFixed(2)}`, inline: true },
                                { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                            )
                            .setFooter({ text: `${msg.author.username}`, iconURL: `${foot}` })

                        msg.reply({ embeds: [EmbRep] })
                        reset()
                    }).catch(error => {
                        if (error.response.status === 404) msg.reply('User not found.')
                        else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                        else console.log(error)
                    })

                }).catch(error => {
                    if (error.response.status === 404) msg.reply('User not found.')
                    else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                    else console.log(error)
                })
            }
            else msg.reply('Please verify')
        });
    })
}
function getStatsMention(msg) {
    userd = msg.mentions.members.first().id

    clientDB.connect(err => {
        const collection = clientDB.db("valo").collection("verified");
        var query = { user: `${userd}` }
        collection.find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result[0]) {
                axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr-history/eu/${result[0].puuid}`).then((response) => {
                    let userID = response.data.name
                    let tag = response.data.tag
                    axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/eu/${userID}/${tag}?force=true`).then((response) => {
                        arr = response.data.data
                        arr.forEach(element => {
                            pl = element.players.all_players
                            pl.forEach(elm => {
                                if (elm.name === `${userID}`) {
                                    foot = elm.assets.card.small
                                    count++
                                    kills = kills + elm.stats.kills
                                    deaths = deaths + elm.stats.deaths
                                    assists = assists + elm.stats.assists
                                    headshots = headshots + elm.stats.headshots
                                    bodyshots = bodyshots + elm.stats.bodyshots
                                    legshots = legshots + elm.stats.legshots
                                }


                            })

                        })

                        let KDA = (kills + assists) / deaths
                        var KD = kills / deaths
                        var hsp = (headshots * 100) / (headshots + bodyshots + legshots)
                        var EmbRep = new MessageEmbed()
                            .setTitle(`${msg.mentions.members.first().user.username}'s last 5 games stats:`)
                            .setThumbnail(icon)
                            .addFields(
                                { name: 'Kills', value: `${kills}`, inline: true },
                                { name: 'Deaths', value: `${deaths}`, inline: true },
                                { name: 'KD', value: `${parseFloat(KD).toFixed(2)}`, inline: true },
                                { name: 'KDA', value: `${parseFloat(KDA).toFixed(2)}`, inline: true },
                                { name: 'HS%', value: `${parseFloat(hsp).toFixed(2)}`, inline: true },
                            )
                            .setFooter({ text: `${msg.mentions.members.first().username}`, iconURL: `${foot}` })

                        msg.reply({ embeds: [EmbRep] })
                        reset()
                    }).catch(error => {
                        if (error.response.status === 404) msg.reply('User not found.')
                        else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                        else console.log(error)
                    })

                }).catch(error => {
                    if (error.response.status === 404) msg.reply('User not found.')
                    else if (error.response.status === 403 || error.response.status === 400) msg.reply('Server error. Please try again later.')
                    else console.log(error)
                })
            }
            else msg.reply('Please verify')
        });
    })
}

var x = ''
var cc = ''


function addVerified(puuid, user, rank) {

    clientDB.connect(err => {
        const collection = clientDB.db("valo").collection("verified");
        collection.updateOne(
            { "user": `${user}` },
            { $setOnInsert: { "user": `${user}`, "puuid": `${puuid}`, "rank": `${rank}` } },
            { upsert: true }
        )
    })
}

function removeRoles(msg) {
    let roles = [Unrated, Iron, Bronze, Silver, Gold, Platinum, Diamond, Immortal, Radiant]
    roles.forEach(element => {
        let role = msg.guild.roles.cache.find(role => role.name === element);
    msg.member.roles.remove(role.id);
    })
}

function updateVerified(puuid, rank) {
    clientDB.connect(err => {
        const collection = clientDB.db("valo").collection("verified");
        collection.updateOne({ puuid: `${puuid}` }, { $set: { rank: `${rank}` } })
    })
}


function reset() {
    mode = ''
    cc = ''
    check = ''
    agent = ''
    i = 0
    score = 0
    kills = 0
    deaths = 0
    assists = 0
    headshots = 0
    bodyshots = 0
    legshots = 0
    count = 0
    dmgm = 0
    dmgr = 0
    foot = ''
    rr = 0
    rw = 0
    rl = 0
    n = 0
    icon = ''
    streak = ''
    rep = ''
}
