/* eslint no-console: off */

import {SourceStore, storeInit} from "common/modules/_util/store";
import {initHomePage} from "common/modules/_page/startup";
import {showQuotes, showTOC} from "common/modules/_util/url";
import {initQuoteDisplay} from "common/modules/_topics/events";

import {setEnv} from "./modules/_config/config";
import toc from "./modules/_contents/toc";
import {pageDriver} from "./modules/_util/driver";

import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);

  setEnv(store);

  initHomePage(store, pageDriver);
  toc.initialize("page");
  initQuoteDisplay("#show-quote-button", store);

  //if url contains ?tocbook=[ack | book1 | book2] then show TOC on page load
  showTOC();

  //if url contains ?quotes=y then show quotes modal on page load
  showQuotes();
});
