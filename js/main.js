// Global

const viewId = "101406599";

// Dates

const getDates = function () {
  // eslint-disable-next-line no-undef
  const today = moment().format("YYYY-MM-DD");

  // Last Full Month
  // eslint-disable-next-line no-undef
  const lastFullMonthStartDate = moment(today)
    .subtract(1, "months")
    .startOf("month")
    .format("YYYY-MM-DD");

  // eslint-disable-next-line no-undef
  const lastFullMonthEndDate = moment(today)
    .subtract(1, "months")
    .endOf("month")
    .format("YYYY-MM-DD");

  // 12 Months Previous
  // eslint-disable-next-line no-undef
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
  queryLandingPageReports(dates);
  // queryEventsReports();
}

// Query for traffic data
const queryTrafficReports = function (dates) {
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
    console.error("There was an error with the API call.");
  }
};

// Query for landing pages
const queryLandingPageReports = function (dates) {
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
    console.error("There was an error with the API call.");
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
  runMainKpiReports(
    dataGroupedByChannel,
    dataGroupedByChannel["Organic Search"]
  );

  // Org Traffic MoM Graph
  create12MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Sessions",
    "graphOrgTrafficMoM",
    0
  );

  // Org Traffic YoY Graph
  create2MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Sessions",
    "graphOrgTrafficYoY",
    0
  );

  // Org Revenue MoM Graph
  create12MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Revenue",
    "graphOrgRevenueMoM",
    5
  );

  // Org Revenue YoY Graph
  create2MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Revenue",
    "graphOrgRevenueYoY",
    5
  );

  // Org Transactions MoM Graph
  create12MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Transactions",
    "graphOrgTransactionsMoM",
    6
  );

  // Org Transactions YoY Graph
  create2MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Transactions",
    "graphOrgTransactionsYoY",
    6
  );

  // Org Conversion Rate MoM (To become a line graph)
  create12MonthLineGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Conversion Rate",
    "graphOrgConvRateMoM",
    7
  );

  // Org Conversion YoY Graph
  create2MonthBarGraph(
    dataGroupedByChannel["Organic Search"],
    "Month",
    "Organic Conversion Rate",
    "graphOrgConvRateYoY",
    7
  );
};

const handleLandingPageEventsGoalsReport = async function (data) {
  // Destructure for all relevant rows
  const {
    result: {
      reports: {
        0: {
          data: { rows: allDataPacked },
        },
      },
    },
  } = data;

  // Prepare data for filtering
  const allChannels = getAllChannels(allDataPacked);
  const dataGroupedByChannel = await groupDataByChannel(
    allDataPacked,
    allChannels
  );

  // Filter down to relevant months and organic data
  const allDataCurrentMonth = await getChannelData(
    findAllSpecificMonthRows(dataGroupedByChannel, "0012"),
    "Organic Search"
  );
  const allDataPreviousMonth = await getChannelData(
    findAllSpecificMonthRows(dataGroupedByChannel, "0011"),
    "Organic Search"
  );
  const allDataPreviousYoY = await getChannelData(
    findAllSpecificMonthRows(dataGroupedByChannel, "0000"),
    "Organic Search"
  );

  // Match up landing pages and compare sessions
  const landingPageDataMoM = matchPerformanceBetweenTwoDatasets(
    allDataCurrentMonth,
    allDataPreviousMonth
  );

  const landingPageDataYoY = matchPerformanceBetweenTwoDatasets(
    allDataCurrentMonth,
    allDataPreviousYoY
  );

  // Send data to create table
  createComparisonTable(landingPageDataMoM, "landingPageMoMTable");
  createComparisonTable(landingPageDataYoY, "landingPageYoYTable");
};

