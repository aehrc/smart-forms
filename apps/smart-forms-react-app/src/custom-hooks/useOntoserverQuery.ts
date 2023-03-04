import { useQuery } from '@tanstack/react-query';
import type { Coding, ValueSet } from 'fhir/r5';
import { getValueSetCodings, getValueSetPromise } from '../functions/ValueSetFunctions';

import type { AlertColor } from '@mui/material';

function useOntoserverQuery(
  answerValueSetUrl: string | undefined,
  maxList: number,
  input: string,
  searchTerm: string
): { options: Coding[]; loading: boolean; feedback?: { message: string; color: AlertColor } } {
  let fullUrl = '';

  let options: Coding[] = [];
  let loading = false;
  let feedback: { message: string; color: AlertColor } | undefined;

  if (input.length === 0) {
    feedback = undefined;
  }

  if (searchTerm.length < 2 && searchTerm.length > 0) {
    feedback = { message: 'Enter at least 2 characters to search for results.', color: 'info' };
  }

  // Restructure url to include filter and count parameters
  if (answerValueSetUrl) {
    const urlWithTrailingAmpersand =
      answerValueSetUrl + (answerValueSetUrl[answerValueSetUrl.length - 1] !== '&' ? '&' : '');
    fullUrl = urlWithTrailingAmpersand + 'filter=' + searchTerm + '&count=' + maxList;
  }

  // Perform query
  const { isInitialLoading, error, data } = useQuery<ValueSet>(
    ['expandValueSet', fullUrl],
    () => getValueSetPromise(fullUrl),
    {
      enabled: searchTerm.length >= 2 && answerValueSetUrl !== undefined
    }
  );

  if (isInitialLoading) {
    loading = true;
  }

  if (error) {
    console.warn('Ontoserver query failed. Details below: \n' + error);
    feedback = {
      message: 'An error occurred. Try again later or try searching for a different term.',
      color: 'error'
    };
  }

  if (data) {
    if (data.expansion?.total !== 0) {
      options = getValueSetCodings(data);
    } else {
      feedback = {
        message: "We couldn't seem to find anything. Try searching for a different term.",
        color: 'warning'
      };
    }
  }

  return { options, loading, feedback };
}
export default useOntoserverQuery;
