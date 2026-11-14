import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "typescript",
  "php",
  "ruby",
] as const;

const isSupportedLanguage = (language: string): boolean => {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
};

const MOCK_OUTPUTS: Record<string, string> = {
  javascript: "> Output:\nHello, World!\nExecution time: 0.05s",
  python: "Output:\nHello, World!\nExecution time: 0.03s",
  java: "Output:\nHello, World!\nExecution time: 0.12s",
  c: "Output:\nHello, World!\nExecution time: 0.08s",
  cpp: "Output:\nHello, World!\nExecution time: 0.09s",
  csharp: "Output:\nHello, World!\nExecution time: 0.11s",
  go: "Output:\nHello, World!\nExecution time: 0.07s",
  rust: "Output:\nHello, World!\nExecution time: 0.06s",
  typescript: "> Output:\nHello, World!\nExecution time: 0.05s",
  php: "Output:\nHello, World!\nExecution time: 0.04s",
  ruby: "Output:\nHello, World!\nExecution time: 0.05s",
};

const getSessionOrThrow = async (sessionId: string) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new AppError("Session not found", 404);
  }
  return session;
};

const getCodeEditorOrThrow = async (sessionId: string) => {
  const editor = await prisma.codeEditor.findUnique({
    where: { sessionId },
  });
  if (!editor) {
    throw new AppError("Code editor not found", 404);
  }
  return editor;
};

export const createCodeEditor = async (
  sessionId: string,
  language = "javascript"
) => {
  await getSessionOrThrow(sessionId);

  if (!isSupportedLanguage(language)) {
    throw new AppError(`Unsupported language: ${language}`, 400);
  }

  const codeEditor = await prisma.codeEditor.upsert({
    where: { sessionId },
    update: {},
    create: {
      sessionId,
      code: `// Start coding in ${language}\n`,
      language,
      output: "",
      isExecuting: false,
      collaborators: [],
      version: 0,
    },
  });

  return codeEditor;
};

export const getCodeEditor = async (sessionId: string) => {
  return prisma.codeEditor.findUnique({ where: { sessionId } });
};

export const updateCode = async (sessionId: string, code: string) => {
  await getCodeEditorOrThrow(sessionId);

  const editor = await prisma.codeEditor.update({
    where: { sessionId },
    data: {
      code,
      version: { increment: 1 },
    },
  });

  return { success: true, version: editor.version };
};

export const changeLanguage = async (
  sessionId: string,
  language: string
) => {
  if (!isSupportedLanguage(language)) {
    throw new AppError(`Unsupported language: ${language}`, 400);
  }

  await getCodeEditorOrThrow(sessionId);

  const editor = await prisma.codeEditor.update({
    where: { sessionId },
    data: {
      language,
      code: `// Language changed to ${language}\n`,
      output: "",
      version: { increment: 1 },
    },
  });

  return { success: true, language, version: editor.version };
};

export const executeCode = async (sessionId: string) => {
  const editor = await getCodeEditorOrThrow(sessionId);

  if (editor.isExecuting) {
    throw new AppError("Code is already executing", 400);
  }

  await prisma.codeEditor.update({
    where: { sessionId },
    data: { isExecuting: true },
  });

  // Simulated async execution (~1s). In production this would call a real
  // code-runner service; the result is written back to Prisma when done.
  setTimeout(() => {
    void (async () => {
      try {
        const current = await prisma.codeEditor.findUnique({
          where: { sessionId },
        });
        if (!current) {
          return;
        }

        const language = current.language;
        const output =
          MOCK_OUTPUTS[language] ?? "Output:\nExecution completed";

        await prisma.codeEditor.update({
          where: { sessionId },
          data: {
            isExecuting: false,
            output,
            version: { increment: 1 },
          },
        });
      } catch (error) {
        try {
          await prisma.codeEditor.update({
            where: { sessionId },
            data: {
              isExecuting: false,
              output: `Error: ${
                error instanceof Error ? error.message : "Execution failed"
              }`,
            },
          });
        } catch {
         
        }
      }
    })();
  }, 1000);

  return { success: true, message: "Code execution started" };
};

export const clearOutput = async (sessionId: string) => {
  await getCodeEditorOrThrow(sessionId);

  await prisma.codeEditor.update({
    where: { sessionId },
    data: { output: "" },
  });

  return { success: true };
};

export const getSupportedLanguages = () => {
  return [...SUPPORTED_LANGUAGES];
};
