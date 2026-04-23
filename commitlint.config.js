export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Tính năng mới
        'fix', // Bug fix
        'docs', // Thay đổi documentation
        'style', // Định dạng code
        'refactor', // Refactor code
        'perf', // Cải thiện performance
        'test', // Thêm hoặc sửa test
        'chore', // Build, dependencies, tools
        'ci', // CI/CD configuration
        'revert', // Revert commit trước đó
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
  },
};
