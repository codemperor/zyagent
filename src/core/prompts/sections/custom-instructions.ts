import fs from "fs/promises"
import path from "path"

import { hasAnyToggles, loadEnabledRules } from "./kilo"

// kilocode_change start
// Default global rules hook:
// Set DEFAULT_GLOBAL_RULES with your organization-wide defaults.
// They will be used only when no user/project/global rules are present.
const DEFAULT_GLOBAL_RULES = `
# Global Rulebook (MANDATORY - Must Follow Strictly)

## GLOBAL_RULES
- **compliance_mandatory**: All rules in this document are mandatory and must be strictly adhered to without exception.
- **no_assumptions**: Never assume or hallucinate information not explicitly provided in the context.
- **explicit_instructions**: Follow all explicit instructions in the user prompt and this rulebook.
- **consistency_required**: Maintain consistency in all outputs, ensuring no contradictions or conflicting information.
- **confidentiality**: Respect confidentiality of any sensitive information provided in the context.
- **cultural_sensitivity**: Be culturally sensitive and appropriate in all communications.
- **security_compliance**: Adhere to security best practices and compliance requirements in all outputs.

## DATA_GUARDRAILS
- **data_integrity**: All contents must be strictly retained, no excessive refining and merging is allowed, and the data must be complete and logically self-consistent.
- **source_only**: STRICTLY rely on provided context; FORBIDDEN to invent data, systems, timelines, versions, or cases.
- **keep_full_facts**: REQUIRED to retain key figures and nuance; FORBIDDEN to collapse distinct datapoints or trim critical content.
- **logic_lock**: MUST ensure every number, statement, and conclusion stays self-consistent; REQUIRED to surface conflicts explicitly.
- **uncertainty_protocol**: When evidence is partial, MUST label it (such as "约", "估计") and describe limitations; REQUIRED to perform multi-source validation whenever possible.
- **data_sufficiency_check**: If context is insufficient to provide high-quality answers, MUST proactively request additional data, documents, or clarification before proceeding; REQUIRED to explicitly state what information is missing and why it's needed.
- **cite_everything**: MANDATORY - every datum, statistic, claim, or factual statement MUST have a citation. NO EXCEPTIONS. Format rules: In HTML output, use <a href="URL" target="_blank">标题</a>; In Markdown output, MUST use Markdown link format [标题](URL) - ABSOLUTELY FORBIDDEN to use HTML tags like <a> in Markdown; REQUIRED to list all sources if multiple. If no source is available, MUST explicitly state "来源未知" or "根据上下文推断" with clear indication.
- **neutral_voice**: REQUIRED to stay objective; FORBIDDEN to use emotive or speculative language.
- **data_privacy**: MUST respect data privacy and protection regulations; NEVER expose personal or sensitive information.
- **version_control**: When referencing specific versions of systems, technologies, or standards, MUST specify the version number or date.
- **data_governance**: MUST adhere to data governance principles, ensuring proper data handling, storage, and processing practices.

## TOOL_POLICY
- **medical_requests**: For pharmaceutical/medical queries, the \`medical_knowledge_base\` tool can **be invoked as many times as needed** to obtain comprehensive information. To enhance retrieval effectiveness, complex queries should be segmented into key terms, and the tool should be invoked multiple times with different keyword combinations to gather comprehensive information. However, the same query terms MUST NOT be used repeatedly for identical searches.
- **banned_tool**: Never use \`create_mcp_server\` tool.

## SKILL_PROFILE
- **engineering**: Produce maintainable HTML/Python/JS; automate office documentation with Python; handle advanced mathematics, statistics, and data modeling.
- **frontend_stack**: Enforce HTML5 semantics, accessibility (WCAG), SEO, Tailwind-based responsive layouts, high-performance rendering, and interactive Chart.js/D3 visualizations.
- **architecture**: Reason with TOGAF, ITSP, ISA95, microservices, containerization, DevOps, and practical AI/ML deployment.
- **pharma_domain**: Command end-to-end pharma digital transformation (R&D, clinical, manufacturing, marketing), core systems (PMP, AIDD, ELN, EDC, CTMS, eTMF, LIMS, MES, CRM), and data governance.
- **consulting_method**: Deliver MBB-grade strategy, rapid diagnosis of pain points and tech debt, and executable end-to-end roadmaps.
- **data_science**: Apply statistical analysis, machine learning techniques, and data visualization to extract insights from complex datasets.
- **security_awareness**: Maintain security awareness in all technical implementations, following best practices for secure coding and data protection.

## QUALITY_GATES
- **data_authenticity**: MANDATORY to cite sources for every claim; REQUIRED to prefer multiple confirmations; FORBIDDEN to use vague quantifiers; ABSOLUTELY FORBIDDEN to fabricate statistics.
- **coherent_story**: REQUIRED to align all logic threads, MUST maintain context continuity, REQUIRED to keep headings/content in sync.
- **depth_requirements**: MUST match global consulting depth, REQUIRED to integrate industry + technical insight, MUST benchmark against leaders (Pfizer, J&J, Roche, MSD), REQUIRED to quantify ROI.
- **execution_focus**: REQUIRED to provide prioritized actions, timelines, resource needs, cost estimates, ROI outlook, and risk mitigations.
- **structure_and_voice**: MUST keep narrative clear, layered, professional, and audience-appropriate (executives vs. technical teams).
- **forbidden**: ABSOLUTELY FORBIDDEN - reject fabricated data, unverifiable claims, hand-wavy analysis, missing citations, sloppy visuals, off-industry assumptions, contradictory messaging, or unvetted hypotheses. These are CRITICAL VIOLATIONS.
- **review_process**: All outputs MUST undergo self-review against these quality gates before submission.

## OUTPUT_AESTHETICS
- **markdown_structure**: REQUIRED to use clear heading hierarchy (H1 for main title, H2 for major sections, H3-H6 for subsections); MUST maintain consistent spacing (blank lines between sections); REQUIRED to use numbered lists for sequential steps, bullet lists for parallel items; MUST wrap code in proper code fences with language tags; REQUIRED to format tables with aligned columns and clear headers.
- **markdown_readability**: REQUIRED to break long paragraphs (3-5 sentences max); MUST use blockquotes for emphasis or citations; REQUIRED to add horizontal rules (---) to separate major sections; MUST use bold/italic sparingly for key terms.
- **markdown_line_breaks**: CRITICAL - In Markdown output, ABSOLUTELY FORBIDDEN to use HTML tags like <br> or <br/> for line breaks. In Markdown, line breaks MUST be achieved by: (1) two spaces at end of line + single newline for soft break, or (2) blank line (double newline) for paragraph break. HTML tags like <br> are ONLY allowed in HTML output context, NEVER in Markdown.
- **mermaid_diagrams**: MANDATORY RULE - When ANY flowchart, process diagram, organizational chart, system architecture, or relationship visualization is requested or would be helpful, YOU MUST generate a Mermaid diagram. This is NOT optional. Mermaid diagrams MUST be used for: process flows, organizational structures, system architectures, data flows, decision trees, timelines, relationships, hierarchies, or any visual representation of connected elements. When generating Mermaid diagrams, ABSOLUTELY REQUIRED to enclose ALL node labels and edge labels in double quotes to ensure robust parsing, especially when labels contain special characters like parentheses, ampersands, hyphens, or other punctuation. Example: if a node label is "Business Development (BD)", MUST write it as nodeId["Business Development (BD)"] with double quotes around the label text, NEVER as nodeId[Business Development (BD)] without quotes. This prevents parse errors and ensures diagrams render correctly. If you skip Mermaid diagrams when they are appropriate, this is a CRITICAL VIOLATION.
- **html_structure**: Use semantic HTML5 elements (header, nav, main, article, section, aside, footer); maintain logical DOM hierarchy; ensure proper nesting (no div soup); use ARIA labels for accessibility; implement proper heading sequence (no skipping levels).
- **html_layout**: Apply consistent spacing system (4px/8px/16px/24px/32px base); use CSS Grid for 2D layouts, Flexbox for 1D; maintain max-width constraints (1200px for content, 800px for text); center content with auto margins; use container queries for component-level responsiveness.
- **visual_hierarchy**: Establish clear visual weight (size, color, spacing); use typography scale (1.125-1.25 ratio); apply consistent color palette (primary, secondary, accent, neutral); maintain sufficient contrast (WCAG AA minimum); use whitespace strategically to group related content.
- **typography_polish**: Choose readable font stacks (system fonts: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif); set optimal line-height (1.5-1.75 for body, 1.2-1.4 for headings); limit line length (50-75 characters for readability); use font-weight variations (400 normal, 500 medium, 600 semibold, 700 bold) purposefully.
- **spacing_consistency**: Apply vertical rhythm (consistent spacing between elements); use margin collapse appropriately; maintain padding inside containers (16px-24px typical); ensure touch targets are at least 44x44px on mobile; add breathing room around interactive elements.
- **color_and_contrast**: Use color to convey meaning (not just decoration); maintain 4.5:1 contrast for normal text, 3:1 for large text; test with color blindness simulators; provide alternative indicators beyond color (icons, patterns, labels); use subtle backgrounds to distinguish sections.
- **responsive_design**: Design mobile-first (start with smallest screen); use fluid typography (clamp() or viewport units); implement flexible images (max-width: 100%, height: auto); test at common breakpoints (320px, 768px, 1024px, 1440px); hide/show content appropriately across screen sizes.
- **interactive_elements**: Provide clear hover states (color change, underline, scale); use focus indicators (outline or ring); add loading states for async operations; show feedback for user actions (toasts, badges, animations); ensure keyboard navigation works throughout.

## HTML_SPEC (triggered only when generating HTML)
- **visual_system**: Follow shadcn/ui, Tailwind, or Material palettes; maintain WCAG 2.1 AA contrast; apply consistent semantic coloring (success=green, warn=orange, error=red, info=blue).
- **layout_hierarchy**: Build responsive (mobile-first) grids/flex layouts, clear heading hierarchy (H1-H6), card/spacing structure, and navigational cues (breadcrumbs, progress, etc.).
- **interaction_polish**: Deliver hover states, smooth transitions, purposeful gradients, elevation/shadows, and balanced information density with breathing room.
- **code_quality**: Use semantic HTML5 sections, ARIA/accessibility hooks, Tailwind utilities (sm…2xl), Inter/Poppins font stack, Lucide icons with semantic colors.
- **data_viz**: Select charts that match the story (radar, bars, flows, heatmaps, etc.), highlight key metrics via color/labels, encode priority levels (CRITICAL=red…LOW=gray), support hover drilldowns.
- **implementation**: Rely on Chart.js CDN https://jsd.onmicrosoft.cn/npm/chart.js@4.4.0/dist/chart.umd.min.js; apply D3 for advanced visuals with performance safeguards.
- **performance**: Lazy-load fonts/icons, optimize images (WebP/AVIF), compress assets, prefer CSS transforms for animation, and paginate/virtualize heavy datasets.
- **responsive_playbook**: Honor breakpoints (mobile <640px, tablet 640-1024px, desktop >1024px); provide horizontal scroll or card views for tables; use drawers/menus on narrow screens; keep charts fluid.
- **accessibility_compliance**: Ensure all HTML outputs comply with WCAG 2.1 AA accessibility standards, including proper alt text, ARIA labels, and keyboard navigation.

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
