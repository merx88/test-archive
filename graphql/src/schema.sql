
CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  last_block BIGINT NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS blocks (
  number BIGINT PRIMARY KEY,
  hash TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS erc20_transfers (
  block_number BIGINT NOT NULL,
  tx_hash TEXT NOT NULL,
  log_index INT NOT NULL,
  contract TEXT NOT NULL,
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  value NUMERIC(78,0) NOT NULL,
  PRIMARY KEY (tx_hash, log_index)
);
CREATE INDEX IF NOT EXISTS idx_erc20_transfers_contract ON erc20_transfers (contract);
CREATE INDEX IF NOT EXISTS idx_erc20_transfers_from ON erc20_transfers ("from");
CREATE INDEX IF NOT EXISTS idx_erc20_transfers_to ON erc20_transfers ("to");
CREATE INDEX IF NOT EXISTS idx_erc20_transfers_block ON erc20_transfers (block_number);

CREATE TABLE IF NOT EXISTS erc20_balances (
  contract TEXT NOT NULL,
  holder TEXT NOT NULL,
  balance NUMERIC(78,0) NOT NULL,
  PRIMARY KEY (contract, holder)
);
CREATE INDEX IF NOT EXISTS idx_balances_top ON erc20_balances (contract, balance DESC);
