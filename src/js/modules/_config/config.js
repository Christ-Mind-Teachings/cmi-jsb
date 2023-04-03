//import {fetchConfiguration} from "www/modules/_util/cmi";
import {fetchConfiguration} from "www/modules/_ajax/config";
import axios from "axios";
import {status} from "./status";

//import {decodeKey, parseKey, genKey} from "./key";
const transcript = require("./key");

//change these values to reflect transcript info
const AWS_BUCKET = "assets.christmind.info";
const SOURCE_ID = "jsb";
const SOURCE = "The Impersonal Life";

//mp3 and audio timing base directories
const audioBase = `https://s3.amazonaws.com/${AWS_BUCKET}/${SOURCE_ID}/audio`;
const timingBase = "/t/jsb/public/timing";

//location of configuration files
const configUrl = "/t/jsb/public/config";

//the current configuration, initially null, assigned by getConfig()
let config;

/*
  Fetch audio timing data
*/
export function fetchTimingData(url) {
  return new Promise((resolve, reject) => {
    axios.get(`${timingBase}${url}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Get the configuration file for 'book'. If it's not found in
 * the cache (local storage) then get it from the server and 
 * save it in cache.
 *
 * @param {string} book - the book identifier
 * @param {boolean} assign - true if the config is to be assigned to global config variable
 * @returns {promise}
 */
export function getConfig(book, assign = true) {
  let lsKey = `cfg${book}`;
  let url = `${configUrl}/${book}.json`;

  return new Promise((resolve, reject) => {
    fetchConfiguration(url, lsKey, status).then((resp) => {
      if (assign) {
        config = resp;
      }
      resolve(resp);
    }).catch((err) => {
      reject(err);
    });
  });
}

/**
 * Load the configuration file for 'book'. If it's not found in
 * the cache (local storage) then get it from the server and 
 * save it in cache.
 *
 * @param {string} book - the book identifier
 * @returns {promise}
 */
export function loadConfig(book) {
  let lsKey = `cfg${book}`;
  let url = `${configUrl}/${book}.json`;

  //"book" is a single page, no configuration
  if (!book) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    fetchConfiguration(url, lsKey, status)
      .then((resp) => {
        config = resp;
        resolve(true);
      })
      .catch((error) => {
        config = null;
        console.error(error);
        reject(error);
      });
  });
}

/*
  get audio info from config file
*/
function _getAudioInfo(idx, cIdx) {
  let audioInfo;

  audioInfo = config.contents[cIdx];
  return audioInfo ? audioInfo: {};
}

export function getAudioInfo(url) {
  //check that config has been initialized
  if (!config) {
    throw new Error("Configuration has not been initialized");
  }

  //remove leading and trailing "/"
  url = url.substr(1);
  url = url.substr(0, url.length - 1);

  let idx = url.split("/");

  //check the correct configuration file is loaded
  if (config.bid !== idx[2]) {
    throw new Error("Unexpected config file loaded; expecting %s but %s is loaded.", idx[2], config.bid);
  }

  let audioInfo = {};
  let cIdx;

  switch(idx[2]) {
    default:
      //console.log("idx[1]: ", idx);
      cIdx = parseInt(idx[3].substr(4), 10) - 1;
      //console.log("cIdx: %s", cIdx);
      audioInfo = _getAudioInfo(idx, cIdx);
      break;
  }

  audioInfo.audioBase = audioBase;
  return audioInfo;
}

/*
 * get timer info for the current page
 */
export function getReservation(url) {
  let audioInfo = getAudioInfo(url);

  if (audioInfo.timer) {
    return audioInfo.timer;
  }

  return null;
}

/*
  Given a page key, return data from a config file

  returns: book title, page title, url and optionally subtitle.

  args:
    pageKey: a key uniuely identifying a transcript page
    data: optional, data that will be added to the result, used for convenience
*/
export function getPageInfo(pageKey, data = false) {
  let decodedKey = transcript.decodeKey(pageKey);
  let info = {pageKey: pageKey, source: SOURCE, bookId: decodedKey.bookId};

  if (data) {
    info.data = data;
  }

  return new Promise((resolve, reject) => {

    //get configuration data specific to the bookId
    getConfig(decodedKey.bookId, false)
      .then((data) => {
        info.bookTitle = data.title;

        if (decodedKey.hasQuestions) {
          info.title = data.contents[decodedKey.uid].title;
          info.subTitle = data.contents[decodedKey.uid].questions[decodedKey.qid].title;
          info.url = data.contents[decodedKey.uid].questions[decodedKey.qid].url;
        }
        else {
          info.title = data.contents[decodedKey.uid].title;
          info.url = data.contents[decodedKey.uid].url;
        }

        resolve(info);
      })
      .catch((error) => {
        reject(error);
      });
  });

}
