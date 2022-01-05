// Imports

import moment from "../node_modules/moment/moment.js";

// Functions

export const getDates = function () {
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
