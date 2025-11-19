#!/usr/bin/env node
/**
 * Script to add translations to icons-data.ts using LibreTranslate API
 * 
 * Usage:
 *   pnpm tsx scripts/add-icon-translations.ts --target es
 *   pnpm tsx scripts/add-icon-translations.ts --target fr --source en
 * 
 * Environment variables:
 *   LIBRETRANSLATE_URL - URL of the LibreTranslate endpoint (default: http://localhost:5000)
 */

import * as fs from 'fs';
import * as path from 'path';

interface IconData {
    name: string;
    categories: string[];
    tags: string[];
    translations?: {
        [languageCode: string]: {
            name?: string;
            tags?: string[];
            categories?: string[];
        };
    };
}

interface TranslateOptions {
    sourceLanguage: string;
    targetLanguage: string;
    libreTranslateUrl: string;
    batchSize: number;
    delayMs: number;
}

// Parse command line arguments
function parseArgs(): { source: string; target: string } {
    const args = process.argv.slice(2);
    let source = 'en';
    let target = 'es';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--source' && args[i + 1]) {
            source = args[i + 1];
            i++;
        } else if (args[i] === '--target' && args[i + 1]) {
            target = args[i + 1];
            i++;
        }
    }

    return { source, target };
}

// Translate text using LibreTranslate API
async function translateText(
    text: string,
    source: string,
    target: string,
    apiUrl: string
): Promise<string> {
    try {
        const formData = new URLSearchParams();
        formData.append('q', text);
        formData.append('source', source);
        formData.append('target', target);

        const response = await fetch(`${apiUrl}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            console.error(`Translation failed for "${text}": ${response.statusText}`);
            return text; // Return original text on error
        }

        const data = await response.json();
        return data.translatedText || text;
    } catch (error) {
        console.error(`Error translating "${text}":`, error);
        return text; // Return original text on error
    }
}

// Translate an array of strings with batching
async function translateBatch(
    texts: string[],
    source: string,
    target: string,
    apiUrl: string,
    delayMs: number = 100
): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < texts.length; i++) {
        const translated = await translateText(texts[i], source, target, apiUrl);
        results.push(translated);

        // Add delay to avoid overwhelming the API
        if (i < texts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            process.stdout.write(`\r  Translated ${i + 1}/${texts.length} items...`);
        }
    }

    if (texts.length > 0) {
        process.stdout.write(`\r  Translated ${texts.length}/${texts.length} items... Done!\n`);
    }

    return results;
}

// Translate icon name (convert kebab-case to readable text first)
function iconNameToReadable(name: string): string {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Translate a single icon
async function translateIcon(
    icon: IconData,
    options: TranslateOptions
): Promise<IconData> {
    const { sourceLanguage, targetLanguage, libreTranslateUrl, delayMs } = options;

    // Skip if translation already exists
    if (icon.translations?.[targetLanguage]) {
        return icon;
    }

    // Translate icon name
    const readableName = iconNameToReadable(icon.name);
    const translatedName = await translateText(
        readableName,
        sourceLanguage,
        targetLanguage,
        libreTranslateUrl
    );

    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Translate tags
    const translatedTags = await translateBatch(
        icon.tags,
        sourceLanguage,
        targetLanguage,
        libreTranslateUrl,
        delayMs
    );

    // Translate categories
    const translatedCategories = await translateBatch(
        icon.categories,
        sourceLanguage,
        targetLanguage,
        libreTranslateUrl,
        delayMs
    );

    // Create updated icon with translations
    return {
        ...icon,
        translations: {
            ...icon.translations,
            [targetLanguage]: {
                name: translatedName,
                tags: translatedTags,
                categories: translatedCategories,
            },
        },
    };
}

// Main function
async function main() {
    const { source, target } = parseArgs();

    // Get LibreTranslate URL from environment or use default
    const libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';

    console.log('='.repeat(60));
    console.log('Icon Translation Script');
    console.log('='.repeat(60));
    console.log(`Source language: ${source}`);
    console.log(`Target language: ${target}`);
    console.log(`LibreTranslate URL: ${libreTranslateUrl}`);
    console.log('='.repeat(60));
    console.log('');

    // Test the API connection
    console.log('Testing LibreTranslate API connection...');
    try {
        const testTranslation = await translateText('hello', source, target, libreTranslateUrl);
        console.log(`✓ API connection successful! Test translation: "hello" → "${testTranslation}"`);
        console.log('');
    } catch (error) {
        console.error('✗ Failed to connect to LibreTranslate API');
        console.error('Please ensure the API is running and the URL is correct.');
        console.error(`Current URL: ${libreTranslateUrl}`);
        process.exit(1);
    }

    // Read the icons data file
    const iconsDataPath = path.join(process.cwd(), 'components/ui/icons-data.ts');
    console.log(`Reading icons data from: ${iconsDataPath}`);

    if (!fs.existsSync(iconsDataPath)) {
        console.error(`Error: icons-data.ts not found at ${iconsDataPath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(iconsDataPath, 'utf-8');

    // Extract the type definition and update it
    const typeRegex = /export const iconsData: Array<\{[\s\S]+?\}>/;
    const newType = `export const iconsData: Array<{
        name: string;
        categories: string[];
        tags: string[];
        translations?: {
            [languageCode: string]: {
                name?: string;
                tags?: string[];
                categories?: string[];
            }
        }
    }>`;

    let updatedContent = fileContent.replace(typeRegex, newType);

    // Extract and parse the icons array
    const arrayMatch = fileContent.match(/= \[([\s\S]*)\];/);
    if (!arrayMatch) {
        console.error('Error: Could not parse icons array');
        process.exit(1);
    }

    // Parse icons (using a simple JSON parse after cleaning)
    const arrayContent = arrayMatch[1];
    const iconsJson = `[${arrayContent}]`;

    let icons: IconData[];
    try {
        icons = JSON.parse(iconsJson);
    } catch (error) {
        console.error('Error: Failed to parse icons JSON');
        console.error(error);
        process.exit(1);
    }

    console.log(`Found ${icons.length} icons to process`);
    console.log('');

    // Translate each icon
    const translatedIcons: IconData[] = [];
    const options: TranslateOptions = {
        sourceLanguage: source,
        targetLanguage: target,
        libreTranslateUrl,
        batchSize: 10,
        delayMs: 100,
    };

    for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        console.log(`\nProcessing icon ${i + 1}/${icons.length}: ${icon.name}`);

        const translatedIcon = await translateIcon(icon, options);
        translatedIcons.push(translatedIcon);

        // Save progress every 50 icons
        if ((i + 1) % 50 === 0) {
            console.log(`\n💾 Saving progress... (${i + 1}/${icons.length} icons processed)`);
            const progressContent = generateFileContent(translatedIcons, icons.slice(i + 1));
            fs.writeFileSync(iconsDataPath + '.progress', progressContent, 'utf-8');
        }
    }

    // Generate the new file content
    console.log('\n\nGenerating updated file...');
    const newFileContent = generateFileContent(translatedIcons);

    // Write the updated file
    const outputPath = iconsDataPath;
    fs.writeFileSync(outputPath, newFileContent, 'utf-8');

    console.log('');
    console.log('='.repeat(60));
    console.log('✓ Translation complete!');
    console.log(`✓ Updated file: ${outputPath}`);
    console.log(`✓ Processed ${translatedIcons.length} icons`);
    console.log('='.repeat(60));
}

// Generate the file content with proper formatting
function generateFileContent(translatedIcons: IconData[], remainingIcons: IconData[] = []): string {
    const allIcons = [...translatedIcons, ...remainingIcons];

    const typeDefinition = `export const iconsData: Array<{
    name: string;
    categories: string[];
    tags: string[];
    translations?: {
        [languageCode: string]: {
            name?: string;
            tags?: string[];
            categories?: string[];
        }
    }
}>`;

    const iconsArray = allIcons.map(icon => {
        const base = {
            name: icon.name,
            categories: icon.categories,
            tags: icon.tags,
        };

        if (icon.translations) {
            return JSON.stringify({ ...base, translations: icon.translations }, null, 2);
        }

        return JSON.stringify(base, null, 2);
    }).join(',\n  ');

    return `${typeDefinition} = [\n  ${iconsArray}\n];\n`;
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
