import scroll from "scroll-into-view";
import {getConfig} from "../_config/config";

const uiTocModal = ".toc.ui.modal";
const uiOpenTocModal = ".toc-modal-open";
const uiModalOpacity = 0.5;

//generate html for Contents
function makeContents(contents) {
  return (`
    <div class="ui ordered relaxed list">
      ${contents.map((unit, idx) => `
        <div class="item"> 
          <a data-lid="${idx+1}" href="${unit.url}">${unit.title}</a>
        </div>
      `).join("")}
    </div>
  `);
}

/*
  If we're on a transcript page, highlight the 
  current transcript in the list and set prev and
  next menu controls
*/
function highlightCurrentTranscript(bid) {
  if ($(".transcript").length > 0) {
    let page = location.pathname;
    let $el = $(`.toc-list a[href='${page}']`);

    //remove href to deactivate link for current page
    $el.addClass("current-unit").removeAttr("href");

    let max = 1;

    switch(bid) {
      case "til":
        max = 19;
        break;
      case "acq":
        max = 1;
        break;
    }

    setNextPrev($el, max);
  }
}

/*
  set next/prev controls on menu for workbook transcripts
*/
function setNextPrev($el, max) {
  const LAST_ID = max;
  let prevId = -1, nextId = -1, href, text;
  let lid = $el.attr("data-lid");
  let lessonId = parseInt(lid, 10);

  //disable prev control
  if (lessonId === 1) {
    $(".previous-page").addClass("disabled");
  }
  else {
    $(".previous-page").removeClass("disabled");
    prevId = lessonId - 1;
  }

  //disable next control
  if (lessonId === LAST_ID) {
    $(".next-page").addClass("disabled");
  }
  else {
    $(".next-page").removeClass("disabled");
    nextId = lessonId + 1;
  }

  if (prevId > -1) {
    href = $(`a[data-lid="${prevId}"]`).attr("href");
    text = $(`a[data-lid="${prevId}"]`).text();

    //set prev tooltip and href
    $("a.previous-page > span").attr("data-tooltip", `${text}`);
    $("a.previous-page").attr("href", `${href}`);
  }
  else {
    $("a.previous-page > span").attr("data-tooltip", "At Top");
  }

  if (nextId > -1) {
    href = $(`a[data-lid="${nextId}"]`).attr("href");
    text = $(`a[data-lid="${nextId}"]`).text();

    //set prev tooltip and href
    $("a.next-page > span").attr("data-tooltip", `${text}`);
    $("a.next-page").attr("href", `${href}`);
  }
  else {
    $("a.next-page > span").attr("data-tooltip", "At Bottom");
  }
}

//called for transcript pages
function loadTOC() {
  let book = $("#contents-modal-open").attr("data-book").toLowerCase();

  getConfig(book)
    .then((contents) => {
      $(".toc-image").attr("src", `${contents.image}`);
      $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
      $(".toc-list").html(makeContents(contents.contents));
      highlightCurrentTranscript(contents.bid);
    })
    .catch((error) => {
      console.error(error);
      $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
      $(".toc-title").html("Table of Contents: <em>Error</em>");
      $(".toc-list").html(`<p>Error: ${error.message}</p>`);
      $(uiTocModal).modal("show");
    });
}

/*
  Calls to this function are valid for transcript pages.
*/
export function getBookId() {
  return $(uiOpenTocModal).attr("data-book");
}

export default {

  /*
   * Init the modal dialog with data from JSON file 
   * or local storage
   */
  initialize: function(env) {

    //modal dialog settings
    $(uiTocModal).modal({
      dimmerSettings: {opacity: uiModalOpacity},
      observeChanges: true,
      onVisible: function() {
        let $el = $(".toc-list a.current-unit");
        scroll($el.get(0), {
          isScrollable: function(target, defaultIsScrollable) {
            return defaultIsScrollable(target) || target.className.includes('scrolling');
          }
        });
      }
    });

    //load toc once for transcript pages
    if (env === "transcript") {
      loadTOC();
    }
    /*
     * TOC populated by JSON file from AJAX call if not found
     * in local storage.
     * 
     * Read value of data-book attribute to identify name of file
     * with contents.
     */
    $(uiOpenTocModal).on("click", (e) => {
      e.preventDefault();
      let book = $(e.currentTarget).attr("data-book").toLowerCase();
      if (env !== "transcript") {
        getConfig(book)
          .then((contents) => {
            $(".toc-image").attr("src", `${contents.image}`);
            $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
            $(".toc-list").html(makeContents(contents.contents));
            $(uiTocModal).modal("show");
          })
          .catch((error) => {
            $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
            $(".toc-title").html("Table of Contents: <em>Error</em>");
            $(".toc-list").html(`<p>Error: ${error.message}</p><p>Failed to get ${url}`);
            $(uiTocModal).modal("show");
          });
      }
      else {
        $(uiTocModal).modal("show");
      }
    });
  }
};
