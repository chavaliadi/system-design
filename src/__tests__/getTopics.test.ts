import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getTopics, getTopicById } from '../lib/getTopics';

describe('getTopics Data Access Module (AC-1, AC-6)', () => {
  it('loads all 8 system design topics from content/*.json', async () => {
    const topics = await getTopics();
    expect(topics.length).toBe(8);

    // Confirm essential fields on every topic
    for (const t of topics) {
      expect(t._id).toBeDefined();
      expect(t.name).toBeDefined();
      expect(['easy', 'medium', 'hard']).toContain(t.difficulty);
      expect(t.mermaid_diagram).toBeDefined();
      expect(Array.isArray(t.tradeoffs)).toBe(true);
      expect(Array.isArray(t.interview_questions)).toBe(true);
    }
  });

  it('getTopicById returns correct topic for valid id (e.g. url-shortener)', async () => {
    const topic = await getTopicById('url-shortener');
    expect(topic).not.toBeNull();
    expect(topic?._id).toBe('url-shortener');
    expect(topic?.name).toBe('URL Shortener');
    expect(topic?.difficulty).toBe('medium');
    expect(topic?.tradeoffs.length).toBeGreaterThan(0);
  });

  it('getTopicById returns null (not throws) for non-existent topic id', async () => {
    const topic = await getTopicById('non-existent-topic');
    expect(topic).toBeNull();
  });

  it('getTopicById returns null for empty string or null argument', async () => {
    const topic = await getTopicById('');
    expect(topic).toBeNull();
  });

  it('handles malformed JSON syntax gracefully by logging console.error and skipping the file', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const originalReaddirSync = fs.readdirSync;
    const originalReadFileSync = fs.readFileSync;

    const readdirSpy = vi.spyOn(fs, 'readdirSync').mockImplementation(((
      dirPath: fs.PathLike,
      options?: unknown
    ) => {
      const realFiles = originalReaddirSync(
        dirPath,
        options as Parameters<typeof originalReaddirSync>[1]
      ) as unknown as string[];
      return [...realFiles, 'malformed-syntax.json'];
    }) as unknown as typeof fs.readdirSync);

    const readFileSpy = vi.spyOn(fs, 'readFileSync').mockImplementation(((
      filePath: fs.PathLike,
      options?: unknown
    ) => {
      const pathStr = String(filePath);
      if (pathStr.endsWith('malformed-syntax.json')) {
        return '{ "id": "malformed", "name": "Broken JSON", '; // Unclosed JSON syntax
      }
      return originalReadFileSync(filePath, options as Parameters<typeof originalReadFileSync>[1]);
    }) as unknown as typeof fs.readFileSync);

    try {
      const topics = await getTopics();

      // Confirm malformed file was skipped and valid 8 topics remain intact
      expect(topics.length).toBe(8);
      expect(topics.find((t) => t._id === 'malformed')).toBeUndefined();

      // Confirm error was logged with file context
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorLogArgs = consoleErrorSpy.mock.calls.flat().join(' ');
      expect(errorLogArgs).toContain(
        '[getTopics] Error reading/parsing topic file malformed-syntax.json'
      );
    } finally {
      consoleErrorSpy.mockRestore();
      readdirSpy.mockRestore();
      readFileSpy.mockRestore();
    }
  });

  it('handles missing required fields gracefully by logging console.warn and skipping the file', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const originalReaddirSync = fs.readdirSync;
    const originalReadFileSync = fs.readFileSync;

    const readdirSpy = vi.spyOn(fs, 'readdirSync').mockImplementation(((
      dirPath: fs.PathLike,
      options?: unknown
    ) => {
      const realFiles = originalReaddirSync(
        dirPath,
        options as Parameters<typeof originalReaddirSync>[1]
      ) as unknown as string[];
      return [...realFiles, 'missing-fields.json'];
    }) as unknown as typeof fs.readdirSync);

    const readFileSpy = vi.spyOn(fs, 'readFileSync').mockImplementation(((
      filePath: fs.PathLike,
      options?: unknown
    ) => {
      const pathStr = String(filePath);
      if (pathStr.endsWith('missing-fields.json')) {
        // Valid JSON syntax, but missing required `mermaid_diagram` and `difficulty`
        return JSON.stringify({
          id: 'missing-fields',
          name: 'Incomplete Topic',
        });
      }
      return originalReadFileSync(filePath, options as Parameters<typeof originalReadFileSync>[1]);
    }) as unknown as typeof fs.readFileSync);

    try {
      const topics = await getTopics();

      // Confirm incomplete file was skipped and valid 8 topics remain intact
      expect(topics.length).toBe(8);
      expect(topics.find((t) => t._id === 'missing-fields')).toBeUndefined();

      // Confirm warning was logged with file context
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnLogArgs = consoleWarnSpy.mock.calls.flat().join(' ');
      expect(warnLogArgs).toContain(
        '[getTopics] Skipping malformed topic file: missing-fields.json'
      );
    } finally {
      consoleWarnSpy.mockRestore();
      readdirSpy.mockRestore();
      readFileSpy.mockRestore();
    }
  });
});
