require('dotenv').config();
const mongoose = require('mongoose');
const connectionStr = "mongodb+srv://manishpanwar682:QN2Dh4JGpE58jLwM@cluster0.iqo54dv.mongodb.net/database";

mongoose.connect(connectionStr, {useNewUrlparser: true})
.then(() => console.log('connected to mongodb'))
.catch(err => console.log(err))

mongoose.connection.on('error', err => {
  console.log(err)
})
