/*
 * Copyright (C) 2014-present Taiga Agile LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: crypto/index.js
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
