import _client from 'part:@sanity/base/client';
const sanityClient = _client as import('@sanity/client').SanityClient;
let client = sanityClient

if (typeof sanityClient.withConfig === 'function') {
  client = sanityClient.withConfig({
    apiVersion: "v1"
  })
}

export default client;
