/* eslint no-console: off */

import {SourceStore, storeInit} from "common/modules/_util/store";
import auth from "common/modules/_user/netlify";
import {initStickyMenu, initAnimation} from "common/modules/_page/startup";
import {showQuotes, showTOC} from "common/modules/_util/url";
import fb from "common/modules/_util/facebook";
import {initQuoteDisplay} from "common/modules/_topics/events";

import {bookmarkStart} from "./modules/_bookmark/start";
import {setEnv} from "./modules/_config/config";
import toc from "./modules/_contents/toc";
import about from "./modules/_about/about";

import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);
  initStickyMenu();

  auth.initialize();
  setEnv(store);

  bookmarkStart("page", store);
  toc.initialize("page");
  about.initialize();

  fb.initialize();
  initQuoteDisplay("#show-quote-button", constants);
  initAnimation();

  //if url contains ?tocbook=[ack | book1 | book2] then show TOC on page load
  showTOC();

  //if url contains ?quotes=y then show quotes modal on page load
  showQuotes();
});
