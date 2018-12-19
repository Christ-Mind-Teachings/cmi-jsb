import scroll from "scroll-into-view";
import {getConfig} from "../_config/config";

const uiTocModal = ".toc.ui.modal";
const uiOpenTocModal = ".toc-modal-open";
const uiModalOpacity = 0.5;

//generate html for questions
function renderQuestions(questions) {
  return `
    <div class="list">
      ${questions.map(q => `<a class="item" href="${q.url}">${q.title}</a>`).join("")}
    </div>
  `;
}

//generate html for Contents
function makeContents(contents) {
  return (`
    <div class="ui ordered relaxed list">
      ${contents.map(unit => `
        <div class="item"> 
          <a href="${unit.url}">${unit.title}</a>
          ${unit.questions ? renderQuestions(unit.questions) : ""}
        </div>
      `).join("")}
    </div>
  `);
}

/*
  If we're on a transcript page, highlight the 
  current transcript in the list
*/
function highlightCurrentTranscript() {
  if ($(".transcript").length > 0) {
    let page = location.pathname;
    let $el = $(`.toc-list a[href='${page}']`);

    //remove href to deactivate link for current page and
    //scroll into middle of viewport
    $el.addClass("current-unit").removeAttr("href");
    scroll($el.get(0));
  }
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
  initialize: function() {
    //dialog settings
    $(uiTocModal).modal({
      dimmerSettings: {opacity: uiModalOpacity},
      observeChanges: true
    });

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

      getConfig(book)
        .then((contents) => {
          $(".toc-image").attr("src", `${contents.image}`);
          $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
          $(".toc-list").html(makeContents(contents.contents));
          highlightCurrentTranscript();
          $(uiTocModal).modal("show");
        })
        .catch((error) => {
          $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
          $(".toc-title").html("Table of Contents: <em>Error</em>");
          $(".toc-list").html(`<p>Error: ${error.message}</p><p>Failed to get ${url}`);
          $(uiTocModal).modal("show");
        });
    });
  }
};
