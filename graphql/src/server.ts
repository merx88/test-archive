import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Transfer {
    blockNumber: String!
    txHash: String!
    contract: String!
    from: String!
    to: String!
    value: String!
  }

  type Query {
    ping: String!
    transfers(limit: Int = 5): [Transfer!]!
  }
`;

const fake = [
  {
    blockNumber: "5000001",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
  {
    blockNumber: "5000001",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
  {
    blockNumber: "5000001",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
  {
    blockNumber: "5000001",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
  {
    blockNumber: "5000005",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
  {
    blockNumber: "5000006",
    txHash: "0xabc",
    contract: "0xToken",
    from: "0xA",
    to: "0xB",
    value: "1000",
  },
];

const resolvers = {
  Query: {
    ping: () => "pong",
    transfers: (_: any, { limit }: { limit: number }) => fake.slice(0, limit),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT || 4000) },
  });
  console.log("GraphQL at", url);
})();
