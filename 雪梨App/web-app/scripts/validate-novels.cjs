const fs = require('fs');
const path = require('path');

/**
 * 小说 JSON 格式校验器
 * 严格匹配 App 解析协议
 */
class NovelValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validate(filePath) {
        this.errors = [];
        this.warnings = [];
        console.log(`\n🔍 正在校验文件: ${path.basename(filePath)}`);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            this.checkMetadata(data);
            this.checkCharacters(data);
            this.checkChapters(data);
            this.checkLogicalIntegrity(data);

            this.report();
            return this.errors.length === 0;
        } catch (e) {
            this.addError('文件读取或 JSON 解析失败', e.message);
            this.report();
            return false;
        }
    }

    addError(type, message) {
        this.errors.push({ type, message });
    }

    addWarning(type, message) {
        this.warnings.push({ type, message });
    }

    checkMetadata(data) {
        const required = ['id', 'title', 'author', 'description', 'tags'];
        required.forEach(field => {
            if (!data[field]) this.addError('Metadata 缺失', `缺少必填字段: ${field}`);
        });
        if (data.tags && !Array.isArray(data.tags)) {
            this.addError('Metadata 格式错误', 'tags 必须是数组');
        }
    }

    checkCharacters(data) {
        if (!Array.isArray(data.characters)) {
            return this.addError('Characters 缺失', '必须包含 characters 数组');
        }

        data.characters.forEach((char, index) => {
            const prefix = `角色[${index}](${char.name || '未命名'})`;
            if (!char.id) this.addError(`${prefix}`, '缺少 id');
            if (!char.intimacy) this.addError(`${prefix}`, '缺少 intimacy 定义');
            if (char.intimacy && !char.intimacy.upgradePath) {
                this.addError(`${prefix}`, 'intimacy 缺少 upgradePath');
            }
        });
    }

    checkChapters(data) {
        if (!Array.isArray(data.chapters)) {
            return this.addError('Chapters 缺失', '必须包含 chapters 数组');
        }

        data.chapters.forEach((chapter, cIdx) => {
            const prefix = `章节[${cIdx}](${chapter.title || '未命名'})`;
            if (!chapter.paragraphs || !Array.isArray(chapter.paragraphs)) {
                this.addError(prefix, '缺少 paragraphs 数组');
                return;
            }

            chapter.paragraphs.forEach((para, pIdx) => {
                const pPrefix = `${prefix} -> 段落[${pIdx}](${para.id || '无ID'})`;
                if (!para.id) this.addError(pPrefix, '缺少 id');
                if (!para.parts || !Array.isArray(para.parts)) {
                    this.addError(pPrefix, '缺少 parts 数组');
                } else {
                    para.parts.forEach((part, ptIdx) => {
                        if (!['narration', 'dialogue'].includes(part.type)) {
                            this.addError(`${pPrefix} -> Part[${ptIdx}]`, `无效的 type: ${part.type}`);
                        }
                        if (part.type === 'dialogue' && !part.speaker) {
                            this.addWarning(`${pPrefix} -> Part[${ptIdx}]`, '对话类型建议填写 speaker');
                        }
                    });
                }
            });
        });
    }

    checkLogicalIntegrity(data) {
        const choiceIds = new Set();
        const paragraphIds = new Set();
        const characterNames = new Set(data.characters.map(c => c.name));

        // 收集所有 ID
        data.chapters.forEach(chapter => {
            [...(chapter.paragraphs || []), ...(chapter.extendedParagraphs || [])].forEach(para => {
                if (para.id) paragraphIds.add(para.id);
                if (para.choices) {
                    para.choices.forEach(choice => {
                        if (choice.id) choiceIds.add(choice.id);
                        // 校验跳转目标是否存在
                        choice.nextParagraphs.forEach(target => {
                            if (!paragraphIds.has(target) && !this.findParagraphInAll(data, target)) {
                                this.addError('逻辑断层', `选项 ${choice.id} 指向的段落 ${target} 不存在`);
                            }
                        });
                    });
                }
            });
        });

        // 校验好感度条件引用
        data.characters.forEach(char => {
            if (char.intimacy && char.intimacy.upgradePath) {
                char.intimacy.upgradePath.forEach(path => {
                    if (path.condition && path.condition.type === 'choice') {
                        if (!choiceIds.has(path.condition.id)) {
                            this.addWarning('引用孤岛', `角色 ${char.name} 的好感度条件 ID ${path.condition.id} 在剧情选项中未找到`);
                        }
                    }
                });
            }
        });
    }

    findParagraphInAll(data, id) {
        for (const chapter of data.chapters) {
            const allPara = [...(chapter.paragraphs || []), ...(chapter.extendedParagraphs || [])];
            if (allPara.find(p => p.id === id)) return true;
        }
        return false;
    }

    report() {
        if (this.errors.length === 0) {
            console.log('✅ 校验通过！格式完全符合协议。');
        } else {
            console.error(`❌ 发现 ${this.errors.length} 个严重错误:`);
            this.errors.forEach(err => console.error(`   - [${err.type}] ${err.message}`));
        }

        if (this.warnings.length > 0) {
            console.warn(`⚠️ 发现 ${this.warnings.length} 个建议项:`);
            this.warnings.forEach(warn => console.warn(`   - [${warn.type}] ${warn.message}`));
        }
    }
}

// 自动执行校验
const targetFile = process.argv[2] || path.join(__dirname, '../../server/data/novels/星际穿越：最后的玫瑰.json');
const validator = new NovelValidator();
validator.validate(targetFile);
