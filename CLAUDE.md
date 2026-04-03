# Claude Code Guidelines for the-gifted-piggy

## Image Optimization Workflow

When adding blog post images:

1. **Before** `git add src/content/blog/images/`, run:
   ```bash
   npm run optimize-images
   ```

2. This automatically:
   - Resizes images to max 1920px width (preserves aspect ratio)
   - Compresses JPG to quality 82 (progressive)
   - Compresses PNG to quality 80 with max compression
   - Skips already-small images (<100KB)
   - Overwrites files in place

3. The script is located at `scripts/optimize-images.mjs`

**Why**: Keeps git repo size manageable (currently ~5GB+). Images from phones/cameras can be 3-8MB originals; after optimization they're 150-400KB. This is critical before scaling to 10k+ images.

**When Claude is asked to commit images**: Claude will run `npm run optimize-images` before staging files.
