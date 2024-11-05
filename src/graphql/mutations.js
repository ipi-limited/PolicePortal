/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDemoTable = /* GraphQL */ `
  mutation CreateDemoTable(
    $input: CreateDemoTableInput!
    $condition: ModelDemoTableConditionInput
  ) {
    createDemoTable(input: $input, condition: $condition) {
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
export const updateDemoTable = /* GraphQL */ `
  mutation UpdateDemoTable(
    $input: UpdateDemoTableInput!
    $condition: ModelDemoTableConditionInput
  ) {
    updateDemoTable(input: $input, condition: $condition) {
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
export const deleteDemoTable = /* GraphQL */ `
  mutation DeleteDemoTable(
    $input: DeleteDemoTableInput!
    $condition: ModelDemoTableConditionInput
  ) {
    deleteDemoTable(input: $input, condition: $condition) {
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
