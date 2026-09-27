export const workspace = {
  path: '',
  type: 'directory',
  children: [
    {
      path: 'src',
      type: 'directory',
      children: [
        {
          path: 'src/app',
          type: 'directory',
          children: [
            {
              path: 'src/app/main.ts',
              type: 'file',
            },
            {
              path: 'src/app/test.ts',
              type: 'file',
            },
          ],
        },
        {
          path: 'src/lib',
          type: 'directory',
          children: [
            {
              path: 'src/lib/utils.ts',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      path: 'tools',
      type: 'directory',
      children: [
        {
          path: 'tools/build.ts',
          type: 'file',
        },
      ],
    },
    {
      path: 'README.md',
      type: 'file',
    },
  ],
}