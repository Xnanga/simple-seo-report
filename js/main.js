// 3rd Party Imports

// import moment from "../node_modules/moment/moment.js";
// import Plotly from "../node_modules/plotly.js-dist/plotly.js";

// Internal Imports

import * as dateFunctions from "./dateFunctions.js";
import * as analyticsAPICalls from "./analyticsAPICalls.js";
// import * as dataManagement from "./dataManagement.js";
// import * as graphsTables from "./graphsAndTables.js";
// import * as utilities from "./utilityFunctions.js";

function runAllQueries(dates) {
  analyticsAPICalls.queryTrafficReports(dates);
  analyticsAPICalls.queryLandingPageReports(dates);
  // queryEventsReports();
}

// Init

async function init() {
  const dates = await dateFunctions.getDates();
  if (dates) runAllQueries(dates);
}

init();
