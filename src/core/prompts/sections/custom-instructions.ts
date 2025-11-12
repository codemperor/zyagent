import fs from "fs/promises"
import path from "path"

import { hasAnyToggles, loadEnabledRules } from "./kilo"

// kilocode_change start
// Default global rules hook:
// Set DEFAULT_GLOBAL_RULES with your organization-wide defaults.
// They will be used only when no user/project/global rules are present.
const DEFAULT_GLOBAL_RULES = `

# 全局系统提示词（必须严格遵守）

- 本提示词用于规范智能体在医药及通用咨询与技术任务中的行为与输出，确保数据可靠、逻辑自洽、可执行且可追溯。除非任务明确要求偏离，默认严格执行以下规则。
- 执行本提示词时，若任何条款与具体上下文或已知事实冲突，以“数据可追溯性与不确定性显式标注”为最高优先原则处理，并在输出中清晰说明。

## 一、适用范围与总则
- 仅基于已提供的上下文与工具检索结果输出内容；禁止任何臆测、补全或虚构。
- 优先级顺序：数据来源与可追溯性 > 逻辑一致性 > 可执行性 > 表达精炼。
- 数据不足以形成结论时，明确标注不确定性并提出最小化补充信息建议。

## 二、工具使用原则
- 仅医药任务检索允许调用 \`medical_knowledge_base\` 工具：
  - 对查询进行分词与改写（同义词、领域术语、MeSH词）。
  - 可多次检索直至信息充分且边际收益递减；对结果去重合并并保留原始表述。
  - 仅引用检索到的内容并逐条保留来源。
- 禁止事项：任何情况下禁用 \`create_mcp_server\`。

## 三、数据与证据要求（必须）
- **严格基于数据**：结论、数字、比例、案例、系统与版本信息必须有来源，来源可点击跳转对应的URL。
- **数据完整性**：保留关键信息原貌与上下文，避免过度提炼造成信息缺失。
- **逻辑一致性**：前后数据与推论自洽；冲突需显式标注并分列不同来源观点。
- **禁止虚构**：不得编造任何数字、比例、时间、系统名称、版本、功能、用户量、案例。
- **交叉验证**：关键数据尽可能多源校验；单一来源须标注“单一来源”与局限性。
- **数据来源标注（逐条必须）**：
  - HTML：<a href="https://pubmed.ncbi.nlm.nih.gov/41138728/" target="_blank">Cancer cells co-opt an inter-organ neuroimmune circuit</a>
  - Markdown：[Cancer cells co-opt an inter-organ neuroimmune circuit](https://pubmed.ncbi.nlm.nih.gov/41138728/)
  - 多来源需全部列出；一条数据对应多来源时并列给出。
  - （必须）必须严格遵守数据来源的撰写规则，必须采取英文符号
- **不确定性处理**：使用“约/估计/部分数据显示”，说明局限与缺口，不强行补齐。

## 四、输出质量标准
### 1) 内容准确性（自检）
- 标注来源可追溯；关键发现尽可能多源验证。
- 禁用模糊不可验证表述（“很多/大量/部分”），使用量化范围与上下限。
- 关键信息有上下文支撑；标题与正文逻辑连贯、一致。

### 2) 分析专业度
- 深度达MBB标准；具备行业与技术双深度；包含对标分析与量化指标/ROI。
- 战略高度：从行业顶层视角分析业务影响、战略价值与全球竞争格局。
- 完整性：覆盖“现状→问题→方案→实施”的完整链条，结合行业最佳实践。

### 3) 可执行性
- 建议可操作、可落地；包含优先级、实施路径与时间规划。
- 明确资源需求与成本估算；识别风险并提供应对措施。

### 4) 输出规范
- 结构清晰、术语专业；根据受众（高管/技术）调整粒度。
- 达到行业顶级质量标准；确保准确性、连贯性、可追溯性。

### 5) 内容结尾
- 必须罗列展示全部的参考来源，并可点击跳转对应的数据源

## 五、禁止事项（严格执行）
- 虚构任何系统、数据、案例、时间节点或版本信息。
- 使用模糊或不可验证描述；提供空泛无实证的分析。
- 忽略数据来源标注；偏离行业标准或实际业务。
- 过度提炼导致信息丢失；前后矛盾；使用未经验证的假设或推测。

## 六、专业能力边界与要求
### 1) 核心技术能力
- 代码质量（HTML/Python/JavaScript）；Python办公自动化（Excel/Word/PDF）。
- 数据处理（数学公式、统计分析、建模）。

### 2) 前端技术栈
- HTML5语义化、WCAG无障碍、SEO。
- Tailwind与响应式设计；Chart.js/D3.js交互可视化；性能优化（压缩、懒加载、渲染优化）。

### 3) 架构与设计
- 企业架构（TOGAF/ITSP/ISA-95）、云原生（微服务/容器/DevOps）、AI/ML应用架构。

### 4) 医药行业专长
- 研发/临床/生产/营销全链路。
- 系统生态：PMP、AIDD、ELN、EDC、CTMS、eTMF、LIMS、MES、CRM。
- 数据治理/质量/安全在医药场景的实践。

### 5) 咨询方法论
- 战略规划（MBB标准）、问题诊断、端到端解决方案设计与落地。

## 七、Markdown 排版与美化规范（默认输出生效）
- 标题层级
  - 使用“##/###”层级递进，不跳级；每节开头给出1行摘要或要点。
  - 可选目录：在文档前加入“目录”并使用锚点链接。
- 重点强调
  - 仅对关键信息使用加粗与少量表情符号（如“✅/⚠️/❗”），避免过用。
  - 重要级别标注建议置于小标签行，如：状态：CRITICAL | HIGH | MEDIUM | LOW
- 表格规范
  - 表头必须含单位/时间窗；数字右对齐、文本左对齐；必要时添加“来源”列。
  - 表格下方附注重要口径或计算方法。
  - 表格美化要求：
    - 对齐语法统一：文本列使用 \":---\"，数值列使用 \"---:\"，居中列使用 \":---:\"（示例：\":--- | ---: | :---:\"）。
    - 数字格式统一：启用千分位（如 12,345），小数位统一到 1–2 位（如 12.3 或 12.34），百分比以 % 结尾（如 12.3%），区间用 \"~\"。
    - 单位与口径：单位放入表头（如 金额(万元)；时段(23Q4)），避免行内重复；必要时新增“口径/备注”列。
    - 列宽与可读性：缩短长列名（用缩写+注脚）；将冗长备注移至“备注/脚注”；多维度信息拆分为两张子表而非过宽一表。
    - 高密度数据：优先横向展示（列多于行），超出渲染宽度时按主题分组拆表；避免超过 6–7 列的混合型表头。
    - 重要性标识：关键行在“结论/影响”列用加粗与图标（如 ✅/⚠️）；风险矩阵用“概率×影响”等级（LOW/MEDIUM/HIGH/CRITICAL）。
    - 综述行：表格首行上方添加“结论先行：……”一句话摘要；表格下方添加“注：口径/计算方法/数据窗口”。
    - 模板建议：
      - KPI对照表：指标 | 当前值 | 目标值 | 偏差 | 责任人 | 时间窗 | 状态
      - 实施路线图：里程碑 | 交付物 | 负责人 | 截止时间 | 依赖 | 风险 | 备注
      - 风险矩阵：风险 | 概率 | 影响 | 等级 | 监控指标 | 预案 | 所有者
- 清单与步骤
  - 使用任务清单表达实施进度与优先级：- [ ] P1 | 里程碑A（T+4周）
- 图形与公式
  - 流程/架构/依赖关系建议使用Mermaid（若渲染环境支持），例："mermaid" 的 flowchart/sequence/class
  - 关键公式使用行间公式并给出变量释义。
- 引用与注解
  - 使用引用块突出定义、判据或风险说明；注脚用于补充细节或口径差异。
- 代码与数据块
  - 仅在必要时使用代码块；为JSON/CSV/伪代码添加语言标记；保留原始缩进与键顺序。
- 版式与可读性
  - 单行不超过约100字符；段间距适中；相关图表或表格前给出一句“阅读指引/结论先行”。
- 链接与来源
  - 所有关键数据项在行内紧随来源标注；多来源并列；同一来源首次全称、后续可简写。
- 可移植性
  - 避免依赖特定渲染器的专有语法；当使用扩展语法（如任务清单、Mermaid、details）时在顶部简述兼容性。

## 八、HTML 视觉设计规范（仅在生成HTML时生效）
- 配色：参考shadcn/ui、Tailwind官方主题、Material Design；主/辅/中性/语义色统一；对比度≥WCAG 2.1 AA（4.5:1）。
- 布局：响应式；H1–H6层级明确；卡片化分组、分割线、间距合理；12列网格或Flex布局。
- 视觉增强：hover与过渡；渐变与阴影层次；留白充足，信息密度适中。
- 技术实现：HTML5语义与可访问性（ARIA、alt、键盘导航）；SEO与结构化数据；Tailwind优先、断点"sm/md/lg/xl/2xl"；字体Inter/Poppins；Lucide图标统一；Chart.js（https://jsd.onmicrosoft.cn/npm/chart.js@4.4.0/dist/chart.umd.min.js）或D3.js；懒加载、压缩合并、虚拟滚动；移动优先适配。
- 数据可视化：类型匹配；信息突出；标注齐全（标题、图例、数据标签）。数字、重点信息、标签、趋势等信息可以通过图表突出视觉效果
- 用户体验：交互流畅、信息密度合理、可访问性与性能达标。

## 九、冲突与异常处理
- 数据不足：标注“不足以得出结论”，列出缺口与所需补充数据清单。
- 数据冲突：并列不同来源与差异，解释可能原因与影响，提出验证路径。
- 工具不可用或检索失败：说明失败原因与重试策略；提供替代查询方案；避免未验证结论。
- 时效性风险：标注数据时间戳与时效窗口，提示潜在失效。

## 十、响应格式与最小化输出规则
- 优先结构化输出（分节标题、要点清单、表格/图表建议）。
- 每条关键数据均附来源（HTML或Markdown）；多源并列。
- 语言简洁、科学、无情绪化表达；必要时提供简短解释。
- 未要求HTML时，默认输出为Markdown并遵守“Markdown 排版与美化规范”。

## 十一、审核与发布前自检（执行即打勾）
- 内容准确性：来源完整、数字可追溯、无模糊表述、无虚构信息。
- 逻辑一致性：前后自洽、上下文支撑、标题与正文连贯。
- 专业深度：对标国际最佳实践、含量化指标/ROI、具行业与技术深度。
- 可执行性：建议落地、含优先级/路径/时间/资源/风险。
- 数据与不确定性：交叉验证完成；不足与冲突已标注；局限性已说明。
- Markdown/HTML（如适用）：版式美观、可读性与兼容性达标；可视化清晰。

## MODEL_DISCLOSURE
- If asked about model identity, authorship, "who answers", "what model", or any model-related questions, respond exactly: "您好，我是小Y，全名Zyagent，是您最值得信任的伙伴！"
` // <-- fill with default Global Rules (markdown/plain text)
// kilocode_change end
// kilocode_change start
let vscodeAPI: typeof import("vscode") | undefined
try {
	vscodeAPI = require("vscode")
} catch (e) {
	// In environments where 'vscode' is not available (like webview-ui build),
	// vscodeAPI will remain undefined. Notifications will not be shown.
	// This is acceptable as notifications are a progressive enhancement.
}

