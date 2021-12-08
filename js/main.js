// Imports

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

const handleTrafficOutput = async function (data, dates) {
  // All Data
  const allDataRows = data.result.reports[0].data.rows;

  // Organic Search
  const allOrgDataRows = await getChannelData(allDataRows, "Organic Search");

  // Send Data for Reporting
  runAllTrafficReports(allDataRows, allOrgDataRows);

  // Create graphs
  graphOrgTrafficMoM(allOrgDataRows);
  graphOrgTrafficYoY(allOrgDataRows);
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

const graphOrgTrafficMoM = function (orgData) {
  const xAxisLabels = last12MonthsArr(12);
  let yAxisDataArr = [];

  for (let i = 1; i < orgData.length; i++) {
    yAxisDataArr.push(orgData[i].metrics[0].values[0]);
  }

  const data = [
    {
      x: xAxisLabels,
      y: yAxisDataArr,
      type: "bar",
    },
  ];

  const layout = {
    xaxis: {
      title: "Month",
    },
    yaxis: { title: "Organic Sessions" },
    dragmode: false,
    margin: {
      b: 60,
      l: 60,
      r: 60,
      t: 10,
    },
  };

  Plotly.newPlot("graphOrgTrafficMoM", data, layout, {
    displayModeBar: false,
    responsive: true,
  });
};

const graphOrgTrafficYoY = function (orgData) {
  const xAxisLabels = [
    moment().subtract(13, "months").endOf("month").format("MMM YYYY"),
    moment().subtract(1, "months").endOf("month").format("MMM YYYY"),
  ];

  const currentMonthOrgSessions = [
    orgData[0].metrics[0].values[0],
    orgData[12].metrics[0].values[0],
  ];

  const data = [
    {
      x: xAxisLabels,
      y: currentMonthOrgSessions,
      type: "bar",
    },
  ];

  const layout = {
    xaxis: {
      title: "Month",
    },
    yaxis: { title: "Organic Sessions" },
    dragmode: false,
    margin: {
      b: 60,
      l: 60,
      r: 60,
      t: 10,
    },
  };

  Plotly.newPlot("graphOrgTrafficYoY", data, layout, {
    displayModeBar: false,
    responsive: true,
  });
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

// Create array of month names
const last12MonthsArr = function (months) {
  let arr = [];

  for (i = 0; i < months; i++) {
    const currentMonth = moment()
      .subtract(i + 1, "month")
      .startOf("month")
      .format("MMM");

    arr.unshift(currentMonth);
  }
  return arr;
};

// Init

async function init() {
  const dates = await getDates();
  if (dates) runAllQueries(dates);
}

init();
