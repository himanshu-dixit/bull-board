// @ts-nocheck
const express = require('express');
const {Queue} = require('bullmq');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const IORedis = require("ioredis");


const TEST_EXECUTION_QUEUE = "TEST_EXECUTION_QUEUE";
const VIDEO_PROCESSOR_QUEUE = "VIDEO_PROCESSOR_QUEUE";
const TEST_COMPLETE_QUEUE = "TEST_COMPLETE_QUEUE";

const redisOptions = {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
};
const redisClient = new IORedis({ ...redisOptions, maxRetriesPerRequest: null, enableReadyCheck: false });

const testExecutionQueue = new Queue(TEST_EXECUTION_QUEUE, {connection: redisClient});
const videoProcessorQueue = new Queue(VIDEO_PROCESSOR_QUEUE, {connection: redisClient});
const testCompleteQueue = new Queue(TEST_COMPLETE_QUEUE, {connection: redisClient});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
;

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(testExecutionQueue), new BullMQAdapter(videoProcessorQueue), new BullMQAdapter(testCompleteQueue)],
  serverAdapter: serverAdapter,
});

const app = express();

app.use('/admin/queues', serverAdapter.getRouter());

// other configurations of your server
  
app.listen(3000, () => {
  console.log('Running on 3000...');
  console.log('For the UI, open http://localhost:3000/admin/queues');
  console.log('Make sure Redis is running on port 6379 by default');
});