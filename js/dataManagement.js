// Imports

import {
  addChannelPerfTableRows,
  create12MonthBarGraph,
  create2MonthBarGraph,
  create12MonthLineGraph,
  createComparisonTable,
} from "./graphsAndTables.js";
import {
  getAllChannels,
  groupDataByChannel,
  findAllSpecificMonthRows,
  sortRowsHighestToLowest,
  findFigureByMonthRow,
  calculatePercentageShare,
  createUniqueIntroText,
  compareMonths,
  findAllSpecificMonthRows,
  sortRowsHighestToLowest,
  getChannelData,
  matchPerformanceBetweenTwoDatasets,
} from "./utilityFunctions.js";

// Functions

export const runMainKpiReports = async function (allDataGrouped, orgData) {
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

export const runChannelPerfOverview = function (dataGroupedByChannel) {
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

export const handleTrafficOutput = async function (data) {
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

export const handleLandingPageEventsGoalsReport = async function (data) {
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
