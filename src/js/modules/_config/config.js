import store from "store";
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
const configStore = "config.jsb.";

//the current configuration, initially null, assigned by getConfig()
let config;

/*
  The status constains the save date for each config file. We compare that to the saveDate
  in the locally stored config file. If it's different or doesn't exist we need to get
  a new version.

  return: true - get a new version
          false - use the one we've got
*/
function refreshNeeded(cfg) {
  let saveDate = status[cfg.bid];

  if (!cfg.saveDate) {
    cfg.saveDate = saveDate;

    //we don't use this anymore
    if (cfg.lastFetchDate) {
      delete cfg.lastFetchDate;
    }
    console.log("%s needs to be refreshed", cfg.bid);
    return true; //refresh needed
  }

  if (cfg.saveDate === saveDate) {
    //no refresh needed
    return false;
  }
  else {
    //config file has changed, refresh needed
    cfg.saveDate = saveDate;
    console.log("%s needs to be refreshed", cfg.bid);
    return true;
  }
}

function requestConfiguration(url) {
  return axios.get(url);
}

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

/*
  We use book level configuration that is loaded by request via AJAX. Once
  loaded the config is persisted in local storage. A check is made for
  configuration data loaded from storage to determine if the data needs to
  be reloaded. This is indicated using Define-webpack-plugin to set the timestamp
  of configurations that have changed.

  args:
    book: the book identifier, woh, wot, etc
    assign: when true, assign global variable 'config' to retrieved data
*/
export function getConfig(book, assign = true) {
  return new Promise((resolve, reject) => {
    let cfg = store.get(`${configStore}${book}`);
    let url;

    //if config in local storage check if we need to get a freash copy
    if (cfg && !refreshNeeded(cfg)) {
      if (assign) {
        config = cfg;
      }
      resolve(cfg);
    }

    //get config from server
    url = `${configUrl}/${book}.json`;
    requestConfiguration(url)
      .then((response) => {
        //add save date before storing
        response.data.saveDate = status[response.data.bid];
        store.set(`${configStore}${book}`, response.data);
        if (assign) {
          config = response.data;
        }
        resolve(response.data);
      })
      .catch(() => {
        config = null;
        reject(`Config file: ${url} is not valid JSON`);
      });
  });
}

/*
  For transcript pages; load the configuration file.
  For non-transcript pages; configuration is loaded by getConfig()

  This is the same as getConfig() except it doesn't resolve passing the data
  but a message indicating source of the configuration file
*/
export function loadConfig(book) {
  return new Promise((resolve, reject) => {
    let cfg = store.get(`${configStore}${book}`);
    let url;

    //if config in local storage check if we need to get a freash copy
    if (cfg && !refreshNeeded(cfg)) {
      config = cfg;
      resolve("config read from cache");
    }

    //get config from server
    url = `${configUrl}/${book}.json`;
    requestConfiguration(url)
      .then((response) => {
        //add save date before storing
        response.data.saveDate = status[response.data.bid];
        store.set(`${configStore}${book}`, response.data);
        config = response.data;
        resolve("config fetched from server");
      })
      .catch((error) => {
        config = null;
        reject(`Config file: ${url} is not valid JSON`);
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
