const express = require('express');
const app = express();
const port = process.env.PORT || 6700;
const mongodb = require('mongodb')
const mongourl = "mongodb://localhost:27017";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let db;
let secret = 'superman' //to be hidden

app.use(express.json())
app.use(express.urlencoded())

app.get('/', (req, res) => {
    return res.send('server is running fine')
})


const verifyaccesstoken =  (req, res, next) => {
    if(!req.headers['authorization']){
        req.error('unauthorized')
        next()
    }
    const token = req.headers['authorization']
    jwt.verify(token, secret, (err, data) => {
        console.log(data)
        if(err){
            req.error('unauthorized')
            next()
        }    
        req.data = data
        next()
    })
}

app.post('/register', (req, res) => {
    const {email, password} = req.body
    db.collection('users').findOne({email}, (err, user) => {
        if(err) throw err
        if(user) return res.send({error: 'User already registered'})
        const hash = bcrypt.hashSync(password)
        db.collection('users').insert({email, password: hash}, (err, result) => {
            if(err) throw err
            return res.send('user registered')
        })
    })
})


app.post('/login', (req, res) => {
    const {email, password} = req.body
    db.collection('users').findOne({email}, (err, user) => {
        if(err) throw err
        if(!user) return res.send({error: 'user not registered'})
        if(bcrypt.compareSync(password, user.password)){
            let token = jwt.sign({id: user._id}, secret, {expiresIn: 86400})
            return res.send({token})
        }
        return res.send({error: 'incorrect password'})
    })
})

app.get('/state', verifyaccesstoken, (req, res) => {
    if(req.error) return res.send(req.error)
    db.collection('state').find({}).toArray((err, states) => {
        if(err) throw err
        return res.send(states)
    })
})

app.post('/state', verifyaccesstoken,(req, res) => {
    if(req.error) return res.send(req.error)
    const{state} = req.body
    db.collection('state').findone({state}, (err, data) => {
        if(err) throw err
        if(data) return res.send({error: 'state already present'})
        db.collection('state').insert({state}, (err, result) => {
            if(err) throw err
            return res.send({message: "state added"})
        })
    })
})

app.get('/districts',verifyaccesstoken, (req, res) => {
    if(req.error) return res.send(req.error)
    db.collection('district').find({}).toArray((err, states) => {
        if(err) throw err
        return res.send(states)
    })
})

app.post('/districts',verifyaccesstoken, (req, res) => {
    if(req.error) return res.send(req.error)
    const{state,district} = req.body
    db.collection('district').findone({district}, (err, data) => {
        if(err) throw err
        if(data) return res.send({error: 'district already present'})
        db.collection('district').insert({district,state}, (err, result) => {
            if(err) throw err
            return res.send({message: "district added"})
        })
    })
})

app.get('/child',verifyaccesstoken, (req, res) => {
    if(req.error) return res.send(req.error)
    db.collection('children').find({}).toArray((err, children) => {
        if(err) throw err
        return res.send(children)
    })
})

app.post('/child',verifyaccesstoken, (req, res) => {
    if(req.error) return res.send(req.error)
    const{state,district,child} = req.body
    db.collection('children').findone({child}, (err, data) => {
        if(err) throw err
        if(data) return res.send({error: 'district already present'})
        db.collection('children').insert({district,state,child}, (err, result) => {
            if(err) throw err
            return res.send({message: "child added"})
        })
    })
})

mongodb.MongoClient.connect(mongourl, { useUnifiedTopology: true }, (err, connection) => {
    if(err) throw err
    db = connection.db('child')
    console.log('mongodb connected successfully')
})

app.listen(port, (err) => {
    if (err) throw err
    console.log(`Server is running on port ${port}!`)
})