import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://uv6glzpmwjblxalwde3jj46n7q.appsync-api.eu-west-2.amazonaws.com/graphql',
  cache: new InMemoryCache(),
});

export default client;