const runMainKpiReports = async function (allDataGrouped, orgData) {
  const currMonthOrgSessions = findFigureByMonthRow(orgData, "0012", 0);
  const prevMonthOrgSessions = findFigureByMonthRow(orgData, "0011", 0);
  const prevYearOrgSessions = findFigureByMonthRow(orgData, "0000", 0);
  const currMonthOrgRevenue = findFigureByMonthRow(orgData, "0012", 5);
  const prevMonthOrgRevenue = findFigureByMonthRow(orgData, "0011", 5);
  const prevYearOrgRevenue = findFigureByMonthRow(orgData, "0000", 5);
  const currMonthOrgTransactions = findFigureByMonthRow(orgData, "0012", 6);
  const prevMonthOrgTransactions = findFigureByMonthRow(orgData, "0011", 6);
  const prevYearOrgTransactions = findFigureByMonthRow(orgData, "0000", 6);
  const currMonthOrgConvRate = findFigureByMonthRow(orgData, "0012", 7);
  const prevMonthOrgConvRate = findFigureByMonthRow(orgData, "0011", 7);
  const prevYearOrgConvRate = findFigureByMonthRow(orgData, "0000", 7);

  // Organic Traffic Percentage Share
  const orgTrafficPercentShare = await calculatePercentageShare(
    allDataGrouped,
    "Organic Search",
    0
  );
  createUniqueIntroText(orgTrafficPercentShare);

  // MoM Organic Traffic
  compareMonths(
    currMonthOrgSessions,
    prevMonthOrgSessions,
    "month-on-month",
    "organic traffic",
    "visits",
    "org-traffic-mom-line"
  );

  // YoY Organic Traffic
  compareMonths(
    currMonthOrgSessions,
    prevYearOrgSessions,
    "year-on-year",
    "organic traffic",
    "visits",
    "org-traffic-yoy-line"
  );

  // MoM Organic Revenue
  compareMonths(
    currMonthOrgRevenue,
    prevMonthOrgRevenue,
    "month-on-month",
    "organic revenue",
    "revenue",
    "ecommerce-mom-line-revenue"
  );

  // YoY Organic Revenue
  compareMonths(
    currMonthOrgRevenue,
    prevYearOrgRevenue,
    "year-on-year",
    "organic revenue",
    "revenue",
    "ecommerce-yoy-line-revenue"
  );

  // MoM Organic Transactions
  compareMonths(
    currMonthOrgTransactions,
    prevMonthOrgTransactions,
    "month-on-month",
    "organic transactions",
    "transactions",
    "ecommerce-mom-line-transactions"
  );

  // YoY Organic Transactions
  compareMonths(
    currMonthOrgTransactions,
    prevYearOrgTransactions,
    "year-on-year",
    "organic transactions",
    "transactions",
    "ecommerce-yoy-line-transactions"
  );

  // MoM Organic Conversion Rate
  compareMonths(
    currMonthOrgConvRate,
    prevMonthOrgConvRate,
    "month-on-month",
    "organic conversion rate",
    "conversion rate",
    "ecommerce-mom-line-conv-rate"
  );

  // YoY Organic Conversion Rate
  compareMonths(
    currMonthOrgConvRate,
    prevYearOrgConvRate,
    "year-on-year",
    "organic conversion rate",
    "conversion rate",
    "ecommerce-yoy-line-conv-rate"
  );
};

const runChannelPerfOverview = function (dataGroupedByChannel) {
  // Reduce channel data to just the latest month
  const currentMonthData = findAllSpecificMonthRows(
    dataGroupedByChannel,
    "0012"
  );

  // Order channels by sessions high to low
  const sortedCurrentMonthData = sortRowsHighestToLowest(currentMonthData, 0);

  // Append a row to the table for each channel
  addChannelPerfTableRows(sortedCurrentMonthData);
};

// Google Analytics - Comparisons

const compareMonths = function (
  currVal,
  prevVal,
  comparison,
  metric,
  unit,
  lineId
) {
  let introString;
  let includeUnit = false;
  const changePercentage = determineIncreaseDecrease(currVal, prevVal);

  // Only include unit at end of sentence depending on line used in intro
  if (metric === "organic traffic") !includeUnit;

  if (changePercentage === "remained stable") {
    introString = `${comparison} ${metric} ${determineIncreaseDecrease(
      currVal,
      prevVal
    )} at ${currVal} ${includeUnit === true ? unit : ""}.`;
  } else {
    introString = `${comparison} ${metric} ${determineIncreaseDecrease(
      currVal,
      prevVal
    )} by ${getPercentage(
      currVal,
      prevVal
    )}%, from ${prevVal} to ${currVal} ${unit}.`;
  }

  generateIntroText(introString, lineId);
};

const matchPerformanceBetweenTwoDatasets = function (
  currentMonthData,
  comparisonMonthData
) {
  let dataTable = {};

  // Match months between datasets
  currentMonthData.forEach((row) => {
    const currentRowPagePath = row.dimensions[2];
    const previousMonthPagePath = comparisonMonthData.find(
      (row) => row.dimensions[2] === currentRowPagePath
    );

    // If match found between datasets, perform comparison
    if (previousMonthPagePath) {
      const currentMonthSessions = Number(row.metrics[0].values[0]);
      const comparisonMonthSessions = Number(
        comparisonMonthData.find(
          (row) => row.dimensions[2] === currentRowPagePath
        ).metrics[0].values[0]
      );

      // Add all data to table
      dataTable[currentRowPagePath] = {
        identifier: currentRowPagePath,
        previousFigure: comparisonMonthSessions,
        currentFigure: currentMonthSessions,
        difference: currentMonthSessions - comparisonMonthSessions,
      };
    }
  });
  return dataTable;
};

