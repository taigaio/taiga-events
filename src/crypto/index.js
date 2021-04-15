/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2021-present Kaleidos Ventures SL
 */

const { createHash, createHmac } = require("crypto");
const base64url = require("base64-url");

const secret = process.env.SECRET;
const salt = "django.core.signing";

/**
 * Split function
 * @param token
 * @param sep
 * @param maxsplit
 * @return {string[]|*}
 */
const rsplit = (token, sep, maxsplit) => {
  const split = token.split(sep);
  if (maxsplit) {
    return [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit));
  }
  return split;
};

/**
 * Getting user Id
 * @param token
 * @return {*}
 */
const getUserId = token => {
  let value = token.split(":")[0];
  value = JSON.parse(base64url.decode(value));
  return value != null ? value.user_authentication_id : void 0;
};

/**
 * Verify function
 * @param token
 * @return {boolean}
 */
const verify = token => {
  if (!token) {
    return false;
  }

  const [value, sig] = rsplit(token, ":", 1);
  const shasum = createHash("sha1");

  shasum.update(`${salt}signer${secret}`);

  const hmacKey = shasum.digest();
  const hmac = createHmac("sha1", hmacKey);

  hmac.setEncoding("base64");
  hmac.update(value);

  const key = base64url.escape(hmac.digest("base64"));
  return key === sig;
};

module.exports = { getUserId, verify };
