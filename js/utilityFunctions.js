// Imports

import moment from "../node_modules/moment/moment.js";

// Global Vars

let chosenCurrency = "£";

// Functions

export const compareMonths = function (
  currValue,
  prevValue,
  comparison,
  metric,
  unit,
  lineId
) {
  // Convert values to numbers and to 2 decimal places
  let currVal = Number(currValue).toFixed(2);
  let prevVal = Number(prevValue).toFixed(2);

  let introString;
  let includeUnit = false;
  let includeCurrency = false;
  let includePercentage = false;
  const changePercentage = determineIncreaseDecrease(currVal, prevVal);

  // Only include unit or currency depending on metric
  // Remove last 3 characters if traffic or transactions
  if (metric === "organic traffic") {
    includeUnit = true;
    currVal = removeLastThreeCharacters(currVal);
    prevVal = removeLastThreeCharacters(prevVal);
  }
  if (metric === "organic transactions") {
    currVal = removeLastThreeCharacters(currVal);
    prevVal = removeLastThreeCharacters(prevVal);
  }
  if (metric === "organic conversion rate") includePercentage = true;
  if (metric === "organic revenue") includeCurrency = true;

  if (changePercentage === "remained stable") {
    introString = `${comparison} ${metric} ${determineIncreaseDecrease(
      currVal,
      prevVal
    )} at ${includeCurrency === true ? chosenCurrency : ""}${addCommasToNumber(
      currVal
    )} ${includeUnit === true ? unit : ""}`;
  } else {
    introString = `${comparison} ${metric} ${determineIncreaseDecrease(
      currVal,
      prevVal
    )} by ${getPercentage(currVal, prevVal)}%, from ${
      includeCurrency === true ? chosenCurrency : ""
    }${addCommasToNumber(prevVal)}${includePercentage === true ? "%" : ""} to ${
      includeCurrency === true ? chosenCurrency : ""
    }${addCommasToNumber(currVal)}${includePercentage === true ? "%" : ""}${
      includeUnit === true ? " " + unit : ""
    }.`;
  }

  generateIntroText(introString, lineId);
};

export const matchPerformanceBetweenTwoDatasets = function (
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

export const calculatePercentageShare = async function (
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
export const createUniqueIntroText = function (figure1, figure2) {
  // Define specific intro text lines
  const orgTrafficShareLineId = "org-traffic-percentage-line";

  // Define text for each line
  const orgTrafficShareLine = `Organic Search accounted for ${figure1} of all traffic this month.`;

  generateIntroText(orgTrafficShareLine, orgTrafficShareLineId);
};

export const generateIntroText = function (data, lineId) {
  const firstLetter = data.slice(0, 1).toUpperCase();
  const remainingString = data.slice(1);
  const formattedString = `${firstLetter}${remainingString}`;

  populateIntroText(formattedString, lineId);
};

export const populateIntroText = function (sentence, lineId) {
  // Get all line IDs
  const lineElement = getLineById(lineId);

  // Replace inner text depending on lineID
  lineElement.innerText = sentence;
};

export const getChannelData = function (allData, channel) {
  return new Promise((res) => {
    const newChannelData = allData.filter((row) => {
      return row.dimensions[0] === channel;
    });
    res(newChannelData);
  });
};

export const checkArrForAllZeroes = function (arr) {
  const allZeroes = arr.every(
    (figure) =>
      figure === 0 || figure === "0" || figure === 0.0 || figure === "0.0"
  );
  return allZeroes;
};

export const getPercentage = (num1, num2) => {
  if (!num1 || !num2) return 0;
  return Math.abs(((num1 - num2) / num1) * 100).toFixed(2);
};

export const determineIncreaseDecrease = function (currentNumber, prevNumber) {
  const currentNum = Number(currentNumber);
  const prevNum = Number(prevNumber);

  if (currentNum === prevNum) return "remained stable";

  let comparison;
  currentNum > prevNum
    ? (comparison = "increased")
    : (comparison = "decreased");

  return comparison;
};

export const convertSecondsToTime = function (seconds) {
  return new Date(seconds * 1000).toISOString().substring(11, 19);
};

export const addCommasToNumber = function (num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const removeLastThreeCharacters = function (num) {
  return num.slice(0, -3);
};

export const getLineById = (lineId) => document.getElementById(lineId);

// Create array of month names
export const last12MonthsArr = function (months) {
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

export const getAllChannels = function (rows) {
  let arr = [];
  rows.forEach((row) => {
    arr.push(row.dimensions[0]);
  });

  return [...new Set(arr)];
};

export const groupDataByChannel = function (allData, allChannels) {
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

export const findFigureByMonthRow = function (rows, month, metricIndex) {
  const figure =
    rows.find((row) => row.dimensions[1] === month).metrics[0]?.values[
      metricIndex
    ] || 0;
  return figure;
};

export const findAllSpecificMonthRows = function (rows, monthIndex) {
  let specificMonthRows = [];

  Object.keys(rows).forEach((key) => {
    rows[key].forEach((row) => {
      if (row.dimensions[1] === monthIndex) specificMonthRows.push(row);
    });
  });

  return specificMonthRows;
};

export const sortRowsHighestToLowest = function (rows, valueIndex) {
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