const calculatePercentageShare = async function (
  allData,
  channel = "Organic Search",
  valueIndex = 0
) {
  const currentMonthData = findAllSpecificMonthRows(allData, "0012");

  let shareFigure;
  await getChannelData(currentMonthData, channel).then((res) => {
    shareFigure = res[0].metrics[0].values[valueIndex];
  });

  let totalFigure = 0;
  currentMonthData.forEach(
    (row) => (totalFigure += Number(row.metrics[0].values[valueIndex]))
  );

  return `${((shareFigure / totalFigure) * 100).toFixed(2)}%`;
};

// UI
// THIS NEEDS REWORKED TO CATER TO ANY DATA PROVIDED TO IT
const createUniqueIntroText = function (figure1, figure2) {
  // Define specific intro text lines
  const orgTrafficShareLineId = "org-traffic-percentage-line";

  // Define text for each line
  const orgTrafficShareLine = `Organic Search accounted for ${figure1} of all traffic this month.`;

  generateIntroText(orgTrafficShareLine, orgTrafficShareLineId);
};

const generateIntroText = function (data, lineId) {
  const firstLetter = data.slice(0, 1).toUpperCase();
  const remainingString = data.slice(1);
  const formattedString = `${firstLetter}${remainingString}`;

  populateIntroText(formattedString, lineId);
};

const populateIntroText = function (sentence, lineId) {
  // Get all line IDs
  const lineElement = getLineById(lineId);

  // Replace inner text depending on lineID
  lineElement.innerText = sentence;
};

// Tables

const addChannelPerfTableRows = function (data) {
  const channelPerfTable = document.getElementById("channelPerfTable");

  data.forEach((row) => {
    const newRowHtml = `
    <tr class="performance-table__row">
      <th class="performance-table__cell performance-table__cell--heading">
          ${row.dimensions[0]}
      </th>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[0] // sessions
      )}</td>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[1] // users
      )}</td>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[2] // bounce rate
      ).toFixed(2)}%</td>
      <td class="performance-table__cell">${convertSecondsToTime(
        Number(
          row.metrics[0].values[3] // avg session duration (needs conversion)
        ).toFixed(0)
      )}</td>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[4] // pages per session
      ).toFixed(2)}</td>
      <td class="performance-table__cell">£ ${Number(
        row.metrics[0].values[5] // revenue
      ).toFixed(2)}</td>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[6] // transactions
      )}</td>
      <td class="performance-table__cell">${Number(
        row.metrics[0].values[7] // conv rate
      ).toFixed(2)}%</td>
    </tr>
    `;

    channelPerfTable.insertAdjacentHTML("beforeend", newRowHtml);
  });
};

const createComparisonTable = function (data, tableId) {
  console.log(data);
  const dataObj = data;
  const perfTable = document.getElementById(tableId);

  // Get top 10 highest difference (positive) - MAYBE THIS SHOULD BE ITS OWN DEDICATED FUNCTION?
  // let topTenHighest = {};
  // for(let i = 1; i < 10; i++){
  //   dataObj
  // }

  // Splice these out of the array and into a new one

  // Add relevant data to html table

  // Insert into page table html
  // perfTable.insertAdjacentHTML("beforeend", newRowHtml);
};

// Plotly Graphs

const create12MonthBarGraph = function (
  rawData,
  xAxisTitle = "X Axis Needs Title",
  yAxisTitle = "Y Axis Needs Title",
  graphID,
  valueIndex = 0
) {
  const xAxisLabels = last12MonthsArr(12);
  let yAxisDataArr = [];

  for (let i = 1; i < rawData.length; i++) {
    yAxisDataArr.push(rawData[i].metrics[0].values[valueIndex]);
  }

  if (checkArrForAllZeroes(yAxisDataArr)) {
    document
      .getElementById(graphID)
      .insertAdjacentHTML("afterbegin", `<h3>No Data Available :(</h3>`);
    return;
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
      title: xAxisTitle,
    },
    yaxis: { title: yAxisTitle },
    dragmode: false,
    margin: {
      b: 60,
      l: 60,
      r: 60,
      t: 10,
    },
  };

  // eslint-disable-next-line no-undef
  Plotly.newPlot(graphID, data, layout, {
    displayModeBar: false,
    responsive: true,
  });
};

