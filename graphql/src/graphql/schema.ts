import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar BigInt

  type Transfer {
    blockNumber: BigInt!
    txHash: String!
    logIndex: Int!
    contract: String!
    from: String!
    to: String!
    value: BigInt!
  }

  type HolderBalance {
    contract: String!
    holder: String!
    balance: BigInt!
  }

  type Block {
    number: BigInt!
    hash: String!
    timestamp: BigInt!
  }

  type Query {
    transfers(
      contract: String
      holder: String
      limit: Int = 50
      offset: Int = 0
    ): [Transfer!]!
    topHolders(
      contract: String!
      limit: Int = 20
      offset: Int = 0
    ): [HolderBalance!]!
    holderBalance(contract: String!, holder: String!): HolderBalance
    block(number: BigInt!): Block
    latestTransfers(limit: Int = 10): [Transfer!]! # 빠르게 확인용
  }
`;
