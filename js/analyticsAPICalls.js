// Imports

import {
  handleTrafficOutput,
  handleLandingPageEventsGoalsReport,
} from "./dataManagement.js";

// Global Vars

const viewId = "203215467";

// Functions

export const queryTrafficReports = function (dates) {
  try {
    // eslint-disable-next-line no-undef
    gapi.client
      .request({
        path: "/v4/reports:batchGet",
        root: "https://analyticsreporting.googleapis.com/",
        method: "POST",
        includeEmptyRows: true,
        body: {
          reportRequests: [
            {
              viewId: viewId,
              dateRanges: [
                {
                  startDate: dates.lastFullMonthStartDateYoY,
                  endDate: dates.lastFullMonthEndDate,
                },
              ],
              metrics: [
                {
                  expression: "ga:sessions",
                },
                {
                  expression: "ga:users",
                },
                {
                  expression: "ga:bounceRate",
                },
                {
                  expression: "ga:avgSessionDuration",
                },
                {
                  expression: "ga:pageviewsPerSession",
                },
                {
                  expression: "ga:transactionRevenue",
                },
                {
                  expression: "ga:transactions",
                },
                {
                  expression: "ga:transactionsPerSession",
                },
              ],
              dimensions: [
                {
                  name: "ga:channelGrouping",
                },
                {
                  name: "ga:nthMonth",
                },
              ],
            },
          ],
        },
      })
      .then(handleTrafficOutput);
  } catch (error) {
    console.error(error);
  }
};

// Query for landing pages
export const queryLandingPageReports = function (dates) {
  try {
    // eslint-disable-next-line no-undef
    gapi.client
      .request({
        path: "/v4/reports:batchGet",
        root: "https://analyticsreporting.googleapis.com/",
        method: "POST",
        includeEmptyRows: true,
        body: {
          reportRequests: [
            {
              viewId: viewId,
              dateRanges: [
                {
                  startDate: dates.lastFullMonthStartDateYoY,
                  endDate: dates.lastFullMonthEndDate,
                },
              ],
              metrics: [
                {
                  expression: "ga:sessions",
                },
              ],
              dimensions: [
                {
                  name: "ga:channelGrouping",
                },
                {
                  name: "ga:nthMonth",
                },
                {
                  name: "ga:landingPagePath",
                },
              ],
            },
          ],
        },
      })
      .then(handleLandingPageEventsGoalsReport);
  } catch (error) {
    console.error(error);
  }
};
