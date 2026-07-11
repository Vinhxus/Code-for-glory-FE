import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './Survey.css';
import {
  completeSurvey,
  runSkillTestQuestion,
  saveCareerPath,
  saveDiscipline,
  startSkillTest,
  submitSkillTest,
  type CareerField,
  type CodingProblem,
  type DisciplineLevel,
  type LearningGoal,
  type MilestoneTestPreference,
  type QuestionGrade,
  type SkillLevel,
  type SkillTestStartResponse,
  type SkillTestRunResult,
} from '../services/surveyApi';
import { useSettingsStore, type AppLanguage } from '../store/settings';

type Bilingual = { vi: string; en: string };
type BilingualOption<T extends string> = {
  id: T;
  title: Bilingual;
  sub?: Bilingual;
  detail?: Bilingual;
};

const FIELD_OPTIONS: BilingualOption<CareerField>[] = [
  {
    id: 'frontend',
    title: { vi: 'Frontend', en: 'Frontend' },
    sub: {
      vi: 'UI, React, browser, trải nghiệm người dùng',
      en: 'UI, React, browser, and user experience',
    },
  },
  {
    id: 'backend',
    title: { vi: 'Backend', en: 'Backend' },
    sub: {
      vi: 'API, database, auth, xử lý dữ liệu',
      en: 'API, database, auth, and data processing',
    },
  },
  {
    id: 'fullstack',
    title: { vi: 'Fullstack', en: 'Fullstack' },
    sub: {
      vi: 'Kết hợp workflow frontend và backend',
      en: 'A combined frontend and backend workflow',
    },
  },
];

const GOAL_OPTIONS: BilingualOption<LearningGoal>[] = [
  { id: 'get_job', title: { vi: 'Xin việc', en: 'Get a job' } },
  {
    id: 'personal_project',
    title: { vi: 'Làm sản phẩm cá nhân', en: 'Build personal projects' },
  },
  { id: 'competition', title: { vi: 'Thi đấu / contest', en: 'Compete / contests' } },
  { id: 'explore_ai', title: { vi: 'Khám phá AI', en: 'Explore AI' } },
];

const LEVEL_OPTIONS: BilingualOption<SkillLevel>[] = [
  {
    id: 'novice',
    title: { vi: 'Novice', en: 'Novice' },
    sub: { vi: 'Mới bắt đầu', en: 'Just getting started' },
    detail: {
      vi: 'Bài test tập trung vào thao tác mảng, string và object cơ bản.',
      en: 'The test focuses on basic array, string, and object manipulation.',
    },
  },
  {
    id: 'apprentice',
    title: { vi: 'Apprentice', en: 'Apprentice' },
    sub: { vi: 'Đã biết nền tảng', en: 'Knows the foundations' },
    detail: {
      vi: 'Bài test kiểm tra tư duy chuẩn hóa dữ liệu và xử lý input thực tế.',
      en: 'The test checks data normalization and practical input handling.',
    },
  },
  {
    id: 'journeyman',
    title: { vi: 'Journeyman', en: 'Journeyman' },
    sub: { vi: 'Code khá vững', en: 'Comfortable with coding' },
    detail: {
      vi: 'Bài test yêu cầu tổng hợp dữ liệu và tổ chức logic rõ ràng.',
      en: 'The test requires data aggregation and well-structured logic.',
    },
  },
  {
    id: 'master',
    title: { vi: 'Master', en: 'Master' },
    sub: { vi: 'Kinh nghiệm tốt', en: 'Experienced' },
    detail: {
      vi: 'Bài test mô phỏng các tình huống merge dữ liệu và xử lý nhiều quy tắc.',
      en: 'The test simulates data merge scenarios and multi-rule handling.',
    },
  },
];

const RANDOM_CHALLENGE_COUNT = 5;

const LEVEL_CHALLENGE_COUNT: Record<SkillLevel, number> = {
  novice: RANDOM_CHALLENGE_COUNT,
  apprentice: RANDOM_CHALLENGE_COUNT,
  journeyman: RANDOM_CHALLENGE_COUNT,
  master: RANDOM_CHALLENGE_COUNT,
};

const LEVEL_POOL_SIZE_BY_FIELD: Record<CareerField, number> = {
  frontend: 10,
  backend: 10,
  fullstack: 20,
};

const TOTAL_STEPS = 4;

const ENTRY_LEVEL_LABELS: Record<AppLanguage, Record<string, string>> = {
  vi: {
    root: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
  en: {
    root: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
};

const TRACK_LABELS: Record<AppLanguage, Record<CareerField, string>> = {
  vi: {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
  },
  en: {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
  },
};

const DIFFICULTY_LABELS: Record<AppLanguage, Record<string, string>> = {
  vi: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },
  en: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },
};

