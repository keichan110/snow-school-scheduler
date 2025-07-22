# Next.js 設計思想・コーディング規約 2025

> **重要**: この規約はLinterでは修正できない設計思想とアーキテクチャ上の決定に焦点を当てています。ESLint/Prettierで自動修正可能な構文的な問題は別途設定してください。

## 目次

1. [設計哲学](#設計哲学)
2. [プロジェクト構造](#プロジェクト構造)
3. [App Router アーキテクチャ](#app-router-アーキテクチャ)
4. [コンポーネント設計](#コンポーネント設計)
5. [データフェッチング戦略](#データフェッチング戦略)
6. [状態管理](#状態管理)
7. [エラーハンドリング](#エラーハンドリング)
8. [パフォーマンス最適化](#パフォーマンス最適化)
9. [セキュリティ](#セキュリティ)
10. [命名規則](#命名規則)

---

## 設計哲学

### 核心原則

**"Don't make me wait"**: ユーザーを待たせない設計を最優先とする。これは以下を意味する：

- データロード時間の最小化
- レンダリング待機時間の削除
- レイアウトシフトの防止
- インタラクション応答性の向上

### React Server Components（RSC）ファースト

Server Componentsの効率向上により、クライアントサイドのJavaScript実行が減少している。2025年の設計では：

```typescript
// ✅ 推奨: Server Componentをデフォルトに
async function ProductList() {
  const products = await fetchProducts()
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

// ❌ 避ける: 不必要なClient Component
"use client"
function ProductList() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])
  // ...
}
```

### ハイブリッドレンダリング戦略

Next.js 2025は、SSG、SSR、ISRの改良により高速化を実現。適切な選択基準：

- **SSG**: 静的コンテンツ（ブログ、ランディングページ）
- **ISR**: 準静的コンテンツ（商品カタログ、ニュース）
- **SSR**: 動的コンテンツ（ダッシュボード、認証必須ページ）
- **CSR**: リアルタイム機能（チャット、ライブデータ）

---

## プロジェクト構造

### ディレクトリ構成

適切なフォルダ構造により開発速度、SEO、チームの作業効率が向上する。

```
my-nextjs-project/
├── app/                          # App Router（Next.js 13+）
│   ├── (auth)/                   # Route Groups（認証関連）
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── settings/
│   │   ├── analytics/
│   │   ├── layout.tsx            # ダッシュボード共通レイアウト
│   │   └── page.tsx
│   ├── api/                      # Route Handlers
│   │   ├── auth/
│   │   └── users/
│   ├── globals.css
│   ├── layout.tsx                # Root Layout
│   └── page.tsx                  # Homepage
├── src/
│   ├── components/               # コンポーネント
│   │   ├── ui/                   # 基本UIコンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   ├── features/             # 機能別コンポーネント
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   └── user-profile/
│   │   └── layouts/              # レイアウトコンポーネント
│   ├── lib/                      # ユーティリティ・設定
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── hooks/                    # カスタムフック
│   ├── types/                    # TypeScript型定義
│   └── constants/                # 定数
├── public/                       # 静的ファイル
├── .env.local                    # 環境変数
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Route Groups活用

Route Groupsを使用してセクション別、意図別、チーム別にルートを整理：

```
app/
├── (marketing)/              # マーケティングページ群
│   ├── about/
│   ├── pricing/
│   └── contact/
├── (dashboard)/              # ダッシュボード機能群
│   ├── analytics/
│   ├── settings/
│   └── users/
└── (auth)/                   # 認証関連ページ群
    ├── login/
    └── register/
```

---

## App Router アーキテクチャ

### Server/Client Components分離戦略

Next.jsは環境変数を適切に処理するため、server-only/client-onlyパッケージを使用して境界を明確にする：

```typescript
// lib/server-api.ts
import 'server-only'

export async function getSecretData() {
  // サーバーでのみ実行される処理
  const response = await fetch('https://api.example.com/secret', {
    headers: {
      authorization: process.env.API_SECRET, // サーバーでのみ利用可能
    },
  })
  return response.json()
}
```

```typescript
// lib/client-utils.ts
import 'client-only'

export function getClientSideData() {
  // クライアントでのみ実行される処理
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-preference')
  }
  return null
}
```

### ファイルベース規約

Next.jsのファイルシステム規約を活用：

- `page.tsx`: ページコンポーネント
- `layout.tsx`: レイアウト定義
- `loading.tsx`: ローディングUI
- `error.tsx`: エラーバウンダリ
- `not-found.tsx`: 404ページ
- `route.ts`: API Route Handler

### レイアウト階層設計

```typescript
// app/layout.tsx (Root Layout)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

// app/dashboard/layout.tsx (Nested Layout)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
```

---

## コンポーネント設計

### Container-Presentational パターン

Container-Presentationalパターンにより、ロジックとUIを分離してメンテナンス性を向上：

```typescript
// containers/UserProfileContainer.tsx (Server Component)
async function UserProfileContainer({ userId }: { userId: string }) {
  const user = await fetchUser(userId)
  const posts = await fetchUserPosts(userId)
  
  return <UserProfilePresentation user={user} posts={posts} />
}

// components/UserProfilePresentation.tsx (Client Component)
"use client"

interface Props {
  user: User
  posts: Post[]
}

export function UserProfilePresentation({ user, posts }: Props) {
  const [selectedTab, setSelectedTab] = useState('posts')
  
  return (
    <div>
      <UserInfo user={user} />
      <TabSwitcher selected={selectedTab} onChange={setSelectedTab} />
      {selectedTab === 'posts' && <PostList posts={posts} />}
    </div>
  )
}
```

### コンポーネント内部構造

コンポーネント内のコード整理により、可読性とメンテナンス性を向上：

```typescript
// 1. Imports
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { validateEmail } from '@/lib/validations'

// 2. Type definitions
interface FormProps {
  onSubmit: (data: FormData) => void
  defaultValues?: Partial<FormData>
}

// 3. Component definition
export function ContactForm({ onSubmit, defaultValues }: FormProps) {
  // 4. Hooks（状態とエフェクト）
  const [formData, setFormData] = useState(defaultValues || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  useEffect(() => {
    // エフェクトロジック
  }, [])
  
  // 5. Event handlers and methods
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // バリデーションとsubmitロジック
  }
  
  const validateField = (name: string, value: string) => {
    // バリデーションロジック
  }
  
  // 6. Render logic (JSX)
  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム要素 */}
    </form>
  )
}
```

### 命名規則（コンポーネント）

ファイル名はkebab-case、コンポーネント名はPascalCaseを使用：

```
✅ 推奨
components/
├── user-profile.tsx          # ファイル名: kebab-case
├── shopping-cart.tsx
└── product-card.tsx

❌ 避ける
components/
├── UserProfile.tsx           # 大文字小文字の問題がLinuxで発生
├── ShoppingCart.tsx
└── productCard.tsx
```

```typescript
// user-profile.tsx
export function UserProfile() {    // コンポーネント名: PascalCase
  // ...
}
```

---

## データフェッチング戦略

### Server Componentsでのデータフェッチ

可能な限りServer Componentsでデータフェッチを行い、セキュリティと性能を向上：

```typescript
// ✅ 推奨: Server Componentでの並列データフェッチ
async function ProductPage({ params }: { params: { id: string } }) {
  // 並列でデータ取得を開始
  const productPromise = getProduct(params.id)
  const reviewsPromise = getProductReviews(params.id)
  const recommendationsPromise = getRecommendations(params.id)
  
  // Promise.allで並列実行
  const [product, reviews, recommendations] = await Promise.all([
    productPromise,
    reviewsPromise,
    recommendationsPromise
  ])
  
  return (
    <div>
      <ProductDetails product={product} />
      <ProductReviews reviews={reviews} />
      <Recommendations products={recommendations} />
    </div>
  )
}
```

### ウォーターフォール回避

データフェッチのウォーターフォールを防ぐため、Suspense境界を適切に配置：

```typescript
// ✅ 推奨: Suspenseによる分離
async function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserInfoSkeleton />}>
        <UserInfo />
      </Suspense>
      
      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts />
      </Suspense>
      
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}

async function UserInfo() {
  const user = await fetchUser() // 独立してフェッチ
  return <UserCard user={user} />
}
```

### プリロードパターン

```typescript
// lib/preload.ts
const cache = new Map()

export function preloadUser(id: string) {
  if (!cache.has(id)) {
    cache.set(id, fetchUser(id))
  }
}

export function getUser(id: string) {
  return cache.get(id) ?? fetchUser(id)
}
```

---

## 状態管理

### 状態管理ライブラリの選択基準

多くの場合、状態管理ライブラリは不要。以下の順序で検討：

1. **React内蔵フック**: `useState`, `useReducer`, `useContext`
2. **Server State**: React Server Components + キャッシュ
3. **軽量ライブラリ**: Zustand（必要に応じて）
4. **複雑なケース**: Redux Toolkit（レガシーコード等）

### 粒度の細かい状態分割

状態を意味のある単位に分割して、不要な再レンダリングを防ぐ：

```typescript
// ✅ 推奨: 粒度の細かい状態分割
function UserProfile({ userId }: { userId: string }) {
  const [userName, setUserName] = useState("")
  const [userStats, setUserStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [friends, setFriends] = useState([])
  
  useEffect(() => {
    fetchUserData(userId).then((userData) => {
      setUserName(userData.name)
      setUserStats(userData.stats)
      setActivities(userData.recentActivities)
      setFriends(userData.friends)
    })
  }, [userId])
  
  // ...
}

// ❌ 避ける: 単一の巨大な状態
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState({}) // 巨大なオブジェクト
  // 一部の変更で全体が再レンダリング
}
```

### Context APIの適切な使用

```typescript
// contexts/ThemeContext.tsx
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
} | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])
  
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## エラーハンドリング

### App Routerでのエラー境界

error.tsxファイルによりルートセグメント単位でエラーを捕捉：

```typescript
// app/dashboard/error.tsx
"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログサービスに送信
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="error-container">
      <h2>ダッシュボードでエラーが発生しました</h2>
      <p>申し訳ございません。一時的な問題が発生している可能性があります。</p>
      <button onClick={reset}>再試行</button>
    </div>
  )
}
```

### Server Actionsのエラーハンドリング

Server Actionsではtry/catchでエラーを適切に処理：

```typescript
// app/actions/user.ts
"use server"

export async function updateUser(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    
    // バリデーション
    if (!userId || !name) {
      return { success: false, error: '必須項目が不足しています' }
    }
    
    // データベース更新
    await db.user.update({
      where: { id: userId },
      data: { name }
    })
    
    revalidatePath('/dashboard/profile')
    return { success: true }
    
  } catch (error) {
    console.error('User update error:', error)
    return { 
      success: false, 
      error: 'ユーザー情報の更新に失敗しました。再度お試しください。' 
    }
  }
}
```

### API Route Handlersのエラーハンドリング

API routesでは一貫したエラーレスポンス形式を使用：

```typescript
// app/api/users/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    
    // 入力値検証
    if (isNaN(Number(page))) {
      return NextResponse.json(
        { success: false, error: 'Invalid page parameter' },
        { status: 400 }
      )
    }
    
    const users = await getUsersWithPagination(Number(page))
    
    return NextResponse.json({
      success: true,
      data: users,
      meta: { page: Number(page) }
    })
    
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Not Found処理

リソースが存在しない場合はnotFound関数を使用：

```typescript
import { notFound } from 'next/navigation'

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound() // not-found.tsxページを表示
  }
  
  return <ProductDetails product={product} />
}
```

---

## パフォーマンス最適化

### コード分割戦略

動的インポートを使用してクライアントサイドコードを小さなバンドルに分割：

```typescript
// ✅ 推奨: 必要時のみロード
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // クライアントサイドでのみレンダリング
})

