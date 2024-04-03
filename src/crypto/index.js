/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos INC
 */

const { logger } = require('../logger');
var jwt = require('jsonwebtoken');


const secret = process.env.SECRET;
const options = {
  algorithm: process.env.ALGORITHM || 'HS256',
  audience: process.env.AUDIENCE || '',
  issuer: process.env.ISSUER || '',
  ignoreExpiration: 'true'
};
const userIdClaim = process.env.USER_ID_CLAIM || 'user_id';


/**
 * Getting user Id from a JWT Token
 * @param token
 * @return {*}
 */
const getUserId = token => {
  try {
    const payload = jwt.verify(token, secret, options);
    return payload[userIdClaim];
  } catch (err) {
    logger.error(`crypto: ${JSON.stringify(err)}`);
  }
  return null;
};


/**
 * Verify a JWT token
 * @param token
 * @return {boolean}
 */
const verify = token => {
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, secret, options);
    return true;
  } catch (err) {
    logger.error(`crypto: ${JSON.stringify(err)}`);
  }

  return false;
};


module.exports = { getUserId, verify };