let hasShownNonKilocodeRulesMessage = false
// kilocode_change end

import { Dirent } from "fs"

import { isLanguage } from "@roo-code/types"

import type { SystemPromptSettings } from "../types"

import { LANGUAGES } from "../../../shared/language"
import { ClineRulesToggles } from "../../../shared/cline-rules" // kilocode_change
import { getRooDirectoriesForCwd } from "../../../services/roo-config"

/**
 * Safely read a file and return its trimmed content
 */
async function safeReadFile(filePath: string): Promise<string> {
	try {
		const content = (await fs.readFile(filePath, "utf-8")) ?? ""
		return content.trim()
	} catch (err) {
		const errorCode = (err as NodeJS.ErrnoException).code
		if (!errorCode || !["ENOENT", "EISDIR"].includes(errorCode)) {
			throw err
		}
		return ""
	}
}

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stats = await fs.stat(dirPath)
		return stats.isDirectory()
	} catch (err) {
		return false
	}
}

const MAX_DEPTH = 5

/**
 * Recursively resolve directory entries and collect file paths
 */
async function resolveDirectoryEntry(
	entry: Dirent,
	dirPath: string,
	fileInfo: Array<{ originalPath: string; resolvedPath: string }>,
	depth: number,
): Promise<void> {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}

	const fullPath = path.resolve(entry.parentPath || dirPath, entry.name)
	if (entry.isFile()) {
		// Regular file - both original and resolved paths are the same
		fileInfo.push({ originalPath: fullPath, resolvedPath: fullPath })
	} else if (entry.isSymbolicLink()) {
		// Await the resolution of the symbolic link
		await resolveSymLink(fullPath, fileInfo, depth + 1)
	}
}

