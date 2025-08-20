import "dotenv/config";
import { createPublicClient, http, Log, parseAbiItem } from "viem";
import { sepolia } from "viem/chains";
import { Pool } from "pg";

const DB_URL = process.env.DB_URL!;
const RPC_URL = process.env.RPC_HTTP_URL!;
const CONFIRMATIONS = Number(process.env.CONFIRMATIONS ?? 12);
const SEED_BLOCKS = Number(process.env.SEED_BLOCKS ?? 50);

const pool = new Pool({ connectionString: DB_URL });
const client = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });

const Transfer = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);
const ZERO = "0x0000000000000000000000000000000000000000";

async function main() {
  const latest = Number(await client.getBlockNumber());
  const to = Math.max(0, latest - CONFIRMATIONS);
  const from = Math.max(0, to - SEED_BLOCKS);

  if (from >= to) {
    console.log(
      "The seeding range is incorrect. Please check the SEED_BLOCKS/CONFIRMATIONS value."
    );
    process.exit(1);
  }

  console.log(
    `Seeding ERC20 Transfers: from ${from} to ${to} (latest=${latest})`
  );

  const logs = await client.getLogs({
    fromBlock: BigInt(from),
    toBlock: BigInt(to),
    event: Transfer,
  });

  console.log(`Fetched ${logs.length} logs. Writing to Postgres...`);

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const seenBlocks = new Set<number>();

    for (const l of logs as Log<bigint, number, false>[]) {
      const bn = Number(l.blockNumber!);
      seenBlocks.add(bn);

      const rawArgs = (l as any).args;
      const from = rawArgs?.from as string | undefined;
      const to = rawArgs?.to as string | undefined;
      const value = rawArgs?.value as bigint | string | undefined;

      if (!from || !to || value === undefined || value === null) {
        console.warn("[skip-log] undecodable Transfer", {
          block: bn,
          tx: l.transactionHash,
          logIndex: l.logIndex,
          addr: l.address,
        });
        continue;
      }

      const valueStr =
        typeof value === "bigint" ? value.toString() : String(value);

      await db.query(
        `INSERT INTO erc20_transfers
           (block_number, tx_hash, log_index, contract, "from", "to", value)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (tx_hash, log_index) DO NOTHING`,
        [bn, l.transactionHash, l.logIndex, l.address, from, to, valueStr]
      );

      if (from !== ZERO) {
        await db.query(
          `INSERT INTO erc20_balances (contract, holder, balance)
             VALUES ($1,$2,$3)
             ON CONFLICT (contract, holder) DO UPDATE
             SET balance = erc20_balances.balance - EXCLUDED.balance`,
          [l.address, from, valueStr]
        );
      }
      if (to !== ZERO) {
        await db.query(
          `INSERT INTO erc20_balances (contract, holder, balance)
             VALUES ($1,$2,$3)
             ON CONFLICT (contract, holder) DO UPDATE
             SET balance = erc20_balances.balance + EXCLUDED.balance`,
          [l.address, to, valueStr]
        );
      }
    }

    for (const n of seenBlocks) {
      const b = await client.getBlock({ blockNumber: BigInt(n) });
      await db.query(
        `INSERT INTO blocks (number, hash, timestamp)
         VALUES ($1,$2,$3)
         ON CONFLICT (number) DO UPDATE
         SET hash=EXCLUDED.hash, timestamp=EXCLUDED.timestamp`,
        [n, b.hash, Number(b.timestamp)]
      );
    }

    await db.query("COMMIT");
    console.log(
      `Done. Inserted logs: ${logs.length}, blocks: ${seenBlocks.size}`
    );
  } catch (e) {
    await db.query("ROLLBACK");
    console.error("Seed failed:", e);
    process.exit(1);
  } finally {
    db.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
