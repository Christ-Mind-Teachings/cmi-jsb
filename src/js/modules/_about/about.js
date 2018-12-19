import {pageDriver, transcriptDriver} from "../_util/driver";

function createClickHandlers() {
  $("#help-menu").on("click", "div.item", function(e) {
    e.preventDefault();

    if ($(this).hasClass("page-tour")) {
      console.log("pageDriver");
      pageDriver();
    }

    if ($(this).hasClass("transcript-tour")) {
      console.log("transcriptDriver");
      transcriptDriver();
    }
  });
}

export default {
  initialize() {
    createClickHandlers();
  }
};
