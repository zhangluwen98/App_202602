import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOVELS_DIR = path.join(__dirname, '../src/novels');

const errors = [];
const warnings = [];

function validateNovel(filePath) {
  console.log(`\n📖 Validating: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const novel = JSON.parse(content);
    
    validateCharacters(novel, filePath);
    validateDialogues(novel, filePath);
    validateChapters(novel, filePath);
    
  } catch (error) {
    errors.push(`❌ ${path.basename(filePath)}: Failed to parse JSON - ${error.message}`);
  }
}

function validateCharacters(novel, filePath) {
  if (!novel.characters || !Array.isArray(novel.characters)) {
    errors.push(`❌ ${path.basename(filePath)}: Missing or invalid characters array`);
    return;
  }
  
  novel.characters.forEach((character, index) => {
    if (!character.id) {
      errors.push(`❌ ${path.basename(filePath)}: Character at index ${index} missing 'id'`);
    }
    if (!character.name) {
      errors.push(`❌ ${path.basename(filePath)}: Character at index ${index} missing 'name'`);
    }
    if (!character.avatar) {
      errors.push(`❌ ${path.basename(filePath)}: Character '${character.name || index}' missing 'avatar'`);
    }
    if (character.avatar && !isValidUrl(character.avatar)) {
      warnings.push(`⚠️  ${path.basename(filePath)}: Character '${character.name}' has invalid avatar URL`);
    }
  });
}

function validateDialogues(novel, filePath) {
  if (!novel.chapters || !Array.isArray(novel.chapters)) {
    return;
  }
  
  const speakers = new Set();
  
  novel.chapters.forEach((chapter, chapterIndex) => {
    const allParagraphs = [...(chapter.paragraphs || []), ...(chapter.extendedParagraphs || [])];
    
    allParagraphs.forEach((paragraph, paraIndex) => {
      if (!paragraph.parts || !Array.isArray(paragraph.parts)) {
        return;
      }
      
      paragraph.parts.forEach((part, partIndex) => {
        if (part.type === 'dialogue') {
          const speaker = part.speaker;
          if (!speaker) {
            errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapterIndex + 1}, paragraph ${paragraph.id || paraIndex}, part ${partIndex} missing 'speaker'`);
            return;
          }
          
          speakers.add(speaker);
          
          if (speaker !== '我') {
            const character = novel.characters?.find(c => 
              c.name === speaker || 
              c.id === speaker ||
              c.name.includes(speaker) ||
              speaker.includes(c.name?.split(' ')[0])
            );
            
            if (!character) {
              errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapterIndex + 1}, speaker '${speaker}' has no matching character definition`);
            } else if (!character.avatar) {
              errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapterIndex + 1}, speaker '${speaker}' has no avatar defined`);
            }
          }
        }
      });
    });
  });
}

function validateChapters(novel, filePath) {
  if (!novel.chapters || !Array.isArray(novel.chapters)) {
    errors.push(`❌ ${path.basename(filePath)}: Missing or invalid chapters array`);
    return;
  }
  
  novel.chapters.forEach((chapter, index) => {
    if (!chapter.id) {
      errors.push(`❌ ${path.basename(filePath)}: Chapter at index ${index} missing 'id'`);
    }
    if (!chapter.title) {
      errors.push(`❌ ${path.basename(filePath)}: Chapter at index ${index} missing 'title'`);
    }
    if (!chapter.paragraphs || !Array.isArray(chapter.paragraphs)) {
      errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapter.id || index} missing or invalid 'paragraphs' array`);
    }
    
    if (chapter.dialogueTriggers && Array.isArray(chapter.dialogueTriggers)) {
      chapter.dialogueTriggers.forEach((trigger, triggerIndex) => {
        if (!trigger.paragraphId) {
          errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapter.id || index}, trigger ${triggerIndex} missing 'paragraphId'`);
        }
        if (!trigger.nextParagraphs || !Array.isArray(trigger.nextParagraphs)) {
          errors.push(`❌ ${path.basename(filePath)}: Chapter ${chapter.id || index}, trigger ${triggerIndex} missing or invalid 'nextParagraphs'`);
        }
      });
    }
  });
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function main() {
  console.log('🔍 Starting novel validation...\n');
  
  const files = fs.readdirSync(NOVELS_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(NOVELS_DIR, file));
  
  if (files.length === 0) {
    console.log('⚠️  No novel files found in', NOVELS_DIR);
    process.exit(1);
  }
  
  files.forEach(validateNovel);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary');
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(error => console.log(error));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(warning => console.log(warning));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All validations passed!');
    process.exit(0);
  } else if (errors.length === 0) {
    console.log('\n✅ Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed');
    process.exit(1);
  }
}

main();
