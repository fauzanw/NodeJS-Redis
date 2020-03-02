'use strict';

const express = require('express');
const app = express();
const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();

const getUserRepos = (req, res) => {
    let username = req.query.username;
    axios.get(`https://api.github.com/users/${username}`)
    .then(response => {
        const {login, id, name, bio, followers, node_id} = response.data;

        client.setex(username, 3600, JSON.stringify({
            username: login,
            id, name, bio, followers, node_id
        }));

        // res.send(respond(username, repoLength
        res.json({
            id, node_id,
            username: login,
            name, bio, followers,
        });
    })
    .catch(err => {
        throw err;
    })
};

function cache(req, res, next) {
    const username = req.query.username;
    client.get(username, function (err, data) {
        if (err) throw err;
        if (typeof data == Object) {
            res.json({
                id: data.id,
                node_id: data.node_id,
                username: data.username,
                name: data.name, bio: data.bio, followers: data.followers
            });
        } else {
            next();
        }
    });
}

app.get('/users', cache, getUserRepos);

app.listen(3000, function () {
    console.log('App running on port 3000!')
});