// src/typings/react-use-flexsearch.d.ts

// This tells TypeScript that we are defining the types for the 'react-use-flexsearch' module.
declare module 'react-use-flexsearch' {
  // We define the signature of the 'useSearch' hook.
  // It's a generic function that takes a type 'T' (which will be our 'Game' type).
  // - query: The search string.
  // - index: The pre-built FlexSearch index (a plain object or string).
  // - store: The full array of documents to search through.
  // It returns an array of the documents that match the search, of type T[].
  export function useSearch<T>(
    query: string,
    index: object | string,
    store: T[]
  ): T[];
}