/**
 * Recursively resolve a symbolic link and collect file paths
 */
async function resolveSymLink(
	symlinkPath: string,
	fileInfo: Array<{ originalPath: string; resolvedPath: string }>,
	depth: number,
): Promise<void> {
	// Avoid cyclic symlinks
	if (depth > MAX_DEPTH) {
		return
	}
	try {
		// Get the symlink target
		const linkTarget = await fs.readlink(symlinkPath)
		// Resolve the target path (relative to the symlink location)
		const resolvedTarget = path.resolve(path.dirname(symlinkPath), linkTarget)

		// Check if the target is a file
		const stats = await fs.stat(resolvedTarget)
		if (stats.isFile()) {
			// For symlinks to files, store the symlink path as original and target as resolved
			fileInfo.push({ originalPath: symlinkPath, resolvedPath: resolvedTarget })
		} else if (stats.isDirectory()) {
			const anotherEntries = await fs.readdir(resolvedTarget, { withFileTypes: true, recursive: true })
			// Collect promises for recursive calls within the directory
			const directoryPromises: Promise<void>[] = []
			for (const anotherEntry of anotherEntries) {
				directoryPromises.push(resolveDirectoryEntry(anotherEntry, resolvedTarget, fileInfo, depth + 1))
			}
			// Wait for all entries in the resolved directory to be processed
			await Promise.all(directoryPromises)
		} else if (stats.isSymbolicLink()) {
			// Handle nested symlinks by awaiting the recursive call
			await resolveSymLink(resolvedTarget, fileInfo, depth + 1)
		}
	} catch (err) {
		// Skip invalid symlinks
	}
}

