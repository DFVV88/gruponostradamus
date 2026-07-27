'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { requestPayload } = require('./lib/culqi-webhook');
const legacyWebhook = require('./webhook').culqiWebhook;

const CULQI_SECRET_KEY = defineSecret('CULQI_SECRET_KEY');
const OPTIONS = {
  region: 'us-central1',
  cors: false,
  timeoutSeconds: 45,
  memory: '256MiB',
  maxInstances: 3,
  secrets: [CULQI_SECRET_KEY]
};

exports.culqiWebhook = onRequest(OPTIONS, async (req, res) => {
  const payload = requestPayload(req.rawBody, req.body);
  if (Object.keys(payload).length > 0) {
    req.body = payload;
  }
  return legacyWebhook(req, res);
});