const MapComponent = dynamic(() => import('./MapComponent'), {
  loading: () => <div>地図を読み込み中...</div>,
  ssr: false
})

function Dashboard() {
  const [showChart, setShowChart] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        チャートを表示
      </button>
      {showChart && <HeavyChart />}
    </div>
  )
}
```

### ユーザーインタラクション時のライブラリロード

ユーザーの操作に基づいてライブラリをオンデマンドでロード：

```typescript
// ScrollToTopボタンの例
function ScrollToTopButton() {
  const handleScrollToTop = async () => {
    // ユーザーがクリックした時点でライブラリをロード
    const { animateScroll } = await import('react-scroll')
    animateScroll.scrollToTop({
      duration: 500,
      smooth: true
    })
  }
  
  return (
    <button onClick={handleScrollToTop}>
      ↑ トップへ戻る
    </button>
  )
}
```

### バンドル分析と最適化

@next/bundle-analyzerを使用してバンドルサイズを監視：

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'date-fns'
    ],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
```

### 画像最適化

Next.jsのImageコンポーネントで自動最適化とlazy loadingを実装：

```typescript
import Image from 'next/image'

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={200}
            className="rounded-lg"
            priority={product.featured} // 重要な画像のみpriority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,..." // 低品質プレースホルダー
          />
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

---

## セキュリティ

### Server Actions認証

```typescript
// app/actions/admin.ts
"use server"

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function adminAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/unauthorized')
  }
  
  // 管理者のみが実行可能な処理
  // ...
}
```

### API Route認証・認可

APIルートではトークン検証やIPフィルタリングを実装：

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // API routes認証
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = request.headers.get('authorization')
    
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }
  
  // レート制限
  const ip = request.ip ?? '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  return NextResponse.next()
}
```

