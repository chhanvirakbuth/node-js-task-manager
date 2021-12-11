const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

// custom module
const { sendWelcomeEmail ,sendCancelEmail} = require('../emails/account')

const router = express.Router()


// list users endpoint
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e);
    }
})

// profile
router.get('/users/me', auth, async (req, res) => {
    return res.send(req.user)
})

// find user by id ( for admin )
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         return user ? res.send(user) : res.status(404).send('no user found')
//     } catch (e) {
//         return res.status(500).send(e);
//     }
// })

//create user endpoint
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save()
        const token = await user.generateAuthToken();
        sendWelcomeEmail(user.email,user.name)
        return res.send({
            user,
            token
        })
    } catch (e) {
        return res.status(400).send(e);
    }
})

// logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        return res.status(500).send('logged out')
    }
})

// logout all
router.post('/users/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    } catch (e) {

    }
})

// login
router.post('/users/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        return res.send({
            user,
            token
        })
    } catch (e) {
        return res.status(400).send(e);
    }
})

//update user endpoint
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates.'
        })
    }
    try {
        const user = await req.user;
        updates.forEach((update) => user[update] = req.body[update])
        await user.save();
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        return user ? res.send(user) : res.status(400).send('User not found')
    } catch (e) {
        return res.status(500).send(e)
    }
})

// deleting user by id
// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         return user ? res.send({
//             status: 'success',
//             message: 'deleted',
//             data: user
//         }) : res.status(400).send({error: 'user not found'})
//     } catch (e) {
//         return res.status(500).send(e)
//     }
// })

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelEmail(req.user.email,req.user.name)
        return res.send({
            status: 'success',
            message: 'account deleted'
        })
    } catch (e) {
        return res.status(500).send(e)
    }
})

// avatar upload
const upload = multer({
    limits: {
        fileSize: 1000000, // limit file size 1MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload image in type of jpg , jpeg ,png'));
        }
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({
            message: 'please upload an image'
        })
    }
    // save avatar buffer
    req.user.avatar = req.file.buffer
    // req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer() // if wan to resize
    await req.user.save()

    return res.send({
        message: 'avatar uploaded'
    })
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

// delete user avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    return res.send(req.user)

})

// getting user avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        // res.set('Content-Type','image/jpeg')
        res.type('png') // => image/png:
        // res.send(await sharp(user.avatar).resize({
        //     width: req.query.width ? parseInt(req.query.width) : 0,
        //     height: req.query.height ? parseInt(req.query.height) : 0
        // }).png().toBuffer())
        if (req.query.size){
            return res.send(await sharp(user.avatar).resize(parseInt(req.query.size)).png().toBuffer())
        }
            return res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router;
