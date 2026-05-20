export type DiffLine = {
  type: 'add' | 'remove' | 'keep';
  content: string;
};

export function generateDiff(original: string, updated: string): DiffLine[] {
  const origLines = original.split('\n');
  const newLines = updated.split('\n');
  const lines: DiffLine[] = [];

  const maxLen = Math.max(origLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = origLines[i] ?? '';
    const newLine = newLines[i] ?? '';
    if (oldLine === newLine) {
      lines.push({ type: 'keep', content: oldLine });
    } else {
      if (i < origLines.length) {
        lines.push({ type: 'remove', content: oldLine });
      }
      if (i < newLines.length) {
        lines.push({ type: 'add', content: newLine });
      }
    }
  }
  return lines;
}

export function formatDiff(lines: DiffLine[]): string {
  return lines
    .map(l => {
      switch (l.type) {
        case 'add':
          return `+ ${l.content}`;
        case 'remove':
          return `- ${l.content}`;
        case 'keep':
          return `  ${l.content}`;
      }
    })
    .join('\n');
}
