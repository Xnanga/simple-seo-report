"use:strict";

// Imports

import * as Plotly from "../node_modules/plotly.js-dist/plotly.js";

// Global

const VIEW_ID = "101406599";

// Dates

const getDates = function () {
  const today = moment().format("YYYY-MM-DD");

  // Last Full Month
  const lastFullMonthStartDate = moment(today)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");

  const lastFullMonthEndDate = moment(today)
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD");

  // 12 Months Previous
  const lastFullMonthStartDateYoY = moment(lastFullMonthStartDate)
    .subtract(12, "months")
    .format("YYYY-MM-DD");

  const allDates = {
    lastFullMonthEndDate: lastFullMonthEndDate,
    lastFullMonthStartDateYoY: lastFullMonthStartDateYoY,
  };

  return allDates;
};

// Google Analytics

function runAllQueries(dates) {
  queryTrafficReports(dates);
  // queryLandingPageReports();
  // queryEventsReports();
  // queryEcommerceReports(); No e-commerce data to test with yet
}

// Query for traffic data
const queryTrafficReports = function (dates) {
  try {
    gapi.client
      .request({
        path: "/v4/reports:batchGet",
        root: "https://analyticsreporting.googleapis.com/",
        method: "POST",
        body: {
          reportRequests: [
            {
              viewId: VIEW_ID,
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

const handleTrafficOutput = async function (data) {
  // All Data
  const allDataRows = data.result.reports[0].data.rows;

  // Organic Search
  const allOrgDataRows = await getChannelData(allDataRows, "Organic Search");

  // Send Data for Reporting
  runAllTrafficReports(allDataRows, allOrgDataRows);
};

const runAllTrafficReports = function (allData, orgData) {
  const currMonthOrgSessions = orgData[12].metrics[0].values[0];
  const prevMonthOrgSessions = orgData[11].metrics[0].values[0];
  const prevYearOrgSessions = orgData[0].metrics[0].values[0];

  // Organic Traffic Percentage

  // MoM Organic Traffic
  compareMonths(
    currMonthOrgSessions,
    prevMonthOrgSessions,
    "month-on-month",
    "organic traffic",
    "visits"
  );

  // YoY Organic Traffic
  compareMonths(
    currMonthOrgSessions,
    prevYearOrgSessions,
    "year-on-year",
    "organic traffic",
    "visits"
  );
};

// Query for Ecommerce Data

const queryEcommerceReports = function () {
  try {
    gapi.client
      .request({
        path: "/v4/reports:batchGet",
        root: "https://analyticsreporting.googleapis.com/",
        method: "POST",
        body: {
          reportRequests: [
            {
              viewId: VIEW_ID,
              dateRanges: [
                {
                  startDate: allDates.lastFullMonthStartDateYoY,
                  endDate: allDates.lastFullMonthEndDate,
                },
              ],
              metrics: [
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
      .then(handleEcommerceOutput);
  } catch (error) {
    console.error(error);
  }
};

const handleEcommerceOutput = async function (data) {
  console.log(data);

  // All Data
  const allDataRows = data.result.reports[0].data.rows;

  // Organic Search
  // const allOrgDataRows = await getChannelData(allDataRows, "Organic Search");

  // // Send Data for Reporting
  // runAllEcommerceReports(allDataRows, allOrgDataRows);
};

const runAllEcommerceReports = function (allData, orgData) {
  // Get MoM and YoY revenue, transactions, and conv rate
  // MoM Revenue
  // YoY Revenue
  // MoM Transactions
  // YoY Transactions
  // MoM Conv Rate
  // YoY Conv Rate
};

// Google Analytics - Comparisons

const compareMonths = function (currVal, prevVal, comparison, metric, unit) {
  const introString = `${comparison} ${metric} ${determineIncreaseDecrease(
    currVal,
    prevVal
  )} by ${getPercentage(
    currVal,
    prevVal
  )}%, from ${prevVal} to ${currVal} ${unit}.`;

  generateIntroText(introString);
};

// UI

const generateIntroText = function (data) {
  const firstLetter = data.slice(0, 1).toUpperCase();
  const remainingString = data.slice(1);
  const formattedString = `<li>${firstLetter}${remainingString}</li>`;

  const introBody = document.getElementById("intro-body");
  introBody.insertAdjacentHTML("afterbegin", formattedString);
};

// Plotly Graphs

const testGraph = function () {
  const TESTER = document.getElementById("tester");
  newPlot(
    TESTER,
    [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
      },
    ],
    {
      margin: { t: 0 },
    }
  );
};

// Utilities

const getChannelData = function (allData, channel) {
  return new Promise((res) => {
    const newChannelData = allData.filter((row) => {
      return row.dimensions[0] === channel;
    });
    res(newChannelData);
  });
};

const getPercentage = (num1, num2) =>
  Math.abs(((num1 - num2) / num1) * 100).toFixed(2);

const determineIncreaseDecrease = function (currentNum, prevNum) {
  if (currentNum === prevNum) return "remained stable";

  let comparison;
  currentNum > prevNum
    ? (comparison = "increased")
    : (comparison = "decreased");
  return comparison;
};

// Init

async function init() {
  const dates = await getDates();
  if (dates) runAllQueries(dates);
}

init();
