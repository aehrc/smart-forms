/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import dayjs from 'dayjs';

const inputMatchRegex = /(\d{4}|\d{3}|\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/g;

export function parseInputToDateOptions(input: string): {
  dateOptions: string[];
  seperator: string;
} {
  const matches = input.match(inputMatchRegex);

  if (matches) {
    const seperatorSlash = input.includes('/') ? '/' : null;
    const seperatorDash = input.includes('-') ? '-' : null;
    const seperatorSpace = input.includes(' ') ? ' ' : null;
    const seperator = seperatorSlash || seperatorDash || seperatorSpace;

    // Handle YYYY format
    if (matches.length === 1) {
      // seperator not supposed to be present if only one match present
      if (seperator) {
        return { dateOptions: [], seperator: '' };
      }

      return {
        dateOptions: getYearOptions(matches[0]).filter((dateString) =>
          dayjs(dateString, 'YYYY').isValid()
        ),
        seperator: ''
      };
    }

    // Only accepts either "-" or "/" as separators
    // Its invalid if both are present, return empty array
    if (!seperator || (seperatorSlash && seperatorDash)) {
      return { dateOptions: [], seperator: '' };
    }

    // Display no options if num of slots don't match the number of regex matches
    const slotsMatched = input.split(seperator);
    if (slotsMatched.length != matches.length) {
      return { dateOptions: [], seperator: '' };
    }

    // Handle YYYY-MM format (displayed as Month YYYY)
    if (matches.length === 2) {
      const dateOptionStrings = handleTwoMatches(matches, seperator);
      const uniqueDateOptionStrings = Array.from(new Set(dateOptionStrings));
      return {
        dateOptions: uniqueDateOptionStrings.filter((dateString) =>
          dayjs(dateString, `MM${seperator}YYYY`).isValid()
        ),
        seperator
      };
    }

    // Handle YYYY-MM--DD format (displayed as DD Month YYYY)
    if (matches.length === 3) {
      const dateOptionStrings = handleThreeMatches(matches, seperator);
      const uniqueDateOptionStrings = Array.from(new Set(dateOptionStrings));
      return {
        dateOptions: uniqueDateOptionStrings.filter((dateString) =>
          dayjs(dateString, `DD${seperator}MM${seperator}YYYY`).isValid()
        ),
        seperator
      };
    }
  }

  return { dateOptions: [], seperator: '' };
}

function handleTwoMatches(matches: RegExpMatchArray, seperator: string) {
  // One of the matches is definitely a year
  const yearMatch = matches.find((match) => Number(match) && match.length > 2);
  if (yearMatch) {
    const yearOptions = getYearOptions(yearMatch);
    const remainingMatch = matches.filter((match) => match !== yearMatch)[0];

    return yearOptions
      .map((yearOption) => {
        const monthOption = getMonthOption(remainingMatch);
        if (monthOption) {
          return `${monthOption}${seperator}${yearOption}`;
        }

        return null;
      })
      .filter((value) => value !== null) as string[];
  }

  // Both matches could be month/year
  const yearOptions = matches.map((match) => getYearOptions(match));
  const monthOptions = matches.map((match) => {
    const monthOption = getMonthOption(match);
    return monthOption ? [monthOption] : null;
  });

  const options: string[] = [];
  for (const [i, yearOption] of yearOptions.entries()) {
    for (const [j, monthOption] of monthOptions.entries()) {
      // Skip if the year and month are the same
      if (i === j) {
        continue;
      }

      options.push(`${monthOption}${seperator}${yearOption[0]}`);
      options.push(`${monthOption}${seperator}${yearOption[1]}`);
    }
  }

  return options;
}

function handleThreeMatches(matches: RegExpMatchArray, seperator: string) {
  // Disallow year placement in the first two slots
  const yearMatch = matches.find((match) => Number(match) && match.length > 2);
  if (yearMatch) {
    if (yearMatch != matches[2]) {
      return [];
    }
  }

  const yearOptions = matches.map((match) => getYearOptions(match));
  const monthOptions = matches.map((match) => {
    const monthOption = getMonthOption(match);
    return monthOption ? [monthOption] : null;
  });
  const dayOptions = matches.map((match) => {
    const dayOption = getDayOption(match);
    return dayOption ? [dayOption] : null;
  });

  const options: string[] = [];
  for (const [i, yearOption] of yearOptions.entries()) {
    for (const [j, monthOption] of monthOptions.entries()) {
      for (const [k, dayOption] of dayOptions.entries()) {
        // Skip if the month and day are the same
        if (i === j || i === k || j === k) {
          continue;
        }

        options.push(`${dayOption}${seperator}${monthOption}${seperator}${yearOption[0]}`);
        options.push(`${dayOption}${seperator}${monthOption}${seperator}${yearOption[1]}`);
      }
    }
  }

  return options;
}

function getYearOptionsNums(partialYear: string) {
  const year = parseInt(partialYear, 10);

  const currentYear = new Date().getFullYear() % 100;

  if (year >= 0 && year <= 99) {
    if (year >= 0 && year <= currentYear) {
      return [2000 + year, 1900 + year];
    }

    return [1900 + year, 2000 + year];
  }

  if (year >= 900 && year <= 999) {
    return [1000 + year];
  }

  if (year >= 190 && year <= 209) {
    return [year * 10];
  }

  if (year >= 1900 && year <= 2099) {
    return [year];
  }

  return [];
}

function getYearOptions(partialYear: string): string[] {
  return getYearOptionsNums(partialYear).map((yearOption) => yearOption.toString());
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

function getMonthOption(partialMonth: string) {
  let monthNumeric = parseInt(partialMonth, 10);

  if (isNaN(monthNumeric)) {
    const parsed = monthNames.indexOf(partialMonth) + 1;
    if (parsed === -1) {
      return null;
    }

    monthNumeric = parsed;
  }

  if (monthNumeric >= 1 && monthNumeric <= 12) {
    if (monthNumeric < 10) {
      return `0${monthNumeric}`;
    }

    return monthNumeric.toString();
  }

  return null;
}

const monthNamesRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/;
export function replaceMonthNameWithNumber(input: string) {
  const matches = input.match(monthNamesRegex);

  if (!matches) {
    return input;
  }

  return input.replace(monthNamesRegex, (match) => {
    const monthNum = monthNames.indexOf(match) + 1;
    if (monthNum === -1) {
      return match; // No valid replacement found
    }

    return monthNum.toString().padStart(2, '0');
  });
}

function getDayOption(partialDay: string) {
  const day = parseInt(partialDay, 10);

  if (day >= 1 && day <= 31) {
    if (day < 10) {
      return `0${day}`;
    }

    return day.toString();
  }

  return null;
}

export function getDateOptionLabel(option: string, seperator: string) {
  const threeMatchesOption = dayjs(option, [
    `DD${seperator}MM${seperator}YYYY`,
    `DD${seperator}MMM${seperator}YYYY`
  ]);
  if (threeMatchesOption.isValid()) {
    return threeMatchesOption.format('DD MMM YYYY');
  }

  const twoMatchesOption = dayjs(option, [`MM${seperator}YYYY`, `MMM${seperator}YYYY`]);
  if (twoMatchesOption.isValid()) {
    return twoMatchesOption.format('MMM YYYY');
  }

  const oneMatchOption = dayjs(option, `YYYY`);
  if (oneMatchOption.isValid()) {
    return option;
  }

  return '';
}

export function getSelectedDateFormat(valueDate: string) {
  if (!valueDate) {
    return 'N/A';
  }
  const numOfSeparators = getNumOfSeparators(valueDate, '/');

  if (numOfSeparators === 2) {
    return 'DD/MM/YYYY';
  }

  if (numOfSeparators === 1) {
    return 'MM/YYYY';
  }

  return 'YYYY';
}

export function getNumOfSeparators(valueDate: string, seperator: string) {
  const regex = new RegExp(seperator, 'g');
  return [...valueDate.matchAll(regex)].length;
}

export function parseFhirDateToDisplayDate(fhirDate: string) {
  const numOfSeparators = getNumOfSeparators(fhirDate, '-');

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(fhirDate, `YYYY-MM-DD`);
    if (threeMatchesDate.isValid()) {
      return threeMatchesDate.format('DD MMM YYYY');
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(fhirDate, `YYYY-MM`);
    if (twoMatchesDate.isValid()) {
      return twoMatchesDate.format('MMM YYYY');
    }
  }

  return fhirDate;
}

export function parseDisplayDateToFhirDate(displayDate: string, seperator: string) {
  const numOfSeparators = getNumOfSeparators(displayDate, seperator);

  if (numOfSeparators === 2) {
    const threeMatchesDate = dayjs(displayDate, [
      `DD${seperator}MM${seperator}YYYY`,
      `DD${seperator}MMM${seperator}YYYY`
    ]);
    if (threeMatchesDate.isValid()) {
      return threeMatchesDate.format('YYYY-MM-DD');
    }
  }

  if (numOfSeparators === 1) {
    const twoMatchesDate = dayjs(displayDate, [`MM${seperator}YYYY`, `MMM${seperator}YYYY`]);
    if (twoMatchesDate.isValid()) {
      return twoMatchesDate.format('YYYY-MM');
    }
  }

  if (displayDate.length <= 4) {
    const oneMatchDate = dayjs(displayDate, 'YYYY');
    if (oneMatchDate.isValid()) {
      return displayDate;
    }
  }

  // Default to YYYY-MM-DD format if all else fails
  return dayjs(displayDate).format('YYYY-MM-DD');
}
