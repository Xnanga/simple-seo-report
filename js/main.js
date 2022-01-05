// Imports

import * as dateFunctions from "./dateFunctions.js";
import * as analyticsAPICalls from "./analyticsAPICalls.js";

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