### 入力値サニタイゼーション

SQLインジェクションを防ぐためパラメータ化クエリを使用：

```typescript
// lib/db.ts
import { sql } from '@vercel/postgres'

export async function getUserById(id: string) {
  // ✅ 推奨: パラメータ化クエリ
  const result = await sql`
    SELECT id, name, email FROM users WHERE id = ${id}
  `
  return result.rows[0]
}

// ❌ 避ける: 文字列結合
// const query = `SELECT * FROM users WHERE id = '${id}'` // SQLインジェクション脆弱性
```

---

## 命名規則

### ファイル・ディレクトリ命名

すべてのファイル名にkebab-caseを使用：

```
✅ 推奨
components/
├── user-profile.tsx
├── shopping-cart.tsx
├── product-card.tsx
└── auth/
    ├── login-form.tsx
    └── password-reset.tsx

pages/
├── about-us.tsx
├── contact-us.tsx
└── terms-of-service.tsx
```

### TypeScript型定義

型名はPascalCase、プロパティとメソッドはcamelCaseを使用：

```typescript
// types/user.ts
export interface UserProfile {
  id: string
  userName: string          // camelCase
  emailAddress: string
  createdAt: Date
  lastLoginAt?: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  errorMessage?: string     // camelCase
}

// props/methods
interface ComponentProps {
  onSubmit: (data: FormData) => void    // camelCase
  initialValue?: string
  isLoading?: boolean
}
```

