# Icon Translation Script

This script automatically adds translations to the icons data using LibreTranslate API.

## Prerequisites

1. **LibreTranslate Server**: You need a running LibreTranslate instance
   - Local: `http://localhost:5000`
   - Or use a hosted instance

2. **Environment Variable**: Add to your `.env` file:
   ```env
   LIBRETRANSLATE_URL=http://localhost:5000
   ```

## Installation

Install the required dependency:

```bash
pnpm install
```

## Usage

### Translate to Spanish (default)

```bash
pnpm translate-icons --target es
```

### Translate to Other Languages

```bash
# French
pnpm translate-icons --target fr

# German
pnpm translate-icons --target de

# Portuguese
pnpm translate-icons --target pt

# Italian
pnpm translate-icons --target it
```

### Specify Source Language

By default, the source language is English (`en`). You can change it:

```bash
pnpm translate-icons --source en --target es
```

## How It Works

1. **Reads** the `components/ui/icons-data.ts` file
2. **Updates** the TypeScript interface to support translations
3. **Translates** each icon's:
   - Name (converted from kebab-case to readable text)
   - Tags (all search terms)
   - Categories
4. **Saves** progress every 50 icons (creates `.progress` file)
5. **Writes** the updated file back to `components/ui/icons-data.ts`

## API Format

The script uses the LibreTranslate API with this format:

```bash
curl -X POST http://localhost:5000/translate \
  -d "q=Hello" \
  -d "source=en" \
  -d "target=es"
```

## Output Structure

Each icon will have a `translations` field added:

```typescript
{
  "name": "accessibility",
  "categories": ["accessibility", "medical"],
  "tags": ["disability", "disabled", "wheelchair"],
  "translations": {
    "es": {
      "name": "Accesibilidad",
      "tags": ["discapacidad", "deshabilitado", "silla de ruedas"],
      "categories": ["accesibilidad", "médico"]
    }
  }
}
```

## Progress Tracking

- The script shows real-time progress for each icon
- Every 50 icons, it saves a `.progress` file
- If interrupted, you can resume by running the script again (it skips already translated icons)

## Performance

- ~1,400 icons to translate
- Each icon has ~5-10 tags on average
- With 100ms delay between API calls, expect ~30-60 minutes for full translation
- You can adjust the `delayMs` in the script if your API can handle faster requests

## Troubleshooting

### API Connection Failed

Ensure LibreTranslate is running:
```bash
# If using Docker:
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# Check if it's accessible:
curl http://localhost:5000/languages
```

### Out of Memory

If the script runs out of memory with large files, you can:
1. Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096" pnpm translate-icons`
2. Process in smaller batches (modify the script's batch size)
