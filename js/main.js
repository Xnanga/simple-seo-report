"use:strict";

// Global

let allDates = {};

// Init

const init = function () {
  getDates();
};

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

  allDates = {
    lastFullMonthEndDate: lastFullMonthEndDate,
    lastFullMonthStartDateYoY: lastFullMonthStartDateYoY,
  };
};

// Google Analytics

const VIEW_ID = "152507396";

// Query the API
function queryReports() {
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
                  expression: "ga:sessions",
                },
                // {
                //   expression: "ga:itemRevenue",
                // },
                // {
                //   expression: "ga:transactions",
                // },
                // {
                //   expression: "ga:transactionsPerSession",
                // },
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
      .then(handleOutput, console.error.bind(console));
  } catch (error) {
    console.error(error);
  }
}

const handleOutput = async function (data) {
  // All Data
  const allDataRows = data.result.reports[0].data.rows;

  // Organic Search
  const allOrgDataRows = await getChannelData(allDataRows, "Organic Search");

  // Send Data for Reporting
  runAllReports(allDataRows, allOrgDataRows);
};

const getChannelData = function (allData, channel) {
  return new Promise((res) => {
    const newChannelData = allData.filter((row) => {
      return row.dimensions[0] === channel;
    });
    res(newChannelData);
  });
};

const runAllReports = function (allData, orgData) {
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

  // Top 10 Landing Pages Biggest Chance MoM

  // Top 10 Landing Pages Biggest Chance YoY

  // Organic Events MoM

  // Organic Events YoY
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

// Utilities

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

init();
