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
        includeEmptyRows: true,
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

const handleTrafficOutput = async function (data) {
  // All Data
  const allDataRows = data.result.reports[0].data.rows;

  // Group channel data together
  const allChannels = getAllChannels(allDataRows);
  const dataGroupedByChannel = await groupDataByChannel(
    allDataRows,
    allChannels
  );

  // Send Data for Channel Performance Overview
  runChannelPerfOverview(dataGroupedByChannel);

  // Send Data for Organic Traffic Performance
  runAllTrafficReports(
    dataGroupedByChannel,
    dataGroupedByChannel["Organic Search"]
  );

  // Send Data for e-commerce performance
  runAllEcommerceReports(dataGroupedByChannel);

  // Create graphs
  graphOrgTrafficMoM(dataGroupedByChannel["Organic Search"]);
  graphOrgTrafficYoY(dataGroupedByChannel["Organic Search"]);
};

const runAllTrafficReports = function (allDataGrouped, orgData) {
  const currMonthOrgSessions = findMonthRow(orgData, "0012", 0);
  const prevMonthOrgSessions = findMonthRow(orgData, "0011", 0);
  const prevYearOrgSessions = findMonthRow(orgData, "0000", 0);

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

const runChannelPerfOverview = function (dataGroupedByChannel) {
  // Some Code
};

const runAllEcommerceReports = function (dataGroupedByChannel) {
  // Some Code
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

const getAllChannels = function (rows) {
  let arr = [];
  rows.forEach((row) => {
    arr.push(row.dimensions[0]);
  });

  return [...new Set(arr)];
};

const groupDataByChannel = function (allData, allChannels) {
  return new Promise((res) => {
    let channelDataTable = {};
    allChannels.forEach((channel) => {
      getChannelData(allData, channel).then(function (res) {
        channelDataTable[channel] = res;
      });
    });
    res(channelDataTable);
  });
};

const findMonthRow = function (rows, month, metricIndex) {
  const figure =
    rows.find((row) => row.dimensions[1] === month).metrics[metricIndex]
      .values[0] || 0;
  return figure;
};

// Init

async function init() {
  const dates = await getDates();
  if (dates) runAllQueries(dates);
}

init();
