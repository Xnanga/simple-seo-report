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

  // Previous Full Month
  const previousFullMonthStartDate = moment(today)
    .subtract(2, "months")
    .startOf("month")
    .format("YYYY-MM-DD");

  const previousFullMonthEndDate = moment(today)
    .subtract(2, "months")
    .endOf("month")
    .format("YYYY-MM-DD");

  // Last Full Month Previous Year
  const lastFullMonthStartDateYoY = moment(lastFullMonthStartDate)
    .subtract(1, "years")
    .format("YYYY-MM-DD");

  const lastFullMonthEndDateYoY = moment(lastFullMonthEndDate)
    .subtract(1, "years")
    .format("YYYY-MM-DD");

  allDates = {
    lastFullMonthStartDate: lastFullMonthStartDate,
    lastFullMonthEndDate: lastFullMonthEndDate,
    previousFullMonthStartDate: previousFullMonthStartDate,
    previousFullMonthEndDate: previousFullMonthEndDate,
    lastFullMonthStartDateYoY: lastFullMonthStartDateYoY,
    lastFullMonthEndDateYoY: lastFullMonthEndDateYoY,
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
                  startDate: allDates.lastFullMonthStartDate,
                  endDate: allDates.lastFullMonthEndDate,
                },
                // FIGURE OUT HOW YOU'RE GOING TO GET BOTH MOM AND YOY DATA IN ONE GO
                // {
                //   startDate: allDates.previousFullMonthStartDate,
                //   endDate: allDates.previousFullMonthEndDate,
                // },
                {
                  startDate: allDates.lastFullMonthStartDateYoY,
                  endDate: allDates.lastFullMonthEndDateYoY,
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
  const currMonthOrgSessions = orgData[0].metrics[0].values[0];
  const prevMonthOrgSessions = orgData[0].metrics[0].values[0];
  const prevYearOrgSessions = orgData[0].metrics[1].values[0];

  console.log(orgData);

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

  // MoM Organic Top Landing Page Increases

  // YoY Organic Top Landing Page Increases

  // MoM Organic Revenue

  // YoY Organic Revenue

  // MoM Organic Transactions

  // YoY Organic Transactions

  // MoM Organic Conversion Rate

  // YoY Organic Conversion Rate

  // MoM Organic AOV

  // YoY Organic AOV
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
  introBody.innerHTML = formattedString;
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
