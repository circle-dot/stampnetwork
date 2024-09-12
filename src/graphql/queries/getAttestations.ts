const GET_ATTESTATIONS = `
  query GetAttestations($where: SchemaWhereUniqueInput!, $skip: Int!, $take: Int!) {
    schema(where: $where) {
      attestations(skip: $skip, take: $take) {
        recipient
        attester
        __typename
      }
      __typename
    }
  }
`;

export default GET_ATTESTATIONS;