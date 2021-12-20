const express = require('express')
var cors = require('cors')

const path = require('path');
const app = express()
const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '..', 'build');
app.use(express.static(publicPath));

const PARTICIPANTS = [
    "Luis",
    "Tany",
    "Roberto",
    "Monse",
    "Dido",
    "Daniel",
    "Mix",
    "Diego",
    "Itzel",
    "Fatima",
    "Rafa",
    "Layan",
    "Carlos",
    "Fany",
    "Aurora",
    "Rosa",
    "Sergio",
    "Karla",
    "Pipo",
    "Mima"
];

let matches = [];
let matched = new Set();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function addMatch(match) {
    matched.add(match)

    return match;
}

function getOtherParticipant(participant) {
    const index = getRandomInt(0, PARTICIPANTS.length);
    const match = PARTICIPANTS[index];

    return match == participant || matched.has(match) ? getOtherParticipant(participant) : addMatch(match);
}

function getRandomMatches() {
    matched = new Set();

    return PARTICIPANTS.map(participant => { return { name: participant, match: getOtherParticipant(participant), seen: false } })
}

app.use(cors())

/* app.get('/', (req, res) => {
    res.send('Hello World!')
}) */

app.get('/', (req, res) => {
    console.log('working...')
    res.sendFile(path.join(publicPath, 'index.html'));
 });


app.get('/participants', (req, res) => {
    res.send(PARTICIPANTS)
})

app.get('/matches', (req, res) => {
    res.send(matches)
})

app.post('/matches', (req, res) => {
    matched = new Set();
    matches = getRandomMatches();
    res.send(matches);
})

app.post('/seen/:name', (req, res) => {
    console.log(req.params.name)
    matchIndex = matches.findIndex(e => e.name == req.params.name)
    if (matchIndex >= 0) {
        console.log('founded')
        matches[matchIndex].seen = true;
    }

    res.send(matches);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