const create2MonthBarGraph = function (
  rawData,
  xAxisTitle = "X Axis Needs Title",
  yAxisTitle = "Y Axis Needs Title",
  graphID,
  valueIndex = 0
) {
  const xAxisLabels = [
    // eslint-disable-next-line no-undef
    moment().subtract(13, "months").endOf("month").format("MMM YYYY"),
    // eslint-disable-next-line no-undef
    moment().subtract(1, "months").endOf("month").format("MMM YYYY"),
  ];

  const figuresYoY = [
    findFigureByMonthRow(rawData, "0000", valueIndex),
    findFigureByMonthRow(rawData, "0012", valueIndex),
  ];

  if (checkArrForAllZeroes(figuresYoY)) {
    document
      .getElementById(graphID)
      .insertAdjacentHTML("afterbegin", `<h3>No Data Available :(</h3>`);
    return;
  }

  const data = [
    {
      x: xAxisLabels,
      y: figuresYoY,
      type: "bar",
    },
  ];

  const layout = {
    xaxis: {
      title: xAxisTitle,
    },
    yaxis: { title: yAxisTitle },
    dragmode: false,
    margin: {
      b: 60,
      l: 60,
      r: 60,
      t: 10,
    },
  };

  // eslint-disable-next-line no-undef
  Plotly.newPlot(graphID, data, layout, {
    displayModeBar: false,
    responsive: true,
  });
};

const create12MonthLineGraph = function (
  rawData,
  xAxisTitle = "X Axis Needs Title",
  yAxisTitle = "Y Axis Needs Title",
  graphID,
  valueIndex = 0
) {
  const xAxisLabels = last12MonthsArr(12);
  let yAxisDataArr = [];

  for (let i = 1; i < rawData.length; i++) {
    yAxisDataArr.push(rawData[i].metrics[0].values[valueIndex]);
  }

  if (checkArrForAllZeroes(yAxisDataArr)) {
    document
      .getElementById(graphID)
      .insertAdjacentHTML("afterbegin", `<h3>No Data Available :(</h3>`);
    return;
  }

  const data = [
    {
      x: xAxisLabels,
      y: yAxisDataArr,
      type: "scatter",
    },
  ];

  const layout = {
    xaxis: {
      title: xAxisTitle,
    },
    yaxis: { title: yAxisTitle },
    dragmode: false,
    margin: {
      b: 60,
      l: 60,
      r: 60,
      t: 10,
    },
  };

  // eslint-disable-next-line no-undef
  Plotly.newPlot(graphID, data, layout, {
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

const checkArrForAllZeroes = function (arr) {
  const allZeroes = arr.every(
    (figure) =>
      figure === 0 || figure === "0" || figure === 0.0 || figure === "0.0"
  );
  return allZeroes;
};

const getPercentage = (num1, num2) => {
  if (!num1 || !num2) return 0;
  return Math.abs(((num1 - num2) / num1) * 100).toFixed(2);
};

const determineIncreaseDecrease = function (currentNum, prevNum) {
  if (currentNum === prevNum) return "remained stable";

  let comparison;
  currentNum > prevNum
    ? (comparison = "increased")
    : (comparison = "decreased");
  return comparison;
};

const convertSecondsToTime = function (seconds) {
  return new Date(seconds * 1000).toISOString().substring(11, 19);
};

const getLineById = (lineId) => document.getElementById(lineId);

// Create array of month names
const last12MonthsArr = function (months) {
  let arr = [];

  for (let i = 0; i < months; i++) {
    // eslint-disable-next-line no-undef
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

const findFigureByMonthRow = function (rows, month, metricIndex) {
  const figure =
    rows.find((row) => row.dimensions[1] === month).metrics[metricIndex]
      ?.values[0] || 0;
  return figure;
};

const findAllSpecificMonthRows = function (rows, monthIndex) {
  let specificMonthRows = [];

  Object.keys(rows).forEach((key) => {
    rows[key].forEach((row) => {
      if (row.dimensions[1] === monthIndex) specificMonthRows.push(row);
    });
  });

  return specificMonthRows;
};

const sortRowsHighestToLowest = function (rows, valueIndex) {
  const reorderedRows = rows.sort((a, b) => {
    let figureA = Number(a.metrics[0].values[valueIndex]);
    let figureB = Number(b.metrics[0].values[valueIndex]);

    if (figureA > figureB) {
      return -1;
    }
    if (figureA < figureB) {
      return 1;
    }
    return 0;
  });

  return reorderedRows;
};

// Init

async function init() {
  const dates = await getDates();
  if (dates) runAllQueries(dates);
}

init();