### CSS クラス命名

カスタムスタイルクラスにはsnake_caseを使用してTailwindと区別：

```typescript
// ✅ 推奨: Tailwind + カスタムクラス区別
<div className="flex items-center custom_button_style">
  <span className="text-lg font-bold label_text">ユーザー名</span>
</div>
```

```css
/* styles/components.css */
.custom_button_style {
  /* カスタムスタイル */
}

.label_text {
  /* カスタムテキストスタイル */
}
```

### Server/Client Component命名

Server/Client Componentを明確に区別する命名：

```typescript
// ✅ 推奨: 機能的な命名で区別
function ServerUserList() {      // Server Component
  // サーバーサイド処理
}

function InteractiveUserList() { // Client Component  
  "use client"
  // クライアントサイド処理
}

// または具体的な命名
function UserListContainer() {   // Server Component
  // データフェッチ
}

function UserListPresentation() { // Client Component
  "use client"
  // インタラクティブUI
}
```

---

## TypeScript設定とベストプラクティス

### 厳格なTypeScript設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 型安全なAPI設計

```typescript
// types/api.ts
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    pagination?: PaginationMeta
    requestId: string
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// 使用例
async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const response = await fetch('/api/users')
  return response.json()
}
```

### Server Actions型安全性

```typescript
// lib/action-types.ts
export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; field?: string }

// app/actions/user.ts
"use server"

import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export async function updateUser(
  formData: FormData
): Promise<ActionResult<User>> {
  try {
    const validatedFields = UpdateUserSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
        field: validatedFields.error.errors[0].path[0] as string,
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: validatedFields.data,
    })

    revalidatePath('/profile')
    return { success: true, data: updatedUser }
  } catch (error) {
    return { success: false, error: 'ユーザー更新に失敗しました' }
  }
}
```

