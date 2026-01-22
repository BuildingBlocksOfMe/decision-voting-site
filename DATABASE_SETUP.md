# データベースセットアップガイド

このアプリケーションは Vercel Postgres を使用してデータを永続化します。

## Vercel Postgres の設定手順

### 1. Vercel ダッシュボードでデータベースを作成

1. [Vercel ダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクト「decision-voting-site」を選択
3. 「Storage」タブをクリック
4. 「Create Database」をクリック
5. 「Postgres」を選択
6. データベース名を入力（例：decision-voting-db）
7. リージョンを選択（推奨：ワシントンD.C. - 最も近いリージョン）
8. 「Create」をクリック

### 2. 環境変数を確認

データベース作成後、以下の環境変数が自動的に設定されます：

- `POSTGRES_URL` - 標準のPostgreSQL URL
- `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

これらの環境変数は自動的にデプロイメントに注入されます。

### 3. テーブル作成（自動）

このプロジェクトは **Prisma は使いません**。アプリ起動時にAPI側で `CREATE TABLE IF NOT EXISTS ...` を実行して、必要なテーブルを自動作成します。

そのため **Vercel Postgres を作成して環境変数が入れば、そのまま動作します**。

## トラブルシューティング

### 投稿が作れない / APIが500になる

- VercelのStorageで **Postgresが作成されているか**
- プロジェクトのEnvironment Variablesに **`POSTGRES_URL` が存在するか**

### ローカル開発

ローカルで開発する場合は、PostgreSQLをインストールして起動し、`POSTGRES_URL` を環境変数として設定してください：

```bash
# 例（bash）
export POSTGRES_URL="postgresql://user:password@localhost:5432/decision_voting_db"
```

## データベーススキーマ

アプリが自動作成するテーブル：

- **Post** - 投稿
  - id, title, description, authorToken
  - isClosed, closedAt, createdAt
  - リレーション: options, comments

- **Option** - 選択肢
  - id, text, votes, postId
  - リレーション: post, comments

- **Comment** - コメント
  - id, author, text, supportedOptionId, createdAt, postId
  - リレーション: post, supportedOption

スキーマの詳細は `lib/data.ts` の `ensureSchema()` を参照してください。



