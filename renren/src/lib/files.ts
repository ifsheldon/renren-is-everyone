import fs from 'fs/promises';
import path from 'path';
import { LRUCache } from 'lru-cache';

const SUBTITLE_DIR = path.join(process.cwd(), '../subtitle-backup');

export type FileEntry = {
    name: string;
    isDirectory: boolean;
    path: string;
};

// Initialize separate LRU Caches for different data types to avoid 'any'
const dirCache = new LRUCache<string, FileEntry[]>({
    max: 100, // Store up to 100 directory listings
    ttl: 1000 * 60 * 60, // 1 hour
});

const fileCache = new LRUCache<string, string>({
    max: 200, // Store up to 200 file contents
    ttl: 1000 * 60 * 60, // 1 hour
    // Estimate size based on string length (rough approximation)
    sizeCalculation: (value) => value.length,
    maxSize: 50 * 1024 * 1024, // Max 50MB total cache size for files
});

const isDirCache = new LRUCache<string, boolean>({
    max: 500, // Store up to 500 path checks
    ttl: 1000 * 60 * 60, // 1 hour
});

export async function getSubtitleFiles(relativePath = ''): Promise<FileEntry[]> {
    const cacheKey = relativePath;
    if (dirCache.has(cacheKey)) {
        // Non-null assertion is safe here because we checked has()
        return dirCache.get(cacheKey)!;
    }

    // Basic security check to prevent directory traversal
    if (relativePath.includes('..')) {
        throw new Error('Invalid path');
    }

    const dirPath = path.join(SUBTITLE_DIR, relativePath);

    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        const files = entries
            .filter(entry => !entry.name.startsWith('.')) // Exclude hidden files
            .map(entry => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
                path: relativePath ? `${relativePath}/${entry.name}` : entry.name
            }))
            .sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            });

        dirCache.set(cacheKey, files);
        return files;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

export async function getFileContent(relativePath: string): Promise<string | null> {
    const cacheKey = relativePath;
    if (fileCache.has(cacheKey)) {
        return fileCache.get(cacheKey)!;
    }

    // Basic security check
    if (relativePath.includes('..')) {
        return null;
    }

    const filePath = path.join(SUBTITLE_DIR, relativePath);

    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            return null;
        }
        const content = await fs.readFile(filePath, 'utf-8');
        fileCache.set(cacheKey, content);
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        return null;
    }
}

export async function isDirectory(relativePath: string): Promise<boolean> {
    const cacheKey = relativePath;
    if (isDirCache.has(cacheKey)) {
        return isDirCache.get(cacheKey)!;
    }

    if (relativePath.includes('..')) {
        return false;
    }

    const filePath = path.join(SUBTITLE_DIR, relativePath);
    try {
        const stats = await fs.stat(filePath);
        const isDir = stats.isDirectory();
        isDirCache.set(cacheKey, isDir);
        return isDir;
    } catch {
        return false;
    }
}
