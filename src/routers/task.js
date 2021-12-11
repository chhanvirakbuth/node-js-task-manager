const express = require('express')

const Task = require('../models/task')
const router = express.Router()
const auth = require('../middleware/auth')

// read all tasks
// GET /tasks?complete=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sort=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    try {
        const user = await req.user;

        const match = {}
        const sort = {}
        const {completed, limit, skip,sortBy} = req.query;

        if (completed) {
            match.completed = completed === 'true'
        }

        if(sortBy){
            const parts = sortBy.split(':');
            // -1 => desc
            // 1 => asc
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

        await user.populate({
            path: 'tasks',
            match,
            options:{
                limit : parseInt(limit),
                skip : parseInt(skip),
                sort
            }
        })
        return res.send(user.tasks)
    } catch (e) {
        return res.status(500).send(e)
    }
})

// read specific task
router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({
            _id,
            owner: await req.user._id
        });
        return task ? res.send(task) : res.status(404).send('We not found what you want ');
    } catch (e) {
        return res.status(400).send(e)
    }
})
//create task endpoint
router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id

        })
        await task.save()
        return res.send(task)
    } catch (e) {
        return res.status(500).send(e)
    }
})

// update specific task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update'})
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: await req.user._id
        });
        updates.forEach((update) => task[update] = req.body[update])
        await task.save();
        return task ? res.send(task) : res.status(404).send({error: 'task not found'})
    } catch (e) {
        return res.status(500).send(e)
    }
})

//delete task by id
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: await req.user._id
        })
        return task ? res.send({
            status: 200,
            message: 'deleted',
            task
        }) : res.status(400).send({error: 'no task found '})
    } catch (e) {
        return res.status(500).send(e)
    }
})

module.exports = router
