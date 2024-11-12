/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDemoTable = /* GraphQL */ `
  query GetDemoTable($video_file_name: String!) {
    getDemoTable(video_file_name: $video_file_name) {
      video_file_name
      dashcam_name
      file_location
      ip_address
      latitude
      longitude
      number_plate
      postcode
      video_end_time
      video_start_time
      __typename
    }
  }
`;
export const listDemoTables = /* GraphQL */ `
  query ListDemoTables(
    $filter: TableDemoTableFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDemoTables(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        video_file_name
        dashcam_name
        file_location
        ip_address
        latitude
        longitude
        number_plate
        postcode
        video_end_time
        video_start_time
        __typename
      }
      nextToken
      __typename
    }
  }
`;