---

## キャッシュ戦略

### Next.js 15キャッシュ変更への対応

Next.js 15では、GETルートハンドラとクライアントルーターキャッシュがデフォルトで無効になりました：

```typescript
// app/api/products/route.ts
// ✅ 推奨: 明示的なキャッシュ設定
export async function GET() {
  const products = await fetchProducts()
  
  return Response.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}

// 静的なルートハンドラとして強制する場合
export const dynamic = 'force-static'
```

### データキャッシュ戦略

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

// 長期間キャッシュ（商品情報など）
export const getCachedProducts = unstable_cache(
  async () => {
    return await fetchProducts()
  },
  ['products'],
  {
    revalidate: 3600, // 1時間
    tags: ['products']
  }
)

// 短期間キャッシュ（ユーザー情報など）
export const getCachedUser = unstable_cache(
  async (userId: string) => {
    return await fetchUser(userId)
  },
  ['user'],
  {
    revalidate: 300, // 5分
    tags: ['user']
  }
)
```

### ISR（Incremental Static Regeneration）

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return <BlogPostContent post={post} />
}

// ISR設定
export const revalidate = 3600 // 1時間ごとに再生成
```

---

## 国際化（i18n）とアクセシビリティ

### 国際化設定

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ja', 'en', 'ko'],
    defaultLocale: 'ja',
    localeDetection: true,
  },
}

module.exports = nextConfig
```

```typescript
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return [{ locale: 'ja' }, { locale: 'en' }, { locale: 'ko' }]
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages(locale)
  
  return (
    <html lang={locale}>
      <body>
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </body>
    </html>
  )
}
```

### アクセシビリティ

```typescript
// components/accessible-button.tsx
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick: () => void
  ariaLabel?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  disabled = false,
  variant = 'primary'
}: AccessibleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`}
      // フォーカス管理
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </button>
  )
}
```

---

## テスト戦略

### コンポーネントテスト

```typescript
// __tests__/components/user-profile.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserProfile } from '@/components/user-profile'

// Server Componentのテスト
describe('UserProfile', () => {
  it('ユーザー情報を正しく表示する', async () => {
    const mockUser = {
      id: '1',
      name: 'テストユーザー',
      email: 'test@example.com'
    }
    
    render(<UserProfile user={mockUser} />)
    
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
  
  it('編集モードの切り替えが動作する', async () => {
    const user = userEvent.setup()
    const mockUser = { id: '1', name: 'テストユーザー', email: 'test@example.com' }
    
    render(<UserProfile user={mockUser} />)
    
    const editButton = screen.getByRole('button', { name: '編集' })
    await user.click(editButton)
    
    expect(screen.getByDisplayValue('テストユーザー')).toBeInTheDocument()
  })
})
```

### Server Actions テスト

```typescript
// __tests__/actions/user.test.ts
import { updateUser } from '@/app/actions/user'

// Server Actionsのテスト
describe('updateUser', () => {
  it('有効なデータでユーザーを更新する', async () => {
    const formData = new FormData()
    formData.append('userId', '1')
    formData.append('name', '更新されたユーザー')
    formData.append('email', 'updated@example.com')
    
    const result = await updateUser(formData)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('更新されたユーザー')
    }
  })
  
  it('無効なメールアドレスでエラーを返す', async () => {
    const formData = new FormData()
    formData.append('userId', '1')
    formData.append('name', 'テストユーザー')
    formData.append('email', 'invalid-email')
    
    const result = await updateUser(formData)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('有効なメールアドレス')
    }
  })
})
```