/**
 * Read all text files from a directory in alphabetical order
 */
async function readTextFilesFromDirectory(dirPath: string): Promise<Array<{ filename: string; content: string }>> {
	try {
		const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true })

		// Process all entries - regular files and symlinks that might point to files
		// Store both original path (for sorting) and resolved path (for reading)
		const fileInfo: Array<{ originalPath: string; resolvedPath: string }> = []
		// Collect promises for the initial resolution calls
		const initialPromises: Promise<void>[] = []

		for (const entry of entries) {
			initialPromises.push(resolveDirectoryEntry(entry, dirPath, fileInfo, 0))
		}

		// Wait for all asynchronous operations (including recursive ones) to complete
		await Promise.all(initialPromises)

		// kilocode_change, must be imported at submodule level because the module is imported in the webview-ui
		const { isBinaryFile } = await import("isbinaryfile")

		const fileContents = await Promise.all(
			fileInfo.map(async ({ originalPath, resolvedPath }) => {
				try {
					// Check if it's a file (not a directory)
					const stats = await fs.stat(resolvedPath)
					if (stats.isFile()) {
						// Filter out cache files and system files that shouldn't be in rules
						if (!shouldIncludeRuleFile(resolvedPath)) {
							return null
						}

						// kilocode_change start
						if (stats.size > 0 && (await isBinaryFile(resolvedPath))) {
							return null
						}
						// kilocode_change end

						const content = await safeReadFile(resolvedPath)
						// Use resolvedPath for display to maintain existing behavior
						return { filename: resolvedPath, content, sortKey: originalPath }
					}
					return null
				} catch (err) {
					return null
				}
			}),
		)

		// Filter out null values (directories, failed reads, or excluded files)
		const filteredFiles = fileContents.filter(
			(item): item is { filename: string; content: string; sortKey: string } => item !== null,
		)

		// Sort files alphabetically by the original filename (case-insensitive) to ensure consistent order
		// For symlinks, this will use the symlink name, not the target name
		return filteredFiles
			.sort((a, b) => {
				const filenameA = path.basename(a.sortKey).toLowerCase()
				const filenameB = path.basename(b.sortKey).toLowerCase()
				return filenameA.localeCompare(filenameB)
			})
			.map(({ filename, content }) => ({ filename, content }))
	} catch (err) {
		return []
	}
}

/**
 * Format content from multiple files with filenames as headers
 */
function formatDirectoryContent(dirPath: string, files: Array<{ filename: string; content: string }>): string {
	if (files.length === 0) return ""

	return files
		.map((file) => {
			return `# Rules from ${file.filename}:\n${file.content}`
		})
		.join("\n\n")
}

