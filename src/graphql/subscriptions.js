/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDemoTable = /* GraphQL */ `
  subscription OnCreateDemoTable(
    $video_file_name: String
    $dashcam_name: String
    $file_location: String
    $ip_address: String
    $latitude: String
  ) {
    onCreateDemoTable(
      video_file_name: $video_file_name
      dashcam_name: $dashcam_name
      file_location: $file_location
      ip_address: $ip_address
      latitude: $latitude
    ) {
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
export const onUpdateDemoTable = /* GraphQL */ `
  subscription OnUpdateDemoTable(
    $video_file_name: String
    $dashcam_name: String
    $file_location: String
    $ip_address: String
    $latitude: String
  ) {
    onUpdateDemoTable(
      video_file_name: $video_file_name
      dashcam_name: $dashcam_name
      file_location: $file_location
      ip_address: $ip_address
      latitude: $latitude
    ) {
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
export const onDeleteDemoTable = /* GraphQL */ `
  subscription OnDeleteDemoTable(
    $video_file_name: String
    $dashcam_name: String
    $file_location: String
    $ip_address: String
    $latitude: String
  ) {
    onDeleteDemoTable(
      video_file_name: $video_file_name
      dashcam_name: $dashcam_name
      file_location: $file_location
      ip_address: $ip_address
      latitude: $latitude
    ) {
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
