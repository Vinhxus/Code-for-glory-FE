type BackendPracticeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'sql'
  | 'go';

type BackendPracticeSolutionContent = {
  primaryLanguage: BackendPracticeLanguage;
  code: Partial<Record<BackendPracticeLanguage, string>>;
  explanation: {
    vi: string;
    en: string;
  };
};

const lines = (...items: string[]) => items.join('\n');

export const PRACTICE_BACKEND_SOLUTIONS: Record<
  string,
  BackendPracticeSolutionContent
> = {
  'be-http-basics': {
    primaryLanguage: 'javascript',
    code: {
      javascript: lines(
        'function handleRequest(req) {',
        "  const request = req ?? { method: 'GET', path: '/' };",
        "  const path = request.path ?? '/';",
        '',
        '  return {',
        '    status: 200,',
        "    body: { ok: true, method: request.method ?? 'GET', path },",
        "    headers: { 'content-type': 'application/json' },",
        '  };',
        '}'
      ),
      python: lines(
        'def handleRequest(req):',
        "    request = req or {'method': 'GET', 'path': '/'}",
        "    path = request.get('path', '/')",
        '    return {',
        "        'status': 200,",
        "        'body': {'ok': True, 'method': request.get('method', 'GET'), 'path': path},",
        "        'headers': {'content-type': 'application/json'},",
        '    }'
      ),
      typescript: lines(
        "type HttpRequest = { method?: string; path?: string; body?: unknown };",
        "type HttpResponse = { status: number; body: unknown; headers: Record<string, string> };",
        '',
        'export function handleRequest(req?: HttpRequest): HttpResponse {',
        "  const request = req ?? { method: 'GET', path: '/' };",
        '  return {',
        '    status: 200,',
        '    body: { ok: true, method: request.method ?? "GET", path: request.path ?? "/" },',
        '    headers: { "content-type": "application/json" },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Lời giải đúng mindset HTTP cơ bản: luôn trả về response object ổn định gồm `status`, `body`, và `headers`.',
        'Có guard cho input `undefined`, nên cả sample lẫn hidden checks đều không bị throw khi request trống.',
      ].join('\n'),
      en: [
        'The solution follows a stable HTTP contract: always return a response object with `status`, `body`, and `headers`.',
        'It also guards against `undefined` input, so sample and hidden checks do not crash on empty requests.',
      ].join('\n'),
    },
  },

  'be-cache-header-tuning': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "type CacheProfile = 'static' | 'dynamic';",
        '',
        'export function buildResponse(profile: CacheProfile, body: unknown) {',
        '  const headers =',
        "    profile === 'static'",
        "      ? { 'cache-control': 'public, max-age=31536000, immutable' }",
        "      : { 'cache-control': 'private, no-store, must-revalidate' };",
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: body },',
        '    headers,',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Tách rõ static và dynamic responses để cache policy không “mập mờ”. Static assets có thể cache mạnh; dữ liệu nhạy cảm thì `no-store`.',
        'Contract response vẫn giữ `status`, `body`, `headers` rõ ràng nên dễ test và dễ map vào controller thực tế.',
      ].join('\n'),
      en: [
        'Separate static and dynamic responses so caching policy stays explicit. Static assets can be cached aggressively; sensitive data should use `no-store`.',
        'The response contract still exposes `status`, `body`, and `headers`, which keeps controllers and tests predictable.',
      ].join('\n'),
    },
  },

  'be-idempotency-key': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type CheckoutRequest = { idempotencyKey: string; amount: number; userId: string };',
        'type CheckoutResponse = { status: number; body: unknown; headers: Record<string, string> };',
        '',
        'const completedRequests = new Map<string, CheckoutResponse>();',
        '',
        'export async function handleCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {',
        '  const cached = completedRequests.get(req.idempotencyKey);',
        '  if (cached) return cached;',
        '',
        '  const response: CheckoutResponse = {',
        '    status: 200,',
        '    body: { data: { chargeId: crypto.randomUUID(), amount: req.amount } },',
        "    headers: { 'idempotency-key': req.idempotencyKey },",
        '  };',
        '',
        '  completedRequests.set(req.idempotencyKey, response);',
        '  return response;',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Ý chính của bài là “same key, same effect”: request đã xử lý thì trả lại kết quả cũ thay vì charge lại lần nữa.',
        'Response có `headers.idempotency-key` và `body.data` để contract đủ rõ cho client lẫn logging/audit.',
      ].join('\n'),
      en: [
        'The core rule is “same key, same effect”: once processed, the same request should return the previous result instead of charging again.',
        'The response includes `headers.idempotency-key` and `body.data` so both clients and audits can rely on a clear contract.',
      ].join('\n'),
    },
  },

  'be-content-negotiation': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "type AcceptHeader = 'application/json' | 'text/csv' | string;",
        '',
        'export function negotiateContent(accept: AcceptHeader, rows: Array<Record<string, string>>) {',
        "  if (accept.includes('application/json')) {",
        '    return {',
        '      status: 200,',
        '      body: { data: rows },',
        "      headers: { 'content-type': 'application/json' },",
        '    };',
        '  }',
        '',
        "  if (accept.includes('text/csv')) {",
        "    const header = Object.keys(rows[0] ?? {}).join(',');",
        "    const body = [header, ...rows.map((row) => Object.values(row).join(','))].join('\\n');",
        '    return {',
        '      status: 200,',
        '      body,',
        "      headers: { 'content-type': 'text/csv; charset=utf-8' },",
        '    };',
        '  }',
        '',
        '  return {',
        '    status: 406,',
        "    body: { error: 'Not Acceptable' },",
        "    headers: { vary: 'accept' },",
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Content negotiation tốt phải branch theo `Accept` header và trả đúng `content-type` tương ứng.',
        'Nếu client yêu cầu format không hỗ trợ thì trả `406 Not Acceptable`, thay vì silently fallback làm client hiểu sai contract.',
      ].join('\n'),
      en: [
        'Good content negotiation branches on the `Accept` header and returns the matching `content-type`.',
        'If the client asks for an unsupported format, return `406 Not Acceptable` instead of silently falling back to the wrong contract.',
      ].join('\n'),
    },
  },

  'be-rest-endpoint': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Order = { id: string; status: string };',
        'const orders = new Map<string, Order>();',
        '',
        'export function getOrderById(id: string) {',
        '  if (!id) {',
        "    return { status: 400, body: { error: 'id is required' } };",
        '  }',
        '',
        '  const order = orders.get(id);',
        '  if (!order) {',
        "    return { status: 404, body: { error: 'order not found' } };",
        '  }',
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: order },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'REST endpoint tốt phải tách rõ `400` (input sai), `404` (resource không tồn tại), và `200` (thành công).',
        'Payload nên thống nhất dạng `{ data }` hoặc `{ error }` để frontend parse đơn giản và log dễ đọc.',
      ].join('\n'),
      en: [
        'A solid REST endpoint distinguishes `400` (invalid input), `404` (missing resource), and `200` (success).',
        'Keep the payload consistent as `{ data }` or `{ error }` so frontend parsing and logging stay simple.',
      ].join('\n'),
    },
  },

  'be-pagination-contract': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Page<T> = { data: T[]; nextCursor: string | null; prevCursor: string | null; hasMore: boolean };',
        '',
        'export function toCursorPage<T extends { id: string }>(rows: T[], limit: number): Page<T> {',
        '  const slice = rows.slice(0, limit + 1);',
        '  const hasMore = slice.length > limit;',
        '  const data = slice.slice(0, limit);',
        '',
        '  return {',
        '    data,',
        '    nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,',
        '    prevCursor: data[0]?.id ?? null,',
        '    hasMore,',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Cursor pagination chuyên nghiệp không chỉ trả `data` mà còn phải trả `nextCursor`, `prevCursor`, và `hasMore`.',
        'Pattern `limit + 1` giúp biết còn trang sau hay không mà không cần query count quá nặng.',
      ].join('\n'),
      en: [
        'A professional cursor pagination contract returns not only `data`, but also `nextCursor`, `prevCursor`, and `hasMore`.',
        'The `limit + 1` pattern tells you whether another page exists without an expensive full count query.',
      ].join('\n'),
    },
  },

  'be-bulk-update-api': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Patch = { id: string; status?: string };',
        '',
        'export function bulkUpdateOrders(items: Patch[]) {',
        '  const results = items.map((item) => {',
        '    if (!item.id || !item.status) {',
        "      return { id: item.id ?? null, ok: false, error: 'invalid payload' };",
        '    }',
        '',
        '    return {',
        '      id: item.id,',
        '      ok: true,',
        '      data: { id: item.id, status: item.status },',
        '    };',
        '  });',
        '',
        '  return {',
        '    status: 207,',
        '    body: {',
        '      data: results,',
        '      summary: {',
        '        total: results.length,',
        '        success: results.filter((r) => r.ok).length,',
        '        failed: results.filter((r) => !r.ok).length,',
        '      },',
        '    },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Batch API nên hỗ trợ partial success, nên response phải đủ chi tiết cho từng item thay vì chỉ trả 1 boolean chung.',
        'Dùng `207` và `summary` giúp client render kết quả hàng loạt, retry item fail, và audit dễ hơn.',
      ].join('\n'),
      en: [
        'A batch API should support partial success, so the response must describe each item instead of returning one global boolean.',
        'Using `207` plus a `summary` block makes client rendering, retries, and auditing much easier.',
      ].join('\n'),
    },
  },

  'be-webhook-retry-flow': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const processedEvents = new Set<string>();',
        '',
        'export async function handleWebhook(eventId: string, payload: unknown) {',
        '  if (processedEvents.has(eventId)) {',
        "    return { status: 200, body: { data: { duplicate: true } } };",
        '  }',
        '',
        '  try {',
        '    // apply side effects here',
        '    processedEvents.add(eventId);',
        "    return { status: 202, body: { data: { accepted: true, payload } } };",
        '  } catch (error) {',
        '    return {',
        '      status: 500,',
        "      body: { error: 'temporary failure, provider may retry' },",
        '    };',
        '  }',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Webhook flow phải idempotent: event đã xử lý rồi thì trả 2xx an toàn, không chạy side effect lần nữa.',
        'Lỗi tạm thời nên trả `5xx` để provider retry; không nên nuốt lỗi và trả 200 nếu state chưa commit xong.',
      ].join('\n'),
      en: [
        'Webhook flows must be idempotent: once an event is processed, return a safe 2xx and do not replay side effects.',
        'Temporary failures should return `5xx` so the provider retries; do not swallow the error with a 200 if state was not committed.',
      ].join('\n'),
    },
  },

  'be-jwt-guard': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "type Claims = { sub: string; role: 'user' | 'admin' };",
        '',
        'function verifyJwt(token: string): Claims | null {',
        "  if (!token.startsWith('Bearer ')) return null;",
        "  return { sub: 'u_123', role: 'admin' };",
        '}',
        '',
        'export function guard(authHeader?: string) {',
        '  const claims = authHeader ? verifyJwt(authHeader) : null;',
        '  if (!claims) {',
        "    return { status: 401, body: { error: 'unauthenticated' } };",
        '  }',
        '',
        "  if (claims.role !== 'admin') {",
        "    return { status: 403, body: { error: 'forbidden' } };",
        '  }',
        '',
        '  return { status: 200, body: { data: { userId: claims.sub, role: claims.role } } };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Guard chuẩn phải tách `401` (thiếu/invalid token) và `403` (đã auth nhưng không đủ quyền).',
        'Lời giải giữ boundary authz rõ ràng bằng cách verify token trước, rồi check role sau.',
      ].join('\n'),
      en: [
        'A correct guard separates `401` (missing/invalid token) from `403` (authenticated but not authorized).',
        'The solution keeps the auth/authz boundary clear: verify the token first, then check permissions.',
      ].join('\n'),
    },
  },

  'be-role-permission-check': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "type Role = 'viewer' | 'editor' | 'admin';",
        "type Action = 'read' | 'write' | 'delete';",
        '',
        'const permissions: Record<Role, Action[]> = {',
        "  viewer: ['read'],",
        "  editor: ['read', 'write'],",
        "  admin: ['read', 'write', 'delete'],",
        '};',
        '',
        'export function authorize(role: Role, action: Action) {',
        '  const allowed = permissions[role].includes(action);',
        '  return allowed',
        '    ? { status: 200, body: { data: { role, action } } }',
        "    : { status: 403, body: { error: 'permission denied' } };",
        '}'
      ),
    },
    explanation: {
      vi: [
        'RBAC nên được model bằng permission matrix rõ ràng, tránh hardcode if/else lặp lại khắp service.',
        'Khi rule thay đổi, chỉ cần cập nhật matrix thay vì sửa logic ở nhiều endpoint.',
      ].join('\n'),
      en: [
        'RBAC should be modeled as a clear permission matrix rather than repeated if/else branches across services.',
        'When rules change, you update one matrix instead of rewriting authorization logic in many endpoints.',
      ].join('\n'),
    },
  },

  'be-refresh-token-rotation': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type RefreshTokenRecord = { userId: string; jti: string; revokedAt?: Date };',
        'const refreshStore = new Map<string, RefreshTokenRecord>();',
        '',
        'export function rotateRefreshToken(oldJti: string, userId: string) {',
        '  const previous = refreshStore.get(oldJti);',
        '  if (!previous || previous.revokedAt) {',
        "    return { status: 401, body: { error: 'refresh token replay detected' } };",
        '  }',
        '',
        '  previous.revokedAt = new Date();',
        '  const nextJti = crypto.randomUUID();',
        '  refreshStore.set(nextJti, { userId, jti: nextJti });',
        '',
        '  return {',
        '    status: 200,',
        '    body: {',
        '      data: { accessToken: "new-access-token", refreshToken: nextJti },',
        '    },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Refresh token rotation nghĩa là mỗi lần refresh thành công phải revoke token cũ và phát token mới.',
        'Nếu token cũ bị dùng lại sau khi đã revoke, đó là dấu hiệu replay và nên chặn session để bảo vệ account.',
      ].join('\n'),
      en: [
        'Refresh token rotation means every successful refresh revokes the old token and issues a new one.',
        'If the old token is used again after revocation, treat it as a replay signal and block the session.',
      ].join('\n'),
    },
  },

  'be-password-reset-flow': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type ResetToken = { token: string; userId: string; expiresAt: Date; usedAt?: Date };',
        'const resetTokens = new Map<string, ResetToken>();',
        '',
        'export function createResetToken(userId: string) {',
        '  const token = crypto.randomUUID();',
        '  resetTokens.set(token, {',
        '    token,',
        '    userId,',
        '    expiresAt: new Date(Date.now() + 1000 * 60 * 15),',
        '  });',
        '  return token;',
        '}',
        '',
        'export function consumeResetToken(token: string, newPasswordHash: string) {',
        '  const record = resetTokens.get(token);',
        '  if (!record || record.usedAt || record.expiresAt < new Date()) {',
        "    return { status: 400, body: { error: 'reset token invalid or expired' } };",
        '  }',
        '',
        '  record.usedAt = new Date();',
        '  const audit = { action: "password_reset", userId: record.userId, at: record.usedAt };',
        '  return { status: 200, body: { data: { passwordUpdated: true, newPasswordHash, audit } } };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Flow an toàn cần đủ 3 yếu tố: token có hạn dùng, single-use, và audit log sau khi consume.',
        'Không trả quá nhiều thông tin chi tiết cho attacker; chỉ expose lỗi “invalid or expired” ở cùng một nhánh.',
      ].join('\n'),
      en: [
        'A secure reset flow needs three properties: expiry, single-use semantics, and audit logging after consumption.',
        'Do not leak too much detail to attackers; return a generic “invalid or expired” branch instead.',
      ].join('\n'),
    },
  },

  'be-sql-analytics': {
    primaryLanguage: 'sql',
    code: {
      sql: lines(
        'SELECT',
        "  DATE_TRUNC('day', created_at) AS activity_day,",
        '  COUNT(*) AS total_events,',
        '  COUNT(DISTINCT user_id) AS active_users,',
        '  RANK() OVER (ORDER BY COUNT(*) DESC) AS volume_rank',
        'FROM user_events',
        "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'",
        "GROUP BY DATE_TRUNC('day', created_at)",
        'ORDER BY activity_day DESC;'
      ),
    },
    explanation: {
      vi: [
        'Bài analytics snapshot cần có `SELECT ... FROM ...`, aggregate (`COUNT`, `COUNT DISTINCT`) và grouping theo trục thời gian.',
        'Dùng alias rõ ràng như `activity_day`, `total_events` giúp query đọc như một báo cáo thay vì chỉ là truy vấn ad-hoc.',
      ].join('\n'),
      en: [
        'An analytics snapshot should include `SELECT ... FROM ...`, aggregation (`COUNT`, `COUNT DISTINCT`), and time-based grouping.',
        'Readable aliases such as `activity_day` and `total_events` make the query feel like a report instead of an ad-hoc statement.',
      ].join('\n'),
    },
  },

  'be-order-aggregation': {
    primaryLanguage: 'sql',
    code: {
      sql: lines(
        'SELECT',
        '  customer_segment AS segment,',
        '  COUNT(*) AS order_count,',
        '  SUM(total_amount) AS gross_revenue,',
        '  AVG(total_amount) AS avg_order_value,',
        "  SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders",
        'FROM orders',
        "WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'",
        'GROUP BY customer_segment',
        'ORDER BY gross_revenue DESC;'
      ),
    },
    explanation: {
      vi: [
        'Lời giải tập trung đúng bản chất “report”: nhóm theo segment, tính revenue, volume, và conversion-like metrics.',
        'Có `WHERE`, `GROUP BY`, `ORDER BY`, và alias rõ ràng nên query vừa đúng nghiệp vụ vừa dễ maintain.',
      ].join('\n'),
      en: [
        'This solution reflects real reporting needs: group by segment, then compute revenue, volume, and conversion-like metrics.',
        'It includes `WHERE`, `GROUP BY`, `ORDER BY`, and readable aliases for maintainability.',
      ].join('\n'),
    },
  },

  'be-n-plus-one-fix': {
    primaryLanguage: 'sql',
    code: {
      sql: lines(
        'SELECT',
        '  p.id AS post_id,',
        '  p.title,',
        '  a.id AS author_id,',
        '  a.name AS author_name,',
        '  COUNT(c.id) AS comment_count',
        'FROM posts p',
        'JOIN authors a ON a.id = p.author_id',
        'LEFT JOIN comments c ON c.post_id = p.id',
        'WHERE p.is_published = TRUE',
        'GROUP BY p.id, p.title, a.id, a.name',
        'ORDER BY p.id DESC;'
      ),
    },
    explanation: {
      vi: [
        'Muốn fix N+1 thì phải gom dữ liệu trong một query đủ giàu thông tin, thay vì loop qua từng post rồi query author/comments riêng.',
        'JOIN + GROUP BY là primitive đúng trọng tâm bài này vì nó giảm round trips và giữ payload đầy đủ.',
      ].join('\n'),
      en: [
        'To fix N+1, fetch the full shape in one rich query instead of looping through posts and querying authors/comments separately.',
        'JOIN + GROUP BY are the key primitives here because they reduce round trips while preserving the payload.',
      ].join('\n'),
    },
  },

  'be-transaction-inventory': {
    primaryLanguage: 'sql',
    code: {
      sql: lines(
        'BEGIN;',
        '',
        'SELECT quantity',
        'FROM inventory',
        "WHERE sku = :sku",
        'FOR UPDATE;',
        '',
        'UPDATE inventory',
        'SET quantity = quantity - :requestedQty',
        "WHERE sku = :sku AND quantity >= :requestedQty;",
        '',
        'INSERT INTO order_items (order_id, sku, quantity)',
        'VALUES (:orderId, :sku, :requestedQty);',
        '',
        'COMMIT;'
      ),
    },
    explanation: {
      vi: [
        'Bài inventory cần primitive transaction rất rõ: lock row, validate stock, update stock, rồi insert order trong cùng boundary.',
        '`FOR UPDATE` + `COMMIT` giúp tránh oversell khi nhiều request cùng tranh chấp một SKU.',
      ].join('\n'),
      en: [
        'Inventory consistency depends on a clear transaction boundary: lock the row, validate stock, update inventory, then insert the order in the same unit.',
        '`FOR UPDATE` plus `COMMIT` reduces overselling under concurrent contention.',
      ].join('\n'),
    },
  },

  'be-async-worker': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Job = { id: string; payload: unknown };',
        '',
        'export async function processJob(job: Job) {',
        '  try {',
        '    const data = await fetchDependency(job.payload);',
        '    await persistResult(job.id, data);',
        "    return { status: 200, body: { data: { jobId: job.id, state: 'done' } } };",
        '  } catch (error) {',
        '    await moveToRetryQueue(job, error);',
        "    return { status: 500, body: { error: 'worker failed, retry scheduled' } };",
        '  }',
        '}',
        '',
        'async function fetchDependency(payload: unknown) {',
        '  return payload;',
        '}',
        '',
        'async function persistResult(jobId: string, data: unknown) {',
        '  return { jobId, data };',
        '}',
        '',
        'async function moveToRetryQueue(job: Job, error: unknown) {',
        '  return { job, error };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Worker solution nên tuyến tính và readable: `fetch -> persist -> ack`, lỗi thì `retry` thay vì callback hell.',
        'Có `try/catch`, `await`, và queue/retry primitive đúng với trọng tâm concurrency backend.',
      ].join('\n'),
      en: [
        'A worker should read linearly: `fetch -> persist -> ack`; on failure, schedule a retry instead of nesting callbacks.',
        'This uses the right concurrency primitives for the topic: `try/catch`, `await`, and retry queue handling.',
      ].join('\n'),
    },
  },

  'be-email-retry-orchestrator': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type EmailJob = { id: string; attempt: number; to: string };',
        '',
        'function nextDelayMs(attempt: number) {',
        '  return Math.min(60_000, 1000 * 2 ** attempt);',
        '}',
        '',
        'export async function sendWithRetry(job: EmailJob) {',
        '  try {',
        '    await sendEmail(job.to);',
        "    return { status: 200, body: { data: { delivered: true, attempt: job.attempt } } };",
        '  } catch (error) {',
        '    const retryAt = Date.now() + nextDelayMs(job.attempt);',
        '    return {',
        '      status: 202,',
        "      body: { data: { retry: true, retryAt }, error: 'queued for retry' },",
        '    };',
        '  }',
        '}',
        '',
        'async function sendEmail(to: string) {',
        '  return { to };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Retry orchestration tốt phải có backoff tăng dần để tránh retry storm khi downstream lỗi hàng loạt.',
        'Response/contract trả `retryAt` giúp hệ thống scheduler và observability theo dõi tiến trình của email job.',
      ].join('\n'),
      en: [
        'A robust retry orchestrator needs exponential backoff to avoid retry storms when the downstream system is failing.',
        'Returning `retryAt` makes the scheduling and observability story much clearer.',
      ].join('\n'),
    },
  },

  'be-race-condition-lock': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const inventoryLocks = new Map<string, boolean>();',
        '',
        'export async function reserveInventory(sku: string, quantity: number) {',
        '  if (inventoryLocks.get(sku)) {',
        "    return { status: 409, body: { error: 'inventory lock busy' } };",
        '  }',
        '',
        '  inventoryLocks.set(sku, true);',
        '  try {',
        '    const available = await readAvailableStock(sku);',
        '    if (available < quantity) {',
        "      return { status: 409, body: { error: 'insufficient stock' } };",
        '    }',
        '',
        '    await writeReservation(sku, quantity);',
        "    return { status: 200, body: { data: { sku, quantity } } };",
        '  } finally {',
        '    inventoryLocks.delete(sku);',
        '  }',
        '}',
        '',
        'async function readAvailableStock(_sku: string) {',
        '  return 10;',
        '}',
        '',
        'async function writeReservation(sku: string, quantity: number) {',
        '  return { sku, quantity };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Bài này cần nhấn mạnh concurrency control: cùng một SKU thì chỉ một flow được vào critical section tại một thời điểm.',
        'Dù demo dùng in-memory lock, tư duy production là Redis lock hoặc DB row lock với timeout rõ ràng.',
      ].join('\n'),
      en: [
        'This exercise is about concurrency control: only one flow should enter the critical section for the same SKU at a time.',
        'The demo uses an in-memory lock, but the production mindset would be Redis or database row locks with timeouts.',
      ].join('\n'),
    },
  },

  'be-background-sync-window': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'let syncLockUntil = 0;',
        '',
        'export async function runBackgroundSync(now = Date.now()) {',
        '  if (syncLockUntil > now) {',
        "    return { status: 409, body: { error: 'sync already running' } };",
        '  }',
        '',
        '  syncLockUntil = now + 60_000;',
        '  try {',
        '    await syncAccounts();',
        "    return { status: 200, body: { data: { synced: true, traceId: crypto.randomUUID() } } };",
        '  } finally {',
        '    syncLockUntil = 0;',
        '  }',
        '}',
        '',
        'async function syncAccounts() {',
        '  return true;',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Mục tiêu là chống overlap giữa các lần sync định kỳ; vì vậy solution cần một “window lock” trước khi chạy job.',
        'Dù đơn giản, pattern này thể hiện đúng primitive của bài: scheduling, lock, và trace/contract để quan sát job.',
      ].join('\n'),
      en: [
        'The goal is to prevent overlap between scheduled sync runs, so the solution takes a lock window before starting work.',
        'Even in a simple form, this demonstrates the right primitives: scheduling, locking, and trace-friendly job output.',
      ].join('\n'),
    },
  },

  'be-redis-cache-aside': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const redis = new Map<string, string>();',
        '',
        'export async function getProduct(productId: string) {',
        '  const cacheKey = `product:${productId}`;',
        '  const cached = redis.get(cacheKey);',
        '  if (cached) {',
        '    return { status: 200, body: { data: JSON.parse(cached), source: "cache" } };',
        '  }',
        '',
        '  const product = await fetchProductFromDb(productId);',
        '  redis.set(cacheKey, JSON.stringify(product));',
        '  return { status: 200, body: { data: product, source: "db" } };',
        '}',
        '',
        'async function fetchProductFromDb(productId: string) {',
        "  return { id: productId, title: 'Demo product' };",
        '}'
      ),
    },
    explanation: {
      vi: [
        'Cache-aside đọc theo flow chuẩn: check cache, miss thì đọc DB, rồi set cache để request sau ăn nhanh hơn.',
        'Giữ `source: cache|db` trong body rất hữu ích cho debug và observability khi tối ưu hot endpoints.',
      ].join('\n'),
      en: [
        'Cache-aside follows the standard read path: check cache, on miss read from DB, then populate cache for the next request.',
        'Keeping `source: cache|db` in the response is useful for debugging and observability on hot endpoints.',
      ].join('\n'),
    },
  },

  'be-stale-while-revalidate': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type CacheEntry<T> = { value: T; expiresAt: number; staleUntil: number };',
        'const cache = new Map<string, CacheEntry<unknown>>();',
        '',
        'export async function getDashboardSnapshot(cacheKey: string) {',
        '  const entry = cache.get(cacheKey);',
        '  const now = Date.now();',
        '',
        '  if (entry && entry.expiresAt > now) {',
        '    return { status: 200, body: { data: entry.value, cache: "fresh" } };',
        '  }',
        '',
        '  if (entry && entry.staleUntil > now) {',
        '    void refreshInBackground(cacheKey);',
        '    return { status: 200, body: { data: entry.value, cache: "stale" } };',
        '  }',
        '',
        '  const fresh = await fetchSnapshot();',
        '  cache.set(cacheKey, { value: fresh, expiresAt: now + 5_000, staleUntil: now + 30_000 });',
        '  return { status: 200, body: { data: fresh, cache: "miss" } };',
        '}',
        '',
        'async function refreshInBackground(cacheKey: string) {',
        '  const fresh = await fetchSnapshot();',
        '  const now = Date.now();',
        '  cache.set(cacheKey, { value: fresh, expiresAt: now + 5_000, staleUntil: now + 30_000 });',
        '}',
        '',
        'async function fetchSnapshot() {',
        '  return { generatedAt: new Date().toISOString() };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'SWR phục vụ dữ liệu cũ còn “chấp nhận được” để latency thấp, đồng thời trigger refresh ở background.',
        'Điểm quan trọng là tách rõ ba trạng thái `fresh`, `stale`, `miss` để contract minh bạch.',
      ].join('\n'),
      en: [
        'SWR serves acceptably stale data to keep latency low while refreshing in the background.',
        'The key is to expose clear states such as `fresh`, `stale`, and `miss` so the contract stays explicit.',
      ].join('\n'),
    },
  },

  'be-cache-invalidation-feed': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const cache = new Map<string, string>();',
        '',
        'export async function updateProductAndInvalidate(productId: string, patch: Record<string, unknown>) {',
        '  await saveProduct(productId, patch);',
        '',
        '  const keysToDelete = [',
        '    `product:${productId}`,',
        '    `product:list`,',
        '    `feed:featured`,',
        '  ];',
        '',
        '  for (const key of keysToDelete) cache.delete(key);',
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: { productId, invalidatedKeys: keysToDelete } },',
        '  };',
        '}',
        '',
        'async function saveProduct(productId: string, patch: Record<string, unknown>) {',
        '  return { productId, patch };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Invalidation tốt phải nhắm đúng key/tag bị ảnh hưởng, không xóa toàn bộ cache space một cách thô bạo.',
        'Response trả `invalidatedKeys` giúp team debug được vì sao một page bị miss cache sau khi admin sửa dữ liệu.',
      ].join('\n'),
      en: [
        'Good invalidation targets the affected keys/tags instead of nuking the entire cache space.',
        'Returning `invalidatedKeys` helps teams debug why certain pages miss cache after admin edits.',
      ].join('\n'),
    },
  },

  'be-rate-limit-login': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Bucket = { count: number; resetAt: number };',
        'const attempts = new Map<string, Bucket>();',
        '',
        'export function enforceRateLimit(ip: string) {',
        '  const now = Date.now();',
        '  const current = attempts.get(ip);',
        '',
        '  if (!current || current.resetAt <= now) {',
        '    attempts.set(ip, { count: 1, resetAt: now + 60_000 });',
        "    return { status: 200, body: { data: { allowed: true } } };",
        '  }',
        '',
        '  current.count += 1;',
        '  if (current.count > 5) {',
        '    return {',
        '      status: 429,',
        "      body: { error: 'too many login attempts' },",
        "      headers: { 'retry-after': String(Math.ceil((current.resetAt - now) / 1000)) },",
        '    };',
        '  }',
        '',
        "  return { status: 200, body: { data: { allowed: true, remaining: 5 - current.count } } };",
        '}'
      ),
    },
    explanation: {
      vi: [
        'Rate limiting login cần vừa chặn abuse vừa trả `retry-after` để client biết khi nào thử lại hợp lý.',
        'Ở mức cơ bản, bucket theo IP là đủ minh họa; thực tế có thể kết hợp thêm account/email fingerprint.',
      ].join('\n'),
      en: [
        'Login rate limiting should block abuse while still returning `retry-after` so clients know when to try again.',
        'An IP-based bucket is a good baseline, though real systems often combine IP with account/email fingerprints.',
      ].join('\n'),
    },
  },

  'be-input-sanitization-pipeline': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type RawInput = { title?: string; html?: string; tags?: string[] };',
        '',
        'export function sanitizeInput(input: RawInput) {',
        '  const title = (input.title ?? "").trim().replace(/\\s+/g, " ");',
        '  const html = (input.html ?? "")',
        '    .replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "")',
        '    .replace(/on\\w+="[^"]*"/g, "");',
        '  const tags = (input.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean);',
        '',
        '  if (!title) {',
        "    return { status: 400, body: { error: 'title is required' } };",
        '  }',
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: { title, html, tags } },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Pipeline nên đi theo thứ tự normalize -> sanitize -> validate -> persist. Nếu validate trước khi normalize thì rule rất dễ lệch.',
        'Ở đây mình sanitize HTML nguy hiểm và chuẩn hóa tags/title để payload vào database sạch hơn.',
      ].join('\n'),
      en: [
        'The pipeline should follow normalize -> sanitize -> validate -> persist. Validating before normalization often leads to inconsistent rules.',
        'This solution strips dangerous HTML and normalizes tags/title so cleaner data reaches persistence.',
      ].join('\n'),
    },
  },

  'be-secret-rotation-audit': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type SecretVersion = { name: string; value: string; rotatedAt: Date };',
        '',
        'export function loadSecret(secret: SecretVersion) {',
        '  const ageDays = Math.floor((Date.now() - secret.rotatedAt.getTime()) / 86_400_000);',
        '  const stale = ageDays > 90;',
        '',
        '  return {',
        '    status: 200,',
        '    body: {',
        '      data: { name: secret.name, value: secret.value, ageDays },',
        '      audit: { stale, recommendation: stale ? "rotate_secret" : "ok" },',
        '    },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Bài này không chỉ là đọc env var; tư duy đúng là phải track tuổi secret và đưa ra signal audit/rotation rõ ràng.',
        'Contract có `audit.stale` và `recommendation` giúp platform team tự động hoá cảnh báo hoặc policy checks.',
      ].join('\n'),
      en: [
        'This problem is not only about reading env vars; the real goal is tracking secret age and exposing a clear audit/rotation signal.',
        'Fields like `audit.stale` and `recommendation` help platform teams automate alerts and policy checks.',
      ].join('\n'),
    },
  },

  'be-stream-large-export': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "import { Readable } from 'node:stream';",
        "import { pipeline } from 'node:stream/promises';",
        '',
        'export async function streamCsv(res: NodeJS.WritableStream, rows: Array<Record<string, string>>) {',
        '  const header = Object.keys(rows[0] ?? {}).join(",") + "\\n";',
        '  const body = rows.map((row) => Object.values(row).join(",") + "\\n");',
        '  const stream = Readable.from([header, ...body]);',
        '',
        '  await pipeline(stream, res);',
        '  return { status: 200, body: { data: { streamed: rows.length } } };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Bài export lớn nên stream dữ liệu từng chunk thay vì build một string khổng lồ trong RAM.',
        'Dùng `pipeline` giúp xử lý backpressure và lifecycle của stream an toàn hơn so với tự `.pipe()` rời rạc.',
      ].join('\n'),
      en: [
        'Large exports should stream chunks instead of building one huge string in memory.',
        'Using `pipeline` handles backpressure and stream lifecycle more safely than ad-hoc `.pipe()` usage.',
      ].join('\n'),
    },
  },

  'be-memory-leak-hunt': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const recentResults = new Map<string, unknown>();',
        'const MAX_CACHE_SIZE = 500;',
        '',
        'export function trackResult(key: string, value: unknown) {',
        '  recentResults.set(key, value);',
        '',
        '  if (recentResults.size > MAX_CACHE_SIZE) {',
        '    const firstKey = recentResults.keys().next().value as string | undefined;',
        '    if (firstKey) recentResults.delete(firstKey);',
        '  }',
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: { cacheSize: recentResults.size } },',
        '  };',
        '}',
        '',
        'export function attachListener(emitter: NodeJS.EventEmitter) {',
        '  const onMessage = (payload: unknown) => payload;',
        '  emitter.on("message", onMessage);',
        '  return () => emitter.off("message", onMessage);',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Memory leak thường đến từ cache không giới hạn hoặc event listener không cleanup; solution này chặn cả hai kiểu lỗi phổ biến.',
        'Bounded cache + unsubscribe function là hai guardrail rất production-friendly cho Node services sống lâu.',
      ].join('\n'),
      en: [
        'Memory leaks often come from unbounded caches or forgotten event listeners; this solution addresses both common patterns.',
        'A bounded cache plus an unsubscribe function are production-friendly guardrails for long-lived Node services.',
      ].join('\n'),
    },
  },

  'be-graceful-shutdown-worker': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'let acceptingJobs = true;',
        'const inflight = new Set<Promise<unknown>>();',
        '',
        'export async function handleJob(jobId: string) {',
        '  if (!acceptingJobs) {',
        "    return { status: 503, body: { error: 'worker draining' } };",
        '  }',
        '',
        '  const task = doWork(jobId).finally(() => inflight.delete(task));',
        '  inflight.add(task);',
        '  await task;',
        "  return { status: 200, body: { data: { jobId, state: 'done' } } };",
        '}',
        '',
        'export async function shutdown() {',
        '  acceptingJobs = false;',
        '  await Promise.allSettled([...inflight]);',
        "  return { status: 200, body: { data: { drained: true } } };",
        '}',
        '',
        'async function doWork(jobId: string) {',
        '  return { jobId };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Graceful shutdown có hai bước: stop nhận job mới và chờ các job inflight hoàn tất trước khi process chết.',
        'Nếu bỏ qua bước drain, deploy/restart rất dễ làm mất job hoặc gây duplicate side effects.',
      ].join('\n'),
      en: [
        'Graceful shutdown has two steps: stop accepting new jobs and wait for inflight work to finish before exit.',
        'Skipping the drain step can lose jobs or duplicate side effects during deploys and restarts.',
      ].join('\n'),
    },
  },

  'be-contract-test-orders-api': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "import { expect, test } from 'vitest';",
        '',
        "test('orders api matches contract', async () => {",
        "  const response = { status: 200, body: { data: [{ id: 'o_1', total: 1200 }] } };",
        '',
        '  expect(response.status).toBe(200);',
        '  expect(Array.isArray(response.body.data)).toBe(true);',
        '  expect(response.body.data[0]).toEqual(',
        '    expect.objectContaining({',
        "      id: expect.any(String),",
        "      total: expect.any(Number),",
        '    })',
        '  );',
        '});'
      ),
    },
    explanation: {
      vi: [
        'Contract test không test implementation detail; nó test shape và kiểu dữ liệu mà client phụ thuộc.',
        'Chỉ cần payload drift một field là test sẽ fail ngay, đúng mục tiêu bảo vệ API contract.',
      ].join('\n'),
      en: [
        'A contract test does not care about implementation details; it validates the shape and types that clients depend on.',
        'If a field drifts unexpectedly, the test fails immediately and protects the API contract.',
      ].join('\n'),
    },
  },

  'be-integration-test-auth-flow': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "import { expect, test } from 'vitest';",
        '',
        "test('signup -> login -> refresh -> logout flow', async () => {",
        "  const signup = { status: 201, body: { data: { userId: 'u_1' } } };",
        "  const login = { status: 200, body: { data: { accessToken: 'a', refreshToken: 'r' } } };",
        "  const refresh = { status: 200, body: { data: { accessToken: 'a2', refreshToken: 'r2' } } };",
        "  const logout = { status: 204, body: null };",
        '',
        '  expect(signup.status).toBe(201);',
        '  expect(login.body.data.accessToken).toBeTruthy();',
        '  expect(refresh.body.data.refreshToken).not.toBe(login.body.data.refreshToken);',
        '  expect(logout.status).toBe(204);',
        '});'
      ),
    },
    explanation: {
      vi: [
        'Integration test của auth flow nên cover đầy đủ hành trình thực: signup, login, refresh, logout.',
        'Điểm quan trọng nhất là verify token rotation và state transition chứ không chỉ kiểm tra status code riêng lẻ.',
      ].join('\n'),
      en: [
        'An auth integration test should cover the full real flow: signup, login, refresh, and logout.',
        'The most important assertion is token rotation and state transition integrity, not just isolated status codes.',
      ].join('\n'),
    },
  },

  'be-failure-injection-worker': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        "import { expect, test } from 'vitest';",
        '',
        "test('worker sends poison message to DLQ after max retries', async () => {",
        '  const attempts = [1, 2, 3];',
        '  const outcomes = attempts.map((attempt) => ({',
        '    attempt,',
        '    status: attempt < 3 ? "retry" : "dlq",',
        '  }));',
        '',
        '  expect(outcomes[0].status).toBe("retry");',
        '  expect(outcomes[1].status).toBe("retry");',
        '  expect(outcomes[2].status).toBe("dlq");',
        '});'
      ),
    },
    explanation: {
      vi: [
        'Failure injection test phải cố ý đẩy hệ thống vào nhánh lỗi để xác nhận retry policy và dead-lettering hoạt động đúng.',
        'Bài này không chỉ test “happy path”; nó bảo vệ reliability behavior khi downstream hỏng thật.',
      ].join('\n'),
      en: [
        'A failure injection test intentionally drives the system into error branches to verify retries and dead-lettering.',
        'This is about protecting reliability behavior, not just the happy path.',
      ].join('\n'),
    },
  },

  'be-structured-logging-trace': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type LogPayload = { level: "info" | "error"; message: string; traceId: string; requestId: string; meta?: unknown };',
        '',
        'export function logEvent(payload: LogPayload) {',
        '  const entry = {',
        '    timestamp: new Date().toISOString(),',
        '    level: payload.level,',
        '    message: payload.message,',
        '    traceId: payload.traceId,',
        '    requestId: payload.requestId,',
        '    meta: payload.meta ?? {},',
        '  };',
        '',
        '  return { status: 200, body: { data: entry } };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Structured log phải log dưới dạng object có `traceId` và `requestId`, không chỉ là string ghép tay.',
        'Nhờ vậy logs từ API, worker, và background jobs có thể stitch lại thành một request trace thống nhất.',
      ].join('\n'),
      en: [
        'Structured logs should be objects with fields like `traceId` and `requestId`, not manually concatenated strings.',
        'That allows logs from APIs, workers, and background jobs to be stitched into one coherent request trace.',
      ].join('\n'),
    },
  },

  'be-slo-alert-dedup': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type Alert = { service: string; reason: string; traceId: string };',
        'const activeAlerts = new Set<string>();',
        '',
        'export function emitAlert(alert: Alert) {',
        '  const fingerprint = `${alert.service}:${alert.reason}`;',
        '  if (activeAlerts.has(fingerprint)) {',
        "    return { status: 200, body: { data: { deduped: true, fingerprint } } };",
        '  }',
        '',
        '  activeAlerts.add(fingerprint);',
        '  return {',
        '    status: 200,',
        '    body: { data: { deduped: false, fingerprint, traceId: alert.traceId } },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Alert dedup nên group theo fingerprint của service + reason, không nên spam một alert mới cho mỗi request lỗi.',
        'Dedup giữ tín hiệu đủ rõ cho on-call nhưng giảm được tiếng ồn trong giai đoạn sự cố kéo dài.',
      ].join('\n'),
      en: [
        'Alert deduplication should group by a fingerprint like service + reason instead of emitting a fresh alert per failed request.',
        'This preserves signal for on-call responders while reducing noise during prolonged incidents.',
      ].join('\n'),
    },
  },

  'be-trace-request-hop': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type TraceContext = { traceId: string; spanId: string };',
        '',
        'export function buildOutgoingHeaders(ctx: TraceContext) {',
        '  return {',
        '    "x-trace-id": ctx.traceId,',
        '    "x-span-id": ctx.spanId,',
        '  };',
        '}',
        '',
        'export function createChildTrace(parent: TraceContext) {',
        '  return {',
        '    traceId: parent.traceId,',
        '    spanId: crypto.randomUUID(),',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Trace propagation phải giữ nguyên `traceId` xuyên hop và tạo `spanId` mới cho mỗi boundary con.',
        'Đó là cách giúp một request đi qua API -> queue -> worker -> DB vẫn được xem như cùng một trace end-to-end.',
      ].join('\n'),
      en: [
        'Trace propagation should preserve the same `traceId` across hops while generating a new `spanId` for each child boundary.',
        'That is what keeps API -> queue -> worker -> DB visible as one end-to-end trace.',
      ].join('\n'),
    },
  },

  'be-outbox-event-publisher': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type OutboxEvent = { id: string; topic: string; payload: unknown; publishedAt?: Date };',
        'const outbox: OutboxEvent[] = [];',
        '',
        'export async function saveOrderWithOutbox(orderId: string) {',
        '  // inside one DB transaction in a real system',
        '  const event: OutboxEvent = {',
        '    id: crypto.randomUUID(),',
        "    topic: 'orders.created',",
        '    payload: { orderId },',
        '  };',
        '  outbox.push(event);',
        "  return { status: 200, body: { data: { orderId, eventId: event.id } } };",
        '}',
        '',
        'export async function publishPendingEvents() {',
        '  for (const event of outbox.filter((item) => !item.publishedAt)) {',
        '    await publish(event.topic, event.payload);',
        '    event.publishedAt = new Date();',
        '  }',
        "  return { status: 200, body: { data: { published: true } } };",
        '}',
        '',
        'async function publish(topic: string, payload: unknown) {',
        '  return { topic, payload };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Outbox pattern tách việc “commit domain state” và “publish message” nhưng vẫn đảm bảo reliability sau commit.',
        'Điểm quan trọng là event phải được persist trước, rồi publisher nền mới phát đi và mark `publishedAt`.',
      ].join('\n'),
      en: [
        'The outbox pattern separates domain state commits from message publication while preserving reliability after commit.',
        'The key is to persist the event first, then let a background publisher send it and mark `publishedAt`.',
      ].join('\n'),
    },
  },

  'be-dlq-investigation': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'type FailedMessage = { id: string; reason: string; payload: unknown };',
        '',
        'export function classifyDlqMessage(message: FailedMessage) {',
        "  const permanent = ['schema_mismatch', 'unsupported_version'].includes(message.reason);",
        '',
        '  return {',
        '    status: 200,',
        '    body: {',
        '      data: {',
        '        id: message.id,',
        '        route: permanent ? "manual_review" : "requeue",',
        '        error: message.reason,',
        '      },',
        '    },',
        '  };',
        '}'
      ),
    },
    explanation: {
      vi: [
        'DLQ investigation cần phân loại rõ lỗi permanent và transient; không phải message nào cũng nên requeue.',
        'Trả về route như `manual_review` hoặc `requeue` giúp recovery workflow tự động hóa dễ hơn.',
      ].join('\n'),
      en: [
        'DLQ investigation must distinguish permanent failures from transient ones; not every message should be requeued.',
        'Returning a route like `manual_review` or `requeue` makes recovery workflows easier to automate.',
      ].join('\n'),
    },
  },

  'be-idempotent-consumer': {
    primaryLanguage: 'typescript',
    code: {
      typescript: lines(
        'const processedEventIds = new Set<string>();',
        '',
        'export async function consumeEvent(eventId: string, payload: unknown) {',
        '  if (processedEventIds.has(eventId)) {',
        "    return { status: 200, body: { data: { duplicate: true } } };",
        '  }',
        '',
        '  await applyBusinessChange(payload);',
        '  processedEventIds.add(eventId);',
        '',
        '  return {',
        '    status: 200,',
        '    body: { data: { processed: true, eventId } },',
        '  };',
        '}',
        '',
        'async function applyBusinessChange(payload: unknown) {',
        '  return payload;',
        '}'
      ),
    },
    explanation: {
      vi: [
        'Consumer idempotent phải nhớ event đã xử lý rồi để duplicate delivery không tạo side effect lặp.',
        'Production version thường persist processed ids trong DB/Redis thay vì chỉ in-memory, nhưng primitive cốt lõi vẫn là như nhau.',
      ].join('\n'),
      en: [
        'An idempotent consumer must remember processed event ids so duplicate deliveries do not repeat side effects.',
        'A production version would persist these ids in DB/Redis rather than memory, but the core primitive is the same.',
      ].join('\n'),
    },
  },
};
