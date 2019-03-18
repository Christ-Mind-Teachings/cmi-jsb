/*
  JSB: Transcript keys
  - first item starts with 1, not 0
  - a numeric value that represents a specific transcript and represents
    a specific logical ordering.

  - The integer part of the key represent a transcript and the decimal part
    a paragraph within the transcript.
  - The paragraphId is increased by 1 and divided by 1000

  key format: ssbuuIqq.ppp
  where: ss: source Id
          b: book Id
         uu: unit Id
          I: quesiton indicator, 0:no questions 1:questions
         qq: question Id
        ppp: paragraph number - not positional

  NOTE: This module is used by code running in the browser and Node so the
        common.js module system is used
*/

//import indexOf from "lodash/indexOf";
const sprintf = require("sprintf-js").sprintf;

//source id: each source has a unique id
//WOM = 10
//jsb = 11
const sourceId = 11;

//length of pageKey excluding decimal portion
const keyLength = 8;

const books = ["til", "acq"];
const bookIds = ["xxx", ...books];
const acq = ["xxx", "welcome"];
const til = ["xxx", "chap01", "chap02", "chap03", "chap04", "chap05", "chap06", "chap07", "chap08", "chap09", "chap10", "chap11", "chap12", "chap13", "chap14", "chap15", "chap16", "chap17", "chap18", "chap18"];

const contents = {
  acq: acq,
  til: til
};

function splitUrl(url) {
  let u = url;

  //remove leading and trailing "/"
  u = url.substr(1);
  u = u.substr(0, u.length - 1);

  return u.split("/");
}

/*
  return the position of unit in the bid array
*/
function getUnitId(bid, unit) {
  if (contents[bid]) {
    return contents[bid].indexOf(unit);
  }
  else {
    throw new Error(`unexpected bookId: ${bid}`);
  }
}

function getSourceId() {
  return sourceId;
}

function getKeyInfo() {
  return {
    sourceId: sourceId,
    keyLength: keyLength
  };
}

/*
  parse bookmarkId into pageKey and paragraphId
  - pid=0 indicates no paragraph id
*/
function parseKey(key) {
  const keyInfo = getKeyInfo();
  let keyString = key;
  let pid = 0;

  if (typeof keyString === "number") {
    keyString = key.toString(10);
  }

  let decimalPos = keyString.indexOf(".");

  //if no decimal key doesn't include paragraph id
  if (decimalPos > -1) {
    let decimalPart = keyString.substr(decimalPos + 1);

    //append 0's if decimal part < 3
    switch(decimalPart.length) {
      case 1:
        decimalPart = `${decimalPart}00`;
        break;
      case 2:
        decimalPart = `${decimalPart}0`;
        break;
    }
    pid = parseInt(decimalPart, 10);
  }
  let pageKey = parseInt(keyString.substr(0, keyInfo.keyLength), 10);

  return {pid, pageKey};
}

/*
  Convert url into key
  returns -1 for non-transcript url

  key format: ssbuuIqq.ppp
  where: ss: source Id
          b: book Id
         uu: unit Id
          I: question indicator, 0:no questions 1:questions
         qq: question Id
        ppp: paragraph number - not positional
*/
function genPageKey(url = location.pathname) {
  let key = {
    sid: sourceId,
    bid: 0,
    uid: 0,
    hasQuestions: 0,
    qid: 0
  };

  let parts = splitUrl(url);

  //key.bid = indexOf(bookIds, parts[0]);
  key.bid = bookIds.indexOf(parts[2]);
  if (key.bid === -1) {
    return -1;
  }
  key.uid = getUnitId(parts[2], parts[3]);
  if (key.bid === -1) {
    return -1;
  }

  if (parts.length === 5) {
    key.hasQuestions = 1;
    key.qid = parseInt(parts[4].substr(1), 10);
  }

  let compositeKey = sprintf("%02s%01s%02s%1s%02s", key.sid, key.bid, key.uid, key.hasQuestions, key.qid);
  let numericKey = parseInt(compositeKey, 10);

  return numericKey;
}

/* 
  genParagraphKey(paragraphId, key: url || pageKey) 

  args:
    pid: a string representing a transcript paragraph, starts as "p0"..."pnnn"
         - it's converted to number and incremented by 1 then divided by 1000
        pid can also be a number so then we just increment it and divide by 1000

    key: either a url or pageKey returned from genPageKey(), if key
   is a string it is assumed to be a url
*/
function genParagraphKey(pid, key = location.pathname) {
  let numericKey = key;
  let pKey;

  if (typeof pid === "string") {
    pKey = (parseInt(pid.substr(1), 10) + 1) / 1000;
  }
  else {
    pKey = (pid + 1)/1000;
  }

  //if key is a string it represents a url
  if (typeof key === "string") {
    numericKey = genPageKey(key);
  }

  let paragraphKey = numericKey + pKey;

  return paragraphKey;
}

/*
  key format: ssbuuIqq.ppp
  where: ss: source Id
          b: book Id
         uu: unit Id
          I: question indicator, 0:no questions 1:questions
         qq: question Id
        ppp: paragraph number - not positional
*/
function decodeKey(key) {
  let {pid, pageKey} = parseKey(key);
  let pageKeyString = pageKey.toString(10);
  let decodedKey = {
    error: 0,
    message: "ok",
    sid: sourceId,
    bookId: "",
    uid: 0,
    hasQuestions: false,
    qid: 0,
    pid: pid - 1
  };

  //error, invalid key length
  if (pageKeyString.length !== keyLength) {
    decodedKey.error = true;
    decodedKey.message = `Integer portion of key should have a length of ${keyLength}, key is: ${pageKeyString}`;
    return decodedKey;
  }

  let bid = parseInt(pageKeyString.substr(2,1), 10);
  decodedKey.bookId = bookIds[bid];

  //substract 1 from key value to get index
  decodedKey.uid = parseInt(pageKeyString.substr(3,2), 10) - 1;
  decodedKey.hasQuestions = pageKeyString.substr(5,1) === "1";

  //subtract 1 from key value to get index
  decodedKey.qid = parseInt(pageKeyString.substr(6,2), 10) - 1;

  return decodedKey;
}

function getBooks() {
  return books;
}

/*
  Return the number of chapters in the book (bid). 
  Subtract one from length because of 'xxx' (fake chapter)
*/
function getNumberOfUnits(bid) {
  if (contents[bid]) {
    return contents[bid].length - 1;
  }
  else {
    throw new Error(`getNumberOfUnits() unexpected bookId: ${bid}`);
  }
}

/*
 * Convert page key to url
 */
function getUrl(key) {
  let decodedKey = decodeKey(key);
  let unit = "invalid";

  if (decodedKey.error) {
    return "/invalid/key/";
  }

  if (contents[decodedKey.bookId]) {
    unit = contents[decodedKey.bookId][decodedKey.uid + 1];
  }

  return `/${decodedKey.bookId}/${unit}/`;
}

module.exports = {
  getNumberOfUnits: getNumberOfUnits,
  getUrl: getUrl,
  getBooks: getBooks,
  getSourceId: getSourceId,
  getKeyInfo: getKeyInfo,
  parseKey: parseKey,
  genPageKey: genPageKey,
  genParagraphKey: genParagraphKey,
  decodeKey: decodeKey
};
