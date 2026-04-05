'use server';

import fs from 'fs';
import path from 'path';

/**
 * Updates or creates keys in the .env.local file.
 * Required for the Admin Dashboard API Integrations module to function.
 */
export async function updateEnvVariables(updates: Record<string, string>) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const lines = envContent.split('\n');
    const newLines: string[] = [];
    const updatedKeys = new Set<string>();

    // Update existing lines
    for (const line of lines) {
      if (!line.trim() || line.startsWith('#')) {
        newLines.push(line);
        continue;
      }

      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        if (updates.hasOwnProperty(key)) {
          // Wrap value in quotes to ensure safety
          newLines.push(`${key}="${updates[key]}"`);
          updatedKeys.add(key);
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    // Append new keys
    for (const [key, value] of Object.entries(updates)) {
      if (!updatedKeys.has(key)) {
        newLines.push(`${key}="${value}"`);
      }
    }

    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    return { success: true, message: 'Environment variables updated. Dev server will automatically reload.' };
  } catch (error: any) {
    console.error("Error updating .env.local", error);
    return { success: false, message: error.message };
  }
}