/**
 * Load rule files from global and project-local directories
 * Global rules are loaded first, then project-local rules which can override global ones
 */
export async function loadRuleFiles(cwd: string): Promise<string> {
	const rules: string[] = []
	const rooDirectories = getRooDirectoriesForCwd(cwd)

	// Check for .roo/rules/ directories in order (global first, then project-local)
	for (const rooDir of rooDirectories) {
		const rulesDir = path.join(rooDir, "rules")
		if (await directoryExists(rulesDir)) {
			const files = await readTextFilesFromDirectory(rulesDir)
			if (files.length > 0) {
				const content = formatDirectoryContent(rulesDir, files)
				rules.push(content)
			}
		}
	}

	// If we found rules in .roo/rules/ directories, return them
	if (rules.length > 0) {
		return "\n" + rules.join("\n\n")
	}

	// Fall back to existing behavior for legacy .roorules/.clinerules files
	const ruleFiles = [".kilocoderules", ".roorules", ".clinerules"]

	for (const file of ruleFiles) {
		const content = await safeReadFile(path.join(cwd, file))
		if (content) {
			if (file !== ".kilocoderules" && vscodeAPI && !hasShownNonKilocodeRulesMessage) {
				// kilocode_change: show message to move to .kilocode/rules/
				vscodeAPI.window.showWarningMessage(
					`Loading non-Kilocode rules from ${file}, consider moving to .kilocode/rules/`,
				)
				hasShownNonKilocodeRulesMessage = true
			} // kilocode_change end
			return `\n# Rules from ${file}:\n${content}\n`
		}
	}

	return ""
}

/**
 * Load AGENTS.md or AGENT.md file from the project root if it exists
 * Checks for both AGENTS.md (standard) and AGENT.md (alternative) for compatibility
 */
async function loadAgentRulesFile(cwd: string): Promise<string> {
	// Try both filenames - AGENTS.md (standard) first, then AGENT.md (alternative)
	const filenames = ["AGENTS.md", "AGENT.md"]

	for (const filename of filenames) {
		try {
			const agentPath = path.join(cwd, filename)
			let resolvedPath = agentPath

			// Check if file exists and handle symlinks
			try {
				const stats = await fs.lstat(agentPath)
				if (stats.isSymbolicLink()) {
					// Create a temporary fileInfo array to use with resolveSymLink
					const fileInfo: Array<{ originalPath: string; resolvedPath: string }> = []

					// Use the existing resolveSymLink function to handle symlink resolution
					await resolveSymLink(agentPath, fileInfo, 0)

					// Extract the resolved path from fileInfo
					if (fileInfo.length > 0) {
						resolvedPath = fileInfo[0].resolvedPath
					}
				}
			} catch (err) {
				// If lstat fails (file doesn't exist), try next filename
				continue
			}

			// Read the content from the resolved path
			const content = await safeReadFile(resolvedPath)
			if (content) {
				return `# Agent Rules Standard (${filename}):\n${content}`
			}
		} catch (err) {
			// Silently ignore errors - agent rules files are optional
		}
	}
	return ""
}

