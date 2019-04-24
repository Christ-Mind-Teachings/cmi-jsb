/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getPageInfo} from "./modules/_config/config";

export default {
  sid: "JSB",
  getPageInfo: getPageInfo,              //list
  keyInfo: keyInfo,                      //list, bmnet
  bm_modal_key: "bm.jsb.modal",         //list
  bm_creation_state: "bm.jsb.creation", //bookmark
  bm_list_store: "bm.jsb.list",         //bmnet
  bm_topic_list: "bm.jsb.topics",       //bmnet
  bm_modal_store: "bm.jsb.modal",       //navigator
  url_prefix: "/t/jsb"                  //navigator
};
