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

- `POSTGRES_PRISMA_URL` - Connection pooling用のURL
- `POSTGRES_URL_NON_POOLING` - Direct connection用のURL
- `POSTGRES_URL` - 標準のPostgreSQL URL
- `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

これらの環境変数は自動的にデプロイメントに注入されます。

### 3. データベーススキーマのマイグレーション

データベースが作成されたら、スキーマを適用する必要があります：

```bash
# Vercel環境変数を使用してマイグレーションを実行
npx prisma migrate deploy
```

または、Vercelのビルドコマンドに追加：

1. Vercelダッシュボード → Settings → General → Build & Development Settings
2. Build Commandを以下に変更：
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```

### 4. 初回マイグレーションの作成（開発時のみ）

ローカルで開発する場合：

```bash
# ローカルPostgreSQLを起動
# .envファイルにローカルのデータベースURLを設定

# マイグレーションを作成
npx prisma migrate dev --name init
```

## package.jsonのビルドスクリプト更新

`package.json`の`build`スクリプトを以下のように更新することを推奨します：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

これにより、Vercelでのビルド時に自動的に：
1. Prisma Clientが生成され
2. データベーススキーマがマイグレーションされ
3. Next.jsアプリがビルドされます

## トラブルシューティング

### エラー: P2010 - Raw query failed

データベーステーブルが存在しない場合、まずマイグレーションを実行してください：

```bash
npx prisma migrate deploy
```

### ローカル開発

ローカルで開発する場合は、PostgreSQLをインストールして起動し、`.env`ファイルに接続情報を設定してください：

```bash
# .env
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/decision_voting_db?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/decision_voting_db"
```

その後、マイグレーションを実行：

```bash
npx prisma migrate dev
```

## データベーススキーマ

現在のスキーマ：

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

スキーマの詳細は `prisma/schema.prisma` を参照してください。