### E2Eテスト（Playwright）

```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ユーザー管理', () => {
  test('ユーザープロフィールの更新', async ({ page }) => {
    await page.goto('/profile')
    
    // 編集ボタンをクリック
    await page.click('[data-testid="edit-profile-button"]')
    
    // 名前を変更
    await page.fill('[data-testid="name-input"]', '新しい名前')
    
    // 保存ボタンをクリック
    await page.click('[data-testid="save-button"]')
    
    // 成功メッセージを確認
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // 新しい名前が表示されることを確認
    await expect(page.locator('[data-testid="user-name"]')).toHaveText('新しい名前')
  })
})
```

---

## パフォーマンス監視

### Core Web Vitals監視

```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // Google Analytics、Vercel Analytics等に送信
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  })
}

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics) // または getINP
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

```typescript
// app/layout.tsx
import { reportWebVitals } from '@/lib/web-vitals'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

### バンドルサイズ監視

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // パフォーマンス予算設定
  experimental: {
    bundlePagesExternals: false,
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  
  // webpack設定でサイズ制限
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.performance = {
        maxAssetSize: 250000, // 250KB
        maxEntrypointSize: 250000,
        hints: 'error'
      }
    }
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
```

---

## デプロイとCI/CD

### Vercelデプロイ設定

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["nrt1"],
  "functions": {
    "app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Build
        run: npm run build
        env:
          ANALYZE: true
      
      - name: Bundle size check
        run: npm run size-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## セキュリティベストプラクティス

### CSP（Content Security Policy）

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' *.vercel.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### 環境変数の安全な管理

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // サーバーサイドのみ
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(32),
  
  // クライアントサイド（NEXT_PUBLIC_プレフィックス必須）
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// 使用例
// サーバーサイドでのみ利用可能
const dbConnection = env.DATABASE_URL

// クライアントサイドでも利用可能
const analyticsId = env.NEXT_PUBLIC_ANALYTICS_ID
```

### CSRF対策

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // API routesのCSRF保護
  if (request.method !== 'GET' && request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (!origin || new URL(origin).host !== host) {
      return NextResponse.json(
        { error: 'CSRF token mismatch' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}
```

---

## プロダクション準備チェックリスト

### パフォーマンス

- [ ] Bundle size analysis実行済み
- [ ] Lighthouse スコア 90+ 確認済み
- [ ] Core Web Vitals合格
- [ ] 画像最適化（WebP/AVIF対応）
- [ ] フォント最適化
- [ ] コード分割実装済み

### セキュリティ

- [ ] CSP設定済み
- [ ] セキュリティヘッダー設定済み
- [ ] 入力値検証実装済み
- [ ] 認証・認可実装済み
- [ ] 機密情報の環境変数管理

### 品質

- [ ] TypeScript strict mode有効
- [ ] ESLint/Prettier設定済み
- [ ] テストカバレッジ80%以上
- [ ] E2Eテスト実装済み
- [ ] エラーハンドリング実装済み

### 運用

- [ ] 監視・ログ設定済み
- [ ] CI/CDパイプライン構築済み
- [ ] 環境別設定管理
- [ ] バックアップ・復旧手順確立
- [ ] ドキュメント整備済み

---

## まとめ

この規約は2025年のNext.js開発における最新のベストプラクティスを反映しています。主なポイント：

### 重要な原則

1. **"Don't make me wait"** - ユーザー体験を最優先
2. **Server Components ファースト** - パフォーマンスとセキュリティの向上
3. **TypeScript厳格設定** - 型安全性による品質向上
4. **適切なエラーハンドリング** - 堅牢なアプリケーション構築
5. **パフォーマンス監視** - 継続的な改善

### 今後の対応

- React 19の正式リリースに向けた準備
- Partial Prerenderingの本格導入
- Edge Functionsの活用拡大
- Server Actionsの更なる最適化

この規約は進化し続けるNext.jsエコシステムに合わせて定期的に更新していく必要があります。チーム全体で継続的にベストプラクティスを学習し、適用していくことが重要です。