const STATUS_LABELS = {
  vi: {
    pass: 'Pass',
    needsWork: 'Cần sửa',
    draft: 'Draft',
    samplePass: 'Sample pass',
    failing: 'Đang lỗi',
    passed: 'Passed',
    failed: 'Failed',
    noOutput: '(không có output)',
    wrongAnswer: 'Wrong answer',
    needsWorkBadge: 'Needs work',
  },
  en: {
    pass: 'Pass',
    needsWork: 'Needs work',
    draft: 'Draft',
    samplePass: 'Sample pass',
    failing: 'Failing',
    passed: 'Passed',
    failed: 'Failed',
    noOutput: '(no output)',
    wrongAnswer: 'Wrong answer',
    needsWorkBadge: 'Needs work',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

const SURVEY_COPY = {
  vi: {
    saveCareerPathError: 'Không thể lưu định hướng học tập',
    loadSkillTestError: 'Không thể tải bộ bài test kỹ năng',
    runSkillTestError: 'Không thể chạy sample test cho bài hiện tại',
    gradeSurveyError: 'Không thể chấm bài survey',
    saveDisciplineError: 'Không thể lưu thiết lập kỷ luật học',
    finishSurveyError: 'Không thể hoàn tất survey',
    step0Title: 'Chọn định hướng học tập',
    step0Desc:
      'Chọn track chính để hệ thống tạo bài survey coding phù hợp với nhu cầu của bạn.',
    goalLabel: 'Mục tiêu chính của bạn là gì?',
    cancel: 'Hủy',
    saving: 'Đang lưu...',
    continue: 'Tiếp tục',
    step1Title: 'Đánh giá kỹ năng bằng code',
    step1Desc:
      'Chọn level tự đánh giá của bạn. Hệ thống sẽ tạo bộ bài survey coding theo đúng level và track bạn vừa chọn.',
    step1Hint:
      'Mỗi level có một ngân hàng bài riêng. Mỗi lần bắt đầu, hệ thống sẽ bốc ngẫu nhiên 5 bài để tránh học tủ và giữ trải nghiệm mới.',
    challengeUnit: 'bài',
    randomPickLabel: 'Random set',
    poolSizeLabel: 'Ngân hàng level',
    randomRuleLabel: 'Cách chọn',
    randomRuleValue: 'Random 5 bài',
    reshuffle: 'Bốc bộ khác',
    poolFallbackHint:
      'Một số bài được lấy thêm từ level lân cận để đủ số lượng cần giao.',
    workspaceTitle: 'Survey coding workspace',
    back: 'Quay lại',
    preparing: 'Đang chuẩn bị...',
    startCoding: 'Bắt đầu coding test',
    resultTitle: 'Kết quả skill survey',
    resultDesc: 'Điểm này được tính từ toàn bộ test case công khai và ẩn.',
    entryLevel: 'Entry level',
    unlockedLearningPath: 'Learning path được mở sẵn',
    placementInsightBeginner:
      'Bạn sẽ bắt đầu từ Beginner stage. Các stage cao hơn sẽ tiếp tục khóa để lộ trình vừa sức hơn.',
    placementInsightIntermediate:
      'Bạn sẽ bắt đầu từ Intermediate stage. Toàn bộ stage Beginner sẽ được đánh dấu đã hoàn thành trong learning path cho cả Frontend và Backend.',
    placementInsightAdvanced:
      'Bạn sẽ bắt đầu từ Advanced stage. Toàn bộ stage Beginner và Intermediate sẽ được đánh dấu đã hoàn thành trong learning path cho cả Frontend và Backend.',
    problemLabel: 'Bài',
    testCasePass: 'Test case pass',
    redoTest: 'Làm lại phần test',
    track: 'Track',
    selectedLevel: 'Level chọn',
    sampleProgress: 'Tiến độ sample',
    challengeCount: 'Số challenge',
    workspaceIntro:
      'Mỗi bài đều dùng Monaco editor như phần Practice. Bạn có thể chạy sample test từng bài trước khi nộp toàn bộ lời giải.',
    surveyProblemList: 'Danh sách bài survey',
    description: 'Description',
    testcases: 'Testcases',
    minutes: 'phút',
    implementationTitle: 'Yêu cầu triển khai',
    implementationBody:
      'Hoàn thiện hàm `solve()`. Ưu tiên lời giải rõ ràng, đúng với sample test và ổn định khi chấm hidden test.',
    noteTitle: 'Lưu ý',
    noteBody:
      'Khi bấm `Chạy code`, hệ thống chỉ chạy sample test công khai. Khi bấm `Nộp tất cả lời giải`, backend sẽ chấm toàn bộ test case.',
    noPublicSample: 'Bài này chưa có sample test công khai.',
    monacoEditor: 'Monaco editor',
    requiredFunction: 'Hàm bắt buộc',
    resetStarter: 'Reset starter',
    testcase: 'Testcase',
    testResult: 'Test Result',
    caseLabel: 'Trường hợp',
    noPublicSampleForThis: 'Chưa có sample test công khai cho bài này.',
    sampleTestPass: 'sample test pass',
    input: 'Input',
    expected: 'Expected',
    actual: 'Actual',
    error: 'Error',
    runCurrentToSee: 'Chạy bài hiện tại để xem kết quả từng testcase.',
    changeLevel: 'Đổi level',
    running: 'Đang chạy...',
    runCode: 'Chạy code',
    grading: 'Đang chấm...',
    submitAll: 'Nộp tất cả lời giải',
    step2Title: 'Thiết lập nhịp học',
    step2Desc:
      'Chọn khung học mỗi ngày để roadmap và milestone phù hợp hơn với cường độ bạn muốn theo.',
    dailyHours: 'Số giờ học mỗi ngày (1–24)',
    focusWindow: 'Khung giờ tập trung',
    milestoneLabel: 'Kiểu milestone bạn muốn',
    disciplineLabel: 'Mức độ kỷ luật',
    step3Title: 'Hoàn tất onboarding survey',
    step3Desc:
      'Hệ thống đã có đủ dữ liệu để khởi tạo lộ trình học cá nhân hóa cho bạn.',
    finishing: 'Đang hoàn tất...',
    startLearning: 'Bắt đầu học',
    project: 'Project',
    projectSub: 'Xây một sản phẩm nhỏ',
    battle: 'Battle',
    battleSub: 'Đấu bài và phản xạ nhanh',
    light: 'Light',
    lightSub: 'Nhắc nhở nhẹ và giữ nhịp học ổn định',
    strict: 'Strict',
    strictSub: 'Siết milestone chặt hơn khi làm chưa tốt',
  },
  en: {
    saveCareerPathError: 'Could not save your learning direction',
    loadSkillTestError: 'Could not load the skill test set',
    runSkillTestError: 'Could not run sample tests for this problem',
    gradeSurveyError: 'Could not grade the survey',
    saveDisciplineError: 'Could not save your study discipline settings',
    finishSurveyError: 'Could not complete the survey',
    step0Title: 'Choose your learning direction',
    step0Desc:
      'Choose your main track so the system can generate survey coding tasks that match your goals.',
    goalLabel: 'What is your main goal?',
    cancel: 'Cancel',
    saving: 'Saving...',
    continue: 'Continue',
    step1Title: 'Skill assessment by coding',
    step1Desc:
      'Pick your self-assessed level. The system will generate survey coding tasks based on that level and the track you selected.',
    step1Hint:
      'Each level has its own bank. Every time you start, the system draws 5 random problems so the experience stays fresh and harder to memorize.',
    challengeUnit: 'tasks',
    randomPickLabel: 'Random set',
    poolSizeLabel: 'Level pool',
    randomRuleLabel: 'Selection',
    randomRuleValue: 'Random 5 problems',
    reshuffle: 'Draw another set',
    poolFallbackHint:
      'Some problems were borrowed from nearby levels to fill the requested set.',
    workspaceTitle: 'Survey coding workspace',
    back: 'Back',
    preparing: 'Preparing...',
    startCoding: 'Start coding test',
    resultTitle: 'Survey skill result',
    resultDesc: 'This score is computed from both public and hidden test cases.',
    entryLevel: 'Entry level',
    unlockedLearningPath: 'Pre-unlocked in learning path',
    placementInsightBeginner:
      'You will start from the Beginner stage. Higher stages stay locked so the roadmap remains appropriately paced.',
    placementInsightIntermediate:
      'You will start from the Intermediate stage. The full Beginner stage will be marked completed across both Frontend and Backend learning paths.',
    placementInsightAdvanced:
      'You will start from the Advanced stage. The full Beginner and Intermediate stages will be marked completed across both Frontend and Backend learning paths.',
    problemLabel: 'Problem',
    testCasePass: 'Test cases passed',
    redoTest: 'Retake this test section',
    track: 'Track',
    selectedLevel: 'Selected level',
    sampleProgress: 'Sample progress',
    challengeCount: 'Challenge count',
    workspaceIntro:
      'Each problem uses a Monaco editor like the Practice page. You can run public sample tests before submitting all solutions.',
    surveyProblemList: 'Survey problem list',
    description: 'Description',
    testcases: 'Testcases',
    minutes: 'min',
    implementationTitle: 'Implementation requirements',
    implementationBody:
      'Complete the `solve()` function. Prefer a clear solution that passes sample tests and remains stable on hidden grading.',
    noteTitle: 'Note',
    noteBody:
      'When you click `Run code`, the system only executes the public sample tests. When you click `Submit all solutions`, the backend grades all test cases.',
    noPublicSample: 'This problem does not have public sample tests yet.',
    monacoEditor: 'Monaco editor',
    requiredFunction: 'Required function',
    resetStarter: 'Reset starter',
    testcase: 'Testcase',
    testResult: 'Test Result',
    caseLabel: 'Case',
    noPublicSampleForThis: 'No public sample tests are available for this problem.',
    sampleTestPass: 'sample tests passed',
    input: 'Input',
    expected: 'Expected',
    actual: 'Actual',
    error: 'Error',
    runCurrentToSee: 'Run the current problem to see per-testcase results.',
    changeLevel: 'Change level',
    running: 'Running...',
    runCode: 'Run code',
    grading: 'Grading...',
    submitAll: 'Submit all solutions',
    step2Title: 'Set your study rhythm',
    step2Desc:
      'Choose your daily study window so the roadmap and milestones match the pace you want to follow.',
    dailyHours: 'Hours per day (1–24)',
    focusWindow: 'Focus time window',
    milestoneLabel: 'Preferred milestone type',
    disciplineLabel: 'Discipline level',
    step3Title: 'Finish onboarding survey',
    step3Desc:
      'The system now has enough information to create a personalized learning path for you.',
    finishing: 'Finishing...',
    startLearning: 'Start learning',
    project: 'Project',
    projectSub: 'Build a small product',
    battle: 'Battle',
    battleSub: 'Compete with coding reflex and speed',
    light: 'Light',
    lightSub: 'Gentle reminders and a steady learning pace',
    strict: 'Strict',
    strictSub: 'Tighter milestone enforcement when performance drops',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

const LOCALIZED_SURVEY_PROBLEMS: Record<
  string,
  {
    title: Bilingual;
    content: Bilingual;
    explanations?: Record<number, Bilingual>;
  }
> = {
  '66f000000000000000000101': {
    title: { vi: 'Normalize Button Labels', en: 'Normalize Button Labels' },
    content: {
      vi: 'Viết `solve(labels)` nhận vào một mảng string và trả về một mảng mới.\n\nYêu cầu:\n- trim khoảng trắng đầu/cuối\n- bỏ phần tử rỗng sau khi trim\n- chuyển toàn bộ label sang lowercase\n- giữ nguyên thứ tự phần tử hợp lệ',
      en: 'Write `solve(labels)` which receives an array of strings and returns a new array.\n\nRequirements:\n- trim leading and trailing spaces\n- remove empty items after trimming\n- convert each valid label to lowercase\n- keep the original order of valid items',
    },
    explanations: {
      0: {
        vi: 'Loại bỏ khoảng trắng và phần tử rỗng.',
        en: 'Remove surrounding spaces and discard empty values.',
      },
    },
  },
  '66f000000000000000000102': {
    title: { vi: 'Build Filter Summary', en: 'Build Filter Summary' },
    content: {
      vi: 'Viết `solve(filters)` nhận vào object filter và trả về object summary.\n\nInput ví dụ:\n`{ search: " react ", tags: ["ui", "", "hooks"], page: 3 }`\n\nOutput mong muốn:\n`{ query: "react", activeTagCount: 2, page: 3, hasActiveFilters: true }`\n\nQuy tắc:\n- `query` = chuỗi search sau khi trim\n- `activeTagCount` = số tag không rỗng\n- `page` = số page hợp lệ, mặc định 1 nếu thiếu hoặc <= 0\n- `hasActiveFilters` = true nếu có query hoặc có ít nhất 1 tag hợp lệ',
      en: 'Write `solve(filters)` which receives a filter object and returns a summary object.\n\nExample input:\n`{ search: " react ", tags: ["ui", "", "hooks"], page: 3 }`\n\nExpected output:\n`{ query: "react", activeTagCount: 2, page: 3, hasActiveFilters: true }`\n\nRules:\n- `query` is the trimmed search string\n- `activeTagCount` is the number of non-empty tags\n- `page` must be a valid positive number, default to 1 when missing or <= 0\n- `hasActiveFilters` is true when there is a query or at least one valid tag',
    },
    explanations: {
      0: {
        vi: 'Có search, có 2 tag hợp lệ và page = 3.',
        en: 'There is a query, 2 valid tags, and page = 3.',
      },
    },
  },
  '66f000000000000000000103': {
    title: { vi: 'Compose Lesson Progress Snapshot', en: 'Compose Lesson Progress Snapshot' },
    content: {
      vi: 'Viết `solve(lessons)` nhận vào mảng lesson có dạng `{ id, status, durationMinutes }`.\n\nTrả về object `{ totalLessons, completedLessons, inProgressLessons, totalMinutes, completionRate }`.\n\nQuy tắc:\n- `completedLessons` = số lesson có `status === "completed"`\n- `inProgressLessons` = số lesson có `status === "in_progress"`\n- `totalMinutes` = tổng `durationMinutes` hợp lệ (> 0)\n- `completionRate` = làm tròn phần trăm hoàn thành từ 0 đến 100',
      en: 'Write `solve(lessons)` which receives an array of lesson objects in the form `{ id, status, durationMinutes }`.\n\nReturn `{ totalLessons, completedLessons, inProgressLessons, totalMinutes, completionRate }`.\n\nRules:\n- `completedLessons` is the number of lessons with `status === "completed"`\n- `inProgressLessons` is the number of lessons with `status === "in_progress"`\n- `totalMinutes` is the sum of valid `durationMinutes` values (> 0)\n- `completionRate` is the rounded completion percentage from 0 to 100',
    },
    explanations: {
      0: {
        vi: 'Tính đủ số lượng lesson, tổng thời gian và phần trăm hoàn thành.',
        en: 'Count the lessons, total time, and the completion percentage.',
      },
    },
  },
  '66f000000000000000000104': {
    title: { vi: 'Merge Notification Feed', en: 'Merge Notification Feed' },
    content: {
      vi: 'Viết `solve(currentItems, incomingItems)` để merge hai mảng notification.\n\nMỗi item có dạng `{ id, createdAt, read }`.\n\nYêu cầu:\n- giữ item duy nhất theo `id`\n- nếu cùng `id`, ưu tiên item từ `incomingItems`\n- sort giảm dần theo `createdAt`\n- trả về object `{ items, unreadCount }`',
      en: 'Write `solve(currentItems, incomingItems)` to merge two notification arrays.\n\nEach item has the form `{ id, createdAt, read }`.\n\nRequirements:\n- keep unique items by `id`\n- if the same `id` appears twice, prioritize the item from `incomingItems`\n- sort in descending order by `createdAt`\n- return `{ items, unreadCount }`',
    },
    explanations: {
      0: {
        vi: 'Item n2 từ incoming ghi đè item cũ và danh sách được sort giảm dần.',
        en: 'Item n2 from the incoming list overrides the old one and the result is sorted descending.',
      },
    },
  },
  '66f000000000000000000201': {
    title: { vi: 'Normalize Query Params', en: 'Normalize Query Params' },
    content: {
      vi: 'Viết `solve(query)` nhận vào object query params và trả về object chuẩn hóa.\n\nYêu cầu:\n- `page` và `limit` phải là số nguyên dương, mặc định `page = 1`, `limit = 20`\n- `search` là string đã trim\n- output: `{ page, limit, search }`',
      en: 'Write `solve(query)` which receives a query params object and returns a normalized object.\n\nRequirements:\n- `page` and `limit` must be positive integers, defaulting to `page = 1`, `limit = 20`\n- `search` must be a trimmed string\n- output: `{ page, limit, search }`',
    },
    explanations: {
      0: {
        vi: 'Query hợp lệ được parse sang kiểu đúng.',
        en: 'Valid query values are parsed into the correct types.',
      },
    },
  },
  '66f000000000000000000202': {
    title: { vi: 'Build API Response Envelope', en: 'Build API Response Envelope' },
    content: {
      vi: 'Viết `solve(input)` nhận vào object `{ ok, data, error, traceId }` và trả về response envelope chuẩn.\n\nQuy tắc:\n- nếu `ok === true` => `{ status: 200, body: { data, error: null, traceId } }`\n- nếu `ok === false` => `{ status: 400, body: { data: null, error, traceId } }`\n- nếu thiếu `traceId` thì dùng `"generated-trace"`',
      en: 'Write `solve(input)` which receives `{ ok, data, error, traceId }` and returns a standard response envelope.\n\nRules:\n- if `ok === true` => `{ status: 200, body: { data, error: null, traceId } }`\n- if `ok === false` => `{ status: 400, body: { data: null, error, traceId } }`\n- if `traceId` is missing, use `"generated-trace"`',
    },
    explanations: {
      0: {
        vi: 'Nhánh success giữ nguyên data và traceId.',
        en: 'The success branch keeps both data and traceId unchanged.',
      },
    },
  },
  '66f000000000000000000203': {
    title: { vi: 'Aggregate API Metrics', en: 'Aggregate API Metrics' },
    content: {
      vi: 'Viết `solve(requests)` nhận vào mảng request `{ path, durationMs, statusCode }`.\n\nTrả về object `{ totalRequests, averageDurationMs, errorCount, slowestPath }`.\n\nQuy tắc:\n- `averageDurationMs` = làm tròn số trung bình duration\n- `errorCount` = số request có `statusCode >= 400`\n- `slowestPath` = `path` của request có `durationMs` lớn nhất; nếu rỗng thì `""`',
      en: 'Write `solve(requests)` which receives an array of requests in the form `{ path, durationMs, statusCode }`.\n\nReturn `{ totalRequests, averageDurationMs, errorCount, slowestPath }`.\n\nRules:\n- `averageDurationMs` must be the rounded average duration\n- `errorCount` is the number of requests with `statusCode >= 400`\n- `slowestPath` is the `path` of the request with the highest `durationMs`; if the array is empty, return `""`',
    },
    explanations: {
      0: {
        vi: 'Tính trung bình duration, số lỗi và endpoint chậm nhất.',
        en: 'Compute the average duration, error count, and the slowest endpoint.',
      },
    },
  },
  '66f000000000000000000204': {
    title: { vi: 'Group Job Retries', en: 'Group Job Retries' },
    content: {
      vi: 'Viết `solve(jobs)` nhận vào mảng job `{ id, queue, attempts, maxAttempts }`.\n\nTrả về object:\n- `ready`: danh sách `id` có thể retry tiếp (`attempts < maxAttempts`)\n- `deadLetter`: danh sách `id` đã vượt quota retry\n- `summaryByQueue`: object đếm tổng số job theo từng queue',
      en: 'Write `solve(jobs)` which receives an array of jobs in the form `{ id, queue, attempts, maxAttempts }`.\n\nReturn:\n- `ready`: the list of `id`s that can still be retried (`attempts < maxAttempts`)\n- `deadLetter`: the list of `id`s that have exceeded the retry quota\n- `summaryByQueue`: an object that counts total jobs per queue',
    },
    explanations: {
      0: {
        vi: 'Phân loại retry và tổng hợp theo queue.',
        en: 'Classify retry states and aggregate counts by queue.',
      },
    },
  },
};

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function prettyEntryLevel(value: string | null, language: AppLanguage): string | null {
  if (!value) return null;
  return ENTRY_LEVEL_LABELS[language][value] ?? value;
}

function getUnlockedLearningPathLabels(
  value: string | null,
  language: AppLanguage,
): string[] {
  if (value === 'advanced') {
    return [
      ENTRY_LEVEL_LABELS[language].root,
      ENTRY_LEVEL_LABELS[language].intermediate,
    ];
  }
  if (value === 'intermediate') {
    return [ENTRY_LEVEL_LABELS[language].root];
  }
  return [];
}

function localize(label: Bilingual, language: AppLanguage) {
  return language === 'vi' ? label.vi : label.en;
}

function translateSurveyError(
  err: unknown,
  fallback: string,
  language: AppLanguage,
) {
  const message = errMsg(err, fallback);
  const knownMessages: Record<string, Bilingual> = {
    'No coding problems configured for this field yet': {
      vi: 'Chưa có bài survey coding phù hợp cho lựa chọn này.',
      en: 'No coding problems are configured for this selection yet.',
    },
    'Skill test has not been started': {
      vi: 'Bạn chưa bắt đầu skill test.',
      en: 'The skill test has not been started yet.',
    },
    'This coding problem has no runnable test cases': {
      vi: 'Bài code này hiện chưa có test case để chạy.',
      en: 'This coding problem does not have runnable test cases yet.',
    },
    'Career path not set': {
      vi: 'Bạn chưa hoàn tất bước chọn định hướng.',
      en: 'You have not completed the career path step yet.',
    },
    'Skill test not completed': {
      vi: 'Bạn chưa hoàn tất phần skill test.',
      en: 'You have not completed the skill test yet.',
    },
    'Discipline setup not completed': {
      vi: 'Bạn chưa hoàn tất phần thiết lập kỷ luật học.',
      en: 'You have not completed the discipline setup yet.',
    },
  };

  for (const [pattern, localized] of Object.entries(knownMessages)) {
    if (message.includes(pattern)) {
      return language === 'vi' ? localized.vi : localized.en;
    }
  }

  if (message.startsWith('Question ') && message.includes('is not part of this skill test')) {
    return language === 'vi'
      ? 'Bài hiện tại không thuộc bộ skill test đã được giao.'
      : 'This problem is not part of the assigned skill test.';
  }

  return message;
}

function localizeProblem(problem: CodingProblem, language: AppLanguage): CodingProblem {
  const override = LOCALIZED_SURVEY_PROBLEMS[problem._id];
  if (!override) return problem;

  return {
    ...problem,
    title: localize(override.title, language),
    content: localize(override.content, language),
    sampleTestCases: problem.sampleTestCases.map((testCase, index) => ({
      ...testCase,
      explanation: override.explanations?.[index]
        ? localize(override.explanations[index], language)
        : testCase.explanation,
    })),
  };
}

type SkillTestMeta = Pick<
  SkillTestStartResponse,
  | 'requestedLevel'
  | 'requestedQuestionCount'
  | 'deliveredQuestionCount'
  | 'poolSize'
  | 'poolBreakdown'
  | 'fallbackUsed'
>;

function formatPoolBreakdown(
  fieldFocus: CareerField | null,
  meta: SkillTestMeta | null,
  language: AppLanguage,
) {
  if (!fieldFocus) return '—';
  const poolSize = meta?.poolSize ?? LEVEL_POOL_SIZE_BY_FIELD[fieldFocus];
  const breakdown = meta?.poolBreakdown;

  if (fieldFocus !== 'fullstack') {
    return `${poolSize} ${language === 'vi' ? 'bài' : 'problems'}`;
  }

  const frontendCount = breakdown?.frontend ?? 10;
  const backendCount = breakdown?.backend ?? 10;

  return language === 'vi'
    ? `${poolSize} bài (${frontendCount} FE + ${backendCount} BE)`
    : `${poolSize} problems (${frontendCount} FE + ${backendCount} BE)`;
}

export default function Survey() {
  const navigate = useNavigate();
  const language = useSettingsStore((state) => state.language);
  const copy = SURVEY_COPY[language];
  const statusText = STATUS_LABELS[language];
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fieldFocus, setFieldFocus] = useState<CareerField | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);

  const [selfLevel, setSelfLevel] = useState<SkillLevel | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [code, setCode] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [entryLevel, setEntryLevel] = useState<string | null>(null);
  const [gradingDetails, setGradingDetails] = useState<QuestionGrade[]>([]);
  const [runResults, setRunResults] = useState<Record<string, SkillTestRunResult>>(
    {}
  );
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'description' | 'testcases'>(
    'description'
  );
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>(
    'testcase'
  );
  const [runningProblemId, setRunningProblemId] = useState<string | null>(null);

  const [dailyHours, setDailyHours] = useState(2);
  const [focusStart, setFocusStart] = useState('20:00');
  const [focusEnd, setFocusEnd] = useState('22:00');
  const [milestone, setMilestone] =
    useState<MilestoneTestPreference>('project');
  const [discipline, setDiscipline] = useState<DisciplineLevel>('light');
  const [skillTestMeta, setSkillTestMeta] = useState<SkillTestMeta | null>(null);

  const localizedProblems = useMemo(
    () => problems.map((problem) => localizeProblem(problem, language)),
    [language, problems],
  );

  const activeProblem = useMemo(
    () =>
      localizedProblems.find((problem) => problem._id === activeProblemId) ??
      localizedProblems[0],
    [activeProblemId, localizedProblems]
  );

  const activeRunResult = activeProblem ? runResults[activeProblem._id] : null;

  const progressText = useMemo(() => {
    const passed = problems.filter(
      (problem) => runResults[problem._id]?.status === 'Accepted'
    ).length;
    return `${passed}/${problems.length}`;
  }, [problems, runResults]);

  const challengeCount =
    skillTestMeta?.requestedQuestionCount ??
    LEVEL_CHALLENGE_COUNT[selfLevel ?? 'apprentice'] ??
    RANDOM_CHALLENGE_COUNT;
  const unlockedLearningPathLabels = useMemo(
    () => getUnlockedLearningPathLabels(entryLevel, language),
    [entryLevel, language],
  );
  const placementInsight = useMemo(() => {
    if (entryLevel === 'advanced') return copy.placementInsightAdvanced;
    if (entryLevel === 'intermediate') return copy.placementInsightIntermediate;
    return copy.placementInsightBeginner;
  }, [copy, entryLevel]);

  const submitCareerPath = async () => {
    if (!fieldFocus) return;
    setError('');
    setLoading(true);
    try {
      await saveCareerPath({
        fieldFocus,
        learningGoal: goal ?? undefined,
      });
      setStep(1);
    } catch (err) {
      setError(translateSurveyError(err, copy.saveCareerPathError, language));
    } finally {
      setLoading(false);
    }
  };

  const loadSkillTest = async () => {
    if (!fieldFocus || !selfLevel) return;
    setError('');
    setLoading(true);
    try {
      const res = await startSkillTest({
        fieldFocus,
        selfAssessedLevel: selfLevel,
        questionCount: LEVEL_CHALLENGE_COUNT[selfLevel],
      });
      setProblems(res.problems);
      setSkillTestMeta({
        requestedLevel: res.requestedLevel,
        requestedQuestionCount: res.requestedQuestionCount,
        deliveredQuestionCount: res.deliveredQuestionCount,
        poolSize: res.poolSize,
        poolBreakdown: res.poolBreakdown,
        fallbackUsed: res.fallbackUsed,
      });
      setCode(
        Object.fromEntries(res.problems.map((problem) => [problem._id, problem.starterCode]))
      );
      setActiveProblemId(res.problems[0]?._id ?? null);
      setRunResults({});
      setWorkspaceTab('description');
      setConsoleTab('testcase');
      setStartedAt(Date.now());
      setScore(null);
      setEntryLevel(null);
      setGradingDetails([]);
    } catch (err) {
      setError(translateSurveyError(err, copy.loadSkillTestError, language));
    } finally {
      setLoading(false);
    }
  };

  const runActiveProblem = async () => {
    if (!activeProblem) return;
    setError('');
    setRunningProblemId(activeProblem._id);
    try {
      const result = await runSkillTestQuestion({
        questionId: activeProblem._id,
        code: code[activeProblem._id] ?? '',
      });
      setRunResults((current) => ({
        ...current,
        [activeProblem._id]: result,
      }));
      setConsoleTab('result');
    } catch (err) {
      setError(translateSurveyError(err, copy.runSkillTestError, language));
    } finally {
      setRunningProblemId(null);
    }
  };

  const resetActiveProblemCode = () => {
    if (!activeProblem) return;
    setCode((current) => ({
      ...current,
      [activeProblem._id]: activeProblem.starterCode,
    }));
  };

  const submitTest = async () => {
    if (problems.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const totalTimeSeconds = startedAt
        ? Math.round((Date.now() - startedAt) / 1000)
        : undefined;
      const draft = await submitSkillTest(
        problems.map((problem) => ({
          questionId: problem._id,
          code: code[problem._id] ?? '',
        })),
        totalTimeSeconds
      );
      setScore(draft.technicalTestScore ?? 0);
      setEntryLevel(draft.computedEntryLevel ?? null);
      setGradingDetails(draft.technicalTestAnswers ?? []);
    } catch (err) {
      setError(translateSurveyError(err, copy.gradeSurveyError, language));
    } finally {
      setLoading(false);
    }
  };

  const submitDiscipline = async () => {
    setError('');
    setLoading(true);
    try {
      await saveDiscipline({
        dailyHours,
        focusTimeWindow: `${focusStart}-${focusEnd}`,
        milestoneTestPreference: milestone,
        disciplineLevel: discipline,
      });
      setStep(3);
    } catch (err) {
      setError(translateSurveyError(err, copy.saveDisciplineError, language));
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setError('');
    setLoading(true);
    try {
      await completeSurvey();
      navigate('/learning-path');
    } catch (err) {
      setError(translateSurveyError(err, copy.finishSurveyError, language));
    } finally {
      setLoading(false);
    }
  };

  const leaveWorkspace = () => {
    setProblems([]);
    setSkillTestMeta(null);
    setActiveProblemId(null);
    setRunResults({});
    setScore(null);
    setEntryLevel(null);
    setGradingDetails([]);
    setWorkspaceTab('description');
    setConsoleTab('testcase');
  };

  const problemStatus = (problemId: string) => {
    const finalGrade = gradingDetails.find((item) => item.questionId === problemId);
    if (finalGrade) {
      return finalGrade.isCorrect
        ? { label: statusText.pass, tone: 'success' as const }
        : { label: statusText.needsWork, tone: 'danger' as const };
    }

    const runResult = runResults[problemId];
    if (!runResult) {
      return { label: statusText.draft, tone: 'neutral' as const };
    }

    return runResult.status === 'Accepted'
      ? { label: statusText.samplePass, tone: 'success' as const }
      : { label: statusText.failing, tone: 'warning' as const };
  };

  return (
    <div className="sv-page">
      <div className="sv-shell">
        <div className="sv-steps">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`sv-step-pill ${index < step ? 'done' : index === step ? 'active' : ''
                }`}
            />
          ))}
        </div>

        <div className="sv-card">
          {error && <p className="sv-error">{error}</p>}

          {step === 0 && (
            <>
              <h1 className="sv-title">{copy.step0Title}</h1>
              <p className="sv-desc">{copy.step0Desc}</p>

              <div className="sv-options">
                {FIELD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${fieldFocus === option.id ? 'selected' : ''}`}
                    onClick={() => setFieldFocus(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">
                      {localize(option.title, language)}
                    </div>
                    <div className="sv-option-sub">
                      {option.sub ? localize(option.sub, language) : ''}
                    </div>
                  </button>
                ))}
              </div>

              <span className="sv-label">{copy.goalLabel}</span>
              <div className="sv-options">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${goal === option.id ? 'selected' : ''}`}
                    onClick={() => setGoal(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">
                      {localize(option.title, language)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => navigate('/')}
                  type="button"
                >
                  {copy.cancel}
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={!fieldFocus || loading}
                  onClick={submitCareerPath}
                  type="button"
                >
                  {loading ? copy.saving : copy.continue}
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="sv-title">{copy.step1Title}</h1>
              {problems.length === 0 ? (
                <>
                  <p className="sv-desc">{copy.step1Desc}</p>
                  <div className="sv-highlight">
                    <div className="sv-highlight-title">{copy.randomPickLabel}</div>
                    <p className="sv-highlight-text">{copy.step1Hint}</p>
                  </div>

                  <div className="sv-level-grid">
                    {LEVEL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`sv-level-card ${selfLevel === option.id ? 'selected' : ''
                          }`}
                        onClick={() => setSelfLevel(option.id)}
                        type="button"
                      >
                        <div className="sv-level-top">
                          <span className="sv-level-name">
                            {localize(option.title, language)}
                          </span>
                          <span className="sv-level-count">
                            {LEVEL_POOL_SIZE_BY_FIELD[fieldFocus ?? 'frontend']} {copy.challengeUnit}
                          </span>
                        </div>
                        <div className="sv-level-sub">
                          {option.sub ? localize(option.sub, language) : ''}
                        </div>
                        <div className="sv-level-detail">
                          {option.detail ? localize(option.detail, language) : ''}
                        </div>
                        <div className="sv-level-helper">
                          {copy.randomRuleValue}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="sv-highlight">
                    <div className="sv-highlight-title">{copy.workspaceTitle}</div>
                    <p className="sv-highlight-text">
                      {copy.poolSizeLabel}:{' '}
                      {formatPoolBreakdown(fieldFocus, null, language)}
                    </p>
                  </div>

                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={() => setStep(0)}
                      type="button"
                    >
                      {copy.back}
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      disabled={!selfLevel || loading}
                      onClick={loadSkillTest}
                      type="button"
                    >
                      {loading ? copy.preparing : copy.startCoding}
                    </button>
                  </div>
                </>
              ) : score !== null ? (
                <>
                  <div className="sv-result-hero">
                    <div className="sv-result-score">{score}%</div>
                    <div className="sv-result-copy">
                      <div className="sv-result-title">{copy.resultTitle}</div>
                      <div className="sv-result-sub">{copy.resultDesc}</div>
                      {prettyEntryLevel(entryLevel, language) && (
                        <div className="sv-entry-chip">
                          {copy.entryLevel}: {prettyEntryLevel(entryLevel, language)}
                        </div>
                      )}
                      <div className="sv-placement-copy">{placementInsight}</div>
                      {unlockedLearningPathLabels.length > 0 ? (
                        <div className="sv-placement-pill-row">
                          <span className="sv-placement-label">
                            {copy.unlockedLearningPath}
                          </span>
                          {unlockedLearningPathLabels.map((label) => (
                            <span className="sv-placement-pill" key={label}>
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="sv-grade-list">
                    {problems.map((problem, index) => {
                      const result = gradingDetails.find(
                        (item) => item.questionId === problem._id
                      );
                      return (
                        <div className="sv-grade-card" key={problem._id}>
                          <div className="sv-grade-top">
                            <div>
                              <div className="sv-grade-index">
                                {copy.problemLabel} {index + 1}
                              </div>
                              <div className="sv-grade-title">{problem.title}</div>
                            </div>
                            <div
                              className={`sv-grade-badge ${result?.isCorrect ? 'success' : 'fail'
                                }`}
                            >
                              {result?.isCorrect
                                ? statusText.passed
                                : statusText.needsWorkBadge}
                            </div>
                          </div>
                          <div className="sv-grade-meta">
                            {TRACK_LABELS[language][problem.track]} ·{' '}
                            {DIFFICULTY_LABELS[language][problem.difficulty] ??
                              problem.difficulty}
                          </div>
                          <div className="sv-grade-meta">
                            {copy.testCasePass}: {result?.passedTestCases ?? 0}/
                            {result?.totalTestCases ?? 0}
                          </div>
                          {result?.errorMessage && (
                            <div className="sv-grade-error">{result.errorMessage}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={leaveWorkspace}
                      type="button"
                    >
                      {copy.redoTest}
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      onClick={() => setStep(2)}
                      type="button"
                    >
                      {copy.continue}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="sv-summary-bar">
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.track}</span>
                      <strong>
                        {fieldFocus ? TRACK_LABELS[language][fieldFocus] : '--'}
                      </strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.selectedLevel}</span>
                      <strong>
                        {localize(
                          LEVEL_OPTIONS.find((item) => item.id === selfLevel)?.title ??
                          { vi: '--', en: '--' },
                          language,
                        )}
                      </strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.sampleProgress}</span>
                      <strong>{progressText}</strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.challengeCount}</span>
                      <strong>{challengeCount}</strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.poolSizeLabel}</span>
                      <strong>{formatPoolBreakdown(fieldFocus, skillTestMeta, language)}</strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">{copy.randomRuleLabel}</span>
                      <strong>{copy.randomRuleValue}</strong>
                    </div>
                  </div>

                  <p className="sv-desc">{copy.workspaceIntro}</p>
                  {skillTestMeta?.fallbackUsed ? (
                    <div className="sv-highlight">
                      <div className="sv-highlight-title">{copy.randomPickLabel}</div>
                      <p className="sv-highlight-text">{copy.poolFallbackHint}</p>
                    </div>
                  ) : null}

                  <div className="sv-skill-layout">
                    <aside className="sv-problem-nav">
                      <div className="sv-problem-nav-title">
                        {copy.surveyProblemList}
                      </div>
                      <div className="sv-problem-nav-list">
                        {localizedProblems.map((problem, index) => {
                          const status = problemStatus(problem._id);
                          return (
                            <button
                              key={problem._id}
                              type="button"
                              className={`sv-problem-tab ${activeProblem?._id === problem._id ? 'active' : ''
                                }`}
                              onClick={() => {
                                setActiveProblemId(problem._id);
                                setWorkspaceTab('description');
                                setConsoleTab('testcase');
                              }}
                            >
                              <div className="sv-problem-tab-top">
                                <span>
                                  {copy.problemLabel} {index + 1}
                                </span>
                                <span className="sv-problem-difficulty">
                                  {DIFFICULTY_LABELS[language][problem.difficulty] ??
                                    problem.difficulty}
                                </span>
                              </div>
                              <div className="sv-problem-tab-title">{problem.title}</div>
                              <div className="sv-problem-tab-meta">
                                {TRACK_LABELS[language][problem.track]} ·{' '}
                                {localize(
                                  LEVEL_OPTIONS.find(
                                    (item) => item.id === problem.targetSkillLevel,
                                  )?.title ?? {
                                    vi: problem.targetSkillLevel,
                                    en: problem.targetSkillLevel,
                                  },
                                  language,
                                )}
                              </div>
                              <div className={`sv-status-badge ${status.tone}`}>
                                {status.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </aside>

                    {activeProblem && (
                      <div className="sv-workspace">
                        <section className="sv-problem-panel">
                          <div className="sv-panel-tabs">
                            <button
                              className={workspaceTab === 'description' ? 'active' : ''}
                              onClick={() => setWorkspaceTab('description')}
                              type="button"
                            >
                              {copy.description}
                            </button>
                            <button
                              className={workspaceTab === 'testcases' ? 'active' : ''}
                              onClick={() => setWorkspaceTab('testcases')}
                              type="button"
                            >
                              {copy.testcases}
                            </button>
                          </div>

                          <h3 className="sv-problem-heading">{activeProblem.title}</h3>
                          <div className="sv-problem-tags">
                            <span className="sv-chip">
                              {TRACK_LABELS[language][activeProblem.track]}
                            </span>
                            <span className="sv-chip">
                              {localize(
                                LEVEL_OPTIONS.find(
                                  (item) => item.id === activeProblem.targetSkillLevel,
                                )?.title ?? {
                                  vi: activeProblem.targetSkillLevel,
                                  en: activeProblem.targetSkillLevel,
                                },
                                language,
                              )}
                            </span>
                            <span className="sv-chip">
                              {DIFFICULTY_LABELS[language][activeProblem.difficulty] ??
                                activeProblem.difficulty}
                            </span>
                            <span className="sv-chip">JavaScript</span>
                            <span className="sv-chip">
                              ~{activeProblem.estimatedMinutes} {copy.minutes}
                            </span>
                          </div>

                          {workspaceTab === 'description' ? (
                            <>
                              <div className="sv-problem-body">
                                {activeProblem.content}
                              </div>
                              <div className="sv-problem-section">
                                <div className="sv-problem-section-title">
                                  {copy.implementationTitle}
                                </div>
                                <div className="sv-problem-section-box">
                                  {copy.implementationBody.split('`solve()`')[0]}
                                  <code>solve()</code>
                                  {copy.implementationBody.split('`solve()`')[1] ?? ''}
                                </div>
                              </div>
                              <div className="sv-problem-section">
                                <div className="sv-problem-section-title">
                                  {copy.noteTitle}
                                </div>
                                <div className="sv-problem-section-box">
                                  {copy.noteBody}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="sv-case-list">
                              {activeProblem.sampleTestCases.length > 0 ? (
                                activeProblem.sampleTestCases.map((testCase, index) => (
                                  <div className="sv-case-card" key={index}>
                                    <div className="sv-case-title">
                                      {copy.caseLabel} {index + 1}
                                    </div>
                                    <pre className="sv-case-block">
                                      {`${copy.input}:
${testCase.input}

${copy.expected}:
${testCase.expectedOutput}`}
                                    </pre>
                                    {testCase.explanation && (
                                      <div className="sv-case-note">
                                        {testCase.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="sv-case-card">{copy.noPublicSample}</div>
                              )}
                            </div>
                          )}
                        </section>

                        <section className="sv-editor-panel">
                          <div className="sv-editor-header">
                            <div>
                              <div className="sv-editor-title">
                                {copy.monacoEditor}
                              </div>
                              <div className="sv-editor-sub">
                                {copy.requiredFunction}: <code>solve()</code>
                              </div>
                            </div>
                            <div className="sv-editor-tools">
                              <span className="sv-editor-language">JavaScript</span>
                              <button
                                className="sv-link-btn"
                                onClick={resetActiveProblemCode}
                                type="button"
                              >
                                {copy.resetStarter}
                              </button>
                            </div>
                          </div>

                          <div className="sv-editor-shell">
                            <Editor
                              height="100%"
                              language="javascript"
                              theme="vs-dark"
                              value={code[activeProblem._id] ?? ''}
                              onChange={(value) =>
                                setCode((current) => ({
                                  ...current,
                                  [activeProblem._id]: value ?? '',
                                }))
                              }
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontFamily: "'JetBrains Mono', monospace",
                                lineHeight: 22,
                              }}
                            />
                          </div>

                          <div className="sv-console-panel">
                            <div className="sv-console-tabs">
                              <button
                                className={consoleTab === 'testcase' ? 'active' : ''}
                                onClick={() => setConsoleTab('testcase')}
                                type="button"
                              >
                                {copy.testcase}
                              </button>
                              <button
                                className={consoleTab === 'result' ? 'active' : ''}
                                onClick={() => setConsoleTab('result')}
                                type="button"
                              >
                                {copy.testResult}
                              </button>
                            </div>

                            <div className="sv-console-body">
                              {consoleTab === 'testcase' ? (
                                activeProblem.sampleTestCases.length > 0 ? (
                                  <div className="sv-console-list">
                                    {activeProblem.sampleTestCases.map((testCase, index) => (
                                      <div className="sv-console-case" key={index}>
                                        <div className="sv-console-case-title">
                                          {copy.caseLabel} {index + 1}
                                        </div>
                                        <pre className="sv-console-code">
                                          {`${copy.input}: ${testCase.input}
${copy.expected}: ${testCase.expectedOutput}`}
                                        </pre>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="sv-console-empty">
                                    {copy.noPublicSampleForThis}
                                  </div>
                                )
                              ) : activeRunResult ? (
                                <div className="sv-run-result">
                                  <div className="sv-run-summary">
                                    <span
                                      className={`sv-status-badge ${activeRunResult.status === 'Accepted'
                                          ? 'success'
                                          : activeRunResult.status === 'Wrong Answer'
                                            ? 'warning'
                                            : 'danger'
                                        }`}
                                    >
                                      {activeRunResult.status}
                                    </span>
                                    <span className="sv-run-count">
                                      {activeRunResult.passedCount}/{activeRunResult.total}{' '}
                                      {copy.sampleTestPass}
                                    </span>
                                  </div>
                                  <div className="sv-run-note">{activeRunResult.notes}</div>
                                  {activeRunResult.cases.map((item) => (
                                    <div className="sv-run-case" key={item.index}>
                                      <div className="sv-run-case-top">
                                        <span>
                                          {copy.caseLabel} {item.index + 1}
                                        </span>
                                        <span
                                          className={`sv-status-badge ${item.passed ? 'success' : 'danger'
                                            }`}
                                        >
                                          {item.passed
                                            ? statusText.passed
                                            : statusText.failed}
                                        </span>
                                      </div>
                                      <div className="sv-run-grid">
                                        <div>
                                          <div className="sv-run-label">
                                            {copy.input}
                                          </div>
                                          <pre className="sv-console-code">
                                            {item.input}
                                          </pre>
                                        </div>
                                        <div>
                                          <div className="sv-run-label">
                                            {copy.expected}
                                          </div>
                                          <pre className="sv-console-code">
                                            {item.expectedOutput}
                                          </pre>
                                        </div>
                                      </div>
                                      {!item.passed && (
                                        <div className="sv-run-grid">
                                          <div>
                                            <div className="sv-run-label">
                                              {copy.actual}
                                            </div>
                                            <pre className="sv-console-code">
                                              {item.actualOutput ?? statusText.noOutput}
                                            </pre>
                                          </div>
                                          <div>
                                            <div className="sv-run-label">
                                              {copy.error}
                                            </div>
                                            <pre className="sv-console-code">
                                              {item.errorMessage ?? statusText.wrongAnswer}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="sv-console-empty">
                                  {copy.runCurrentToSee}
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </div>

                  <div className="sv-actions sv-actions-tight">
                    <div className="sv-action-group">
                      <button
                        className="sv-btn sv-btn-ghost"
                        onClick={leaveWorkspace}
                        type="button"
                      >
                        {copy.changeLevel}
                      </button>
                      <button
                        className="sv-btn sv-btn-ghost"
                        disabled={loading || !selfLevel}
                        onClick={loadSkillTest}
                        type="button"
                      >
                        {copy.reshuffle}
                      </button>
                    </div>
                    <div className="sv-action-group">
                      <button
                        className="sv-btn sv-btn-secondary"
                        disabled={!activeProblem || runningProblemId === activeProblem?._id}
                        onClick={runActiveProblem}
                        type="button"
                      >
                        {runningProblemId === activeProblem?._id
                          ? copy.running
                          : copy.runCode}
                      </button>
                      <button
                        className="sv-btn sv-btn-primary"
                        disabled={loading || !!runningProblemId}
                        onClick={submitTest}
                        type="button"
                      >
                        {loading ? copy.grading : copy.submitAll}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="sv-title">{copy.step2Title}</h1>
              <p className="sv-desc">{copy.step2Desc}</p>

              <span className="sv-label">{copy.dailyHours}</span>
              <input
                className="sv-input"
                type="number"
                min={1}
                max={24}
                value={dailyHours}
                onChange={(event) => setDailyHours(Number(event.target.value))}
              />

              <span className="sv-label">{copy.focusWindow}</span>
              <div className="sv-row">
                <input
                  className="sv-input"
                  type="time"
                  value={focusStart}
                  onChange={(event) => setFocusStart(event.target.value)}
                />
                <input
                  className="sv-input"
                  type="time"
                  value={focusEnd}
                  onChange={(event) => setFocusEnd(event.target.value)}
                />
              </div>

              <span className="sv-label">{copy.milestoneLabel}</span>
              <div className="sv-options">
                {(
                  [
                    {
                      id: 'project',
                      title: copy.project,
                      sub: copy.projectSub,
                    },
                    {
                      id: 'battle',
                      title: copy.battle,
                      sub: copy.battleSub,
                    },
                  ] as {
                    id: MilestoneTestPreference;
                    title: string;
                    sub: string;
                  }[]
                ).map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${milestone === option.id ? 'selected' : ''}`}
                    onClick={() => setMilestone(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                    <div className="sv-option-sub">{option.sub}</div>
                  </button>
                ))}
              </div>

              <span className="sv-label">{copy.disciplineLabel}</span>
              <div className="sv-options">
                {(
                  [
                    {
                      id: 'light',
                      title: copy.light,
                      sub: copy.lightSub,
                    },
                    {
                      id: 'strict',
                      title: copy.strict,
                      sub: copy.strictSub,
                    },
                  ] as { id: DisciplineLevel; title: string; sub: string }[]
                ).map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${discipline === option.id ? 'selected' : ''}`}
                    onClick={() => setDiscipline(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                    <div className="sv-option-sub">{option.sub}</div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(1)}
                  type="button"
                >
                  {copy.back}
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={submitDiscipline}
                  type="button"
                >
                  {loading ? copy.saving : copy.continue}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="sv-title">{copy.step3Title}</h1>
              <p className="sv-desc">{copy.step3Desc}</p>
              <div className="sv-result">
                <div className="score">{score ?? 0}%</div>
                {prettyEntryLevel(entryLevel, language) && (
                  <div className="level">
                    {copy.entryLevel}: {prettyEntryLevel(entryLevel, language)}
                  </div>
                )}
                <p className="sv-result-note">{placementInsight}</p>
                {unlockedLearningPathLabels.length > 0 ? (
                  <div className="sv-placement-pill-row sv-placement-pill-row-center">
                    <span className="sv-placement-label">{copy.unlockedLearningPath}</span>
                    {unlockedLearningPathLabels.map((label) => (
                      <span className="sv-placement-pill" key={label}>
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(2)}
                  type="button"
                >
                  {copy.back}
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={finish}
                  type="button"
                >
                  {loading ? copy.finishing : copy.startLearning}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
