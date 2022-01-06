// Imports

import moment from "../node_modules/moment/moment.js";
import Plotly from "../node_modules/plotly.js-dist/plotly.js";

import {
  convertSecondsToTime,
  last12MonthsArr,
  checkArrForAllZeroes,
  findFigureByMonthRow,
} from "./utilityFunctions.js";

// Functions

export const addChannelPerfTableRows = function (data) {
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

export const createComparisonTable = function (data, tableId) {
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

export const create12MonthBarGraph = function (
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

export const create2MonthBarGraph = function (
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

export const create12MonthLineGraph = function (
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
