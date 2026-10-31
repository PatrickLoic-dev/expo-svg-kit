import { generate } from './generate';

interface ParsedArgs {
  command: string;
  input?: string;
  output?: string;
  watch: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const result: ParsedArgs = { command: command ?? '', watch: false };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--watch') {
      result.watch = true;
    } else if (arg === '--input') {
      result.input = rest[i + 1];
      i += 1;
    } else if (arg === '--output') {
      result.output = rest[i + 1];
      i += 1;
    }
  }

  return result;
}

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  const args = parseArgs(argv);

  if (args.command !== 'generate') {
    console.log('Usage: svg-kit generate [--input <dir>] [--output <file>] [--watch]');
    process.exitCode = args.command ? 1 : 0;
    return;
  }

  try {
    await generate({ cwd: process.cwd(), input: args.input, output: args.output, watch: args.watch });
  } catch (error) {
    console.error('[svg-kit]', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