export async function addCustomInstructions(
	modeCustomInstructions: string,
	globalCustomInstructions: string,
	cwd: string,
	mode: string,
	// kilocode_change begin: rule toggles
	options: {
		language?: string
		rooIgnoreInstructions?: string
		localRulesToggleState?: ClineRulesToggles
		globalRulesToggleState?: ClineRulesToggles
		settings?: SystemPromptSettings
	} = {},
	// kilocode_change end
): Promise<string> {
	const sections = []

	// Load mode-specific rules if mode is provided
	let modeRuleContent = ""
	let usedRuleFile = ""

	if (mode) {
		const modeRules: string[] = []
		const rooDirectories = getRooDirectoriesForCwd(cwd)

		// Check for .roo/rules-${mode}/ directories in order (global first, then project-local)
		for (const rooDir of rooDirectories) {
			const modeRulesDir = path.join(rooDir, `rules-${mode}`)
			if (await directoryExists(modeRulesDir)) {
				const files = await readTextFilesFromDirectory(modeRulesDir)
				if (files.length > 0) {
					const content = formatDirectoryContent(modeRulesDir, files)
					modeRules.push(content)
				}
			}
		}

		// If we found mode-specific rules in .roo/rules-${mode}/ directories, use them
		if (modeRules.length > 0) {
			modeRuleContent = "\n" + modeRules.join("\n\n")
			usedRuleFile = `rules-${mode} directories`
		} else {
			// Fall back to existing behavior for legacy files
			const rooModeRuleFile = `.kilocoderules-${mode}`
			modeRuleContent = await safeReadFile(path.join(cwd, rooModeRuleFile))
			if (modeRuleContent) {
				usedRuleFile = rooModeRuleFile
			}
		}
	}

	// Add language preference if provided
	if (options.language) {
		const languageName = isLanguage(options.language) ? LANGUAGES[options.language] : options.language
		sections.push(
			`Language Preference:\nYou should always speak and think in the "${languageName}" (${options.language}) language unless the user gives you instructions below to do otherwise.`,
		)
	}

	// Add global instructions first
	if (typeof globalCustomInstructions === "string" && globalCustomInstructions.trim()) {
		sections.push(`Global Instructions:\n${globalCustomInstructions.trim()}`)
	}

	// Add mode-specific instructions after
	if (typeof modeCustomInstructions === "string" && modeCustomInstructions.trim()) {
		sections.push(`Mode-specific Instructions:\n${modeCustomInstructions.trim()}`)
	}

	// Add rules - include both mode-specific and generic rules if they exist
	const rules = []

	// Add mode-specific rules first if they exist
	if (modeRuleContent && modeRuleContent.trim()) {
		if (usedRuleFile.includes(path.join(".kilocode", `rules-${mode}`))) {
			rules.push(modeRuleContent.trim())
		} else {
			rules.push(`# Rules from ${usedRuleFile}:\n${modeRuleContent}`)
		}
	}

	if (options.rooIgnoreInstructions) {
		rules.push(options.rooIgnoreInstructions)
	}

	// Add AGENTS.md content if enabled (default: true)
	if (options.settings?.useAgentRules !== false) {
		const agentRulesContent = await loadAgentRulesFile(cwd)
		if (agentRulesContent && agentRulesContent.trim()) {
			rules.push(agentRulesContent.trim())
		}
	}

	// kilocode_change start: rule toggles
	if (hasAnyToggles(options.localRulesToggleState) || hasAnyToggles(options.globalRulesToggleState)) {
		const genericRuleContent =
			(
				await loadEnabledRules(
					cwd,
					options.localRulesToggleState || {},
					options.globalRulesToggleState || {},
					directoryExists,
					readTextFilesFromDirectory,
				)
			)?.trim() ?? ""
		if (genericRuleContent) {
			rules.push(genericRuleContent)
		}
	} else {
		// Fallback to legacy function if no toggle states provided
		const genericRuleContent = (await loadRuleFiles(cwd))?.trim() ?? ""
		if (genericRuleContent) {
			rules.push(genericRuleContent)
		}
	}
	// kilocode_change end

	// Always append built-in defaults (if provided) to the end of collected rules
	if (typeof DEFAULT_GLOBAL_RULES === "string" && DEFAULT_GLOBAL_RULES.trim()) {
		rules.push(`\n${DEFAULT_GLOBAL_RULES.trim()}`)
	}

	if (rules.length > 0) {
		sections.push(`Rules:\n\n${rules.join("\n\n")}`)
	}

	const joinedSections = sections.join("\n\n")

	return joinedSections
		? `
====

USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

${joinedSections}`
		: ""
}

/**
 * Check if a file should be included in rule compilation.
 * Excludes cache files and system files that shouldn't be processed as rules.
 */
function shouldIncludeRuleFile(filename: string): boolean {
	const basename = path.basename(filename)

	const cachePatterns = [
		"*.DS_Store",
		"*.bak",
		"*.cache",
		"*.crdownload",
		"*.db",
		"*.dmp",
		"*.dump",
		"*.eslintcache",
		"*.lock",
		"*.log",
		"*.old",
		"*.part",
		"*.partial",
		"*.pyc",
		"*.pyo",
		"*.stackdump",
		"*.swo",
		"*.swp",
		"*.temp",
		"*.tmp",
		"Thumbs.db",
	]

	return !cachePatterns.some((pattern) => {
		if (pattern.startsWith("*.")) {
			const extension = pattern.slice(1)
			return basename.endsWith(extension)
		} else {
			return basename === pattern
		}
	})
}
