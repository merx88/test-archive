import { pool } from "../db/db.js";

export const resolvers = {
  BigInt: {
    __serialize(v: any) {
      return v?.toString?.() ?? String(v);
    }, //클라이언트를 위해 문자열 변환
    __parseValue(v: any) {
      return v;
    }, //서버에서 처리 할수있도록 변환
    __parseLiteral(ast: any) {
      return (ast as any).value;
    }, //서버에서 처리 할수있도록 변환
  },
  Query: {
    async transfers(_: any, { contract, holder, limit, offset }: any) {
      const params: any[] = [];
      const where: string[] = [];
      if (contract) {
        params.push(contract);
        where.push(`contract = $${params.length}`);
      } //컨트랙트가 있으면 컨트랙트를 바인딩 할 준비를 한다.
      if (holder) {
        params.push(holder, holder);
        where.push(
          `("from" = $${params.length - 1} OR "to" = $${params.length})`
        );
      } //holder가 있다면 바인딩 할 준비를 한다.
      const sql = `
        SELECT block_number, tx_hash, log_index, contract, "from", "to", value
        FROM erc20_transfers
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY block_number DESC, log_index DESC
        LIMIT $${params.push(limit)} OFFSET $${params.push(offset)}
      `; //조건을 담아놓고 바인딩 할준비를 한다.
      const { rows } = await pool.query(sql, params); // 바인딩 준비가 된 sql 문에 params 를 통해 바인딩을 진행한다.
      return rows.map((r: any) => ({
        blockNumber: r.block_number,
        txHash: r.tx_hash,
        logIndex: r.log_index,
        contract: r.contract,
        from: r.from,
        to: r.to,
        value: r.value,
      })); //데이터를 매핑한다.
    },

    async topHolders(_: any, { contract, limit, offset }: any) {
      const { rows } = await pool.query(
        `SELECT contract, holder, balance
         FROM erc20_balances
         WHERE contract = $1 AND balance > 0
         ORDER BY balance DESC
         LIMIT $2 OFFSET $3`,
        [contract, limit, offset]
      );
      return rows;
    }, // 단순히 params 바인딩하고 쿼리받은 내용 넘겨줌
    async holderBalance(_: any, { contract, holder }: any) {
      const { rows } = await pool.query(
        `SELECT contract, holder, balance
         FROM erc20_balances
         WHERE contract = $1 AND holder = $2`,
        [contract, holder]
      );
      return rows[0] || { contract, holder, balance: "0" };
    }, // 단순히 바인딩해서 쿼리한다.  근데 없다면! 0을 반환한다. 당연히 해당 토큰이 없기 때문에

    async block(_: any, { number }: any) {
      const { rows } = await pool.query(
        `SELECT number, hash, timestamp FROM blocks WHERE number = $1`,
        [number]
      );
      return rows[0] || null;
    }, // 단순히 바인딩해서 쿼리한다.  근데 없다면! null을 반환한다.

    async latestTransfers(_: any, { limit }: any) {
      const { rows } = await pool.query(
        `SELECT block_number, tx_hash, log_index, contract, "from", "to", value
         FROM erc20_transfers
         ORDER BY block_number DESC, log_index DESC
         LIMIT $1`,
        [limit]
      );
      return rows.map((r: any) => ({
        blockNumber: r.block_number,
        txHash: r.tx_hash,
        logIndex: r.log_index,
        contract: r.contract,
        from: r.from,
        to: r.to,
        value: r.value,
      }));
    }, //데이터 베이스 컬럼 명과 스키마 명이 다르기 때문에 매핑을 한번해준다.
  },
};
