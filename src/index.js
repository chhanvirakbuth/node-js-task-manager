// 3rd party library
const express = require('express')

// own module
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json()) // allow get json body from post request
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`App is running on port ${port}`)
})

// const Task = require('./models/task')
// const User = require('./models/user')
//
// // const main = async () => {
//     // const task = await Task.findById('61b22d52d0ac7a9cdc2e1056');
//     // await task.populate('owner')
//     // console.log(task.owner)
//     // const user = await User.findById('61ac72f4d4e34df3389d6f43')
//     // await user.populate('tasks')
//     // console.log(user.tasks)
// // }
// // main()

const multer = require('multer')

const upload = multer({
    dest : 'images',
    limits: {
        fileSize : 1000000,// 1 MB
    },
    fileFilter(req,file,cb){
        if (!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('please upload a word document'))
        }
        cb(undefined,true)
    }
})

app.post('/upload',upload.single('upload'),(req ,res) => {
    res.send()
})

