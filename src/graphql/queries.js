/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDemoTable = /* GraphQL */ `
  query GetDemoTable($id: ID!) {
    getDemoTable(id: $id) {
      id
      video_file_name
      dashcam_name
      file_location
      number_plate
      latitude
      longitude
      postcode
      video_start_time
      video_end_time
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDemoTables = /* GraphQL */ `
  query ListDemoTables(
    $filter: ModelDemoTableFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDemoTables(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        video_file_name
        dashcam_name
        file_location
        number_plate
        latitude
        longitude
        postcode
        video_start_time
        video_end_time
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
