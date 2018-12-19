import Driver from "driver.js";

export function pageDriver() {
  const driver = new Driver({
    allowClose: false,
    opacity: 0.5,
    onHighlightStarted: (el) => {
      console.log("highlighting %o", el);
    }
  });

  driver.defineSteps([
    {
      element: "#source-homepage",
      popover: {
        title: "The Way of Mastery",
        description: "This is the homepage for all of <em>The Way of Mastery</em> teachings in the Library. Each of the volumes below contain chapters and some included questions too. And most contain the original audio so you can read along as you listen.<br><br>Click on the image to see the table of contents. The Way of Mastery teachings include&hellip;",
        position: "bottom"
      }
    },
    {
      element: "[data-book='woh']",
      popover: {
        title: "The Way of the Heart",
        description: "The first of three years of monthly messages that present the fundamental ideas and exercises that form a pathway of awakening.",
        position: "top"
      }
    },
    {
      element: "[data-book='wot']",
      popover: {
        title: "The Way of Transformation",
        description: "The second year of monthly messages that presents a transformative way of life.",
        position: "top"
      }
    },
    {
      element: "[data-book='wok']",
      popover: {
        title: "The Way of Knowing",
        description: "The final year of monthly messages that culminates <em>The Way of Mastery</em>.",
        position: "top"
      }
    },
    {
      element: "[data-book='tjl']",
      popover: {
        title: "The Jeshua Letters",
        description: "Jayem's account of his introduction to Jeshua.",
        position: "top"
      }
    },
    {
      element: "[data-book='wos']",
      popover: {
        title: "The Way of the Servant",
        description: "A poetic description of the journey of awakening taken from inception to recognition of self as the servant - one who walks this world awake.",
        position: "top"
      }
    },
    {
      element: "[data-book='early']",
      popover: {
        title: "The Early Years",
        description: "A collection of messages given before the Way of the Heart.",
        position: "top"
      }
    },
    {
      element: "#masthead-title",
      popover: {
        title: "Navigation and Features",
        description: "The Way of Mastery is part of the Library of Christ Mind Teachings. On every page you can click here to display the Library's main page to see all available teachings.",
        position: "bottom"
      }
    },
    {
      element: "#page-menu",
      popover: {
        title: "The Menu",
        description: "This is the page menu, it will stick to the top when the page is scrolled (when the tour is over) so it is always available. The menu on other pages is similar but may contain additional features.",
        position: "bottom"
      }
    },
    {
      element: ".bookmark-modal-open",
      popover: {
        title: "List Bookmarks",
        description: "Display a list of bookmarks you have created and optionally filter by topic. You can quickly jump to any bookmark. Learn more about bookmarks in the documentation.",
        position: "bottom"
      }
    },
    {
      element: ".search-modal-open",
      popover: {
        title: "Search Through All Books",
        description: "Find topics of interest by searching through all Way of Mastery books.",
        position: "bottom"
      }
    },
    {
      element: "#help-menu",
      popover: {
        title: "Get Help and Learn About",
        description: "Learn about the teaching and using the features of the site.",
        position: "bottom"
      }
    },
    {
      element: ".login-menu-option",
      popover: {
        title: "Sign In/Sign Out",
        description: "Create an account and sign in to the site. It's free and allows you to create bookmarks that you can share via Facebook and keep synchronized between devices.",
        position: "left"
      }
    }
  ]);

  driver.start();
}

export function transcriptDriver() {
  const driver = new Driver({
    allowClose: false,
    opacity: 0.5,
    onReset: () => {
      $("#bookmark-dropdown-menu").dropdown("hide");
    }
  });

  driver.defineSteps([
    {
      element: "#bookmark-dropdown-menu",
      popover: {
        title: "Bookmark Feature",
        description: "Here you can list and filter bookmarks by topic.",
        position: "right"
      }
    },
    {
      element: "#bookmark-modal-open",
      popover: {
        title: "List Bookmarks",
        description: "Display a list of bookmarks you have created and optionally filter by topic. You can quickly jump to any bookmark. Learn more about bookmarks in the documentation.",
        position: "right"
      }
    },
    {
      element: "#bookmark-toggle-highlight",
      popover: {
        title: "Show/Hide Bookmark Highlight",
        description: "Hide or show all highlighted text.",
        position: "right"
      }
    },
    {
      element: ".search-modal-open",
      popover: {
        title: "Search Through All Books",
        description: "Find topics of interest by searching through all Way of Mastery books.",
        position: "bottom"
      }
    }
  ]);

  //show bookmark menu
  $("#bookmark-dropdown-menu").dropdown("show");
  driver.start();
}

